'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HowToModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-xl p-6 max-w-sm w-full text-[#334155] relative"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-3">How to Play Lexit</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Start from the seed word shown in gray.</li>
            <li>Change exactly one letter (or add/remove exactly one) to make a real English word.</li>
            <li>Your new word becomes the seed. Repeat and build your stack.</li>
            <li>No repeats within the same game.</li>
            <li>Hit milestones to earn a scramble token.</li>
            <li>Daily Challenge: same seed for everyone, resets every 24h.</li>
          </ol>
          <button
            onClick={onClose}
            className="mt-5 w-full py-2 bg-[#3BB2F6] text-white rounded-lg"
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
