// components/HowToModal.tsx
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  open: boolean
  onClose: () => void
}

export default function HowToModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.8, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-10 w-[90%] max-w-md bg-white rounded-2xl p-6 text-left overflow-y-auto max-h-[80vh]"
          >
            <h2 className="text-2xl font-bold mb-3 text-[#334155]">How to Play</h2>
            <ul className="list-disc ml-6 space-y-2 text-sm text-gray-700">
              <li>Start with the seed word shown.</li>
              <li>Enter a new word that is exactly <strong>one edit</strong> away (add, remove, or replace one letter).</li>
              <li>Words must be valid English words (we check a dictionary).</li>
              <li>You can’t reuse a word already in your stack.</li>
              <li>Every 5, 12, 21, 32, 45… words you earn a scramble token to swap the seed.</li>
            </ul>

            <div className="mt-4 space-y-2">
              <p className="font-semibold text-[#334155]">Example chain</p>
              <p className="text-sm text-gray-700">
                <span className="font-mono bg-[#334155] text-white px-2 py-1 rounded mr-1">STONE</span>
                →
                <span className="font-mono bg-[#10B981] text-white px-2 py-1 rounded mx-1">TONE</span>
                →
                <span className="font-mono bg-[#10B981] text-white px-2 py-1 rounded mx-1">TONES</span>
                →
                <span className="font-mono bg-[#10B981] text-white px-2 py-1 rounded ml-1">TONED</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-lg bg-[#3BB2F6] text-white font-semibold"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
