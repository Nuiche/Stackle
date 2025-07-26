// app/page.tsx
'use client';

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useCallback,
  ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaShareAlt, FaList } from 'react-icons/fa';

import { burst } from '@/lib/confetti';
import { gaEvent } from '@/lib/gtag';
import { saveScore, SaveScoreResult, GameMode } from '@/lib/saveScore';
import { dayKey as buildDayKey } from '@/lib/dayKey';
import HowToModal from '@/components/HowToModal';
import { titleFont } from '@/lib/fonts';
import { getDailyLeaderboard } from '@/lib/getLeaderboard';

// ---------- constants ----------
const MAX_LEN = 8;
const MIN_LEN = 4;
const POP_INTERVALS = [10, 25, 50, 75, 100, 125, 150, 175, 200];

const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','DEL'],
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
  show:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } },
};

// ---------- helpers ----------
const isOneLetterDifferent = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++; j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
  }
  edits += a.length - i + (b.length - j);
  return edits <= 1;
};

async function fetchDictionary(): Promise<Set<string>> {
  const res = await fetch('/api/dictionary');
  const data = (await res.json()) as string[];
  return new Set(data);
}

// ---------- component ----------
export default function Page() {
  const router = useRouter();

  // UI state
  const [showHome, setShowHome] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Timer
  const TIME_LIMIT = 90;
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const timerRef = useRef<number | null>(null);

  // Game state
  const [nickname, setNickname] = useState('');
  const [seedWord, setSeedWord] = useState('TREAT');
  const [stack, setStack] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [dict, setDict] = useState<Set<string>>(new Set());
  const [submitState, setSubmitState] = useState<'idle'|'saving'|'saved'>('idle');

  // Ref for input focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle simple clear on invalid input
  const clearInput = () => setInput('');

  // Prevent overflow on manual typing
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    setInput(raw.slice(0, MAX_LEN));
  };

  // Load dictionary & nickname
  useEffect(() => {
    fetchDictionary().then(setDict);
    const saved = localStorage.getItem('lexit_nick');
    if (saved) setNickname(saved);
  }, []);

  // Auto-focus input when game starts
  useEffect(() => {
    if (!showHome) inputRef.current?.focus();
  }, [showHome]);

  // Timer setup/cleanup
  useEffect(() => {
    if (!showHome && !showHelp) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      setTimeLeft(TIME_LIMIT);
      timerRef.current = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [showHome, showHelp]);

  // Redirect when timer hits zero
  useEffect(() => {
    if (timeLeft > 0) return;
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    const endSeed = stack.length ? stack[stack.length - 1] : seedWord;
    const go = () =>
      router.push(`/leaderboard?endSeed=${encodeURIComponent(endSeed)}&score=${score}`);
    if (score > 0) {
      handleSaveScore().finally(go);
    } else {
      go();
    }
  }, [timeLeft, score]);

  // Start game
  const startGame = async () => {
    if (!nickname) {
      let n = '';
      while (!n) {
        n = prompt('Please enter a nickname (max 20 chars):','')?.trim() || '';
        if (!n) alert('A nickname is required.');
      }
      const clean = n.slice(0,20);
      setNickname(clean);
      localStorage.setItem('lexit_nick', clean);
    }
    const r = await fetch('/api/seed');
    const s = await r.json();
    setSeedWord(s.seed.toUpperCase());
    setStack([]); setScore(0); setInput(''); setSubmitState('idle');
    setShowHome(false); setShowHelp(true);
  };

  // Save score helper
  const handleSaveScore = async () => {
    if (submitState !== 'idle') return;
    setSubmitState('saving');
    try {
      const payload = {
        name: nickname||'Anon',
        mode: 'daily' as GameMode,
        score,
        startSeed: seedWord,
        endSeed: stack.at(-1) ?? seedWord,
        dayKey: buildDayKey(),
      };
      const res = await saveScore(payload);
      if (res.ok) gaEvent('submit_score',{score,mode:'daily'});
      setSubmitState('saved');
    } catch {
      setSubmitState('idle');
    }
  };

  // Submit word
  const submitWord = useCallback(() => {
    const newWord = input.trim().toUpperCase();
    if (!newWord) return;

    // 1) Too short
    if (newWord.length < MIN_LEN) { clearInput(); return; }

    // 2) Already used or seed
    const previous = [seedWord, ...stack];
    if (previous.includes(newWord)) { clearInput(); return; }

    // 3) Invalid English
    if (!dict.has(newWord)) { clearInput(); return; }

    // 4) Must differ by one letter
    const currentSeed = stack.length ? stack[stack.length-1] : seedWord;
    if (!isOneLetterDifferent(currentSeed,newWord)) { clearInput(); return; }

    // Valid
    setStack(p=>[...p,newWord]);
    setScore(s=>s+newWord.length);
    clearInput();
    if (POP_INTERVALS.includes(score+1)) burst();
    inputRef.current?.blur();
  },[input,seedWord,stack,score,dict]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key==='Enter') { e.preventDefault(); submitWord(); }
  };

  const onVKPress = (key: string) => {
    if (key==='ENTER') { submitWord(); return; }
    if (key==='DEL')   { setInput(v=>v.slice(0,-1)); return; }
    if (input.length>=MAX_LEN) return;
    setInput(v=>(v+key).toUpperCase());
  };

  const handleShare = () => {
    const text = `I scored ${score} in today's Daily Challenge on Lexit!`;
    const url  = window.location.origin;
    if (navigator.share) {
      navigator.share({text,url}).catch(()=>navigator.clipboard.writeText(`${text} ${url}`));
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  const changeNick = () => {
    const n = prompt('Enter a new nickname (max 20 chars):',nickname)||'';
    const clean = n.slice(0,20);
    setNickname(clean);
    localStorage.setItem('lexit_nick',clean);
  };

  const backHome = () => {
    setShowHome(true);
    setStack([]); setScore(0); setInput(''); setSubmitState('idle');
  };

  if (showHome) {
    return <HomeScreen nickname={nickname} onNicknameChange={changeNick} onStart={startGame} />;
  }

  const latestSeed = stack.length ? stack[stack.length-1] : seedWord;
  const pastWords = stack.length ? [seedWord,...stack.slice(0,-1)] : [];

  function formatTime(sec: number) {
    if (sec>=60) {
      const m=Math.floor(sec/60),s=sec%60;
      return `${m}:${s.toString().padStart(2,'0')}`;
    }
    return `${sec}`;
  }

  
    const handleHelpClose = () => {
      setShowHelp(false);
      // focus immediately—in the same user click—so the native keyboard will open
      inputRef.current?.focus();
    };
  return (
    <div className="min-h-screen flex flex-col items-center pb-40 relative overflow-hidden overscroll-none">

      
      <HowToModal
        open={showHelp}
        // pass your own focus callback into the modal
        onClose={() => setShowHelp(false)}
        focusInput={() => inputRef.current?.focus()}
      />

      {/* Top bar */}
      <div className="absolute top-4 inset-x-0 flex items-center justify-between max-w-md mx-auto px-4">
        <button onClick={backHome} className="text-[#334155] underline">← Back</button>
        <div className="h-10 px-4 rounded-xl bg-[#334155] text-white flex items-center justify-center text-lg font-semibold">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="h-10 px-4 rounded-xl bg-[#3BB2F6] text-white flex items-center gap-2">
            <FaShareAlt /> Share
          </button>
          <a href="/leaderboard" className="h-10 px-4 rounded-xl bg-[#334155] text-white flex items-center gap-2">
            <FaList /> Board
          </a>
        </div>
      </div>

      {/* Input area */}
      <div className="w-full max-w-md px-4 mt-20 relative">
        <div className="flex gap-2 items-center mb-2 relative">
          <span className="absolute right-20 top-1/2 -translate-y-1/2 text-[#334155]">{score}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="ENTER WORD"
            className="flex-1 h-14 rounded-xl border-2 border-[#334155] bg-[#F1F5F9] text-[#334155] text-xl text-center tracking-widest outline-none"
            //inputMode="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button onClick={submitWord} className="h-14 w-14 rounded-xl bg-[#3BB2F6] flex items-center justify-center text-white text-xl">
            ↵
          </button>
        </div>

        {!showHelp && (
          <motion.div key={latestSeed} variants={popVariants} initial="initial" animate="animate" exit="exit"
            className="w-full rounded-xl bg-[#334155] text-white text-2xl font-bold text-center py-3 mb-4">
            {latestSeed}
          </motion.div>
        )}
      </div>

      {/* Past words */}
      <div className="w-full max-w-md px-4 flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {pastWords.slice().reverse().map(w => (
            <motion.div key={w} variants={popVariants} initial="initial" animate="animate" exit="exit"
              className="w-full rounded-xl bg-[#10B981] text-white text-lg font-semibold text-center py-3 mb-2 opacity-70">
              {w}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Virtual keyboard */}
     {/*} <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none"
           style={{ touchAction:'manipulation', WebkitTapHighlightColor:'transparent' }}>
        <div className="max-w-md w-full backdrop-blur-sm bg-[#334155]/20 rounded-3xl p-2 pointer-events-auto mx-auto">
          {KB_ROWS.map((row, idx) => (
            <div key={idx} className="flex justify-center gap-2 mb-2 last:mb-0 flex-nowrap">
              {row.map(k => {
                const isEnter = k==='ENTER', isDel = k==='DEL';
                const base = 'h-14 rounded-md text-lg font-semibold flex items-center justify-center';
                if (isEnter) return <button key={k} onPointerDown={()=>onVKPress(k)} className={`${base} w-20 bg-[#3BB2F6] text-white`}>↵</button>;
                if (isDel)   return <button key={k} onPointerDown={()=>onVKPress(k)} className={`${base} w-20 bg-[#F1F5F9] text-[#334155]`}>⌫</button>;
                return <button key={k} onPointerDown={()=>onVKPress(k)} className={`${base} w-14 bg-[#F1F5F9] text-[#334155]`}>{k}</button>;
              })}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

// ---------- Home screen (unchanged) ----------
function HomeScreen({
  nickname,
  onNicknameChange,
  onStart,
}: {
  nickname: string;
  onNicknameChange: () => void;
  onStart: () => void;
}) {
  const [currentLeader, setCurrentLeader] = useState<{ name: string; score: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const dk = buildDayKey();
        const [top] = await getDailyLeaderboard(dk, 1);
        if (top) setCurrentLeader({ name: top.name, score: top.score });
      } catch (e) {
        console.error('Error loading current leader', e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden overscroll-none">
      <motion.div initial="hidden" animate="show" variants={{ hidden:{}, show:{ transition:{staggerChildren:0.35} } }} className="w-full max-w-md px-6 space-y-6">
        <motion.h1 variants={childFall} className={`${titleFont.className} text-5xl font-extrabold text-[#334155]`}>Lexit</motion.h1>
        <motion.p variants={childFall} className="text-[#334155] italic">A little goes a long way</motion.p>
        <motion.button variants={childFall} onClick={onStart} className="w-full py-4 rounded-2xl bg-[#10B981] text-white text-2xl font-semibold shadow">Daily Challenge</motion.button>
        <motion.div variants={childFall} className="w-full flex justify-center items-center space-x-2 text-sm text-[#334155] mt-1">
          <div className="underline cursor-pointer" onClick={onNicknameChange}>
            Change nickname {nickname?`(@${nickname})`:''}
          </div>
          <span>|</span>
          <div>Leader: {currentLeader?`${currentLeader.name} - ${currentLeader.score}`:'Loading...'}</div>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#334155]/60">Created By: Nuiche</div>
    </div>
  );
}