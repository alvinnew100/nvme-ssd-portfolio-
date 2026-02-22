"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";

interface KnowledgeCheckProps {
  id: string;
  question: string;
  options: [string, string];
  correctIndex: 0 | 1;
  explanation: string;
  hint?: string;
  diagram?: ReactNode;
  diagramCaption?: string;
}

export default function KnowledgeCheck({
  id,
  question,
  options,
  correctIndex,
  explanation,
  hint,
  diagram,
  diagramCaption,
}: KnowledgeCheckProps) {
  const { markComplete, recordAttempt, resetChallenge, isComplete } = useProgressStore();
  const alreadyDone = isComplete(id);
  const [answered, setAnswered] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleClick = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    recordAttempt(id);
    if (i === correctIndex) {
      markComplete(id);
    }
  };

  if (alreadyDone) {
    return (
      <div className="bg-nvme-violet/5 border border-nvme-violet/20 rounded-xl p-4 my-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-nvme-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-text-secondary text-sm flex-1">{question}</span>
          <button
            onClick={() => resetChallenge(id)}
            className="text-text-muted text-xs hover:text-text-secondary transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-nvme-violet/5 border border-nvme-violet/20 rounded-xl p-4 my-4">
      <div className="text-text-primary text-sm font-medium mb-3">{question}</div>

      {diagram && (
        <div className="mb-3 rounded-xl overflow-hidden border border-story-border">
          {diagram}
          {diagramCaption && (
            <div className="text-text-muted text-xs text-center py-2 bg-story-surface">
              {diagramCaption}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-2">
        {options.map((opt, i) => {
          let style = "bg-story-surface border-story-border text-text-secondary hover:border-nvme-violet/40";
          if (answered !== null) {
            if (i === correctIndex) style = "bg-nvme-green/10 border-nvme-green text-nvme-green";
            else if (i === answered) style = "bg-nvme-red/10 border-nvme-red text-nvme-red";
          }

          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={answered !== null}
              className={`flex-1 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {hint && answered === null && (
        <div className="mb-2">
          {showHint ? (
            <p className="text-text-muted text-xs italic bg-nvme-amber/5 rounded-lg p-3 border border-nvme-amber/20">
              {hint}
            </p>
          ) : (
            <button onClick={() => setShowHint(true)} className="text-nvme-amber text-xs hover:underline">
              Show hint
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {answered !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-text-muted text-xs leading-relaxed mt-2">
              {answered === correctIndex ? (
                <span className="text-nvme-green font-medium">Correct! </span>
              ) : (
                <span className="text-nvme-red font-medium">Not quite. </span>
              )}
              {explanation}
            </p>
            {answered !== correctIndex && (
              <button
                onClick={() => setAnswered(null)}
                className="text-nvme-violet text-xs mt-1 hover:underline"
              >
                Try again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
