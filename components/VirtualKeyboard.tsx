// components/VirtualKeyboard.tsx
'use client'

import React from 'react'

type Props = {
  onChar: (c: string) => void
  onDelete: () => void
  onEnter: () => void
  disabled?: boolean
}

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M']
]

export default function VirtualKeyboard({ onChar, onDelete, onEnter, disabled }: Props) {
  return (
    <div
      className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-2 pb-2 pointer-events-auto z-60"
    >
      <div className="backdrop-blur bg-[#334155]/60 rounded-2xl p-3 shadow-xl space-y-3">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-3">
            {row.map((k) => (
              <button
                key={k}
                disabled={disabled}
                onClick={() => onChar(k)}
                className="flex-1 py-3 rounded-lg bg-[#F1F5F9]/90 text-[#334155] font-semibold text-lg active:scale-95 disabled:opacity-50"
              >
                {k}
              </button>
            ))}
            {ri === 1 && (
              <button
                disabled={disabled}
                onClick={onDelete}
                className="px-4 py-3 rounded-lg bg-[#F1F5F9]/90 text-[#334155] font-semibold text-2xl leading-none active:scale-95 disabled:opacity-50"
                aria-label="Delete"
              >
                ⌫
              </button>
            )}
            {ri === 2 && (
              <button
                disabled={disabled}
                onClick={onEnter}
                className="px-4 py-3 rounded-lg bg-[#3BB2F6] text-white font-semibold text-lg active:scale-95 disabled:opacity-50"
                aria-label="Enter"
              >
                ↵
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
