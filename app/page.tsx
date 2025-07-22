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
import { FaShareAlt, FaTrophy } from 'react-icons/fa'
import { event as gaEvent } from '@/lib/gtag'
import { saveScore } from '@/lib/saveScore'

type GameMode = 'endless' | 'daily'

export default function Page() {
  const [mode, setMode] = useState<GameMode>('endless')
  const [dictionary, setDictionary] = useState<string[]>([])
  const [stack, setStack] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // load dictionary
  useEffect(() => {
    fetch('/api/dictionary')
      .then((r) => r.json())
      .then((words: string[]) => setDictionary(words))
  }, [])

  // seed word when mode or dictionary changes
  useEffect(() => {
    if (!dictionary.length) return
    const init = async () => {
      if (mode === 'daily') {
        const d = await (await fetch('/api/seed')).json()
        setStack([d.seed])
      } else {
        const rand = dictionary[Math.floor(Math.random() * dictionary.length)]
        setStack([rand])
      }
      inputRef.current?.focus()
    }
    init()
  }, [mode, dictionary])

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
    const currentSeed = stack[0]
    if (isValidMove(currentSeed, w)) {
      const newStack = [w, ...stack]
      setStack(newStack)
      setInput('')
      gaEvent('word_submit', { word: w, stackSize: newStack.length, mode })
    } else {
      gaEvent('invalid_move', { attempted: w, from: currentSeed, mode })
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
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto">
        {/* mode toggle */}
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

        {/* input */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="w-full p-3 md:p-4 border-2 border-gray-400 rounded-lg uppercase text-center text-lg md:text-xl tracking-widest focus:outline-none focus:border-blue-500"
            placeholder="ENTER WORD"
          />
        </div>

        {/* stack */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {stack.map((word, i) => (
              <motion.div
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-lg ${
                  i === 0 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                {word}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* share & submit */}
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
