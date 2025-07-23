'use client'
import React, { useEffect, useState } from 'react'

type Props = {
  url: string
  onClose: () => void
}

export default function ShareModal({ url, onClose }: Props) {
  const [src, setSrc] = useState(url)
  const [err, setErr] = useState(false)

  useEffect(() => { setSrc(url); setErr(false) }, [url])

  async function handleError() {
    try {
      const blob = await fetch(url, { cache: 'no-store' }).then(r => r.blob())
      setSrc(URL.createObjectURL(blob))
    } catch {
      setErr(true)
    }
  }

  async function handleCopy() {
    try {
      const blob = await fetch(src).then(r => r.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      alert('Copied to clipboard!')
    } catch {
      alert('Copy failed, use Download instead.')
    }
  }

  async function handleDownload() {
    const a = document.createElement('a')
    a.href = src
    a.download = 'lexit-score.png'
    a.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-gray-400"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold text-[#334155] mb-4">Share Card</h2>

        <div className="border rounded-lg overflow-hidden mb-4 flex items-center justify-center h-48 bg-gray-100">
          {!err ? (
            <img
              src={src}
              alt="share"
              className="max-h-full max-w-full object-contain"
              onError={handleError}
            />
          ) : (
            <div className="text-red-500 text-sm">
              Failed to load image.<br />
              <a href={url} target="_blank" rel="noreferrer" className="underline">
                Open in new tab
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCopy}
            className="px-5 py-3 rounded-lg bg-[#3BB2F6] text-white font-medium"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-3 rounded-lg bg-[#10B981] text-white font-medium"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
