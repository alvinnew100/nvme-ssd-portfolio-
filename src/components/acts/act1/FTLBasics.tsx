"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const INITIAL_MAP = [
  { lba: 0, pba: 12, valid: true },
  { lba: 1, pba: 5, valid: true },
  { lba: 2, pba: 31, valid: true },
  { lba: 3, pba: 8, valid: true },
  { lba: 4, pba: 22, valid: true },
  { lba: 5, pba: 0, valid: true },
  { lba: 6, pba: 17, valid: true },
  { lba: 7, pba: 3, valid: true },
];

export default function FTLBasics() {
  const [ftlMap, setFtlMap] = useState(INITIAL_MAP);
  const [writeLog, setWriteLog] = useState<string[]>([]);
  const [selectedLba, setSelectedLba] = useState<number | null>(null);
  const [nextFreePba, setNextFreePba] = useState(33);

  const handleWrite = (lba: number) => {
    const newPba = nextFreePba;
    setFtlMap((prev) =>
      prev.map((entry) =>
        entry.lba === lba ? { ...entry, pba: newPba, valid: true } : entry
      )
    );
    setWriteLog((prev) => [
      `Write LBA ${lba} → old PBA ${ftlMap[lba].pba} marked stale, new PBA ${newPba}`,
      ...prev.slice(0, 5),
    ]);
    setNextFreePba((p) => p + 1);
    setSelectedLba(lba);
  };

  const handleReset = () => {
    setFtlMap(INITIAL_MAP);
    setWriteLog([]);
    setNextFreePba(33);
    setSelectedLba(null);
  };

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The Flash Translation Layer (FTL)
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The host sees a clean, linear address space (LBA 0, 1, 2, ...) but NAND
          flash has a critical constraint:{" "}
          <strong className="text-text-primary">
            you can&apos;t overwrite data in place
          </strong>
          . Pages must be erased before rewriting, and erasing happens at the{" "}
          <strong className="text-text-primary">block level</strong> (128-512 pages).
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The <strong className="text-text-primary">FTL</strong> solves this by
          maintaining a mapping table — when the host writes to LBA 3, the FTL
          writes the data to a <em>new</em> free physical page and updates the
          mapping. The old page becomes &ldquo;stale.&rdquo; This is why SSDs need
          garbage collection and TRIM.
        </p>

        {/* Interactive FTL mapping */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider">
              Interactive FTL Mapping — Click an LBA to simulate a write
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-nvme-blue hover:underline font-mono"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logical side */}
            <div className="flex-1">
              <div className="text-nvme-green text-xs font-mono font-bold mb-2 text-center">
                Logical Address (Host)
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ftlMap.map((entry) => (
                  <button
                    key={entry.lba}
                    onClick={() => handleWrite(entry.lba)}
                    className={`rounded-lg p-3 text-center transition-all border-2 ${
                      selectedLba === entry.lba
                        ? "border-nvme-blue bg-nvme-blue/5 scale-105"
                        : "border-story-border bg-story-surface hover:border-nvme-green/50"
                    }`}
                  >
                    <div className="text-text-primary font-mono font-bold text-sm">
                      LBA {entry.lba}
                    </div>
                    <div className="text-[9px] text-text-muted mt-1">
                      click to write
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mapping arrows */}
            <div className="hidden sm:flex flex-col items-center justify-center gap-1">
              <div className="text-nvme-violet text-[10px] font-mono font-bold">
                FTL
              </div>
              <div className="text-nvme-violet text-[10px] font-mono font-bold">
                MAP
              </div>
              <svg width="40" height="60" viewBox="0 0 40 60">
                <path d="M20 0 L20 45 L12 37 M20 45 L28 37" stroke="#7c5cfc" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Physical side */}
            <div className="flex-1">
              <div className="text-nvme-amber text-xs font-mono font-bold mb-2 text-center">
                Physical Page (NAND)
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ftlMap.map((entry) => (
                  <div
                    key={entry.lba}
                    className={`rounded-lg p-3 text-center border-2 transition-all ${
                      selectedLba === entry.lba
                        ? "border-nvme-blue bg-nvme-blue/5"
                        : "border-story-border bg-story-surface"
                    }`}
                  >
                    <div className="text-nvme-amber font-mono font-bold text-sm">
                      P{entry.pba}
                    </div>
                    <div className="text-[9px] text-text-muted mt-1">
                      ← LBA {entry.lba}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Write log */}
          {writeLog.length > 0 && (
            <div className="mt-4 bg-story-dark rounded-xl p-4">
              <div className="text-white/40 text-[10px] font-mono mb-2">
                FTL Write Log
              </div>
              {writeLog.map((log, i) => (
                <div
                  key={i}
                  className={`text-[11px] font-mono ${
                    i === 0 ? "text-nvme-green" : "text-white/40"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key concepts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-green text-sm mb-1">
              Out-of-Place Write
            </div>
            <p className="text-text-muted text-xs">
              Data is always written to a new page. The old mapping becomes stale.
              This avoids the costly erase-before-write cycle.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-amber text-sm mb-1">
              Garbage Collection
            </div>
            <p className="text-text-muted text-xs">
              When free pages run low, the FTL copies valid pages from a block with
              many stale pages, then erases the entire block to reclaim space.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-violet text-sm mb-1">
              L2P Table
            </div>
            <p className="text-text-muted text-xs">
              The logical-to-physical mapping table. Stored in DRAM for speed
              (4 bytes per LBA = ~4 GB for a 1 TB drive). Persisted to NAND on
              power-off.
            </p>
          </div>
        </div>

        <InfoCard variant="note" title="Why FTL matters for performance">
          Every random write creates stale pages. When the FTL runs low on free blocks,
          garbage collection kicks in, copying valid data and erasing blocks. This
          background activity competes with host I/O and causes the &ldquo;performance
          cliff&rdquo; seen in steady-state benchmarks. TRIM helps by telling the FTL
          which pages are truly free.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
