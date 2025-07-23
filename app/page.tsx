// app/page.tsx
'use client'

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { FaShareAlt, FaTrophy, FaPaperPlane } from 'react-icons/fa'
import VirtualKeyboard from '@/components/VirtualKeyboard'
import HowToModal from '@/components/HowToModal'
import { event as gaEvent } from '@/lib/gtag'
import { saveScore } from '@/lib/saveScore'
import { burst } from '@/lib/confetti'
import { getUserId } from '@/lib/user'
import { getDailyLeaderboard } from '@/lib/getLeaderboard'

type GameMode = 'endless' | 'daily'
type Screen = 'home' | 'nickname' | 'game'

const MILESTONES = [5, 12, 21, 32, 45]
const FALLBACK_SEEDS = ['STONE', 'ALONE', 'CRANE', 'LIGHT', 'WATER', 'CROWN']

export default function Page() {
  /* ---------- state ---------- */
  const [screen, setScreen] = useState<Screen>('home')
  const [mode, setMode] = useState<GameMode>('endless')
  const [name, setName] = useState('')
  const [dictionary, setDictionary] = useState<string[]>([])
  const dictSet = useRef<Set<string>>(new Set())

  const [stack, setStack] = useState<string[]>([]) // seed at index 0
  const [input, setInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [sendSpin, setSendSpin] = useState(false)
  const [loadingSeed, setLoadingSeed] = useState(false)

  const [topDaily, setTopDaily] = useState<{ name?: string; score: number } | null>(null)

  const [scramblesUsed, setScramblesUsed] = useState(0)
  const [showHelp, setShowHelp] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const uidRef = useRef<string>('')

  /* ---------- init ---------- */
  useEffect(() => {
    uidRef.current = getUserId()
    const stored = typeof window !== 'undefined' ? localStorage.getItem('stackle_name') : null
    if (stored) setName(stored)
  }, [])

  useEffect(() => {
    fetch('/api/dictionary')
      .then(r => r.json())
      .then((words: string[]) => {
        setDictionary(words)
        dictSet.current = new Set(words)
      })
      .catch(() => {
        dictSet.current = new Set(FALLBACK_SEEDS)
      })
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    getDailyLeaderboard(today, 1)
      .then(rows => rows.length && setTopDaily({ name: rows[0].name, score: rows[0].score }))
      .catch(() => {})
  }, [])

  /* ---------- start game ---------- */
  useEffect(() => {
    if (screen !== 'game') return
    startGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mode, dictionary.length])

  async function startGame() {
    setLoadingSeed(true)
    try {
      if (mode === 'daily') {
        const d = await (await fetch('/api/seed')).json()
        setStack([d.seed])
      } else {
        const list = dictionary.length ? dictionary : FALLBACK_SEEDS
        setStack([list[Math.floor(Math.random() * list.length)]])
      }
      setInput('')
      setScramblesUsed(0)
      if (!localStorage.getItem('stackle_help_seen')) {
        setShowHelp(true)
        localStorage.setItem('stackle_help_seen', '1')
      }
      // keep native keyboard closed
      setTimeout(() => inputRef.current?.blur(), 0)
    } finally {
      setLoadingSeed(false)
    }
  }

  /* ---------- logic ---------- */
  function isOneEditAway(a: string, b: string) {
    a = a.toUpperCase(); b = b.toUpperCase()
    if (a === b) return false
    if (Math.abs(a.length - b.length) > 1) return false
    if (a.length > b.length) return isOneEditAway(b, a)

    let i = 0, j = 0, edits = 0
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++ }
      else {
        edits++; if (edits > 1) return false
        if (a.length === b.length) { i++; j++ } else { j++ }
      }
    }
    if (j < b.length || i < a.length) edits++
    return edits === 1
  }

  const score = Math.max(stack.length - 1, 0)

  const submitWord = () => {
    const w = input.trim().toUpperCase()
    if (!w) return
    if (stack.includes(w)) { alert('You already used that word.'); return }
    if (!dictSet.current.has(w)) { alert('Not a valid English word.'); return }
    const seed = stack[0]
    if (!isOneEditAway(seed, w)) {
      gaEvent('invalid_move', { attempted: w, from: seed, mode })
      alert('Invalid move! Must be exactly one edit away.')
      return
    }

    const newStack = [w, ...stack]
    setStack(newStack)
    setInput('')

    const newScore = Math.max(newStack.length - 1, 0)
    gaEvent('word_submit', { word: w, stackSize: newScore, mode })
    localStorage.setItem('stackle_last_score', String(newScore))

    if (navigator.vibrate) navigator.vibrate(15)
    if (newScore > 0 && newScore % 5 === 0) burst()

    setSendSpin(true); setTimeout(() => setSendSpin(false), 350)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitWord()
    if (e.key === 'Backspace') setInput(s => s.slice(0, -1))
    if (/^[a-zA-Z]$/.test(e.key)) setInput(s => (s + e.key).toUpperCase())
  }

  const goMode = (m: GameMode) => {
    setMode(m)
    gaEvent('mode_select', { mode: m })
    if (name.trim().length >= 2) setScreen('game')
    else setScreen('nickname')
  }

  const saveNameAndStart = () => {
    const clean = name.trim()
    if (clean.length < 2) { alert('Please enter at least 2 characters.'); return }
    localStorage.setItem('stackle_name', clean)
    setScreen('game')
  }

  const handleShare = () => {
    const txt = `I stacked ${score} words in Stackle Word!`
    gaEvent('share_click', { score, mode })
    if (navigator.share) {
      navigator.share({ title: 'My Stackle Word Score', text: txt, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${txt} Play: ${window.location.href}`)
      alert('Copied to clipboard!')
    }
  }

  const handleSubmitScore = async () => {
    setIsSaving(true)
    try {
      await saveScore({ mode, score, name })
      gaEvent('score_submit', { score, mode })
      alert('Score submitted!')
    } catch (e) {
      console.error(e)
      alert('Failed to submit.')
    } finally {
      setIsSaving(false)
    }
  }

  const tokensEarned = MILESTONES.filter(m => score >= m).length
  const tokensAvailable = tokensEarned - scramblesUsed

  const handleScramble = () => {
    if (tokensAvailable <= 0) return
    const list = dictionary.length ? dictionary : FALLBACK_SEEDS
    let newSeed = list[Math.floor(Math.random() * list.length)]
    while (stack.includes(newSeed)) newSeed = list[Math.floor(Math.random() * list.length)]
    setStack([newSeed, ...stack])
    setScramblesUsed(n => n + 1)
    gaEvent('scramble_used', { atScore: score, mode })
    burst()
  }

  /* ---------- animations ---------- */
  const popVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 8 }, // starts slightly BELOW header, not above
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 25 } as const
    }
  }

  const homeParent: Variants = {
    hidden: { opacity: 0, y: -40 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.25, delayChildren: 0.4 } }
  }
  const homeChild: Variants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } as const }
  }

  const vkOnChar  = (c: string) => setInput(s => (s + c).toUpperCase())
  const vkOnDelete= () => setInput(s => s.slice(0, -1))
  const vkOnEnter = () => submitWord()
  const activeChars = new Set(input.split(''))

  /* ---------- render ---------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#CFCFCF] flex flex-col items-center text-gray-900">
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div
            key="home"
            variants={homeParent}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-md p-6 pt-16 text-center space-y-6 relative"
          >
            <motion.h1 variants={homeChild} className="text-3xl font-bold mb-2 text-[#334155]">
              Stackle Word
            </motion.h1>
            <motion.p variants={homeChild} className="text-sm italic text-gray-600 mb-6">
              A little goes a long way
            </motion.p>

            <motion.div variants={homeChild} className="space-y-3">
              <button
                onClick={() => goMode('endless')}
                className="w-full py-3 rounded-lg bg-[#3BB2F6] text-white text-lg"
              >
                Endless
              </button>
              <div>
                <button
                  onClick={() => goMode('daily')}
                  className="w-full py-3 rounded-lg bg-[#10B981] text-white text-lg"
                >
                  Daily Challenge
                </button>
                {topDaily && (
                  <p className="text-xs text-gray-500 mt-2">
                    Top today: <span className="font-semibold">{topDaily.name ?? 'Anon'}</span> – {topDaily.score}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div variants={homeChild} className="absolute left-3 bottom-3 text-[#334155]">
              <span className="block text-sm font-semibold">@Nuiche 🕺</span>
              <span className="uppercase tracking-wider opacity-70 text-[10px]">VENMO</span>
            </motion.div>
          </motion.div>
        )}

        {screen === 'nickname' && (
          <motion.div
            key="nickname"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md p-6 pt-16 text-center space-y-6"
          >
            <h2 className="text-2xl font-semibold text-[#334155]">Session Nickname</h2>
            <p className="text-sm text-gray-600">This will appear on the leaderboard.</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={16}
              className="w-full p-3 border-2 border-[#334155] rounded-lg text-center text-lg focus:outline-none focus:border-[#3BB2F6]"
              placeholder="e.g. WonTronSoup"
            />
            <button
              onClick={saveNameAndStart}
              className="w-full py-3 rounded-lg bg-[#3BB2F6] text-white text-lg"
            >
              Continue
            </button>
            <button onClick={() => setScreen('home')} className="text-sm underline text-gray-400">
              Back
            </button>
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto flex-1 flex flex-col p-4"
          >
            {/* scramble token */}
            {tokensAvailable > 0 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleScramble}
                className="fixed top-4 left-4 w-12 h-12 rounded-full bg-[#3BB2F6] shadow-lg flex items-center justify-center z-50"
                aria-label="Scramble seed"
              >
                <img src="/icons/reset.png" alt="Scramble" className="w-8 h-8" />
              </motion.button>
            )}

            {/* Input + seed (center-ish) */}
            <div className="mt-[8vh] mb-4">
              <div className="mb-2 flex space-x-2 items-center">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    readOnly
                    inputMode="none"
                    value={input}
                    onKeyDown={onKeyDown}
                    className="w-full p-3 pr-14 border-2 border-[#334155] rounded-lg uppercase text-center text-xl tracking-widest focus:outline-none focus:border-[#3BB2F6] bg-[#F1F5F9] select-none"
                    placeholder={loadingSeed ? 'LOADING…' : 'ENTER WORD'}
                    onFocus={e => e.currentTarget.blur()}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-[#334155] font-semibold">
                    {score}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  animate={sendSpin ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  onClick={submitWord}
                  disabled={loadingSeed}
                  className="px-5 py-3 rounded-lg bg-[#3BB2F6] text-white text-xl flex items-center justify-center disabled:opacity-50"
                  aria-label="Submit word"
                >
                  <FaPaperPlane />
                </motion.button>
              </div>

              {stack[0] && !loadingSeed && (
                <div className="mb-2">
                  <div className="w-full text-center py-3 rounded-lg bg-[#334155] text-white text-2xl font-semibold tracking-widest">
                    {stack[0]}
                  </div>
                </div>
              )}
            </div>

            {/* Past words BELOW header */}
            <div className="flex-1 overflow-y-auto mt-2 space-y-3 pb-72">
              <AnimatePresence initial={false}>
                {stack.slice(1).map((word, i) => (
                  <motion.div
                    key={`${word}-${i}`}
                    layout
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.8 }}
                    variants={popVariants}
                    className="stack-item p-4 rounded-lg shadow bg-[#10B981] text-white text-lg"
                  >
                    {word}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* VK */}
            <VirtualKeyboard
              onChar={vkOnChar}
              onDelete={vkOnDelete}
              onEnter={vkOnEnter}
              disabled={loadingSeed}
              activeChars={activeChars}
            />

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 px-3 z-50">
              <div className="w-full max-w-md bg-black/60 rounded-2xl shadow-lg backdrop-blur flex gap-2 p-2">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 bg-[#3BB2F6] text-white rounded-lg flex items-center justify-center space-x-1 text-sm"
                >
                  <FaShareAlt /> <span>Share</span>
                </button>
                <button
                  onClick={handleSubmitScore}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-[#10B981] text-white rounded-lg flex items-center justify-center space-x-1 text-sm disabled:opacity-60"
                >
                  <FaTrophy /> <span>{isSaving ? 'Saving…' : 'Submit'}</span>
                </button>
                <Link
                  href="/leaderboard"
                  className="flex-1 py-2 bg-[#334155] text-white rounded-lg flex items-center justify-center space-x-1 text-sm"
                >
                  <span>Board</span>
                </Link>
              </div>
            </div>

            <HowToModal open={showHelp} onClose={() => setShowHelp(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
