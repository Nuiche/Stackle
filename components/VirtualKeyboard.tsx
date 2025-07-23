// components/VirtualKeyboard.tsx
'use client'

import React from 'react'

type Props = {
  onChar: (c: string) => void
  onDelete: () => void
  onEnter: () => void
  disabled?: boolean
  activeChars?: Set<string>
}

const R1 = ['Q','W','E','R','T','Y','U','I','O','P']
const R2 = ['A','S','D','F','G','H','J','K','L']
const R3 = ['Z','X','C','V','B','N','M']

export default function VirtualKeyboard({
  onChar,
  onDelete,
  onEnter,
  disabled,
  activeChars
}: Props) {

  const base =
    'h-12 flex items-center justify-center rounded-lg font-semibold text-lg active:scale-95 disabled:opacity-50 transition-colors select-none'

  const keyBtn = (k: string) => {
    const active = activeChars?.has(k)
    return (
      <button
        key={k}
        disabled={disabled}
        onClick={() => onChar(k)}
        className={`${base} ${
          active ? 'bg-[#3BB2F6] text-white' : 'bg-[#F1F5F9] text-[#334155]'
        }`}
      >
        {k}
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-3 pb-2 z-60">
      <div className="backdrop-blur bg-[#334155]/70 rounded-2xl p-3 shadow-xl space-y-3">
        <div className="grid grid-cols-10 gap-2">{R1.map(keyBtn)}</div>

        <div className="grid grid-cols-10 gap-2">
          <div />
          {R2.map(keyBtn)}
          <button
            aria-label="Delete"
            disabled={disabled}
            onClick={onDelete}
            className={`${base} col-span-1 bg-[#F1F5F9] text-[#334155] text-2xl`}
          >
            ⌫
          </button>
        </div>

        <div className="grid grid-cols-9 gap-2">
          {R3.map(keyBtn)}
          <button
            aria-label="Enter"
            disabled={disabled}
            onClick={onEnter}
            className={`${base} col-span-2 bg-[#3BB2F6] text-white text-lg`}
          >
            ↵
          </button>
        </div>
      </div>
    </div>
  )
}
