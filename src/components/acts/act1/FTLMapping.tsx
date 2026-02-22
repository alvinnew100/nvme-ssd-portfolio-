"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import QuizCard from "@/components/story/QuizCard";

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

function L2POverviewVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Logical-to-Physical Mapping &mdash; The Core Idea
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
        <motion.div
          className="flex-1 rounded-xl p-4 text-center bg-nvme-green/5 border-2 border-nvme-green/30"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <div className="text-nvme-green font-mono font-bold text-sm mb-1">Host</div>
          <div className="text-text-secondary text-xs mb-2">Sends logical address</div>
          <div className="bg-story-surface rounded-lg p-2 font-mono text-sm text-text-primary">
            LBA 42
          </div>
        </motion.div>

        <motion.div
          className="text-nvme-violet"
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <svg width="40" height="24" viewBox="0 0 40 24" className="hidden sm:block">
            <path d="M0 12 L30 12 L22 6 M30 12 L22 18" stroke="#7c5cfc" strokeWidth="2" fill="none" />
          </svg>
          <svg width="24" height="30" viewBox="0 0 24 30" className="block sm:hidden mx-auto">
            <path d="M12 0 L12 22 L6 16 M12 22 L18 16" stroke="#7c5cfc" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>

        <motion.div
          className="flex-1 rounded-xl p-4 text-center bg-nvme-violet/5 border-2 border-nvme-violet/30"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="text-nvme-violet font-mono font-bold text-sm mb-1">FTL Table</div>
          <div className="text-text-secondary text-xs mb-2">Lookup in DRAM</div>
          <div className="bg-story-surface rounded-lg p-2 text-[10px] font-mono space-y-0.5">
            <div className="text-text-muted">LBA 41 → P128</div>
            <div className="text-nvme-violet font-bold">LBA 42 → P507</div>
            <div className="text-text-muted">LBA 43 → P33</div>
          </div>
        </motion.div>

        <motion.div
          className="text-nvme-violet"
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          <svg width="40" height="24" viewBox="0 0 40 24" className="hidden sm:block">
            <path d="M0 12 L30 12 L22 6 M30 12 L22 18" stroke="#7c5cfc" strokeWidth="2" fill="none" />
          </svg>
          <svg width="24" height="30" viewBox="0 0 24 30" className="block sm:hidden mx-auto">
            <path d="M12 0 L12 22 L6 16 M12 22 L18 16" stroke="#7c5cfc" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>

        <motion.div
          className="flex-1 rounded-xl p-4 text-center bg-nvme-amber/5 border-2 border-nvme-amber/30"
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="text-nvme-amber font-mono font-bold text-sm mb-1">NAND</div>
          <div className="text-text-secondary text-xs mb-2">Physical page</div>
          <div className="bg-story-surface rounded-lg p-2 font-mono text-sm text-text-primary">
            Page 507
          </div>
        </motion.div>
      </div>

      <motion.p
        className="text-text-muted text-xs text-center mt-4 max-w-lg mx-auto"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
      >
        The FTL table lives in <strong className="text-text-primary">DRAM</strong> for fast lookups
        (~100ns) and is persisted to NAND on power-off so mappings survive reboots.
      </motion.p>
    </div>
  );
}

function OutOfPlaceWriteVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const steps = [
    { label: "1. Original data at Page 5", pages: [
      { id: 5, state: "valid", content: "Data A" },
      { id: 6, state: "valid", content: "Data B" },
      { id: 7, state: "free", content: "" },
      { id: 8, state: "free", content: "" },
    ]},
    { label: "2. Update 'Data A' → writes to new Page 7", pages: [
      { id: 5, state: "stale", content: "Data A" },
      { id: 6, state: "valid", content: "Data B" },
      { id: 7, state: "new", content: "Data A'" },
      { id: 8, state: "free", content: "" },
    ]},
    { label: "3. FTL table updated: LBA 0 → Page 7 (was Page 5)", pages: [
      { id: 5, state: "stale", content: "Data A" },
      { id: 6, state: "valid", content: "Data B" },
      { id: 7, state: "valid", content: "Data A'" },
      { id: 8, state: "free", content: "" },
    ]},
  ];

  const stateColors: Record<string, { bg: string; border: string; text: string }> = {
    valid: { bg: "bg-nvme-green/10", border: "border-nvme-green/40", text: "text-nvme-green" },
    stale: { bg: "bg-nvme-red/10", border: "border-nvme-red/40", text: "text-nvme-red" },
    free: { bg: "bg-story-surface", border: "border-story-border", text: "text-text-muted" },
    new: { bg: "bg-nvme-blue/10", border: "border-nvme-blue/40", text: "text-nvme-blue" },
  };

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Out-of-Place Write — Why SSDs Never Overwrite
      </div>
      <div className="space-y-4">
        {steps.map((step, si) => (
          <motion.div
            key={si}
            className="bg-story-surface rounded-xl p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: si * 0.2, duration: 0.4 }}
          >
            <div className="text-text-secondary text-xs font-medium mb-2">{step.label}</div>
            <div className="flex gap-2">
              {step.pages.map((page) => {
                const colors = stateColors[page.state];
                return (
                  <motion.div
                    key={`${si}-${page.id}`}
                    className={`flex-1 ${colors.bg} ${colors.border} border-2 rounded-lg p-2 text-center`}
                    initial={{ scale: 0.9 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: si * 0.2 + 0.1, type: "spring" }}
                  >
                    <div className={`${colors.text} font-mono text-[10px] font-bold`}>P{page.id}</div>
                    <div className="text-text-muted text-[8px] font-mono">{page.content || "empty"}</div>
                    <div className={`${colors.text} text-[7px] font-mono mt-0.5`}>
                      {page.state === "stale" ? "\u2715 stale" : page.state === "new" ? "\u2605 new" : page.state === "valid" ? "\u2713 valid" : "\u25CB free"}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-4 justify-center mt-4 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-nvme-green" /> Valid</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-nvme-red" /> Stale</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-nvme-blue" /> New write</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-story-border" /> Free</span>
      </div>
    </div>
  );
}

export default function FTLMapping() {
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
        <AnalogyCard
          concept="The FTL Is a Library Card Catalog"
          analogy="Imagine a library that can't erase single pages — only whole shelves. When you update a book, the librarian writes the new version on a fresh shelf, updates the card catalog to point there, and marks the old copy as 'outdated.' Later, a cleanup crew (garbage collection) moves valid books off shelves with too many outdated copies, then clears those shelves for reuse."
        />

        <TermDefinition term="FTL (Flash Translation Layer)" definition="The firmware inside the SSD controller that translates logical addresses (LBAs from the host) to physical NAND page locations. It handles out-of-place writes, garbage collection, and wear leveling — all invisible to the host operating system." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Remember the &ldquo;shredding the whole notebook&rdquo; problem from the
          hierarchy section? You can write individual pages, but erasing requires wiping
          entire blocks (hundreds of pages). So what happens when you want to update just
          one page&apos;s worth of data?
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The SSD can&apos;t erase a whole block just to update one page — that would
          destroy all the other data in that block. Instead, the controller uses a clever
          trick called the <strong className="text-text-primary">Flash Translation Layer (FTL)</strong>.
          Instead of overwriting the old page, it writes the new data to a{" "}
          <strong className="text-text-primary">completely different, free page</strong>{" "}
          somewhere else on the drive, then updates a mapping table to point the LBA at
          the new location.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The old page still exists but now contains outdated data — it&apos;s
          called <strong className="text-text-primary">&ldquo;stale.&rdquo;</strong> Stale
          pages waste space. They&apos;ll be cleaned up later by a process called{" "}
          <strong className="text-text-primary">garbage collection</strong>.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Let&apos;s see how this works visually, then try it yourself:
        </p>

        <L2POverviewVisual />

        {/* Usage instructions */}
        <div className="bg-nvme-blue/5 rounded-xl p-4 border border-nvme-blue/20 mb-6">
          <div className="text-nvme-blue text-xs font-bold mb-2">Try it yourself &mdash; Interactive FTL Mapping</div>
          <ul className="text-text-secondary text-xs space-y-1.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0 mt-0.5">1.</span>
              <span><strong className="text-text-primary">Click any LBA button</strong> to simulate writing new data to that address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0 mt-0.5">2.</span>
              <span><strong className="text-text-primary">Watch the Physical Page column</strong> &mdash; the PBA changes because SSDs write to a NEW page instead of overwriting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0 mt-0.5">3.</span>
              <span>The <strong className="text-text-primary">write log</strong> at the bottom shows each remapping as it happens</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0 mt-0.5">4.</span>
              <span><strong className="text-text-primary">Click the same LBA multiple times</strong> to see the PBA keep changing &mdash; old pages become stale</span>
            </li>
          </ul>
        </div>

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
            <div className="flex-1">
              <div className="text-nvme-green text-xs font-mono font-bold mb-2 text-center">
                Logical Address (Host)
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ftlMap.map((entry) => (
                  <motion.button
                    key={entry.lba}
                    onClick={() => handleWrite(entry.lba)}
                    className={`rounded-lg p-3 text-center border-2 ${
                      selectedLba === entry.lba
                        ? "border-nvme-blue bg-nvme-blue/5"
                        : "border-story-border bg-story-surface hover:border-nvme-green/50"
                    }`}
                    animate={selectedLba === entry.lba ? { scale: 1.05 } : { scale: 1 }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-text-primary font-mono font-bold text-sm">
                      LBA {entry.lba}
                    </div>
                    <div className="text-[9px] text-text-muted mt-1">
                      click to write
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center gap-1">
              <div className="text-nvme-violet text-[10px] font-mono font-bold">FTL</div>
              <div className="text-nvme-violet text-[10px] font-mono font-bold">MAP</div>
              <svg width="40" height="60" viewBox="0 0 40 60">
                <path d="M20 0 L20 45 L12 37 M20 45 L28 37" stroke="#7c5cfc" strokeWidth="2" fill="none" />
              </svg>
            </div>

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

        <OutOfPlaceWriteVisual />

        <QuizCard
          id="act1-ftl-quiz1"
          question="Why does the SSD write to a NEW page instead of overwriting the old one?"
          options={[
            { text: "Overwriting is slower", explanation: "While it would be slower, the real reason is a physical hardware limitation." },
            { text: "NAND pages can't be overwritten — erasing is block-level", correct: true, explanation: "Correct! NAND flash can only be programmed (written) once per erase cycle, and erasing must happen at the block level (128-256 pages). To avoid erasing an entire block just to update one page, the FTL writes to a fresh page and updates the mapping table." },
            { text: "It uses less power", explanation: "Power isn't the main concern. The physical write constraint of NAND makes out-of-place writes necessary." },
            { text: "The old page might be corrupted", explanation: "Corruption isn't the primary reason. It's a fundamental NAND constraint: you can't reprogram a page without erasing the whole block first." },
          ]}
        />
      </div>
    </SectionWrapper>
  );
}
