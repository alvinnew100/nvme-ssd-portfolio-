"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";

const SMART_FIELDS = [
  { name: "Critical Warning", value: "0x00", status: "ok" as const, explain: "0 means no warnings — no spare capacity issues, no temperature problems, no reliability degradation" },
  { name: "Temperature", value: "315 K (42°C)", status: "ok" as const, explain: "In Kelvin. 315K = 42°C. SSDs throttle at ~70°C and shut down at ~85°C to prevent damage" },
  { name: "Available Spare", value: "100%", status: "ok" as const, explain: "Percentage of spare NAND blocks remaining. The SSD reserves extra blocks to replace worn-out ones" },
  { name: "Available Spare Threshold", value: "10%", status: "ok" as const, explain: "Below this value, the drive triggers a warning. At 0%, the SSD has no more replacement blocks" },
  { name: "Percentage Used", value: "3%", status: "ok" as const, explain: "How much of the drive's rated endurance (TBW) has been consumed. 100% = rated lifetime reached (but the drive often keeps working)" },
  { name: "Data Units Read", value: "12,847,231", status: "ok" as const, explain: "Each unit = 512KB. Multiply by 512KB to get total bytes read. This drive has read ~6.1 TB" },
  { name: "Data Units Written", value: "36,291,082", status: "ok" as const, explain: "Total host writes. Compare with vendor-specific NAND writes to calculate Write Amplification Factor" },
  { name: "Host Read Commands", value: "1,294,821,037", status: "ok" as const, explain: "Total NVMe Read commands received. Higher number with lower data units means many small reads" },
  { name: "Host Write Commands", value: "982,103,442", status: "ok" as const, explain: "Total NVMe Write commands. Compare with read commands to understand the workload profile" },
  { name: "Power Cycles", value: "847", status: "ok" as const, explain: "How many times the drive has been powered on/off. Frequent power cycles stress the controller" },
  { name: "Power On Hours", value: "2,847", status: "ok" as const, explain: "Total hours the drive has been powered on (~119 days). Server drives may show 40,000+" },
  { name: "Unsafe Shutdowns", value: "12", status: "warn" as const, explain: "Power lost without graceful shutdown. The FTL mapping table in DRAM may have been dirty — the SSD had to rebuild it on next boot" },
  { name: "Media Errors", value: "0", status: "ok" as const, explain: "Uncorrectable ECC errors. >0 means some data couldn't be recovered. This is the most serious indicator" },
  { name: "Error Log Entries", value: "3", status: "warn" as const, explain: "Commands that returned error status codes. Check the Error Information Log for details" },
];

export default function SMART() {
  const [animatedIdx, setAnimatedIdx] = useState(0);

  useEffect(() => {
    if (animatedIdx < SMART_FIELDS.length) {
      const t = setTimeout(() => setAnimatedIdx((i) => i + 1), 80);
      return () => clearTimeout(t);
    }
  }, [animatedIdx]);

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Is Your Drive Healthy? &mdash; SMART Monitoring
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Just like you go to a doctor for a checkup, your SSD has a built-in
          health report called <strong className="text-text-primary">SMART</strong>{" "}
          (Self-Monitoring, Analysis, and Reporting Technology). It tracks
          temperature, wear, error counts, power usage, and more — everything you
          need to know about the drive&apos;s health.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why should you check SMART?</em> Because
          SSDs don&apos;t fail suddenly without warning. SMART data shows early
          warning signs: rising temperatures, increasing error counts, shrinking
          spare capacity. If you catch these trends early, you can replace the drive
          before you lose data.
        </p>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          The SMART log is retrieved using the <strong className="text-text-primary">
          Get Log Page</strong> command (opcode 0x02) with Log ID 0x02. It returns
          512 bytes of health data. The nvme-cli shortcut is:
        </p>

        <NvmeCliBlock command="nvme smart-log /dev/nvme0" />

        <div className="mt-6 bg-story-card rounded-2xl card-shadow overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-story-border bg-story-surface flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-nvme-green animate-pulse" />
            <span className="text-text-muted text-xs font-mono">SMART Dashboard — hover each field for explanation</span>
          </div>
          <div className="p-4 space-y-1.5">
            {SMART_FIELDS.map((field, i) => (
              <div
                key={field.name}
                className={`group relative flex justify-between items-center px-3 py-2.5 rounded-lg text-xs transition-all cursor-help ${
                  i < animatedIdx ? "opacity-100" : "opacity-0"
                } ${
                  field.status === "warn"
                    ? "bg-nvme-amber/5 border border-nvme-amber/20"
                    : "bg-story-surface hover:bg-story-border/30"
                }`}
                style={{ transitionDuration: "300ms" }}
              >
                <span className="text-text-secondary">{field.name}</span>
                <span
                  className={`font-mono ${
                    field.status === "warn"
                      ? "text-nvme-amber"
                      : "text-text-primary"
                  }`}
                >
                  {field.value}
                </span>
                {/* Tooltip */}
                <div className="absolute left-0 right-0 -bottom-1 translate-y-full z-10 hidden group-hover:block">
                  <div className="bg-story-dark text-white/90 text-[11px] rounded-lg px-3 py-2 shadow-lg leading-relaxed">
                    {field.explain}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-2">
            The most important SMART fields to watch
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-nvme-red/5 border border-nvme-red/20 rounded-lg p-3">
              <div className="text-nvme-red font-mono font-bold mb-1">Media Errors</div>
              <p className="text-text-muted">Any value above 0 means unrecoverable data corruption. Replace the drive if this keeps growing.</p>
            </div>
            <div className="bg-nvme-amber/5 border border-nvme-amber/20 rounded-lg p-3">
              <div className="text-nvme-amber font-mono font-bold mb-1">Percentage Used</div>
              <p className="text-text-muted">Approaching 100% means the drive is nearing its rated endurance. Plan replacement.</p>
            </div>
            <div className="bg-nvme-green/5 border border-nvme-green/20 rounded-lg p-3">
              <div className="text-nvme-green font-mono font-bold mb-1">Available Spare</div>
              <p className="text-text-muted">Below the threshold means the drive is running low on replacement blocks. Urgently back up.</p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
