'use client';

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useCallback,
} from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaTrophy, FaPaperPlane } from 'react-icons/fa';

import { event as gaEvent } from '@/lib/gtag';
import { burst } from '@/lib/confetti';
import { saveScore, SaveScoreResult } from '@/lib/saveScore';
import { dayKey as buildDayKey } from '@/lib/dayKey';
import { titleFont } from '@/lib/fonts';

import HowToModal from '@/components/HowToModal';

type GameMode = 'daily' | 'endless';
const MAX_LEN = 8;
const POP_INTERVALS = [5, 12, 21, 32, 45];

const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['DEL', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER'],
];

const popVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.15 } },
};

const childFall: Variants = {
  hidden: { opacity: 0, y: -40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 18 },
  },
};

const isOneLetterDifferent = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0,
    j = 0,
    edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else {
        i++;
        j++;
      }
    }
  }
  edits += a.length - i + (b.length - j);
  return edits <= 1;
};

async function fetchDictionary(): Promise<Set<string>> {
  const res = await fetch('/api/dictionary');
  const json: string[] = await res.json();
  return new Set(json);
}

export default function Page() {
  const [showHome, setShowHome] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const [nickname, setNickname] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [seedWord, setSeedWord] = useState('TREAT');
  const [stack, setStack] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [dict, setDict] = useState<Set<string>>(new Set());
  const [submitState, setSubmitState] =
    useState<'idle' | 'saving' | 'saved'>('idle');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDictionary().then(setDict);
    const saved = localStorage.getItem('lexit_nick');
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    if (!showHome) inputRef.current?.focus();
  }, [showHome]);

  const startGame = async (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'daily') {
      const r = await fetch('/api/seed');
      const s = await r.json();
      setSeedWord(s.seed.toUpperCase());
    } else {
      const arr = Array.from(dict.values());
      const rand = arr[Math.floor(Math.random() * arr.length)] || 'STONE';
      setSeedWord(rand.toUpperCase());
    }
    setStack([]);
    setScore(0);
    setInput('');
    setShowHome(false);
    setShowHelp(true);
  };

  const submitWord = useCallback(() => {
    const newWord = input.trim().toUpperCase();
    if (!newWord) return;
    if (newWord.length > MAX_LEN) {
      alert(`Max word length is ${MAX_LEN}.`);
      return;
    }
    const currentSeed = stack.length ? stack[stack.length - 1] : seedWord;
    if (stack.includes(newWord) || newWord === currentSeed) {
      alert('Already used that word!');
      return;
    }
    if (!dict.has(newWord)) {
      alert('Not a valid English word.');
      return;
    }
    if (!isOneLetterDifferent(currentSeed, newWord)) {
      alert('Must differ by exactly one letter (insert/delete/replace).');
      return;
    }

    setStack((prev) => [...prev, newWord]);
    setScore((s) => s + 1);
    setInput('');
    if (POP_INTERVALS.includes(score + 1)) burst();
    inputRef.current?.focus();
  }, [input, seedWord, stack, score, dict]);

  const onVKPress = (key: string) => {
    if (key === 'ENTER') {
      submitWord();
      return;
    }
    if (key === 'DEL') {
      setInput((v) => v.slice(0, -1));
      return;
    }
    if (input.length >= MAX_LEN) return;
    setInput((v) => (v + key).toUpperCase());
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    }
  };

  const handleSaveScore = async () => {
    if (submitState !== 'idle') return;
    setSubmitState('saving');
    try {
      const dk = gameMode === 'daily' ? buildDayKey() : undefined;
      const payload = {
        name: nickname || 'Anon',
        mode: gameMode,
        score,
        seed: stack.at(-1) ?? seedWord, // end seed
        startSeed: seedWord,            // start seed
        dayKey: dk,
      };
      const resp: SaveScoreResult = await saveScore(payload);
      if (!resp.ok) throw new Error(resp.error || 'save failed');
      setSubmitState('saved');
      gaEvent('submit_score', { score, mode: gameMode });
    } catch (err) {
      console.error(err);
      alert('Could not save score.');
      setSubmitState('idle');
    }
  };

  const changeNick = () => {
    const n = prompt('Enter a new nickname (max 20 chars):', nickname) || '';
    const clean = n.trim().slice(0, 20);
    setNickname(clean);
    localStorage.setItem('lexit_nick', clean);
  };

  const backHome = () => {
    setShowHome(true);
    setStack([]);
    setScore(0);
    setInput('');
    setSubmitState('idle');
  };

  if (showHome) {
    return (
      <HomeScreen
        nickname={nickname}
        onNicknameChange={changeNick}
        onStart={startGame}
      />
    );
  }

  const latestSeed = stack.length ? stack[stack.length - 1] : seedWord;
  const canSubmitScore = score > 0 && submitState !== 'saved';

  return (
    <>
      <HowToModal open={showHelp} onClose={() => setShowHelp(false)} />

      <main className="min-h-screen bg-gradient-to-b from-[#F1F5F9] to-[#D1D5DB] flex flex-col items-center pb-40 relative">
        <button
          onClick={backHome}
          className="absolute left-4 top-4 text-[#334155] underline z-50"
        >
          ← Back
        </button>

        {/* Input + seed */}
        <div className="w-full max-w-md px-4 mt-20 z-40">
          <div className="flex gap-2 items-center mb-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={onKeyDown}
              maxLength={MAX_LEN}
              placeholder="ENTER WORD"
              className="flex-1 h-14 rounded-xl border-2 border-[#334155] bg-[#F1F5F9] text-[#334155] text-xl text-center tracking-widest outline-none"
            />
            <button
              onClick={submitWord}
              className="h-14 w-14 rounded-xl bg-[#3BB2F6] flex items-center justify-center text-white text-xl"
            >
              <FaPaperPlane />
            </button>
          </div>

          <motion.div
            key={latestSeed}
            variants={popVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full rounded-xl bg-[#334155] text-white text-2xl font-bold text-center py-3 mb-4"
          >
            {latestSeed}
          </motion.div>
        </div>

        {/* Past words */}
        <div className="w-full max-w-md px-4 flex-1 overflow-hidden z-30">
          <AnimatePresence initial={false}>
            {stack
              .slice(0, -1)
              .reverse()
              .map((w) => (
                <motion.div
                  key={w}
                  variants={popVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full rounded-xl bg-[#10B981] text-white text-lg font-semibold text-center py-3 mb-2 opacity-80"
                >
                  {w}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {/* Keyboard */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 pointer-events-none">
          <div className="backdrop-blur-sm bg-[#334155]/20 rounded-3xl p-3 space-y-2 pointer-events-auto">
            {KB_ROWS.map((row, i) => (
              <div key={i} className="flex gap-2">
                {row.map((k) => {
                  const isEnter = k === 'ENTER';
                  const isDel = k === 'DEL';
                  return (
                    <button
                      key={k}
                      onClick={() => onVKPress(k)}
                      className={`flex-1 h-12 rounded-xl ${
                        isEnter || isDel
                          ? 'bg-[#3BB2F6] text-white'
                          : 'bg-[#E2E8F0] text-[#334155]'
                      } text-lg font-semibold flex items-center justify-center`}
                    >
                      {isEnter ? '↵' : isDel ? '⌫' : k}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3">
          <div className="bg-[#1e293b]/80 backdrop-blur-sm rounded-2xl px-4 py-3 flex gap-3 justify-between">
            <button
              disabled={!canSubmitScore}
              onClick={handleSaveScore}
              className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                canSubmitScore
                  ? 'bg-[#10B981] text-white'
                  : 'bg-gray-400 text-white/60'
              }`}
            >
              <FaTrophy />
              {submitState === 'saved' ? 'Saved' : 'Submit'}
            </button>

            <a
              href="/leaderboard"
              className="flex-1 py-3 rounded-lg bg-[#334155] text-white font-semibold flex items-center justify-center"
            >
              Board
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

function HomeScreen({
  nickname,
  onNicknameChange,
  onStart,
}: {
  nickname: string;
  onNicknameChange: () => void;
  onStart: (mode: GameMode) => void;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F1F5F9] to-[#D1D5DB] flex flex-col items-center justify-center text-center relative">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.35 } } }}
        className="w-full max-w-md px-6 space-y-6"
      >
        <motion.h1
          variants={childFall}
          className={`${titleFont.className} text-5xl font-extrabold text-[#334155]`}
        >
          Lexit
        </motion.h1>

        <motion.p variants={childFall} className="text-[#334155] italic">
          A little goes a long way
        </motion.p>

        <motion.button
          variants={childFall}
          onClick={() => onStart('endless')}
          className="w-full py-4 rounded-2xl bg-[#3BB2F6] text-white text-2xl font-semibold shadow"
        >
          Endless Mode
        </motion.button>

        <motion.button
          variants={childFall}
          onClick={() => onStart('daily')}
          className="w-full py-4 rounded-2xl bg-[#10B981] text-white text-2xl font-semibold shadow"
        >
          Daily Challenge
        </motion.button>

        <motion.div
          variants={childFall}
          className="text-sm text-[#334155] underline cursor-pointer"
          onClick={onNicknameChange}
        >
          Change nickname {nickname ? `(@${nickname})` : ''}
        </motion.div>
      </motion.div>
    </main>
  );
}
