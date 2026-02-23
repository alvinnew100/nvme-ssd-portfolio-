"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import RevealCard from "@/components/story/RevealCard";

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

        <RevealCard
          id="act0-storage-kc1"
          prompt="If RAM is ~1,000x faster than an SSD, why doesn't the system just use RAM for everything? What fundamental tradeoff forces us to have a storage hierarchy instead of a single memory type?"
          answer="RAM (DRAM) achieves 50-100 nanosecond access times vs. 10-100 microseconds for SSDs, but it has two fatal flaws for permanent storage: (1) it's volatile — all data vanishes when power is lost, so your files wouldn't survive a reboot, and (2) it costs ~$3-5/GB vs. ~$0.05/GB for SSD storage, making a 1TB RAM-only system prohibitively expensive. The storage hierarchy exists because no single technology optimizes for speed, persistence, and cost simultaneously. Each layer trades one attribute for another: registers are fastest but smallest, SSDs balance speed with persistence, and HDDs maximize capacity at the cost of speed."
          hint="Think about which type keeps data even when the power is turned off."
          options={[
            "RAM is volatile and loses data on power loss, and costs ~60-100x more per GB than SSD storage",
            "RAM can only store executable code, not user data files",
            "The CPU can only address 64 GB of RAM due to bus width limitations",
            "RAM cells wear out faster than NAND cells, making it impractical for storage"
          ]}
          correctIndex={0}
        />

        <RevealCard
          id="act0-storage-drag1"
          prompt="If you swapped the SSD and RAM layers in the storage hierarchy — putting NAND where DRAM is and vice versa — what specific operations would break or slow down catastrophically, and why?"
          answer="The hierarchy from fastest to slowest is: CPU Registers (< 1 ns) > L1/L2/L3 Cache (1-10 ns) > RAM/DRAM (50-100 ns) > SSD/NAND (10-100 us) > HDD (5-10 ms). If you used NAND as main memory, the CPU would stall for ~1,000x longer on every memory access — page table walks, stack operations, and instruction fetches would all grind to a halt since they rely on nanosecond-level DRAM latency. Conversely, using DRAM as persistent storage would mean losing all data on every power loss (DRAM is volatile), and the cost would be astronomical ($3-5/GB vs $0.05/GB). Each layer exists precisely because no single technology can simultaneously be fast, persistent, large, and cheap."
          hint="Think of the storage hierarchy pyramid — faster and smaller at the top, slower and bigger at the bottom."
          options={[
            "Performance would improve because NAND has higher bandwidth than DRAM",
            "The CPU would stall ~1,000x longer on every memory access, and all persistent data would be lost on power loss since DRAM is volatile",
            "The system would work identically since both are semiconductor-based memory technologies",
            "Only write operations would slow down; reads from NAND are comparable to DRAM"
          ]}
          correctIndex={1}
        />
      </div>
    </SectionWrapper>
  );
}
