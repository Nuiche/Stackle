// app/page.tsx
'use client'

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  ChangeEvent,
} from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaShareAlt, FaTrophy, FaPaperPlane } from 'react-icons/fa'
import { event as gaEvent } from '@/lib/gtag'
import { saveScore } from '@/lib/saveScore'
import { burst } from '@/lib/confetti'
import { getUserId } from '@/lib/user'
import { getDailyLeaderboard } from '@/lib/getLeaderboard'

type GameMode = 'endless' | 'daily'
type Screen = 'home' | 'nickname' | 'game'

const MILESTONES = [5, 10, 20, 30, 50]
const FALLBACK_SEEDS = ['STONE', 'ALONE', 'CRANE', 'LIGHT', 'WATER', 'CROWN']

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [mode, setMode] = useState<GameMode>('endless')
  const [name, setName] = useState('')
  const [dictionary, setDictionary] = useState<string[]>([])
  const dictSet = useRef<Set<string>>(new Set())

  const [stack, setStack] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [sendSpin, setSendSpin] = useState(false)
  const [loadingSeed, setLoadingSeed] = useState(false)

  const [topDaily, setTopDaily] = useState<{ name?: string; score: number } | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const uidRef = useRef<string>('')

  useEffect(() => {
    uidRef.current = getUserId()
    const stored = typeof window !== 'undefined'
      ? localStorage.getItem('stackle_name')
      : null
    if (stored) setName(stored)
  }, [])

  useEffect(() => {
    fetch('/api/dictionary')
      .then((r) => r.json())
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
      .then((rows) => {
        if (rows.length) setTopDaily({ name: rows[0].name, score: rows[0].score })
      })
      .catch(() => {})
  }, [])

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
        const rand = list[Math.floor(Math.random() * list.length)]
        setStack([rand])
      }
      setInput('')
      setTimeout(() => inputRef.current?.focus(), 0)
    } finally {
      setLoadingSeed(false)
    }
  }

  function isOneEditAway(a: string, b: string): boolean {
    a = a.toUpperCase()
    b = b.toUpperCase()
    if (a === b) return false
    const lenA = a.length
    const lenB = b.length
    if (Math.abs(lenA - lenB) > 1) return false
    if (lenA > lenB) return isOneEditAway(b, a)

    let i = 0, j = 0, edits = 0
    while (i < lenA && j < lenB) {
      if (a[i] === b[j]) {
        i++; j++
      } else {
        edits++
        if (edits > 1) return false
        if (lenA === lenB) { i++; j++ } else { j++ }
      }
    }
    if (j < lenB || i < lenA) edits++
    return edits === 1
  }

  const handleSubmit = () => {
    const w = input.trim().toUpperCase()
    if (!w) return

    // no duplicates in this run
    if (stack.includes(w)) {
      alert('You already used that word.')
      return
    }

    if (!dictSet.current.has(w)) {
      alert('Not a valid English word.')
      return
    }

    const seed = stack[0]
    if (isOneEditAway(seed, w)) {
      const newStack = [w, ...stack]
      setStack(newStack)
      setInput('')

      const wordsStacked = Math.max(newStack.length - 1, 0)
      gaEvent('word_submit', { word: w, stackSize: wordsStacked, mode })

      if (navigator.vibrate) navigator.vibrate(15)
      if (wordsStacked > 0 && wordsStacked % 5 === 0) burst()

      setSendSpin(true)
      setTimeout(() => setSendSpin(false), 400)
    } else {
      gaEvent('invalid_move', { attempted: w, from: seed, mode })
      alert('Invalid move! Must be exactly one edit away.')
    }
    inputRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.toUpperCase())
  }

  const goMode = (m: GameMode) => {
    setMode(m)
    gaEvent('mode_select', { mode: m })
    if (name.trim().length >= 2) setScreen('game')
    else setScreen('nickname')
  }

  const saveNameAndStart = () => {
    const clean = name.trim()
    if (clean.length < 2) {
      alert('Please enter at least 2 characters.')
      return
    }
    localStorage.setItem('stackle_name', clean)
    setScreen('game')
  }

  const handleShare = () => {
    const score = Math.max(stack.length - 1, 0)
    const shareText = `I stacked ${score} words in Stackle Word!`
    gaEvent('share_click', { score, mode })

    if (navigator.share) {
      navigator
        .share({
          title: 'My Stackle Word Score',
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(`${shareText} Play at ${window.location.href}`)
      alert('Link copied to clipboard!')
    }
  }

  const handleSubmitScore = async () => {
    setIsSaving(true)
    try {
      await saveScore({ mode, score: Math.max(stack.length - 1, 0), name })
      gaEvent('score_submit', { score: Math.max(stack.length - 1, 0), mode })
      alert('Score submitted!')
    } catch (e) {
      console.error(e)
      alert('Failed to submit score. Check console / rules.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-black flex flex-col items-center text-gray-900">
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md p-6 pt-16 text-center space-y-6"
          >
            <h1 className="text-3xl font-bold mb-4">Stackle Word</h1>
            <p className="text-sm text-gray-600 mb-6">
              Choose a mode to start playing.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => goMode('endless')}
                className="w-full py-3 rounded-lg bg-blue-500 text-white text-lg"
              >
                Endless
              </button>
              <div>
                <button
                  onClick={() => goMode('daily')}
                  className="w-full py-3 rounded-lg bg-green-600 text-white text-lg"
                >
                  Daily Challenge
                </button>
                {topDaily && (
                  <p className="text-xs text-gray-200 mt-2">
                    Top today: <span className="font-semibold">{topDaily.name ?? 'Anon'}</span> – {topDaily.score}
                  </p>
                )}
              </div>
            </div>
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
            <h2 className="text-2xl font-semibold">Session Nickname</h2>
            <p className="text-sm text-gray-600">
              This will appear on the leaderboard.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-center text-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g. WonTronSoup"
            />
            <button
              onClick={saveNameAndStart}
              className="w-full py-3 rounded-lg bg-blue-500 text-white text-lg"
            >
              Continue
            </button>
            <button
              onClick={() => setScreen('home')}
              className="text-sm underline text-gray-400"
            >
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
          {/* Sticky top */}
            <div className="sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-3">
              <div className="mb-2 flex space-x-2 items-center">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    disabled={loadingSeed}
                    className="w-full p-3 pr-14 border-2 border-gray-500 rounded-lg uppercase text-center text-xl tracking-widest focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder={loadingSeed ? 'LOADING…' : 'ENTER WORD'}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 font-semibold">
                    {Math.max(stack.length - 1, 0)}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  animate={sendSpin ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  onClick={handleSubmit}
                  disabled={loadingSeed}
                  className="px-5 py-3 rounded-lg bg-blue-600 text-white text-xl flex items-center justify-center disabled:opacity-50"
                  aria-label="Submit word"
                >
                  <FaPaperPlane />
                </motion.button>
              </div>

              {stack[0] && !loadingSeed && (
                <div className="mb-2">
                  <div className="w-full text-center py-3 rounded-lg bg-gray-700 text-white text-2xl font-semibold tracking-widest">
                    {stack[0]}
                  </div>
                </div>
              )}
            </div>

            {/* Past words */}
            <div className="mt-2 space-y-2 pb-28">
              <AnimatePresence initial={false}>
                {stack.slice(1).map((word, i) => (
                  <motion.div
                    key={`${word}-${i}`}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="p-4 rounded-lg shadow bg-green-500 text-white text-lg"
                  >
                    {word}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 px-3">
              <div className="w-full max-w-md bg-black/60 rounded-2xl shadow-lg backdrop-blur flex gap-2 p-2">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 bg-indigo-500 text-white rounded-lg flex items-center justify-center space-x-1 text-sm"
                >
                  <FaShareAlt /> <span>Share</span>
                </button>
                <button
                  onClick={handleSubmitScore}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg flex items-center justify-center space-x-1 text-sm disabled:opacity-60"
                >
                  <FaTrophy /> <span>{isSaving ? 'Saving…' : 'Submit'}</span>
                </button>
                <Link
                  href="/leaderboard"
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg flex items-center justify-center space-x-1 text-sm"
                >
                  <span>Board</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
