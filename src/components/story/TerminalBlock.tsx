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
    <div className="rounded-xl bg-story-dark overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          </div>
          <span className="text-white/40 text-xs font-mono ml-2">
            {title}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i}>
            {line.startsWith("#") ? (
              <span className="text-white/30">{line}</span>
            ) : line.startsWith("$") ? (
              <>
                <span className="text-green-400 select-none">$ </span>
                <span className="text-white/90">{line.slice(2)}</span>
              </>
            ) : (
              <span className="text-white/70">{line}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
