"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import TermDefinition from "@/components/story/TermDefinition";
import FillInBlank from "@/components/story/FillInBlank";

function QueueDepthDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const depths = [
    { qd: 1, iops: 15000, latency: "70\u03BCs", pct: 6 },
    { qd: 4, iops: 55000, latency: "73\u03BCs", pct: 22 },
    { qd: 8, iops: 100000, latency: "80\u03BCs", pct: 40 },
    { qd: 16, iops: 160000, latency: "100\u03BCs", pct: 64 },
    { qd: 32, iops: 220000, latency: "145\u03BCs", pct: 88 },
    { qd: 64, iops: 250000, latency: "256\u03BCs", pct: 100 },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
        Queue Depth — Filling the Pipeline
      </div>
      <p className="text-text-secondary text-xs mb-4 leading-relaxed">
        <strong className="text-text-primary">Queue Depth (QD)</strong> is how many commands are
        in-flight simultaneously — submitted to the SSD but not yet completed. A single
        NVMe submission queue can hold up to 65,535 entries. Higher QD lets the SSD&apos;s
        controller keep all its NAND dies busy in parallel.
      </p>

      <div className="space-y-2 mb-4">
        {depths.map((d, i) => (
          <motion.div
            key={d.qd}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <div className="text-[10px] font-mono text-text-muted w-10 text-right flex-shrink-0">QD{d.qd}</div>
            <div className="flex-1 flex items-center gap-2">
              <motion.div
                className="h-5 rounded flex items-center justify-end pr-2"
                style={{
                  backgroundColor: `${i < 3 ? "#00d4aa" : i < 5 ? "#f5a623" : "#e05d6f"}20`,
                  borderLeft: `3px solid ${i < 3 ? "#00d4aa" : i < 5 ? "#f5a623" : "#e05d6f"}`,
                }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${d.pct}%` } : {}}
                transition={{ delay: i * 0.08 + 0.15, duration: 0.5, ease: "easeOut" }}
              >
                <span className="text-[8px] font-mono font-bold text-text-primary whitespace-nowrap">
                  {(d.iops / 1000).toFixed(0)}K IOPS
                </span>
              </motion.div>
              <span className="text-[8px] font-mono text-text-muted flex-shrink-0">{d.latency} avg</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-story-surface rounded-lg p-3">
          <div className="text-nvme-green font-mono font-bold text-[10px] mb-1">QD1 — Single Command</div>
          <p className="text-text-muted text-[10px] leading-relaxed">
            Only 1 command in-flight. The CPU waits idle while the SSD reads NAND.
            Most NAND dies are idle. Measures <em>pure latency</em> but wastes bandwidth.
          </p>
        </div>
        <div className="bg-story-surface rounded-lg p-3">
          <div className="text-nvme-amber font-mono font-bold text-[10px] mb-1">QD16-32 — Sweet Spot</div>
          <p className="text-text-muted text-[10px] leading-relaxed">
            Enough commands to keep most NAND dies busy. Latency increases slightly
            but IOPS scales dramatically. This is the typical operating range for
            high-performance storage workloads.
          </p>
        </div>
        <div className="bg-story-surface rounded-lg p-3">
          <div className="text-nvme-red font-mono font-bold text-[10px] mb-1">QD64+ — Diminishing Returns</div>
          <p className="text-text-muted text-[10px] leading-relaxed">
            All dies are saturated — adding more commands just increases queue wait
            time. Latency climbs steeply while IOPS barely improves. The SSD is at
            maximum throughput.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QueueDepthIOPS() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Queue Depth and IOPS
        </h3>

        <TermDefinition term="IOPS (I/O Operations Per Second)" definition="A measure of how many read or write operations a storage device can complete per second. Higher queue depth generally increases IOPS by keeping more NAND dies busy in parallel." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          An SSD contains multiple NAND dies, each capable of operating independently. But
          to keep them all busy, the host needs to submit <em className="text-text-primary">
          multiple commands at once</em>. <strong className="text-text-primary">Queue depth</strong>{" "}
          determines how well the controller can parallelize work across NAND dies.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Think of it like a restaurant with 8 chefs (NAND dies). If you order one dish at
          a time (QD1), 7 chefs stand idle. If you order 8 dishes at once (QD8), every chef
          is cooking — your food arrives much faster overall, even though each dish takes the
          same time.
        </p>

        <QueueDepthDiagram />

        <FillInBlank
          id="act1-qd-fill1"
          prompt="At QD1, a typical NVMe SSD achieves about {blank}K IOPS."
          blanks={[{ answer: "15", tolerance: 5, placeholder: "?" }]}
          explanation="At QD1 (single command in flight), a typical NVMe SSD achieves ~10-20K IOPS. The SSD can only process one command at a time, leaving most NAND dies idle."
        />

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Queue Depth and Parallelism
          </div>
          <div className="flex items-start gap-2 bg-story-surface rounded-lg p-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-nvme-amber flex-shrink-0 mt-1" />
            <span className="text-text-muted">
              <strong className="text-text-primary">Queue depth</strong> determines how
              well the controller can parallelize work across NAND dies. Higher QD =
              more parallelism = higher IOPS, but also higher latency.
              <em className="text-text-secondary"> See Lesson 6: Queues for how SQ/CQ enable this.</em>
            </span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
