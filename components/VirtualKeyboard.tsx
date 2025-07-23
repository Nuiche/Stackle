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
      className="fixed bottom-24 left-0 right-0 mx-auto max-w-md px-2 pb-2 pointer-events-auto"
      style={{ zIndex: 60 }}
    >
      <div className="backdrop-blur bg-[#334155]/75 rounded-xl p-2 shadow-lg space-y-2">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-2">
            {row.map((k) => (
              <button
                key={k}
                disabled={disabled}
                onClick={() => onChar(k)}
                className="flex-1 py-2 rounded-md bg-[#F1F5F9]/90 text-[#334155] font-semibold text-base active:scale-95 disabled:opacity-50"
              >
                {k}
              </button>
            ))}
            {ri === 1 && (
              <button
                disabled={disabled}
                onClick={onDelete}
                className="px-3 py-2 rounded-md bg-[#F1F5F9]/90 text-[#334155] font-semibold text-base active:scale-95 disabled:opacity-50"
              >
                ⌫
              </button>
            )}
            {ri === 2 && (
              <button
                disabled={disabled}
                onClick={onEnter}
                className="px-3 py-2 rounded-md bg-[#3BB2F6] text-white font-semibold text-base active:scale-95 disabled:opacity-50"
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
