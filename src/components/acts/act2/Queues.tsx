"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const MAX_ENTRIES = 8;

interface QEntry {
  id: number;
  label: string;
  type: "sq" | "cq";
}

export default function Queues() {
  const [sqEntries, setSqEntries] = useState<QEntry[]>([]);
  const [cqEntries, setCqEntries] = useState<QEntry[]>([]);
  const [nextId, setNextId] = useState(1);
  const [status, setStatus] = useState("Idle — queues empty");

  const submitCommand = () => {
    if (sqEntries.length >= MAX_ENTRIES) {
      setStatus("SQ full! Controller must process commands first.");
      return;
    }
    const entry: QEntry = {
      id: nextId,
      label: `CMD ${nextId}`,
      type: "sq",
    };
    setSqEntries((prev) => [...prev, entry]);
    setNextId((n) => n + 1);
    setStatus(`Command ${entry.label} placed in Submission Queue. Ring doorbell!`);
  };

  const processCommand = () => {
    if (sqEntries.length === 0) {
      setStatus("SQ empty — nothing to process.");
      return;
    }
    const [cmd, ...rest] = sqEntries;
    setSqEntries(rest);
    if (cqEntries.length < MAX_ENTRIES) {
      setCqEntries((prev) => [...prev, { ...cmd, type: "cq" }]);
    }
    setStatus(`Controller processed ${cmd.label} → completion posted to CQ.`);
  };

  const consumeCompletion = () => {
    if (cqEntries.length === 0) {
      setStatus("CQ empty — no completions to consume.");
      return;
    }
    const [cqe, ...rest] = cqEntries;
    setCqEntries(rest);
    setStatus(`Host consumed completion for ${cqe.label}. Ring CQ doorbell.`);
  };

  return (
    <SectionWrapper className="py-20 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Submission &amp; Completion Queues
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          NVMe uses paired circular buffers in host memory: a{" "}
          <strong className="text-nvme-green">Submission Queue</strong> (SQ) where the host places
          64-byte commands, and a{" "}
          <strong className="text-nvme-blue">Completion Queue</strong> (CQ) where the
          controller posts 16-byte results. There&apos;s always one Admin
          SQ/CQ pair (queue ID 0), plus up to 65,535 I/O queue pairs.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The host writes commands to the SQ tail, rings the SQ doorbell, the
          controller fetches commands from the SQ head, processes them, then
          posts completions to the CQ. The host detects completions via phase
          bit toggling or interrupts (MSI-X).
        </p>

        {/* Interactive queue diagram */}
        <div className="bg-story-panel rounded-xl border border-story-border p-6 mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Interactive Queue Diagram
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* SQ */}
            <div>
              <div className="text-nvme-green font-mono text-sm font-bold mb-2">
                Submission Queue (SQ)
              </div>
              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {sqEntries.length === 0 && (
                  <span className="text-text-muted text-xs italic">Empty</span>
                )}
                {sqEntries.map((e) => (
                  <div
                    key={e.id}
                    className="px-3 py-1.5 bg-nvme-green/10 border border-nvme-green/40 rounded text-nvme-green text-xs font-mono"
                  >
                    {e.label}
                  </div>
                ))}
              </div>
            </div>

            {/* CQ */}
            <div>
              <div className="text-nvme-blue font-mono text-sm font-bold mb-2">
                Completion Queue (CQ)
              </div>
              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {cqEntries.length === 0 && (
                  <span className="text-text-muted text-xs italic">Empty</span>
                )}
                {cqEntries.map((e) => (
                  <div
                    key={e.id}
                    className="px-3 py-1.5 bg-nvme-blue/10 border border-nvme-blue/40 rounded text-nvme-blue text-xs font-mono"
                  >
                    {e.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={submitCommand}
              className="px-4 py-2 bg-nvme-green/10 border border-nvme-green/40 rounded-lg text-nvme-green text-xs font-mono hover:bg-nvme-green/20 transition-colors"
            >
              Submit Command
            </button>
            <button
              onClick={processCommand}
              className="px-4 py-2 bg-nvme-blue/10 border border-nvme-blue/40 rounded-lg text-nvme-blue text-xs font-mono hover:bg-nvme-blue/20 transition-colors"
            >
              Process (Controller)
            </button>
            <button
              onClick={consumeCompletion}
              className="px-4 py-2 bg-nvme-violet/10 border border-nvme-violet/40 rounded-lg text-nvme-violet text-xs font-mono hover:bg-nvme-violet/20 transition-colors"
            >
              Consume Completion
            </button>
          </div>

          <div className="text-text-secondary text-xs font-mono bg-story-bg rounded p-2">
            {status}
          </div>
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
