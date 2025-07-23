'use client';

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useCallback,
} from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FaShareAlt,
  FaTrophy,
  FaPaperPlane,
  FaListOl,
} from 'react-icons/fa';

import { event as gaEvent } from '@/lib/gtag';
import { burst } from '@/lib/confetti';
import { saveScore, SaveScoreResult } from '@/lib/saveScore';
import { dayKey as buildDayKey } from '@/lib/dayKey';

import HowToModal from '@/components/HowToModal';

// ------------ Types ------------
type GameMode = 'daily' | 'endless';

// ------------ Constants ------------
const MAX_LEN = 8;
const POP_INTERVALS = [5, 12, 21, 32, 45];

const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
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

// ------------ Helpers ------------
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

// ------------ Component ------------
export default function Page() {
  // UI
  const [showHome, setShowHome] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Game
  const [nickname, setNickname] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [seedWord, setSeedWord] = useState('STONE');
  const [stack, setStack] = useState<string[]>([]); // words after the original seed
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [dict, setDict] = useState<Set<string>>(new Set());
  const [submitState, setSubmitState] =
    useState<'idle' | 'saving' | 'saved'>('idle');

  // misc
  const inputRef = useRef<HTMLInputElement>(null);

  // Load dictionary & nickname
  useEffect(() => {
    fetchDictionary().then(setDict);
    const saved = localStorage.getItem('lexit_nick');
    if (saved) setNickname(saved);
  }, []);

  // focus
  useEffect(() => {
    if (!showHome) inputRef.current?.focus();
  }, [showHome]);

  // start game
  const startGame = async (mode: GameMode) => {
    setGameMode(mode);
    let firstSeed = seedWord;
    if (mode === 'daily') {
      const r = await fetch('/api/seed');
      const s = await r.json();
      firstSeed = s.seed?.toUpperCase() ?? 'STONE';
    } else {
      // endless
      const arr = Array.from(dict.values());
      firstSeed = (arr[Math.floor(Math.random() * arr.length)] || 'STONE').toUpperCase();
    }
    setSeedWord(firstSeed);
    setStack([]);
    setScore(0);
    setInput('');
    setShowHome(false);
    setShowHelp(true);
  };

  // submit word
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
      alert('Must differ by exactly one letter.');
      return;
    }

    setStack((p) => [...p, newWord]);
    setScore((s) => s + 1);
    setInput('');

    if (POP_INTERVALS.includes(score + 1)) burst();

    inputRef.current?.focus();
  }, [input, seedWord, stack, score, dict]);

  // VK
  const onVKPress = (key: string) => {
    if (key === 'ENTER') return submitWord();
    if (key === 'DEL') {
      setInput((v) => v.slice(0, -1));
      return;
    }
    if (input.length < MAX_LEN) setInput((v) => (v + key).toUpperCase());
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    }
  };

  // save score
  const handleSaveScore = async () => {
    if (submitState !== 'idle' || score === 0) return;
    setSubmitState('saving');
    try {
      const dk = gameMode === 'daily' ? buildDayKey() : undefined;
      const payload = {
        name: nickname || 'Anon',
        mode: gameMode,
        score,
        startSeed: seedWord,
        endSeed: stack.at(-1) ?? seedWord,
        dayKey: dk,
      };
      const res: SaveScoreResult = await saveScore(payload);
      if (!res.ok) throw new Error(res.error || 'save failed');
      setSubmitState('saved');
      gaEvent('submit_score', { score, mode: gameMode });
    } catch (e) {
      console.error(e);
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

  // build full list for rendering (seed first)
  const fullList = [seedWord, ...stack];
  const latestSeed = fullList[fullList.length - 1]; // dark bar
  const history = fullList.slice(0, -1).reverse(); // greens

  if (showHome) {
    return (
      <HomeScreen
        nickname={nickname}
        onNicknameChange={changeNick}
        onStart={startGame}
      />
    );
  }

  const canSubmitScore = score > 0 && submitState !== 'saved';

  return (
    <>
      <HowToModal open={showHelp} onClose={() => setShowHelp(false)} />

      <div className="min-h-screen flex flex-col items-center pb-40 relative">
        {/* Back */}
        <button
          onClick={backHome}
          className="absolute left-4 top-4 text-[#334155] underline"
        >
          ← Back
        </button>

        {/* Input + Seed */}
        <div className="w-full max-w-md px-4 mt-20">
          <div className="flex gap-2 items-center mb-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={onKeyDown}
              maxLength={MAX_LEN}
              placeholder="ENTER WORD"
              className="flex-1 h-14 rounded-xl border-2 border-[#334155] bg-[#F1F5F9] text-[#334155] text-xl text-center tracking-widest outline-none"
              inputMode="none"
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

        {/* History */}
        <div className="w-full max-w-md px-4 flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {history.map((w) => (
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

        {/* Virtual keyboard */}
        <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center pointer-events-none">
          <div className="backdrop-blur-sm bg-[#334155]/20 rounded-3xl p-2 pointer-events-auto">
            {KB_ROWS.map((row, idx) => (
              <div key={idx} className="flex justify-center gap-2 mb-2 last:mb-0">
                {row.map((k) => {
                  const isEnter = k === 'ENTER';
                  const isDel = k === 'DEL';
                  return (
                    <button
                      key={k}
                      onClick={() => onVKPress(k)}
                      className={`h-12 ${
                        isEnter || isDel ? 'w-16' : 'w-10'
                      } rounded-xl bg-[#F1F5F9] text-[#334155] text-lg font-semibold flex items-center justify-center`}
                    >
                      {isEnter ? '↵' : isDel ? '⌫' : k}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-[#334155]/80 backdrop-blur-sm rounded-3xl px-3 py-2 flex gap-3">
            <button
              onClick={() => {
                const text = `${nickname || 'Anon'} – ${
                  gameMode === 'daily' ? 'Daily' : 'Endless'
                } – Score ${score}\nPlay: https://lexit.uno`;
                navigator.share
                  ? navigator.share({ text })
                  : navigator.clipboard.writeText(text);
              }}
              className="h-10 px-4 rounded-xl bg-[#3BB2F6] text-white flex items-center gap-2"
            >
              <FaShareAlt /> Share
            </button>

            <button
              disabled={!canSubmitScore}
              onClick={handleSaveScore}
              className={`h-10 px-4 rounded-xl flex items-center gap-2 ${
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
              className="h-10 px-4 rounded-xl bg-[#334155] text-white flex items-center gap-2"
            >
              <FaListOl /> Board
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// ------------ Home screen ------------
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
    <div className="min-h-screen flex flex-col items-center justify-center text-center relative">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.35 } },
        }}
        className="w-full max-w-md px-6 space-y-6"
      >
        <motion.h1
          variants={childFall}
          className="text-5xl font-extrabold text-[#334155]"
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
    </div>
  );
}

const childFall: Variants = {
  hidden: { opacity: 0, y: -40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 18 },
  },
};
