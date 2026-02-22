"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";
import confetti from "canvas-confetti";

interface BlankDef {
  answer: string;
  placeholder?: string;
  unit?: string;
  tolerance?: number;
}

interface FillInBlankProps {
  id: string;
  prompt: string; // Use {blank} or {blank0}, {blank1} etc. for blanks
  blanks: BlankDef[];
  explanation?: string;
  hint?: string;
  diagram?: ReactNode;
  diagramCaption?: string;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/,/g, "");
}

function checkAnswer(input: string, blank: BlankDef): boolean {
  const norm = normalize(input);
  const answer = normalize(blank.answer);

  // Try numeric comparison with tolerance
  if (blank.tolerance !== undefined) {
    const num = parseFloat(norm);
    const target = parseFloat(answer);
    if (!isNaN(num) && !isNaN(target)) {
      return Math.abs(num - target) <= blank.tolerance;
    }
  }

  // String comparison (case-insensitive)
  return norm === answer;
}

export default function FillInBlank({ id, prompt, blanks, explanation, hint, diagram, diagramCaption }: FillInBlankProps) {
  const { markComplete, recordAttempt, resetChallenge, isComplete } = useProgressStore();
  const alreadyDone = isComplete(id);

  const [values, setValues] = useState<string[]>(blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [shaking, setShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleCheck = () => {
    const res = blanks.map((blank, i) => checkAnswer(values[i], blank));
    setResults(res);
    setChecked(true);
    recordAttempt(id);

    if (res.every(Boolean)) {
      markComplete(id);
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.7 },
        colors: ["#00d4aa", "#635bff", "#7c5cfc"],
      });
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const handleRetry = () => {
    setChecked(false);
    setResults([]);
  };

  const allCorrect = checked && results.every(Boolean);

  if (alreadyDone) {
    return (
      <div className="bg-story-card rounded-2xl p-6 card-shadow my-6">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-nvme-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-text-secondary text-sm flex-1">{prompt.replace(/\{blank\d?\}/g, (_) => "___")}</span>
          <span className="text-nvme-green text-xs">Completed</span>
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

  // Build prompt with inline inputs
  let blankIndex = 0;
  const parts = prompt.split(/(\{blank\d?\})/);

  return (
    <motion.div
      className="bg-story-card rounded-2xl p-6 card-shadow my-6"
      animate={shaking ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {diagram && (
        <div className="mb-4 rounded-xl overflow-hidden border border-story-border">
          {diagram}
          {diagramCaption && (
            <div className="text-text-muted text-xs text-center py-2 bg-story-surface">
              {diagramCaption}
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-nvme-blue/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-nvme-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-text-primary text-sm leading-relaxed flex flex-wrap items-baseline gap-1">
            {parts.map((part, pi) => {
              if (part.match(/^\{blank\d?\}$/)) {
                const bi = blankIndex++;
                const blank = blanks[bi];
                const borderColor = checked
                  ? results[bi]
                    ? "border-nvme-green"
                    : "border-nvme-red"
                  : "border-nvme-blue/30";

                return (
                  <span key={pi} className="inline-flex items-baseline gap-1">
                    <input
                      type="text"
                      value={values[bi]}
                      onChange={(e) => {
                        const newVals = [...values];
                        newVals[bi] = e.target.value;
                        setValues(newVals);
                        if (checked) {
                          setChecked(false);
                          setResults([]);
                        }
                      }}
                      placeholder={blank.placeholder || "?"}
                      className={`bg-transparent border-b-2 ${borderColor} text-text-primary font-mono text-sm w-20 text-center outline-none transition-colors focus:border-nvme-blue`}
                      disabled={allCorrect}
                    />
                    {blank.unit && <span className="text-text-muted text-xs">{blank.unit}</span>}
                  </span>
                );
              }
              return <span key={pi}>{part}</span>;
            })}
          </div>
        </div>
      </div>

      {explanation && allCorrect && (
        <p className="text-text-muted text-xs leading-relaxed mb-3 ml-11">{explanation}</p>
      )}

      <div className="ml-11">
        {hint && !allCorrect && (
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

        {!allCorrect && (
          <button
            onClick={checked ? handleRetry : handleCheck}
            disabled={values.some((v) => !v.trim())}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all bg-nvme-blue text-white hover:bg-nvme-blue/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {checked ? "Try Again" : "Check"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
