'use client';

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useCallback,
} from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaShareAlt, FaTrophy, FaListUl, FaPaperPlane } from 'react-icons/fa';

import { burst } from '@/lib/confetti';
import { gaEvent } from '@/lib/gtag'
import { saveScore, SaveScoreResult, GameMode } from '@/lib/saveScore';
import { dayKey as buildDayKey } from '@/lib/dayKey';
import HowToModal from '@/components/HowToModal';
import { titleFont } from '@/lib/fonts';

// ---------- constants ----------
const MAX_LEN = 8;
const MIN_LEN = 4;    // ← enforce at least 4 letters
const POP_INTERVALS = [5, 12, 21, 32, 45];

const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'], // ENTER left, DEL right
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

// ---------- helpers ----------
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
  const data: string[] = await res.json();
  return new Set(data);
}

// ---------- component ----------
export default function Page() {
  // UI
  const [showHome, setShowHome] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // game
  const [nickname, setNickname] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [seedWord, setSeedWord] = useState('TREAT');
  const [stack, setStack] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [dict, setDict] = useState<Set<string>>(new Set());
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );

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
    setSubmitState('idle');
    setShowHome(false);
    setShowHelp(true);
  };

  const submitWord = useCallback(() => {
    const newWord = input.trim().toUpperCase();
    if (!newWord) return;
    // ==== NEW: enforce minimum length ====
    if (newWord.length > 0 && newWord.length < MIN_LEN) {
      alert(`Words must be at least ${MIN_LEN} letters.`);
      return;
    }
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
    setScore((s) => s + newWord.length);
    setInput('');
    if (POP_INTERVALS.includes(score + 1)) burst();
    inputRef.current?.blur();
  }, [input, seedWord, stack, score, dict]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    }
  };

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

  const handleSaveScore = async () => {
    if (submitState !== 'idle') return;
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

  const handleShare = () => {
    const text = `I scored ${score} in ${
      gameMode === 'daily' ? 'the Daily Challenge' : 'Endless Mode'
    } on Lexit!`;
    const base =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (typeof window !== 'undefined' ? window.location.origin : '');
  const url = base;
    if (navigator.share) {
      navigator
        .share({ text, url })
        .catch(() => navigator.clipboard.writeText(`${text} ${url}`));
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copied!');
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
  const pastWords =
    stack.length === 0 ? [] : [seedWord, ...stack.slice(0, -1)];
  const canSubmitScore = score > 0 && submitState !== 'saved';

  return (
    <div className="min-h-screen flex flex-col items-center pb-40 relative overflow-hidden overscroll-none">
      <HowToModal open={showHelp} onClose={() => setShowHelp(false)} />

      {/* Back */}
      <button
        onClick={backHome}
        className="absolute left-4 top-4 text-[#334155] underline"
      >
        ← Back
      </button>

      {/* Input area */}
      <div className="w-full max-w-md px-4 mt-20 relative">
        <div className="flex gap-2 items-center mb-2 relative">
          <span className="absolute right-20 top-1/2 -translate-y-1/2 text-[#334155]">
            {score}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={onKeyDown}
            maxLength={MAX_LEN}
            placeholder="ENTER WORD"
            className="flex-1 h-14 rounded-xl border-2 border-[#334155] bg-[#F1F5F9] text-[#334155] text-xl text-center tracking-widest outline-none"
            inputMode="none"
            onFocus={(e) => e.target.blur()}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            onClick={submitWord}
            className="h-14 w-14 rounded-xl bg-[#3BB2F6] flex items-center justify-center text-white text-xl"
          >
            <FaPaperPlane />
          </button>
        </div>

        {/* current seed */}
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
      <div className="w-full max-w-md px-4 flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {pastWords
            .slice()
            .reverse()
            .map((w) => (
              <motion.div
                key={w}
                variants={popVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full rounded-xl bg-[#10B981] text-white text-lg font-semibold text-center py-3 mb-2 opacity-70"
              >
                {w}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Virtual keyboard */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none">
        <div className="max-w-md w-full backdrop-blur-sm bg-[#334155]/20 rounded-3xl p-2 pointer-events-auto mx-auto">
          {KB_ROWS.map((row, idx) => (
            <div
              key={idx}
              className="flex justify-center gap-2 mb-2 last:mb-0 flex-nowrap"
            >
              {row.map((k) => {
                const isEnter = k === 'ENTER';
                const isDel = k === 'DEL';
                const base =
                  'h-12 rounded-xl text-lg font-semibold flex items-center justify-center';
                if (isEnter) {
                  return (
                    <button
                      key={k}
                      onClick={() => onVKPress(k)}
                      className={`${base} w-16 bg-[#3BB2F6] text-white`}
                    >
                      ↵
                    </button>
                  );
                }
                if (isDel) {
                  return (
                    <button
                      key={k}
                      onClick={() => onVKPress(k)}
                      className={`${base} w-16 bg-[#F1F5F9] text-[#334155]`}
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={k}
                    onClick={() => onVKPress(k)}
                    className={`${base} w-10 bg-[#F1F5F9] text-[#334155]`}
                  >
                    {k}
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
            onClick={handleShare}
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
            <FaListUl /> Board
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------- Home screen ----------
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden overscroll-none">
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

      {/* Creator credit near bottom */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#334155]/60">
        Created By: Nuiche
      </div>
    </div>
  );
}
