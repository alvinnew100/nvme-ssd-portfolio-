"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import DragSortChallenge from "@/components/story/DragSortChallenge";

function GcProcessVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const steps = [
    { num: 1, label: "Select source block", desc: "Pick block with lowest VPC (fewest valid pages)", color: "#e05d6f" },
    { num: 2, label: "Copy valid pages", desc: "Move valid pages to a free block (write amplification!)", color: "#f5a623" },
    { num: 3, label: "Update FTL table", desc: "Point LBAs at the new physical locations", color: "#7c5cfc" },
    { num: 4, label: "Erase source block", desc: "High-voltage erase of entire block (~3-5ms)", color: "#635bff" },
    { num: 5, label: "Return to free pool", desc: "Block is now empty and available for new writes", color: "#00d4aa" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
        Garbage Collection — Step by Step
      </div>
      <p className="text-text-secondary text-xs mb-4 leading-relaxed">
        When free blocks run low, the GC engine kicks in to reclaim space:
      </p>

      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -15 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.35 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold flex-shrink-0"
              style={{ backgroundColor: step.color }}
            >
              {step.num}
            </div>
            <div className="flex-1 rounded-lg p-3" style={{ backgroundColor: `${step.color}08`, borderLeft: `3px solid ${step.color}` }}>
              <div className="text-xs font-semibold" style={{ color: step.color }}>{step.label}</div>
              <div className="text-[10px] text-text-muted">{step.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function GarbageCollection() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Garbage Collection
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Every time the FTL performs an <strong className="text-text-primary">out-of-place write</strong>,
          the old page becomes stale but still occupies physical space. Over time, blocks
          accumulate stale pages that can&apos;t be reclaimed individually (remember: NAND
          erases happen at the <em className="text-text-primary">block</em> level, not page level).
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">So how does the SSD reclaim this wasted space?</em>{" "}
          Through <strong className="text-text-primary">garbage collection (GC)</strong> — a
          background process that consolidates valid data and frees up entire blocks for reuse.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          GC is the biggest internal factor affecting SSD performance. When the drive runs
          low on free blocks, GC must run more aggressively — competing with host I/O for
          NAND bandwidth and causing the dreaded <strong className="text-text-primary">
          performance cliff</strong> seen in steady-state benchmarks.
        </p>

        <GcProcessVisual />

        {/* Key concept cards */}
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

        <DragSortChallenge
          id="act1-gc-drag1"
          prompt="Order the garbage collection steps:"
          items={[
            { id: "select", label: "Select source block", detail: "Pick block with lowest VPC" },
            { id: "copy", label: "Copy valid pages", detail: "Move to a free block" },
            { id: "update", label: "Update FTL table", detail: "Point LBAs at new locations" },
            { id: "erase", label: "Erase source block", detail: "High-voltage block erase" },
            { id: "return", label: "Return to free pool", detail: "Block available for new writes" },
          ]}
          correctOrder={["select", "copy", "update", "erase", "return"]}
          hint="Think about what must happen before the block can be safely erased."
        />

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
