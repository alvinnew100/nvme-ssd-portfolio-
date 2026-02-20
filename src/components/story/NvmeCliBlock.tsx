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
    <div className="rounded-xl border border-story-border bg-story-bg overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-story-border bg-story-panel">
        <span className="text-text-muted text-xs font-mono">terminal</span>
        <button
          onClick={handleCopy}
          className="text-xs text-text-muted hover:text-nvme-green transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 font-mono text-sm overflow-x-auto">
        <span className="text-nvme-green select-none">$ </span>
        <span className="text-text-code">{command}</span>
      </div>
      {note && (
        <div className="px-4 pb-3 text-xs text-text-muted italic">{note}</div>
      )}
    </div>
  );
}
