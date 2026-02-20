"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

const TEST_LEVELS = [
  { label: "Compliance", desc: "NVMe spec conformance, error codes, edge cases", color: "#ed5f74", w: "160px" },
  { label: "Functional", desc: "All 38 commands, namespace ops, security", color: "#f5a623", w: "208px" },
  { label: "Performance", desc: "Throughput, latency, IOPS, QD scaling", color: "#635bff", w: "256px" },
  { label: "Endurance", desc: "P/E cycles, SMART degradation, TBW validation", color: "#7c5cfc", w: "304px" },
  { label: "Power & Recovery", desc: "Power-loss protection, graceful shutdown, ungraceful reset", color: "#00d4aa", w: "100%" },
];

export default function Testing() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          SSD Testing Methodology
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Testing an SSD goes far beyond benchmarks. A thorough test plan covers
          protocol compliance, performance characterization, endurance, power
          loss protection, and error injection. Here&apos;s the test pyramid:
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="flex flex-col items-center gap-2">
            {TEST_LEVELS.map((level) => (
              <div
                key={level.label}
                className="rounded-xl p-3 text-center"
                style={{
                  width: level.w,
                  maxWidth: "384px",
                  backgroundColor: `${level.color}10`,
                  border: `1px solid ${level.color}30`,
                }}
              >
                <div className="font-mono font-bold text-sm" style={{ color: level.color }}>
                  {level.label}
                </div>
                <div className="text-text-muted text-xs mt-1">{level.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-green font-semibold mb-1">Tools</div>
            <p className="text-text-muted text-xs">
              fio (flexible I/O tester), nvme-cli, blktrace/ftrace, custom
              test frameworks, hardware power-loss rigs.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-blue font-semibold mb-1">Key Metrics</div>
            <p className="text-text-muted text-xs">
              4KB random read/write IOPS, 128KB sequential MB/s, mixed workload
              latency (p50, p99, p999), steady-state performance after preconditioning.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
