"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

export default function Testing() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          SSD Testing Methodology
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Testing an SSD goes far beyond benchmarks. A thorough test plan covers
          protocol compliance, performance characterization, endurance, power
          loss protection, and error injection. Here&apos;s the test pyramid:
        </p>

        <div className="bg-story-panel rounded-xl border border-story-border p-6 mb-6">
          <div className="flex flex-col items-center gap-2">
            {[
              { label: "Compliance", desc: "NVMe spec conformance, error codes, edge cases", color: "nvme-red", w: "w-40" },
              { label: "Functional", desc: "All 38 commands, namespace ops, security", color: "nvme-amber", w: "w-52" },
              { label: "Performance", desc: "Throughput, latency, IOPS, QD scaling", color: "nvme-blue", w: "w-64" },
              { label: "Endurance", desc: "P/E cycles, SMART degradation, TBW validation", color: "nvme-violet", w: "w-76" },
              { label: "Power & Recovery", desc: "Power-loss protection, graceful shutdown, ungraceful reset", color: "nvme-green", w: "w-full max-w-96" },
            ].map((level) => (
              <div
                key={level.label}
                className={`${level.w} bg-${level.color}/10 border border-${level.color}/30 rounded-lg p-3 text-center`}
              >
                <div className={`text-${level.color} font-mono font-bold text-sm`}>
                  {level.label}
                </div>
                <div className="text-text-muted text-xs mt-1">{level.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-story-panel rounded-lg border border-story-border p-4">
            <div className="text-nvme-green font-semibold mb-1">Tools</div>
            <p className="text-text-muted text-xs">
              fio (flexible I/O tester), nvme-cli, blktrace/ftrace, custom
              test frameworks, hardware power-loss rigs.
            </p>
          </div>
          <div className="bg-story-panel rounded-lg border border-story-border p-4">
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
