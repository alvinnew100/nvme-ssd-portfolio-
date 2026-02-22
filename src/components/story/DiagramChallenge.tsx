"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";
import confetti from "canvas-confetti";

interface MCOption {
  text: string;
  correct?: boolean;
  explanation?: string;
}

interface BlankDef {
  label: string;
  answer: string;
  altAnswers?: string[];
  placeholder?: string;
}

interface LabelDef {
  marker: string;
  answer: string;
  altAnswers?: string[];
  placeholder?: string;
}

type Interaction =
  | { mode: "multiple-choice"; options: MCOption[] }
  | { mode: "fill-in-blank"; blanks: BlankDef[] }
  | { mode: "label-identification"; labels: LabelDef[] };

interface DiagramChallengeProps {
  id: string;
  question: string;
  diagram: ReactNode;
  diagramCaption?: string;
  hint?: string;
  interaction: Interaction;
  explanation?: string;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9/\-_.]/g, "");
}

function checkMatch(input: string, answer: string, alts?: string[]): boolean {
  const norm = normalize(input);
  if (norm === normalize(answer)) return true;
  return alts?.some((a) => norm === normalize(a)) ?? false;
}

export default function DiagramChallenge({
  id,
  question,
  diagram,
  diagramCaption,
  hint,
  interaction,
  explanation,
}: DiagramChallengeProps) {
  const { markComplete, recordAttempt, resetChallenge, isComplete } = useProgressStore();
  const alreadyDone = isComplete(id);

  const [selected, setSelected] = useState<number | null>(null);
  const [values, setValues] = useState<string[]>(() => {
    if (interaction.mode === "fill-in-blank") return interaction.blanks.map(() => "");
    if (interaction.mode === "label-identification") return interaction.labels.map(() => "");
    return [];
  });
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleCheck = () => {
    setChecked(true);
    recordAttempt(id);

    let allCorrect = false;

    if (interaction.mode === "multiple-choice") {
      const correctIdx = interaction.options.findIndex((o) => o.correct);
      allCorrect = selected === correctIdx;
      setResults([allCorrect]);
    } else if (interaction.mode === "fill-in-blank") {
      const res = interaction.blanks.map((b, i) => checkMatch(values[i], b.answer, b.altAnswers));
      setResults(res);
      allCorrect = res.every(Boolean);
    } else if (interaction.mode === "label-identification") {
      const res = interaction.labels.map((l, i) => checkMatch(values[i], l.answer, l.altAnswers));
      setResults(res);
      allCorrect = res.every(Boolean);
    }

    if (allCorrect) {
      markComplete(id);
      confetti({
        particleCount: 60,
        spread: 55,
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
    if (interaction.mode === "multiple-choice") setSelected(null);
  };

  const handleReset = () => {
    resetChallenge(id);
  };

  const allCorrect = checked && results.length > 0 && results.every(Boolean);

  if (alreadyDone) {
    return (
      <div className="bg-story-card rounded-2xl p-6 card-shadow my-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-nvme-green/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-nvme-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-text-primary text-sm font-semibold">{question}</div>
            <div className="text-nvme-green text-xs mt-0.5">Completed</div>
          </div>
          <button
            onClick={handleReset}
            className="text-text-muted text-xs hover:text-text-secondary transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-story-card rounded-2xl p-6 card-shadow my-6"
      animate={shaking ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Question */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-nvme-violet/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-nvme-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-text-primary text-sm font-semibold">{question}</div>
      </div>

      {/* Diagram */}
      <div className="mb-4 rounded-xl overflow-hidden border border-story-border">
        {diagram}
        {diagramCaption && (
          <div className="text-text-muted text-xs text-center py-2 bg-story-surface">
            {diagramCaption}
          </div>
        )}
      </div>

      {/* Interaction area */}
      {interaction.mode === "multiple-choice" && (
        <div className="space-y-2 mb-4">
          {interaction.options.map((opt, i) => {
            const correctIdx = interaction.options.findIndex((o) => o.correct);
            let style = "border-story-border bg-story-surface hover:border-nvme-violet/40";
            if (checked && i === correctIdx) style = "border-nvme-green bg-nvme-green/5";
            else if (checked && i === selected && selected !== correctIdx) style = "border-nvme-red bg-nvme-red/5";
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
                  {checked && (i === selected || i === correctIdx) && opt.explanation && (
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
      )}

      {interaction.mode === "fill-in-blank" && (
        <div className="space-y-3 mb-4">
          {interaction.blanks.map((blank, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-text-muted text-xs font-mono w-24 flex-shrink-0">{blank.label}</span>
              <input
                type="text"
                value={values[i]}
                onChange={(e) => {
                  const newVals = [...values];
                  newVals[i] = e.target.value;
                  setValues(newVals);
                  if (checked) { setChecked(false); setResults([]); }
                }}
                placeholder={blank.placeholder || "?"}
                disabled={allCorrect}
                className={`flex-1 bg-transparent border-b-2 ${
                  checked ? (results[i] ? "border-nvme-green" : "border-nvme-red") : "border-nvme-blue/30"
                } text-text-primary font-mono text-sm px-2 py-1 outline-none transition-colors focus:border-nvme-blue`}
              />
              {checked && results[i] && (
                <svg className="w-4 h-4 text-nvme-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {interaction.mode === "label-identification" && (
        <div className="space-y-3 mb-4">
          {interaction.labels.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-nvme-violet text-sm font-bold w-8 flex-shrink-0">{label.marker}</span>
              <input
                type="text"
                value={values[i]}
                onChange={(e) => {
                  const newVals = [...values];
                  newVals[i] = e.target.value;
                  setValues(newVals);
                  if (checked) { setChecked(false); setResults([]); }
                }}
                placeholder={label.placeholder || "?"}
                disabled={allCorrect}
                className={`flex-1 bg-transparent border-b-2 ${
                  checked ? (results[i] ? "border-nvme-green" : "border-nvme-red") : "border-nvme-blue/30"
                } text-text-primary font-mono text-sm px-2 py-1 outline-none transition-colors focus:border-nvme-blue`}
              />
              {checked && results[i] && (
                <svg className="w-4 h-4 text-nvme-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Explanation */}
      {explanation && allCorrect && (
        <p className="text-text-muted text-xs leading-relaxed mb-3">{explanation}</p>
      )}

      {/* Hint */}
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

      {/* Actions */}
      <div className="flex gap-2">
        {!allCorrect && (
          <button
            onClick={checked ? handleRetry : handleCheck}
            disabled={
              interaction.mode === "multiple-choice"
                ? selected === null
                : values.some((v) => !v.trim())
            }
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all bg-nvme-violet text-white hover:bg-nvme-violet/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {checked ? "Try Again" : "Check"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
