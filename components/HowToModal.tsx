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
            <li>Start with the daily seed word.</li>
            <li>Change exactly one letter (insert, delete or replace) per turn.</li>
            <li>Words must be at least 4 letters and at most 8 letters long.</li>
            <li>Earn points equal to each word’s length.</li>
            <li>You have 1 minute, 30 seconds to chain as many words as possible!</li>
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
