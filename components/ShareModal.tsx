'use client'

import React, { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  imageUrl: string
}

export default function ShareModal({ open, onClose, imageUrl }: Props) {
  const [downloading, setDownloading] = useState(false)

  if (!open) return null

  const copyImage = async () => {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      // @ts-ignore - ClipboardItem not in TS lib yet in some configs
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      alert('Image copied to clipboard!')
    } catch {
      alert('Copy failed. Long-press / right-click to save instead.')
    }
  }

  const downloadImage = async () => {
    setDownloading(true)
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'lexit-score.png'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-4 max-w-sm w-full relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 text-xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold text-[#334155] mb-3">
          Share Card
        </h2>

        <div className="w-full border rounded overflow-hidden mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Share card" className="w-full h-auto" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyImage}
            className="flex-1 py-2 rounded-lg bg-[#3BB2F6] text-white text-sm"
          >
            Copy
          </button>
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="flex-1 py-2 rounded-lg bg-[#10B981] text-white text-sm disabled:opacity-50"
          >
            {downloading ? '...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  )
}
