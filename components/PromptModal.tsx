// components/PromptModal.tsx
'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import HowToModal from './HowToModal';

export default function PromptModal({
  open,
  title,
  initialValue = '',
  instructions,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  initialValue?: string;
  instructions: ReactNode;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset value & focus when opened
  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open, initialValue]);

  if (!open) return null;

  return (
    <HowToModal open onClose={onCancel} focusInput={() => inputRef.current?.focus()}>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <div className="mb-4 text-sm text-gray-700">{instructions}</div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="px-4 py-2">
          Cancel
        </button>
        <button
          onClick={() => onConfirm(value.trim())}
          disabled={!value.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          OK
        </button>
      </div>
    </HowToModal>
  );
}
