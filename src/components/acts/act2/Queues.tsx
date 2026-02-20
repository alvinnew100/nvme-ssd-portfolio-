"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const QUEUE_SIZE = 8;

interface QEntry {
  id: number;
  label: string;
}

function CircularQueue({
  entries,
  head,
  tail,
  size,
  color,
  label,
  type,
}: {
  entries: (QEntry | null)[];
  head: number;
  tail: number;
  size: number;
  color: string;
  label: string;
  type: "sq" | "cq";
}) {
  const cx = 140;
  const cy = 140;
  const radius = 100;
  const slotRadius = 20;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-text-primary font-semibold text-sm">{label}</span>
      </div>
      <svg viewBox="0 0 280 280" className="w-full max-w-[260px]">
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={`${color}20`} strokeWidth="40" />

        {/* Slots */}
        {Array.from({ length: size }).map((_, i) => {
          const angle = (i / size) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const entry = entries[i];
          const isHead = i === head;
          const isTail = i === tail;

          return (
            <g key={i}>
              {/* Slot circle */}
              <circle
                cx={x}
                cy={y}
                r={slotRadius}
                fill={entry ? `${color}20` : "#f0ece4"}
                stroke={entry ? color : "#ddd6ca"}
                strokeWidth={entry ? 2 : 1}
              />
              {/* Entry label */}
              {entry ? (
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[8px] font-mono font-bold"
                  fill={color}
                >
                  {entry.label}
                </text>
              ) : (
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[8px] font-mono"
                  fill="#9e9789"
                >
                  {i}
                </text>
              )}

              {/* Head pointer */}
              {isHead && (
                <g>
                  <circle cx={x} cy={y} r={slotRadius + 5} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3,3" />
                  <text
                    x={x + Math.cos(angle) * (slotRadius + 16)}
                    y={y + Math.sin(angle) * (slotRadius + 16) + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[7px] font-mono font-bold"
                    fill={color}
                  >
                    HEAD
                  </text>
                </g>
              )}

              {/* Tail pointer */}
              {isTail && !isHead && (
                <g>
                  <circle cx={x} cy={y} r={slotRadius + 5} fill="none" stroke="#e8a317" strokeWidth="1.5" strokeDasharray="3,3" />
                  <text
                    x={x + Math.cos(angle) * (slotRadius + 16)}
                    y={y + Math.sin(angle) * (slotRadius + 16) + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[7px] font-mono font-bold"
                    fill="#e8a317"
                  >
                    TAIL
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-[10px] font-bold" fill={color}>
          {type === "sq" ? "SQ" : "CQ"}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="text-[8px]" fill="#9e9789">
          {entries.filter(Boolean).length}/{size}
        </text>
      </svg>
    </div>
  );
}

export default function Queues() {
  const [sqSlots, setSqSlots] = useState<(QEntry | null)[]>(
    Array(QUEUE_SIZE).fill(null)
  );
  const [cqSlots, setCqSlots] = useState<(QEntry | null)[]>(
    Array(QUEUE_SIZE).fill(null)
  );
  const [sqHead, setSqHead] = useState(0);
  const [sqTail, setSqTail] = useState(0);
  const [cqHead, setCqHead] = useState(0);
  const [cqTail, setCqTail] = useState(0);
  const [nextId, setNextId] = useState(1);
  const [status, setStatus] = useState("Idle — click 'Submit Command' to begin");

  const sqCount = sqSlots.filter(Boolean).length;
  const cqCount = cqSlots.filter(Boolean).length;

  const submitCommand = () => {
    if (sqCount >= QUEUE_SIZE) {
      setStatus("SQ full! Process some commands first.");
      return;
    }
    const entry: QEntry = { id: nextId, label: `C${nextId}` };
    const newSlots = [...sqSlots];
    newSlots[sqTail] = entry;
    setSqSlots(newSlots);
    setSqTail((sqTail + 1) % QUEUE_SIZE);
    setNextId((n) => n + 1);
    setStatus(`Host wrote ${entry.label} at SQ[${sqTail}], tail → ${(sqTail + 1) % QUEUE_SIZE}. Doorbell ringed.`);
  };

  const processCommand = () => {
    if (sqCount === 0) {
      setStatus("SQ empty — nothing to process.");
      return;
    }
    const cmd = sqSlots[sqHead];
    if (!cmd) {
      setStatus("No command at SQ head.");
      return;
    }
    const newSq = [...sqSlots];
    newSq[sqHead] = null;
    setSqSlots(newSq);
    const oldSqHead = sqHead;
    setSqHead((sqHead + 1) % QUEUE_SIZE);

    if (cqCount < QUEUE_SIZE) {
      const newCq = [...cqSlots];
      newCq[cqTail] = cmd;
      setCqSlots(newCq);
      setCqTail((cqTail + 1) % QUEUE_SIZE);
      setStatus(`Controller fetched ${cmd.label} from SQ[${oldSqHead}], posted CQE at CQ[${cqTail}]. Interrupt raised.`);
    } else {
      setStatus(`Controller fetched ${cmd.label} but CQ is full!`);
    }
  };

  const consumeCompletion = () => {
    if (cqCount === 0) {
      setStatus("CQ empty — no completions to consume.");
      return;
    }
    const cqe = cqSlots[cqHead];
    if (!cqe) {
      setStatus("No completion at CQ head.");
      return;
    }
    const newCq = [...cqSlots];
    newCq[cqHead] = null;
    setCqSlots(newCq);
    const oldCqHead = cqHead;
    setCqHead((cqHead + 1) % QUEUE_SIZE);
    setStatus(`Host consumed ${cqe.label} from CQ[${oldCqHead}], head → ${(oldCqHead + 1) % QUEUE_SIZE}. CQ doorbell updated.`);
  };

  const reset = () => {
    setSqSlots(Array(QUEUE_SIZE).fill(null));
    setCqSlots(Array(QUEUE_SIZE).fill(null));
    setSqHead(0);
    setSqTail(0);
    setCqHead(0);
    setCqTail(0);
    setNextId(1);
    setStatus("Queues reset.");
  };

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Submission &amp; Completion Queues
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          NVMe uses paired <strong className="text-text-primary">circular buffers</strong> in host memory: a{" "}
          <strong className="text-text-primary">Submission Queue</strong> (SQ) where the host places
          64-byte commands, and a{" "}
          <strong className="text-text-primary">Completion Queue</strong> (CQ) where the
          controller posts 16-byte results. Head and tail pointers chase each other
          around the ring. When tail catches head, the queue is full.
        </p>

        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Interactive Circular Queue Simulator
          </div>

          {/* Circular queue diagrams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <CircularQueue
              entries={sqSlots}
              head={sqHead}
              tail={sqTail}
              size={QUEUE_SIZE}
              color="#635bff"
              label="Submission Queue (SQ)"
              type="sq"
            />
            <CircularQueue
              entries={cqSlots}
              head={cqHead}
              tail={cqTail}
              size={QUEUE_SIZE}
              color="#00b894"
              label="Completion Queue (CQ)"
              type="cq"
            />
          </div>

          {/* Pointer legend */}
          <div className="flex items-center gap-6 justify-center mb-6 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-dashed border-nvme-blue" />
              <span className="text-text-muted font-mono">HEAD (controller reads)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-dashed border-nvme-amber" />
              <span className="text-text-muted font-mono">TAIL (host writes)</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            <button
              onClick={submitCommand}
              className="px-5 py-2.5 bg-nvme-blue text-white rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-nvme-blue/20 transition-all active:scale-95"
            >
              Submit Command
            </button>
            <button
              onClick={processCommand}
              className="px-5 py-2.5 bg-nvme-green text-white rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-nvme-green/20 transition-all active:scale-95"
            >
              Process (Controller)
            </button>
            <button
              onClick={consumeCompletion}
              className="px-5 py-2.5 bg-nvme-violet text-white rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-nvme-violet/20 transition-all active:scale-95"
            >
              Consume Completion
            </button>
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-story-surface text-text-muted rounded-full text-xs font-semibold hover:bg-story-border transition-all"
            >
              Reset
            </button>
          </div>

          {/* Status line */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-text-secondary text-xs bg-story-surface rounded-xl p-3 font-mono text-center"
            >
              {status}
            </motion.div>
          </AnimatePresence>
        </div>

        <InfoCard variant="info" title="Phase bit trick">
          Instead of comparing head/tail pointers, NVMe uses a phase bit (P) in
          each CQ entry. When the controller wraps around the CQ, it flips the
          phase. The host knows a CQ entry is new when its P bit matches the
          expected phase.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
