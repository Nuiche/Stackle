'use client'

import React from 'react'

type Props = {
  onChar: (c: string) => void
  onDelete: () => void
  onEnter: () => void
  disabled?: boolean
  activeChars?: Set<string>
}

const R1 = ['Q','W','E','R','T','Y','U','I','O','P']      // 10
const R2 = ['A','S','D','F','G','H','J','K','L']          // 9
const R3 = ['Z','X','C','V','B','N','M']                  // 7

export default function VirtualKeyboard({
  onChar,
  onDelete,
  onEnter,
  disabled,
  activeChars
}: Props) {

  const base =
    'flex items-center justify-center rounded-xl font-semibold text-xl h-14 active:scale-95 disabled:opacity-50 transition-transform select-none'

  const keyBtn = (k: string) => {
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
      {/* subtle blur plate behind keys */}
      <div className="rounded-2xl p-3 backdrop-blur-sm bg-black/10">
        <div className="space-y-2">
          {/* Row 1 */}
          <div className="grid grid-cols-10 gap-2">
            {R1.map(keyBtn)}
          </div>

          {/* Row 2 (9 equal columns) */}
          <div className="grid grid-cols-9 gap-2">
            {R2.map(keyBtn)}
          </div>

          {/* Row 3: Enter (left) + 7 letters + Delete (right) */}
          <div className="grid grid-cols-9 gap-2">
            <button
              aria-label="Enter"
              disabled={disabled}
              onClick={onEnter}
              className={`${base} bg-[#3BB2F6] text-white text-2xl`}
            >
              ↵
            </button>

            {R3.map(keyBtn)}

            <button
              aria-label="Delete"
              disabled={disabled}
              onClick={onDelete}
              className={`${base} bg-[#F1F5F9] text-[#334155] text-2xl`}
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
