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

type GameMode = 'endless' | 'daily'

const MILESTONES = [5, 10, 20, 30, 50]

export default function Page() {
  const [mode, setMode] = useState<GameMode>('endless')
  const [dictionary, setDictionary] = useState<string[]>([])
  const [stack, setStack] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [sendSpin, setSendSpin] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const uidRef = useRef<string>('')

  useEffect(() => {
    uidRef.current = getUserId()
  }, [])

  // Load dictionary
  useEffect(() => {
    fetch('/api/dictionary')
      .then((r) => r.json())
      .then((words: string[]) => setDictionary(words))
  }, [])

  // Seed word when mode or dictionary changes
  useEffect(() => {
    if (!dictionary.length) return
    ;(async () => {
      if (mode === 'daily') {
        const d = await (await fetch('/api/seed')).json()
        setStack([d.seed])
      } else {
        const rand = dictionary[Math.floor(Math.random() * dictionary.length)]
        setStack([rand])
      }
      inputRef.current?.focus()
    })()
  }, [mode, dictionary])

  // Validate single-letter difference
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

      // Vibrate (mobile only)
      if (navigator.vibrate) navigator.vibrate(15)

      // Confetti on milestones
      if (MILESTONES.includes(newStack.length)) burst()

      // spin the send button quickly
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

  const switchMode = (m: GameMode) => {
    setMode(m)
    gaEvent('mode_switch', { mode: m })
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
      await saveScore({ mode, score: stack.length })
      gaEvent('score_submit', { score: stack.length, mode })
      alert('Score submitted!')
    } catch (e) {
      console.error(e)
      alert('Failed to submit score. Check console / rules.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-500 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto p-4 pb-24">
        {/* Mode toggle */}
        <div className="flex mb-4 space-x-2 text-sm md:text-base">
          <button
            onClick={() => switchMode('endless')}
            className={`flex-1 py-2 rounded-lg ${
              mode === 'endless'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Endless
          </button>
          <button
            onClick={() => switchMode('daily')}
            className={`flex-1 py-2 rounded-lg ${
              mode === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Daily
          </button>
        </div>

        {/* Input + Send */}
        <div className="mb-4 flex space-x-2 sticky top-0 bg-gradient-to-b from-gray-100/90 to-gray-200/60 backdrop-blur z-10 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="flex-1 p-3 border-2 border-gray-400 rounded-lg uppercase text-center text-lg md:text-xl tracking-widest focus:outline-none focus:border-blue-500"
            placeholder="ENTER WORD"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={sendSpin ? { rotate: 360 } : { rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            onClick={handleSubmit}
            className="px-4 rounded-lg bg-blue-500 text-white flex items-center justify-center"
            aria-label="Submit word"
          >
            <FaPaperPlane />
          </motion.button>
        </div>

        {/* Stack list */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {stack.map((word, i) => (
              <motion.div
                key={`${word}-${i}`}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`p-4 rounded-lg shadow ${
                  i === 0 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                {word}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Share & Submit */}
        <button
          onClick={handleShare}
          className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg flex items-center justify-center space-x-2"
        >
          <FaShareAlt />
          <span>Share My Score</span>
        </button>

        <button
          onClick={handleSubmitScore}
          disabled={isSaving}
          className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-lg flex items-center justify-center space-x-2 disabled:opacity-60"
        >
          <FaTrophy />
          <span>{isSaving ? 'Submitting…' : 'Submit Score'}</span>
        </button>

        <Link
          href="/leaderboard"
          className="block text-center text-sm mt-4 underline text-gray-800"
        >
          View Leaderboard
        </Link>
      </div>
    </main>
  )
}
