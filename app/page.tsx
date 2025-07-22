// app/page.tsx

'use client'

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaShareAlt } from 'react-icons/fa'

type GameMode = 'endless' | 'daily'

export default function Page() {
  const [mode, setMode] = useState<GameMode>('endless')
  const [dictionary, setDictionary] = useState<string[]>([])
  const [stack, setStack] = useState<string[]>([])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Load dictionary once
  useEffect(() => {
    fetch('/api/dictionary')
      .then((res) => res.json())
      .then((words: string[]) => setDictionary(words))
  }, [])

  // On mode or dictionary change, pick seed
  useEffect(() => {
    if (dictionary.length === 0) return
    if (mode === 'daily') {
      fetch('/api/seed')
        .then((res) => res.json())
        .then((data: { seed: string }) => setStack([data.seed]))
    } else {
      const rand = dictionary[Math.floor(Math.random() * dictionary.length)]
      setStack([rand])
    }
    inputRef.current?.focus()
  }, [mode, dictionary])

  // Validate single-letter move
  const isValidMove = (oldW: string, newW: string) => {
    if (!dictionary.includes(newW)) return false
    let diff = 0
    for (let i = 0; i < oldW.length; i++) {
      if (oldW[i] !== newW[i]) diff++
      if (diff > 1) return false
    }
    return diff === 1
  }

  const handleSubmit = () => {
    const w = input.trim().toUpperCase()
    const oldW = stack[0]
    if (isValidMove(oldW, w)) {
      setStack([w, ...stack])
      setInput('')
    } else {
      alert('Invalid move!')
    }
    inputRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleShare = () => {
    const score = stack.length
    const shareText = `I stacked ${score} words in Stackle Word!`
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-500 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        {/* Mode switch */}
        <div className="flex mb-4 space-x-2 text-sm md:text-base">
          <button
            onClick={() => setMode('endless')}
            className={`flex-1 py-2 rounded-lg ${
              mode === 'endless'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Endless
          </button>
          <button
            onClick={() => setMode('daily')}
            className={`flex-1 py-2 rounded-lg ${
              mode === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Daily
          </button>
        </div>

        {/* Input box */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={onKeyDown}
            className="w-full p-3 md:p-4 border-2 border-gray-400 rounded-lg uppercase text-center text-lg md:text-xl tracking-widest focus:outline-none focus:border-blue-500"
            placeholder="Enter word"
          />
        </div>

        {/* Stack */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {stack.map((word, i) => (
              <motion.div
                key={word}
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

        {/* Share button */}
        <button
          onClick={handleShare}
          className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg flex items-center justify-center space-x-2"
        >
          <FaShareAlt /> <span>Share My Score</span>
        </button>
      </div>
    </main>
  )
}
