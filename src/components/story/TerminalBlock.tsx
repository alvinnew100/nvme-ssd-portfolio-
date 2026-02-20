"use client";

import { useState } from "react";

interface TerminalBlockProps {
  lines: string[];
  title?: string;
}

export default function TerminalBlock({
  lines,
  title = "terminal",
}: TerminalBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = lines
      .filter((l) => !l.startsWith("#"))
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-story-border bg-story-bg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-story-border bg-story-panel">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-nvme-red/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-nvme-amber/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-nvme-green/60" />
          </div>
          <span className="text-text-muted text-xs font-mono ml-2">
            {title}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-text-muted hover:text-nvme-green transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i}>
            {line.startsWith("#") ? (
              <span className="text-text-muted">{line}</span>
            ) : line.startsWith("$") ? (
              <>
                <span className="text-nvme-green select-none">$ </span>
                <span className="text-text-code">{line.slice(2)}</span>
              </>
            ) : (
              <span className="text-text-secondary">{line}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
