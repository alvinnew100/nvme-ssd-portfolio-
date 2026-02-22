"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";

interface RevealCardProps {
  id: string;
  prompt: string;
  answer: ReactNode;
  answerPreview?: string;
}

export default function RevealCard({ id, prompt, answer, answerPreview }: RevealCardProps) {
  const { markComplete, isComplete } = useProgressStore();
  const alreadyDone = isComplete(id);
  const [revealed, setRevealed] = useState(alreadyDone);

  const handleReveal = () => {
    setRevealed(true);
    markComplete(id);
  };

  return (
    <div className="bg-story-card rounded-2xl p-6 card-shadow my-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-nvme-amber/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-nvme-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div className="text-text-primary text-sm font-semibold">{prompt}</div>
      </div>

      <div className="relative ml-11">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="blur"
              exit={{ opacity: 0 }}
              className="relative"
            >
              {answerPreview && (
                <div className="text-text-muted text-sm blur-md select-none pointer-events-none">
                  {answerPreview}
                </div>
              )}
              <button
                onClick={handleReveal}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-nvme-amber/10 text-nvme-amber border border-nvme-amber/20 hover:bg-nvme-amber/20 transition-all mt-2"
              >
                Tap to reveal
              </button>
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
