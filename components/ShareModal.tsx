'use client';
import React, { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
};

export default function ShareModal({ open, imageUrl, onClose }: Props) {
  const [src, setSrc] = useState<string>('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  // When opened or URL changes, fetch -> blob -> objectURL
  useEffect(() => {
    if (!open || !imageUrl) return;
    let revoked = false;
    (async () => {
      setLoading(true);
      setErr(false);
      try {
        const res = await fetch(imageUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('bad status');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (!revoked) setSrc(url);
      } catch {
        if (!revoked) setErr(true);
      } finally {
        if (!revoked) setLoading(false);
      }
    })();
    return () => {
      revoked = true;
      if (src) URL.revokeObjectURL(src);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, imageUrl]);

  if (!open) return null;

  async function handleCopy() {
    try {
      const blob = await fetch(src).then(r => r.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      alert('Copied!');
    } catch {
      alert('Copy failed. Try Download.');
    }
  }

  function handleDownload() {
    const a = document.createElement('a');
    a.href = src;
    a.download = 'lexit-score.png';
    a.click();
  }

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
          {loading && <div className="text-gray-500 text-sm">Generating…</div>}
          {!loading && !err && src && (
            <img
              src={src}
              alt="share"
              className="max-h-full max-w-full object-contain"
            />
          )}
          {!loading && err && (
            <div className="text-red-500 text-sm">
              Failed to load image.
              <br />
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-600"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCopy}
            className="px-5 py-3 rounded-lg bg-[#3BB2F6] text-white font-medium"
            disabled={err || loading || !src}
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-3 rounded-lg bg-[#10B981] text-white font-medium"
            disabled={err || loading || !src}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
