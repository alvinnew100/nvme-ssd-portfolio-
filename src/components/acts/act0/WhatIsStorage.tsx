"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";
import DragSortChallenge from "@/components/story/DragSortChallenge";

function StorageHierarchyDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const levels = [
    { label: "CPU Registers", size: "~1 KB", speed: "< 1 ns", color: "#635bff", width: "20%" },
    { label: "L1/L2/L3 Cache (SRAM)", size: "KB–MB", speed: "1–10 ns", color: "#7c5cfc", width: "35%" },
    { label: "Main Memory (DRAM)", size: "GB", speed: "50–100 ns", color: "#00d4aa", width: "55%" },
    { label: "SSD (NAND Flash)", size: "TB", speed: "10–100 μs", color: "#e8a317", width: "75%" },
    { label: "Hard Disk (HDD)", size: "TB", speed: "5–10 ms", color: "#e05d6f", width: "95%" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 sm:p-8 border border-story-border card-shadow mb-8">
      <h4 className="text-sm font-mono text-nvme-blue uppercase tracking-wider mb-6 text-center">
        Storage Hierarchy — Faster = Smaller = More Expensive
      </h4>
      <div className="max-w-lg mx-auto space-y-2">
        {levels.map((level, i) => (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15 * i, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <div
              className="rounded-lg px-3 py-2 text-center flex-shrink-0"
              style={{
                width: level.width,
                backgroundColor: `${level.color}10`,
                border: `1px solid ${level.color}40`,
              }}
            >
              <div className="font-bold text-[10px]" style={{ color: level.color }}>{level.label}</div>
            </div>
            <div className="text-text-muted text-[9px] flex-shrink-0 w-16 text-right">{level.size}</div>
            <div className="text-text-muted text-[9px] flex-shrink-0 w-16">{level.speed}</div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between max-w-lg mx-auto mt-3 text-[9px] text-text-muted">
        <span>&uarr; Faster, smaller, costlier</span>
        <span>&darr; Slower, larger, cheaper</span>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="text-text-muted text-xs text-center mt-4"
      >
        An SSD sits between fast-but-volatile DRAM and slow-but-cheap HDDs — combining speed with persistence
      </motion.p>
    </div>
  );
}

export default function WhatIsStorage() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-6">
          What Is Storage?
        </h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          Your computer processes data using its <strong className="text-text-primary">CPU</strong> (the processor
          that performs calculations) and temporarily holds data in <strong className="text-text-primary">RAM</strong>{" "}
          (fast memory that loses everything when power is turned off). But your files, apps, and operating system
          need to survive restarts — that&apos;s what <strong className="text-text-primary">storage</strong> is for.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          <em className="text-text-primary">Why can&apos;t we just use RAM for everything?</em> Two reasons:
          RAM is <strong className="text-text-primary">volatile</strong> (data disappears without power) and
          it&apos;s expensive (~$3-5 per GB vs ~$0.05 per GB for SSD storage). Storage devices like SSDs
          are <strong className="text-text-primary">non-volatile</strong> — they keep your data even when
          the computer is off.
        </p>

        <AnalogyCard
          concept="The Memory Hierarchy Is Like a Kitchen"
          analogy="CPU registers are the ingredients in your hand — instantly accessible but tiny. Cache is the counter space — fast to grab from, but limited. RAM is the fridge — lots of room, quick access, but needs power. An SSD is the pantry — large, keeps food long-term, but takes a walk to get there. An HDD is the basement storage — huge, cheap, but slow to retrieve from."
        />

        <StorageHierarchyDiagram />

        <p className="text-text-secondary leading-relaxed mb-4">
          This course focuses on <strong className="text-text-primary">SSDs (Solid State Drives)</strong> —
          specifically the kind that use the <strong className="text-text-primary">NVMe protocol</strong> to
          communicate with the CPU. SSDs are the dominant storage technology today because they&apos;re fast
          (thousands of times faster than HDDs for random access), have no moving parts, and are
          energy-efficient.
        </p>
        <p className="text-text-secondary leading-relaxed mb-6">
          But before we dive into how SSDs work, we need to understand the highway they use to talk
          to the rest of the computer — the <strong className="text-text-primary">bus</strong>.
        </p>

        <KnowledgeCheck
          id="act0-storage-kc1"
          question="Which is faster: RAM or an SSD?"
          options={["RAM", "SSD"]}
          correctIndex={0}
          explanation="RAM (DRAM) has access times of 50-100 nanoseconds, while SSDs take 10-100 microseconds — about 1,000x slower. That's why RAM is used for active data and SSDs for persistent storage."
          hint="Think about which type keeps data even when the power is turned off."
        />

        <DragSortChallenge
          id="act0-storage-drag1"
          prompt="Order these storage types from fastest to slowest:"
          items={[
            { id: "registers", label: "CPU Registers", detail: "< 1 ns" },
            { id: "cache", label: "L1/L2/L3 Cache", detail: "1-10 ns" },
            { id: "ram", label: "RAM (DRAM)", detail: "50-100 ns" },
            { id: "ssd", label: "SSD (NAND Flash)", detail: "10-100 \u00B5s" },
            { id: "hdd", label: "Hard Disk (HDD)", detail: "5-10 ms" },
          ]}
          correctOrder={["registers", "cache", "ram", "ssd", "hdd"]}
          hint="Think of the storage hierarchy pyramid — faster and smaller at the top, slower and bigger at the bottom."
        />
      </div>
    </SectionWrapper>
  );
}
