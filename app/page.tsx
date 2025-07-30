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
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion';
import { FaShareAlt, FaList } from 'react-icons/fa';

import { burst } from '@/lib/confetti';
import { gaEvent } from '@/lib/gtag';
import { saveScore, GameMode } from '@/lib/saveScore';
import { dayKey as buildDayKey } from '@/lib/dayKey';
import HowToModal from '@/components/HowToModal';
import PromptModal from '@/components/PromptModal';
import { titleFont } from '@/lib/fonts';
import { getDailyLeaderboard } from '@/lib/getLeaderboard';

// ---------- constants ----------
const MAX_LEN = 8;
const MIN_LEN = 4;
const POP_INTERVALS = [10, 25, 50, 75, 100, 125, 150, 175, 200];

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
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } },
};

// ---------- component ----------
export default function Page() {
  const router = useRouter();

  // persisted state
  const [nickname, setNickname] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);

  // modal flow: 'groupName' -> 'nickname' -> null
  const [modalType, setModalType] = useState<'groupName' | 'nickname' | null>(null);

  // UI state
  const [showHome, setShowHome] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const inputControls = useAnimation();

  // timer
  const TIME_LIMIT = 90;
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const timerRef = useRef<number | null>(null);

  // game state
  const [seedWord, setSeedWord] = useState('TREAT');
  const [stack, setStack] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [dict, setDict] = useState<Set<string>>(new Set());
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const inputRef = useRef<HTMLInputElement>(null);

  // hydrate nickname (client-only)
  useEffect(() => {
    const n = localStorage.getItem('lexit_nick');
    if (n) setNickname(n);
  }, []);

  // hydrate groupId/groupName from URL or storage (client-only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get('groupId');
    const gnm = params.get('groupName');
    if (gid && gnm) {
      setGroupId(gid);
      setGroupName(decodeURIComponent(gnm));
      localStorage.setItem('groupId', gid);
      localStorage.setItem('groupName', gnm);
    } else {
      const sg = localStorage.getItem('groupId');
      const sn = localStorage.getItem('groupName');
      if (sg && sn) {
        setGroupId(sg);
        setGroupName(decodeURIComponent(sn));
      }
    }
  }, []);

  // load dictionary
  useEffect(() => {
    fetch('/api/dictionary')
      .then((res) => res.json())
      .then((words: string[]) => setDict(new Set(words.map((w) => w.toUpperCase()))));
  }, []);

  // auto-focus input when game starts
  useEffect(() => {
    if (!showHome && !showHelp) inputRef.current?.focus();
  }, [showHome, showHelp]);

  // timer setup/cleanup
  useEffect(() => {
    if (!showHome && !showHelp) {
      timerRef.current && clearInterval(timerRef.current);
      setTimeLeft(TIME_LIMIT);
      timerRef.current = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [showHome, showHelp]);

  // end of game redirect
  useEffect(() => {
    if (timeLeft > 0) return;
    timerRef.current && clearInterval(timerRef.current);
    const endSeed = stack.length ? stack[stack.length - 1] : seedWord;
    const go = () => {
      let url = `/leaderboard?endSeed=${encodeURIComponent(endSeed)}&score=${score}`;
      if (groupId && groupName) {
        url += `&groupId=${encodeURIComponent(groupId)}&groupName=${encodeURIComponent(groupName)}`;
      }
      router.push(url);
    };
    if (score > 0) handleSaveScore().finally(go);
    else go();
  }, [timeLeft, score, groupId, groupName, router, stack, seedWord]);

  // prompt nickname
  const onConfirmNickname = (n: string) => {
    const clean = n.slice(0, 20);
    setNickname(clean);
    localStorage.setItem('lexit_nick', clean);
    setModalType(null);
    startGame('group');
  };

  // create group via API
  const onConfirmGroupName = async (raw: string) => {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: raw.trim() }),
    });
    const data = (await res.json()) as { ok: boolean; id: string; displayName: string };
    if (!data?.ok) {
      alert('Error creating group');
      setModalType(null);
      return;
    }
    setGroupId(data.id);
    setGroupName(data.displayName);
    localStorage.setItem('groupId', data.id);
    localStorage.setItem('groupName', encodeURIComponent(data.displayName));
    // copy invite link
    const invite = `${window.location.origin}?groupId=${encodeURIComponent(data.id)}&groupName=${encodeURIComponent(
     data.displayName
    )}`;
    // auto‑copy to clipboard
    try {
     await navigator.clipboard.writeText(invite);
      alert('Invite link copied to clipboard!');
    } catch {
      alert(`Group created! Here’s the invite link:\n\n${invite}`);
    }
    setModalType('nickname');
  };

  // unified Group entry flow
  const onStartGroup = () => {
    if (groupId && nickname) {
      startGame('group');
    } else if (groupId && !nickname) {
      setModalType('nickname');
    } else {
      // neither or have nickname only
      setModalType('groupName');
    }
  };

  // solo entry
  const onStartSolo = () => {
    if (!nickname) setModalType('nickname');
    else startGame('daily');
  };

  // common start
  const startGame = async (mode: GameMode) => {
    const r = await fetch('/api/seed');
    const s = await r.json();
    setSeedWord(s.seed.toUpperCase());
    setStack([]);
    setScore(0);
    setInput('');
    setSubmitState('idle');
    setShowHome(false);
    setShowHelp(true);
  };

  // save score
  const handleSaveScore = async () => {
    if (submitState !== 'idle') return;
    setSubmitState('saving');
    try {
      const payload: any = {
        name: nickname || 'Anon',
        mode: groupId ? 'group' : 'daily',
        score,
        startSeed: seedWord,
        endSeed: stack.at(-1) ?? seedWord,
        dayKey: buildDayKey(),
      };
      if (groupId) payload.groupId = groupId;
      const res = await saveScore(payload);
      if (res.ok) gaEvent('submit_score', { score, mode: payload.mode });
      setSubmitState('saved');
    } catch {
      setSubmitState('idle');
    }
  };

  // word submission
  const clearInput = () => setInput('');
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    setInput(raw.slice(0, MAX_LEN));
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
  const submitWord = useCallback(() => {
    const w = input.trim().toUpperCase();
    if (
      !w ||
      w.length < MIN_LEN ||
      [seedWord, ...stack].includes(w) ||
      !dict.has(w) ||
      !isOneLetterDifferent(stack.length ? stack[stack.length - 1] : seedWord, w)
    ) {
      shakeInput();
      return;
    }
    setStack((s) => [...s, w]);
    setScore((s) => s + w.length);
    clearInput();
    inputRef.current?.focus();
    if (POP_INTERVALS.includes(score + 1)) burst();
    fetch(`/api/define?word=${w}`).catch(() => {});
  }, [input, seedWord, stack, score, dict]);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    }
  };
  const onVKPress = (k: string) => {
    if (k === 'ENTER') {
      submitWord();
      return;
    }
    if (k === 'DEL') {
      setInput((v) => v.slice(0, -1));
      return;
    }
    if (input.length >= MAX_LEN) return;
    setInput((v) => (v + k).toUpperCase());
  };

  const handleShare = () => {
    const text = `I scored ${score} in today's Daily Challenge on Lexit!`;
    const url = window.location.origin;
    if (navigator.share) navigator.share({ text, url }).catch(() => navigator.clipboard.writeText(`${text} ${url}`));
    else navigator.clipboard.writeText(`${text} ${url}`);
  };
  const changeNick = () => setModalType('nickname');
  const backHome = () => {
    setShowHome(true);
    setStack([]);
    setScore(0);
    setInput('');
    setSubmitState('idle');
  };

  // ------------ RENDER ------------
  if (showHome) {
    return (
      <>
        <PromptModal
          open={modalType === 'groupName'}
          title="Create a new group"
          instructions={
            <>
              Pick a short, memorable group name (e.g. “Family Fun” or “Office Squad”).<br />
              We'll generate a shareable link for others to join automatically.
            </>
          }
          initialValue=""
          onCancel={() => setModalType(null)}
          onConfirm={onConfirmGroupName}
        />
        <PromptModal
          open={modalType === 'nickname'}
          title="Pick your unique nickname"
          instructions={
            <>
              Make it unique so people in your group can spot you easily.<br />
              Consider adding initials or a number.
            </>
          }
          initialValue={nickname}
          onCancel={() => setModalType(null)}
          onConfirm={onConfirmNickname}
        />
        <HomeScreen
          nickname={nickname}
          onNicknameChange={changeNick}
          onStartSolo={onStartSolo}
          onStartGroup={onStartGroup}
          existingGroupName={groupName}
        />
      </>
    );
  }

  // ————————— GAME UI —————————
  const latestSeed = stack.length ? stack[stack.length - 1] : seedWord;
  const pastWords = stack.length ? [seedWord, ...stack.slice(0, -1)] : [];
  const formatTime = (sec: number) =>
    sec >= 60
      ? `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
      : `${sec}`;
  const shakeInput = async () => {
    const el = inputRef.current;
    if (el) el.style.caretColor = 'transparent';
    await inputControls.start({ x: [0, -5, 5, -5, 0], transition: { duration: 0.3 } });
    setTimeout(() => {
      setInput('');
      if (el) el.style.caretColor = '';
    }, 0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-40 relative overflow-hidden overscroll-none">
      <HowToModal open={showHelp} onClose={() => setShowHelp(false)} focusInput={() => inputRef.current?.focus()} />

      {/* Top bar */}
      <div className="absolute top-4 inset-x-0 flex items-center justify-between max-w-md mx-auto px-4">
        <button onClick={backHome} className="text-[#334155] underline">
          ← Back
        </button>
        <div className="h-10 px-4 rounded-xl bg-[#334155] text-white flex items-center justify-center text-lg font-semibold">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="h-10 px-4 rounded-xl bg-[#3BB2F6] text-white flex items-center gap-2">
            <FaShareAlt /> Share
          </button>
          <a
            href={
              groupId && groupName
                ? `/leaderboard?groupId=${encodeURIComponent(groupId)}&groupName=${encodeURIComponent(groupName)}`
                : '/leaderboard'
            }
            className="h-10 px-4 rounded-xl bg-[#334155] text-white flex items-center gap-2"
          >
            <FaList /> Board
          </a>
        </div>
      </div>

      {/* Input area */}
      <div className="w-full max-w-md px-4 mt-20 relative">
        <div className="flex gap-2 items-center mb-2 relative">
          <span className="absolute right-20 top-1/2 -translate-y-1/2 text-[#334155]">{score}</span>
          <motion.input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="ENTER WORD"
            className="flex-1 h-14 rounded-xl border-2 border-[#334155] bg-[#F1F5F9] text-[#334155] text-xl text-center tracking-widest outline-none"
            animate={inputControls}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button onClick={submitWord} className="h-14 w-14 rounded-xl bg-[#3BB2F6] flex items-center justify-center text-white text-xl">
            ↵
          </button>
        </div>
        {!showHelp && (
          <motion.div key={latestSeed} variants={popVariants} initial="initial" animate="animate" exit="exit" className="w-full rounded-xl bg-[#334155] text-white text-2xl font-bold text-center py-3 mb-4">
            {latestSeed}
          </motion.div>
        )}
      </div>

      {/* Past words */}
      <div className="w-full max-w-md px-4 flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {pastWords.slice().reverse().map((w) => (
            <motion.div key={w} variants={popVariants} initial="initial" animate="animate" exit="exit" className="w-full rounded-xl bg-[#10B981] text-white text-lg font-semibold text-center py-3 mb-2 opacity-70">
              {w}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Home screen ----------
function HomeScreen({
  nickname,
  onNicknameChange,
  onStartSolo,
  onStartGroup,
  existingGroupName,
}: {
  nickname: string;
  onNicknameChange: () => void;
  onStartSolo: () => void;
  onStartGroup: () => void;
  existingGroupName: string | null;
}) {
  const [currentLeader, setCurrentLeader] = useState<{ name: string; score: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const dk = buildDayKey();
        const [ldr] = await getDailyLeaderboard(dk, 1);
        if (ldr) setCurrentLeader({ name: ldr.name, score: ldr.score });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.35 } } }} className="w-full max-w-md px-6 space-y-6">
        <motion.h1 variants={childFall} className={`${titleFont.className} text-5xl font-extrabold text-[#334155]`}>Lexit</motion.h1>
        <motion.p variants={childFall} className="text-[#334155] italic">A little goes a long way</motion.p>

        <motion.button variants={childFall} onClick={onStartSolo} className="w-full py-4 rounded-2xl bg-[#10B981] text-white text-2xl font-semibold shadow">
          Daily Challenge (Solo)
        </motion.button>

        <motion.button variants={childFall} onClick={onStartGroup} className="w-full py-4 rounded-2xl bg-[#3BB2F6] text-white text-2xl font-semibold shadow mt-4">
          Daily Challenge (Group)
        </motion.button>

        <motion.div variants={childFall} className="w-full flex justify-center items-center space-x-2 text-sm text-[#334155] mt-1">
          <div className="underline cursor-pointer" onClick={onNicknameChange}>
            Change Nickname {nickname ? `(@${nickname})` : ''}
          </div>
          <span>|</span>
          <div>Leader: {currentLeader ? `${currentLeader.name} (${currentLeader.score})` : 'Loading...'}</div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#334155]/60 space-x-2">
        <span>Created By: Nuiche</span>
        <a href="/privacy" className="underline">Privacy Policy</a>
      </div>
    </div>
  );
}
