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
    'flex items-center justify-center rounded-xl font-semibold text-xl h-14 active:scale-95 disabled:opacity-50 transition-transform select-none'

  const renderKey = (k: string) => {
    const active = activeChars?.has(k)
    return (
      <button
        key={k}
        disabled={disabled}
        onClick={() => onChar(k)}
        className={`${base} ${active ? 'bg-[#3BB2F6] text-white' : 'bg-[#F1F5F9] text-[#334155]'}`}
      >
        {k}
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-3 z-50 pointer-events-auto">
      <div className="space-y-2">
        {/* Row 1 */}
        <div className="grid grid-cols-10 gap-2">
          {R1.map(renderKey)}
        </div>

        {/* Row 2 (letters + delete on the right) */}
        <div className="grid grid-cols-10 gap-2">
          {R2.map(renderKey)}
          <button
            aria-label="Delete"
            disabled={disabled}
            onClick={onDelete}
            className={`${base} bg-[#F1F5F9] text-[#334155] text-2xl`}
          >
            ⌫
          </button>
        </div>

        {/* Row 3 (letters + wide enter) */}
        <div className="grid grid-cols-10 gap-2">
          {R3.map(renderKey)}
          {/* Fill up to 8 cols then enter spans the rest */}
          <div className="col-span-1" />
          <button
            aria-label="Enter"
            disabled={disabled}
            onClick={onEnter}
            className={`${base} col-span-2 bg-[#3BB2F6] text-white`}
          >
            ↵
          </button>
        </div>
      </div>
    </div>
  )
}
