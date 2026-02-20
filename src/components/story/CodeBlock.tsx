"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({
  code,
  language = "bash",
  title,
}: CodeBlockProps) {
  return (
    <div className="rounded-xl border border-story-border overflow-hidden">
      {title && (
        <div className="bg-story-panel px-4 py-2 border-b border-story-border">
          <span className="text-text-muted text-xs font-mono">{title}</span>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#0d1420",
          fontSize: "0.8125rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
