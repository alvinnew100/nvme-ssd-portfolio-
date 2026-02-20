"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const MAX_ENTRIES = 8;

interface QEntry {
  id: number;
  label: string;
}

export default function Queues() {
  const [sqEntries, setSqEntries] = useState<QEntry[]>([]);
  const [cqEntries, setCqEntries] = useState<QEntry[]>([]);
  const [nextId, setNextId] = useState(1);
  const [status, setStatus] = useState("Idle — click 'Submit Command' to begin");

  const submitCommand = () => {
    if (sqEntries.length >= MAX_ENTRIES) {
      setStatus("SQ full! Process some commands first.");
      return;
    }
    const entry: QEntry = { id: nextId, label: `CMD ${nextId}` };
    setSqEntries((prev) => [...prev, entry]);
    setNextId((n) => n + 1);
    setStatus(`Host wrote ${entry.label} to SQ tail, then rang the SQ doorbell.`);
  };

  const processCommand = () => {
    if (sqEntries.length === 0) {
      setStatus("SQ empty — nothing to process. Submit a command first.");
      return;
    }
    const [cmd, ...rest] = sqEntries;
    setSqEntries(rest);
    if (cqEntries.length < MAX_ENTRIES) {
      setCqEntries((prev) => [...prev, cmd]);
    }
    setStatus(`Controller fetched ${cmd.label} from SQ, processed it, posted CQE to CQ.`);
  };

  const consumeCompletion = () => {
    if (cqEntries.length === 0) {
      setStatus("CQ empty — no completions to consume.");
      return;
    }
    const [cqe, ...rest] = cqEntries;
    setCqEntries(rest);
    setStatus(`Host consumed ${cqe.label} completion, rang CQ doorbell to update head.`);
  };

  const reset = () => {
    setSqEntries([]);
    setCqEntries([]);
    setNextId(1);
    setStatus("Queues reset. Click 'Submit Command' to begin.");
  };

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Submission &amp; Completion Queues
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          NVMe uses paired circular buffers in host memory: a{" "}
          <strong className="text-text-primary">Submission Queue</strong> (SQ) where the host places
          64-byte commands, and a{" "}
          <strong className="text-text-primary">Completion Queue</strong> (CQ) where the
          controller posts 16-byte results. There&apos;s always one Admin
          SQ/CQ pair (queue ID 0), plus up to 65,535 I/O queue pairs.
        </p>

        {/* Interactive queue diagram */}
        <div className="bg-white rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            Interactive Queue Simulator
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
            {/* SQ */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-nvme-blue" />
                <span className="text-text-primary font-semibold text-sm">
                  Submission Queue (SQ)
                </span>
                <span className="text-text-muted text-xs ml-auto">{sqEntries.length}/{MAX_ENTRIES}</span>
              </div>
              <div className="min-h-[120px] bg-story-surface rounded-xl p-3 flex flex-wrap content-start gap-2">
                <AnimatePresence mode="popLayout">
                  {sqEntries.length === 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-text-muted text-xs italic p-2"
                    >
                      Empty — submit a command
                    </motion.span>
                  )}
                  {sqEntries.map((e) => (
                    <motion.div
                      key={e.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 50 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="px-3 py-2 bg-nvme-blue/10 border border-nvme-blue/30 rounded-lg text-nvme-blue text-xs font-mono font-semibold"
                    >
                      {e.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* CQ */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-nvme-green" />
                <span className="text-text-primary font-semibold text-sm">
                  Completion Queue (CQ)
                </span>
                <span className="text-text-muted text-xs ml-auto">{cqEntries.length}/{MAX_ENTRIES}</span>
              </div>
              <div className="min-h-[120px] bg-story-surface rounded-xl p-3 flex flex-wrap content-start gap-2">
                <AnimatePresence mode="popLayout">
                  {cqEntries.length === 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-text-muted text-xs italic p-2"
                    >
                      Empty — waiting for completions
                    </motion.span>
                  )}
                  {cqEntries.map((e) => (
                    <motion.div
                      key={e.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, x: -50 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="px-3 py-2 bg-nvme-green/10 border border-nvme-green/30 rounded-lg text-nvme-green text-xs font-mono font-semibold"
                    >
                      {e.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
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
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-text-secondary text-xs bg-story-surface rounded-xl p-3 font-mono"
          >
            {status}
          </motion.div>
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
