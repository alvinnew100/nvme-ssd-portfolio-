"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    <div className="rounded-xl bg-[#0a2540] overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-white/10">
          <span className="text-white/40 text-xs font-mono">{title}</span>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#0a2540",
          fontSize: "0.8125rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
