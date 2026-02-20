"use client";

import { useState } from "react";

interface NvmeCliBlockProps {
  command: string;
  note?: string;
}

export default function NvmeCliBlock({ command, note }: NvmeCliBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-story-dark overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          </div>
          <span className="text-white/40 text-xs font-mono ml-2">terminal</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 font-mono text-sm overflow-x-auto">
        <span className="text-green-400 select-none">$ </span>
        <span className="text-white/90">{command}</span>
      </div>
      {note && (
        <div className="px-4 pb-3 text-xs text-white/40 italic">{note}</div>
      )}
    </div>
  );
}
