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
import {
  FaShareAlt,
  FaTrophy,
  FaPaperPlane,
} from 'react-icons/fa'
import { event as gaEvent } from '@/lib/gtag'
import { saveScore } from '@/lib/saveScore'
import { burst } from '@/lib/confetti'
import { getUserId } from '@/lib/user'

type GameMode = 'endless' | 'daily'
type Screen = 'home' | 'nickname' | 'game'

const MILESTONES = [5, 10, 20, 30, 50]

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [mode, setMode] = useState<GameMode>('endless')
  const [name, setName] = useState('')
  const [dictionary, setDictionary] = useState<string[]>([])
  const [stack, setStack] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [sendSpin, setSendSpin] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const uidRef = useRef<string>('')

  // grab uid & name from localStorage
  useEffect(() => {
    uidRef.current = getUserId()
    const stored = typeof window !== 'undefined'
      ? localStorage.getItem('stackle_name')
      : null
    if (stored) setName(stored)
  }, [])

  // Load dictionary once
  useEffect(() => {
    fetch('/api/dictionary')
      .then((r) => r.json())
      .then((words: string[]) => setDictionary(words))
  }, [])

  // Start game when we reach "game" screen
  useEffect(() => {
    if (screen !== 'game' || !dictionary.length) return
    ;(async () => {
      if (mode === 'daily') {
        const d = await (await fetch('/api/seed')).json()
        setStack([d.seed])
      } else {
        const rand = dictionary[Math.floor(Math.random() * dictionary.length)]
        setStack([rand])
      }
      setInput('')
      inputRef.current?.focus()
    })()
  }, [screen, mode, dictionary])

  // ----- helpers -----
  const isValidMove = (oldW: string, newW: string) => {
    if (!dictionary.includes(newW)) return false
    if (oldW.length !== newW.length) return false
    let diff = 0
    for (let i = 0; i < oldW.length; i++) {
      if (oldW[i] !== newW[i]) diff++
      if (diff > 1) return false
    }
    return diff === 1
  }

  const handleSubmit = () => {
    const w = input.trim().toUpperCase()
    if (!w) return
    const seed = stack[0]
    if (isValidMove(seed, w)) {
      const newStack = [w, ...stack]
      setStack(newStack)
      setInput('')
      gaEvent('word_submit', { word: w, stackSize: newStack.length, mode })

      if (navigator.vibrate) navigator.vibrate(15)
      if (MILESTONES.includes(newStack.length)) burst()

      setSendSpin(true)
      setTimeout(() => setSendSpin(false), 400)
    } else {
      gaEvent('invalid_move', { attempted: w, from: seed, mode })
      alert('Invalid move!')
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
    // if we already have a name, skip straight to game
    if (name.trim().length >= 2) {
      setScreen('game')
    } else {
      setScreen('nickname')
    }
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
    const score = stack.length
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
      navigator.clipboard.writeText(
        `${shareText} Play at ${window.location.href}`
      )
      alert('Link copied to clipboard!')
    }
  }

  const handleSubmitScore = async () => {
    setIsSaving(true)
    try {
      await saveScore({ mode, score: stack.length, name })
      gaEvent('score_submit', { score: stack.length, mode })
      alert('Score submitted!')
    } catch (e) {
      console.error(e)
      alert('Failed to submit score. Check console / rules.')
    } finally {
      setIsSaving(false)
    }
  }

  // ----- screens -----
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
              <button
                onClick={() => goMode('daily')}
                className="w-full py-3 rounded-lg bg-green-600 text-white text-lg"
              >
                Daily
              </button>
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
            {/* Sticky top: input + score */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-white/90 to-gray-200/60 backdrop-blur pb-3">
              <div className="mb-2 flex space-x-2 items-center">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    className="w-full p-3 pr-14 border-2 border-gray-500 rounded-lg uppercase text-center text-xl tracking-widest focus:outline-none focus:border-blue-500"
                    placeholder="ENTER WORD"
                  />
                  {/* score badge */}
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 font-semibold">
                    {stack.length}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  animate={sendSpin ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  onClick={handleSubmit}
                  className="px-5 py-3 rounded-lg bg-blue-600 text-white text-xl flex items-center justify-center"
                  aria-label="Submit word"
                >
                  <FaPaperPlane />
                </motion.button>
              </div>

              {/* Seed word block */}
              {stack[0] && (
                <div className="mb-2">
                  <div className="w-full text-center py-3 rounded-lg bg-gray-700 text-white text-2xl font-semibold tracking-widest">
                    {stack[0]}
                  </div>
                </div>
              )}
            </div>

            {/* Stack list (old seed words) */}
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

            {/* Bottom action bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur py-3">
              <div className="max-w-md mx-auto px-4 flex gap-2">
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
                  <FaTrophy />{' '}
                  <span>{isSaving ? 'Saving…' : 'Submit'}</span>
                </button>
                <Link
                  href="/leaderboard"
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg flex items-center justify-center space-x-1 text-sm"
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
