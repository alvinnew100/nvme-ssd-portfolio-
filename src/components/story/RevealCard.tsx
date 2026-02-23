"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";

interface RevealCardProps {
  id: string;
  prompt: string;
  answer: ReactNode;
  answerPreview?: string;
  hint?: string;
  diagram?: ReactNode;
  diagramCaption?: string;
  options?: string[];
  correctIndex?: number;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function RevealCard({ id, prompt, answer, answerPreview, hint, diagram, diagramCaption, options, correctIndex }: RevealCardProps) {
  const { markComplete, resetChallenge, isComplete } = useProgressStore();
  const alreadyDone = isComplete(id);
  const [revealed, setRevealed] = useState(alreadyDone);
  const [showHint, setShowHint] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isMCQ = options && options.length > 0 && correctIndex !== undefined;

  const handleReveal = () => {
    setRevealed(true);
    markComplete(id);
  };

  const handleMCQSelect = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    if (index === correctIndex) {
      markComplete(id);
    }
    setTimeout(() => setRevealed(true), 800);
  };

  const handleReset = () => {
    setRevealed(false);
    setShowHint(false);
    setSelectedIndex(null);
    resetChallenge(id);
  };

  const getOptionStyle = (index: number) => {
    if (selectedIndex === null) {
      return "bg-story-surface border-story-border hover:border-nvme-blue/40 hover:bg-nvme-blue/5 cursor-pointer";
    }
    if (index === correctIndex) {
      return "bg-nvme-green/10 border-nvme-green/40 ring-1 ring-nvme-green/20";
    }
    if (index === selectedIndex && index !== correctIndex) {
      return "bg-nvme-red/10 border-nvme-red/40 ring-1 ring-nvme-red/20";
    }
    return "bg-story-surface border-story-border opacity-50";
  };

  const getLetterStyle = (index: number) => {
    if (selectedIndex === null) {
      return "bg-nvme-blue/10 text-nvme-blue";
    }
    if (index === correctIndex) {
      return "bg-nvme-green/20 text-nvme-green";
    }
    if (index === selectedIndex && index !== correctIndex) {
      return "bg-nvme-red/20 text-nvme-red";
    }
    return "bg-story-border/50 text-text-muted";
  };

  return (
    <div data-vo="reveal" className="bg-story-card rounded-2xl p-6 card-shadow my-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-nvme-amber/10 flex items-center justify-center flex-shrink-0">
          {isMCQ ? (
            <svg className="w-4 h-4 text-nvme-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-nvme-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </div>
        <div className="text-text-primary text-sm font-semibold flex-1">{prompt}</div>
        {(revealed || selectedIndex !== null) && (
          <button
            onClick={handleReset}
            className="text-text-muted text-xs hover:text-text-secondary transition-colors flex-shrink-0"
          >
            Reset
          </button>
        )}
      </div>

      {diagram && (
        <div className="mb-4 ml-11 rounded-xl overflow-hidden border border-story-border">
          {diagram}
          {diagramCaption && (
            <div className="text-text-muted text-xs text-center py-2 bg-story-surface">
              {diagramCaption}
            </div>
          )}
        </div>
      )}

      <div className="relative ml-11">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="options"
              exit={{ opacity: 0 }}
              className="relative"
            >
              {isMCQ ? (
                <div className="space-y-2">
                  {options.map((option, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleMCQSelect(i)}
                      disabled={selectedIndex !== null}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all text-sm ${getOptionStyle(i)}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${getLetterStyle(i)}`}>
                        {OPTION_LETTERS[i]}
                      </span>
                      <span className="text-text-secondary leading-relaxed pt-0.5">{option}</span>
                      {selectedIndex !== null && i === correctIndex && (
                        <svg className="w-4 h-4 text-nvme-green flex-shrink-0 mt-1 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {selectedIndex === i && i !== correctIndex && (
                        <svg className="w-4 h-4 text-nvme-red flex-shrink-0 mt-1 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </motion.button>
                  ))}
                  {selectedIndex !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs font-semibold mt-2 px-3 py-1.5 rounded-lg inline-block ${
                        selectedIndex === correctIndex
                          ? "bg-nvme-green/10 text-nvme-green"
                          : "bg-nvme-red/10 text-nvme-red"
                      }`}
                    >
                      {selectedIndex === correctIndex ? "Correct!" : `Incorrect — the answer is ${OPTION_LETTERS[correctIndex!]}.`}
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  {answerPreview && (
                    <div className="text-text-muted text-sm blur-md select-none pointer-events-none">
                      {answerPreview}
                    </div>
                  )}

                  {hint && (
                    <div className="mb-3">
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

                  <button
                    onClick={handleReveal}
                    className="px-5 py-2 rounded-lg text-sm font-semibold bg-nvme-amber/10 text-nvme-amber border border-nvme-amber/20 hover:bg-nvme-amber/20 transition-all mt-2"
                  >
                    Tap to reveal
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-text-secondary text-sm leading-relaxed"
            >
              {answer}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
