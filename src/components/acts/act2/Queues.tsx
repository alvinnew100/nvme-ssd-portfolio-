"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import RevealCard from "@/components/story/RevealCard";

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
              <circle
                cx={x}
                cy={y}
                r={slotRadius}
                fill={entry ? `${color}20` : "#f0ece4"}
                stroke={entry ? color : "#ddd6ca"}
                strokeWidth={entry ? 2 : 1}
              />
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
  const [flowAnimating, setFlowAnimating] = useState(false);

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

    // Trigger flow animation
    setFlowAnimating(true);
    setTimeout(() => setFlowAnimating(false), 800);

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
      setStatus(`Controller fetched ${cmd.label} from SQ[${oldSqHead}], posted result at CQ[${cqTail}]. Interrupt sent.`);
    } else {
      setStatus(`Controller fetched ${cmd.label} but CQ is full!`);
    }
  };

  const consumeCompletion = () => {
    if (cqCount === 0) {
      setStatus("CQ empty — no results to consume.");
      return;
    }
    const cqe = cqSlots[cqHead];
    if (!cqe) {
      setStatus("No result at CQ head.");
      return;
    }
    const newCq = [...cqSlots];
    newCq[cqHead] = null;
    setCqSlots(newCq);
    const oldCqHead = cqHead;
    setCqHead((cqHead + 1) % QUEUE_SIZE);
    setStatus(`Host consumed ${cqe.label} result from CQ[${oldCqHead}], head → ${(oldCqHead + 1) % QUEUE_SIZE}. CQ doorbell updated.`);
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
    setFlowAnimating(false);
  };

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          How Commands Are Sent &mdash; Submission &amp; Completion Queues
        </h3>
        <AnalogyCard concept="Queues Are Like Restaurant Order Slips" analogy="The Submission Queue (SQ) is the order counter — the host places command 'slips' there. The Completion Queue (CQ) is the pickup counter — the SSD places results there. Head and tail pointers track who's next, and the phase bit prevents confusion when the circular buffer wraps around." />
        <TermDefinition term="SQ (Submission Queue)" definition="A circular buffer in host RAM where the CPU places NVMe commands (64-byte entries) for the SSD to process. Each I/O queue pair has one SQ." />
        <TermDefinition term="CQ (Completion Queue)" definition="A circular buffer in host RAM where the SSD places completion entries (16-byte) after processing commands. The phase bit flips each time the queue wraps to indicate fresh entries." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We know the SSD has a control panel (BAR0 registers) and a high-speed
          connection (PCIe). But here&apos;s the critical question:{" "}
          <em className="text-text-primary">how does the host actually send
          commands to the drive?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Imagine a busy restaurant. Customers don&apos;t walk into the kitchen to
          place orders — there&apos;s a system. Customers write their orders on
          slips and put them in an <strong className="text-text-primary">order
          rack</strong>. The kitchen takes orders from the rack, cooks the food,
          then puts a <strong className="text-text-primary">ready ticket</strong> in
          a pickup tray. The waiter checks the pickup tray and delivers the food.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          NVMe works the same way. The computer (host) places commands into a{" "}
          <strong className="text-text-primary">Submission Queue (SQ)</strong> in
          RAM — that&apos;s the order rack. The SSD picks up commands, processes
          them, and puts results into a{" "}
          <strong className="text-text-primary">Completion Queue (CQ)</strong> in
          RAM — that&apos;s the pickup tray.
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But why use queues at all?</em> Why not
          just send one command at a time? Because SSDs are massively parallel —
          they have multiple NAND chips working simultaneously. If you sent one
          command and waited for it to finish before sending the next, most of the
          SSD would sit idle. Queues let you stack up many commands so the SSD can
          work on them in parallel, keeping all its NAND chips busy.
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">And why circular?</em> Both queues are
          shaped like rings (circular buffers). Two pointers chase each other
          around: the <strong className="text-nvme-blue">HEAD</strong> (where the
          consumer reads from) and the <strong className="text-nvme-amber">TAIL</strong>{" "}
          (where the producer writes to). When the tail catches the head, the queue
          is full — you must wait. When head catches tail, the queue is empty.
        </p>

        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Try the simulator below to see this in action. Each button corresponds
          to a real step in the NVMe command flow:
        </p>

        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6 relative">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Interactive Circular Queue Simulator
          </div>

          {/* Circular queue diagrams with flow arrow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative">
            <CircularQueue
              entries={sqSlots}
              head={sqHead}
              tail={sqTail}
              size={QUEUE_SIZE}
              color="#635bff"
              label="Submission Queue (SQ)"
              type="sq"
            />

            {/* Flow arrow between queues */}
            <div className="hidden sm:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="relative w-16">
                <svg viewBox="0 0 64 24" className="w-full">
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <path d="M0,0 L8,3 L0,6" fill="#9e9789" />
                    </marker>
                  </defs>
                  <line x1="0" y1="12" x2="56" y2="12" stroke="#9e9789" strokeWidth="1.5" markerEnd="url(#arrowhead)" strokeDasharray="4,3" />
                </svg>
                <AnimatePresence>
                  {flowAnimating && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-nvme-green shadow-md shadow-nvme-green/40"
                      initial={{ left: -4, opacity: 0, scale: 0.5 }}
                      animate={{ left: 56, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.5] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile flow arrow (vertical) */}
            <div className="flex sm:hidden items-center justify-center -my-2 z-10 pointer-events-none">
              <div className="relative h-8">
                <svg viewBox="0 0 24 32" className="h-full w-6">
                  <defs>
                    <marker id="arrowhead-v" markerWidth="6" markerHeight="8" refX="3" refY="8" orient="auto">
                      <path d="M0,0 L3,8 L6,0" fill="#9e9789" />
                    </marker>
                  </defs>
                  <line x1="12" y1="0" x2="12" y2="24" stroke="#9e9789" strokeWidth="1.5" markerEnd="url(#arrowhead-v)" strokeDasharray="4,3" />
                </svg>
                <AnimatePresence>
                  {flowAnimating && (
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-nvme-green shadow-md shadow-nvme-green/40"
                      initial={{ top: -4, opacity: 0, scale: 0.5 }}
                      animate={{ top: 24, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.5] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

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
          <div className="flex items-center gap-6 justify-center mb-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-dashed border-nvme-blue" />
              <span className="text-text-muted font-mono">HEAD (consumer reads here)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-dashed border-nvme-amber" />
              <span className="text-text-muted font-mono">TAIL (producer writes here)</span>
            </div>
          </div>

          {/* Control buttons + status — directly below the queues */}
          <div className="flex flex-wrap gap-3 mb-3 justify-center">
            <button
              onClick={submitCommand}
              className="px-5 py-2.5 bg-nvme-blue text-white rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-nvme-blue/20 transition-all active:scale-95"
            >
              1. Submit Command
            </button>
            <button
              onClick={processCommand}
              className="px-5 py-2.5 bg-nvme-green text-white rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-nvme-green/20 transition-all active:scale-95"
            >
              2. Process (SSD)
            </button>
            <button
              onClick={consumeCompletion}
              className="px-5 py-2.5 bg-nvme-violet text-white rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-nvme-violet/20 transition-all active:scale-95"
            >
              3. Consume Result
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
              className="text-text-secondary text-xs bg-story-surface rounded-xl p-3 font-mono text-center mb-4"
            >
              {status}
            </motion.div>
          </AnimatePresence>

          {/* Detailed step-by-step guide — collapsible on mobile, below controls */}
          <details className="sm:open bg-story-surface rounded-xl text-xs group" open>
            <summary className="sm:hidden cursor-pointer p-4 text-text-muted font-mono text-[10px] uppercase tracking-wider select-none flex items-center justify-between">
              <span>Step-by-step guide</span>
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-5 pt-0 sm:pt-5 space-y-3">
              <div className="text-text-muted font-mono text-[10px] uppercase tracking-wider mb-2 hidden sm:block">
                What to do &amp; what to observe at each step
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-nvme-blue text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <strong className="text-nvme-blue">Submit Command</strong>
                  </div>
                  <p className="text-text-secondary ml-7 leading-relaxed">
                    Click this to simulate the host placing a command into the Submission Queue.
                    <strong className="text-text-primary"> Watch the SQ ring:</strong> a new entry (C1, C2, etc.)
                    appears at the <span className="text-nvme-amber font-mono">TAIL</span> position. The tail pointer
                    advances clockwise. In real NVMe, the host then writes the new tail value to
                    the SQ Tail Doorbell register — that&apos;s how the SSD knows new work arrived.
                    <em className="text-text-primary"> Try clicking it 3-4 times</em> to queue up multiple
                    commands and watch the tail chase around the ring.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-nvme-green text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <strong className="text-nvme-green">Process (SSD)</strong>
                  </div>
                  <p className="text-text-secondary ml-7 leading-relaxed">
                    Click this to simulate the SSD fetching a command and completing it.
                    <strong className="text-text-primary"> Watch both rings:</strong> the entry disappears from the
                    SQ at the <span className="text-nvme-blue font-mono">HEAD</span> position (the SSD consumed it),
                    and a matching result appears in the CQ. The SQ head advances, and the CQ tail advances.
                    <em className="text-text-primary"> Notice:</em> commands are always consumed in order (FIFO) —
                    the SSD reads from HEAD, not from any random slot.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-nvme-violet text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <strong className="text-nvme-violet">Consume Result</strong>
                  </div>
                  <p className="text-text-secondary ml-7 leading-relaxed">
                    Click this to simulate the host reading a completion entry.
                    <strong className="text-text-primary"> Watch the CQ ring:</strong> the result is removed from the
                    CQ head position and the head advances. The host then writes the new CQ head to the
                    CQ Head Doorbell — telling the SSD &ldquo;I&apos;ve read up to this point, you can
                    reuse those slots.&rdquo;
                  </p>
                </div>
              </div>
              <div className="border-t border-story-border pt-3 mt-3">
                <div className="text-text-muted font-mono text-[10px] uppercase tracking-wider mb-1.5">
                  Experiments to try
                </div>
                <div className="text-text-secondary space-y-1 leading-relaxed">
                  <div>&bull; Submit 8 commands without processing any — the SQ fills up and rejects the 9th (queue full)</div>
                  <div>&bull; Submit 3, process 3, consume 3 — watch the full lifecycle: SQ &rarr; SSD &rarr; CQ &rarr; Host</div>
                  <div>&bull; Submit 5, process only 2 — watch how HEAD and TAIL have a gap (the pending commands)</div>
                  <div>&bull; Fill SQ, process all, but don&apos;t consume — CQ fills up, blocking new completions</div>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Why this design works */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Why is this design so fast?
          </div>
          <div className="space-y-3 text-text-secondary text-sm leading-relaxed">
            <p>
              <strong className="text-text-primary">No locking needed.</strong> The
              host only writes the tail; the SSD only writes the head. They never
              touch each other&apos;s pointer, so there&apos;s no contention and no
              need for locks.
            </p>
            <p>
              <strong className="text-text-primary">Batching.</strong> The host can
              write 10 commands to the SQ and then ring the doorbell once. The SSD
              sees the new tail and processes all 10 commands in one batch. This is
              much faster than signaling for each command individually.
            </p>
            <p>
              <strong className="text-text-primary">Multiple queues.</strong> NVMe
              supports up to 65,535 I/O queue pairs. In practice, the OS creates one
              queue pair per CPU core. Each core submits commands to its own queue
              without coordinating with other cores — maximum parallelism with zero
              cross-core overhead.
            </p>
          </div>
        </div>

        <InfoCard variant="info" title="The phase bit trick — how the host detects new completions">
          <em>But wait — if the SSD writes results to the CQ, how does the host
          know which entries are new?</em> NVMe uses a clever trick: each CQ entry
          has a &ldquo;phase bit&rdquo; (P). When the SSD wraps around the ring, it
          flips the phase. The host knows a CQ entry is new when its P bit matches
          the expected phase. This avoids the overhead of comparing head/tail
          pointers for every completion check.
        </InfoCard>

        <RevealCard
          id="act2-queues-quiz1"
          prompt="Imagine the NVMe driver keeps submitting commands without checking how full the Submission Queue is. What happens when the tail pointer catches the head pointer, and why doesn't NVMe have a hardware mechanism to auto-recover from this?"
          answer="When the tail pointer catches the head pointer, the circular buffer is full — there are no free slots left. The host must wait for the controller to process commands (which advances the head pointer, freeing slots) before submitting more. NVMe doesn't auto-recover because the host driver is responsible for tracking available queue depth. The driver maintains a local count of in-flight commands and never advances the tail past the head. If the driver had a bug and overwrote an unprocessed entry, the original command would be lost and the replacement would be corrupted — leading to data loss or controller errors. This design keeps hardware simple and puts flow control responsibility on the software, which can make smarter scheduling decisions."
        />
      </div>
    </SectionWrapper>
  );
}
