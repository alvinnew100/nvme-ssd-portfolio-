"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const TEST_LEVELS = [
  { label: "Compliance", desc: "Does the drive follow the NVMe spec? Correct error codes, proper behavior for edge cases, all mandatory commands work.", color: "#ed5f74", w: "160px" },
  { label: "Functional", desc: "Do all features work? All 38 commands, namespace operations, security protocols, firmware updates.", color: "#f5a623", w: "208px" },
  { label: "Performance", desc: "How fast is it? Throughput, latency, IOPS, how it scales with queue depth, steady-state vs burst.", color: "#635bff", w: "256px" },
  { label: "Endurance", desc: "How long will it last? P/E cycle testing, SMART degradation tracking, TBW validation.", color: "#7c5cfc", w: "304px" },
  { label: "Power & Recovery", desc: "What happens when power is lost? Data integrity after unexpected shutdown, recovery time, FTL consistency.", color: "#00d4aa", w: "100%" },
];

function TestPyramid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      {TEST_LEVELS.map((level, i) => (
        <motion.div
          key={level.label}
          className="rounded-xl p-3 text-center"
          style={{
            width: level.w,
            maxWidth: "384px",
            backgroundColor: `${level.color}10`,
            border: `1px solid ${level.color}30`,
          }}
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ delay: i * 0.12, duration: 0.4, ease: "easeOut" }}
        >
          <div className="font-mono font-bold text-sm" style={{ color: level.color }}>
            {level.label}
          </div>
          <div className="text-text-muted text-xs mt-1">{level.desc}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Testing() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          SSD Testing &mdash; Beyond Simple Benchmarks
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Running fio gives you performance numbers. But <em className="text-text-primary">
          thoroughly testing an SSD goes much further.</em> In the storage industry,
          a complete test plan verifies everything from protocol compliance to power
          loss behavior.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why is this important?</em> Because a
          drive that&apos;s fast but loses data during a power failure is worse than
          useless. A drive that passes benchmarks but mishandles error codes will
          crash your database. Testing catches these issues before they reach
          production.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Think of it as a pyramid — each layer builds on the one below it. You
          can&apos;t meaningfully test performance if basic commands don&apos;t work
          correctly:
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            SSD Test Pyramid — from foundation to top
          </div>
          <TestPyramid />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-green font-semibold mb-1">Tools of the Trade</div>
            <ul className="text-text-muted text-xs space-y-1">
              <li>&#8226; <strong className="text-text-secondary">fio</strong> — performance and endurance testing</li>
              <li>&#8226; <strong className="text-text-secondary">nvme-cli</strong> — protocol-level testing and health monitoring</li>
              <li>&#8226; <strong className="text-text-secondary">ftrace/blktrace</strong> — tracing actual commands on the bus</li>
              <li>&#8226; <strong className="text-text-secondary">Power-loss rigs</strong> — hardware that cuts power mid-write to test recovery</li>
            </ul>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-blue font-semibold mb-1">Key Metrics to Report</div>
            <ul className="text-text-muted text-xs space-y-1">
              <li>&#8226; 4KB random read/write IOPS at various queue depths</li>
              <li>&#8226; 128KB sequential read/write MB/s</li>
              <li>&#8226; Latency: average, p50, p99, p99.9 (tail latency matters most)</li>
              <li>&#8226; Steady-state performance after preconditioning (filling the drive)</li>
            </ul>
          </div>
        </div>

        <InfoCard variant="note" title="Preconditioning — why fresh drive numbers lie">
          A brand-new SSD is faster because all blocks are erased and ready. After
          you fill the drive, garbage collection kicks in and steady-state performance
          drops. <em>Always precondition</em> (fill the drive with random writes)
          before measuring production-representative performance. The SNIA PTS
          (Performance Test Specification) defines standard preconditioning procedures.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
