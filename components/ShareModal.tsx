// components/ShareModal.tsx
'use client';
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  imageSrc: string; // object URL from canvas
};

export default function ShareModal({ open, onClose, imageSrc }: Props) {
  if (!open) return null;

  const copy = async () => {
    try {
      const blob = await fetch(imageSrc).then(r => r.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      alert('Copied!');
    } catch {
      alert('Copy failed, use Download.');
    }
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = 'lexit-score.png';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-gray-400"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold text-[#334155] mb-4">Share Card</h2>

        <div className="border rounded-lg overflow-hidden mb-4 flex items-center justify-center h-48 bg-gray-100">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="share"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-gray-500 text-sm">Generating…</div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={copy}
            className="px-5 py-3 rounded-lg bg-[#3BB2F6] text-white font-medium"
            disabled={!imageSrc}
          >
            Copy
          </button>
          <button
            onClick={download}
            className="px-5 py-3 rounded-lg bg-[#10B981] text-white font-medium"
            disabled={!imageSrc}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
