"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";
import confetti from "canvas-confetti";

interface QuizOption {
  text: string;
  correct?: boolean;
  explanation?: string;
}

interface QuizCardProps {
  id: string;
  question: string;
  options: QuizOption[];
  hint?: string;
}

export default function QuizCard({ id, question, options, hint }: QuizCardProps) {
  const { markComplete, recordAttempt, isComplete } = useProgressStore();
  const alreadyDone = isComplete(id);

  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const correctIndex = options.findIndex((o) => o.correct);
  const isCorrect = selected === correctIndex;

  const handleCheck = useCallback(() => {
    if (selected === null) return;
    setChecked(true);
    recordAttempt(id);
    if (selected === correctIndex) {
      markComplete(id);
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.7 },
        colors: ["#00d4aa", "#635bff", "#7c5cfc"],
      });
    }
  }, [selected, correctIndex, id, markComplete, recordAttempt]);

  const handleRetry = () => {
    setSelected(null);
    setChecked(false);
  };

  if (alreadyDone) {
    return (
      <div className="bg-story-card rounded-2xl p-6 card-shadow my-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-nvme-green/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-nvme-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-text-primary text-sm font-semibold">{question}</div>
            <div className="text-nvme-green text-xs mt-0.5">Completed</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-story-card rounded-2xl p-6 card-shadow my-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-nvme-violet/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-nvme-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-text-primary text-sm font-semibold">{question}</div>
      </div>

      <div className="space-y-2 mb-4">
        {options.map((opt, i) => {
          let style = "border-story-border bg-story-surface hover:border-nvme-violet/40";
          if (checked && i === correctIndex) style = "border-nvme-green bg-nvme-green/5";
          else if (checked && i === selected && !isCorrect) style = "border-nvme-red bg-nvme-red/5";
          else if (!checked && i === selected) style = "border-nvme-violet bg-nvme-violet/5";

          return (
            <button
              key={i}
              onClick={() => !checked && setSelected(i)}
              disabled={checked}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${style}`}
            >
              <span className="text-text-secondary">{opt.text}</span>
              <AnimatePresence>
                {checked && i === selected && opt.explanation && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-text-muted text-xs mt-2 leading-relaxed"
                  >
                    {opt.explanation}
                  </motion.p>
                )}
                {checked && i === correctIndex && i !== selected && opt.explanation && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-text-muted text-xs mt-2 leading-relaxed"
                  >
                    {opt.explanation}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {hint && !checked && (
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

      <div className="flex gap-2">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all bg-nvme-violet text-white hover:bg-nvme-violet/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        ) : !isCorrect ? (
          <button
            onClick={handleRetry}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-story-surface text-text-secondary hover:bg-story-border transition-all"
          >
            Try Again
          </button>
        ) : null}
      </div>
    </div>
  );
}
