"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";

const SMART_FIELDS = [
  { name: "Critical Warning", value: "0x00", status: "ok" as const, explain: "A bitmask of critical warnings. 0 means nothing is wrong. If any bit is set, it means: spare capacity low (bit 0), temperature exceeded (bit 1), reliability degraded (bit 2), read-only mode (bit 3), or backup device failed (bit 4)." },
  { name: "Temperature", value: "315 K (42°C)", status: "ok" as const, explain: "Reported in Kelvin. 315K = 42°C — comfortable operating range. SSDs start throttling at ~70°C (reducing speed to cool down) and may shut down at ~85°C to prevent permanent damage to NAND cells." },
  { name: "Available Spare", value: "100%", status: "ok" as const, explain: "Percentage of spare NAND blocks remaining. SSDs reserve extra blocks (over-provisioning) to replace worn-out ones. At 100%, all spares are available. As blocks wear out and get replaced, this value drops." },
  { name: "Available Spare Threshold", value: "Varies by drive", status: "ok" as const, explain: "When Available Spare drops below this value, the drive triggers a Critical Warning (bit 0). This threshold is set by the manufacturer — it varies by drive model. Check your specific drive's value with nvme smart-log." },
  { name: "Percentage Used", value: "3%", status: "ok" as const, explain: "How much of the drive's rated endurance (TBW) has been consumed. Based on actual NAND writes vs the manufacturer's rating. 100% = rated lifetime reached, but the drive often keeps working well beyond this." },
  { name: "Data Units Read", value: "12,847,231", status: "ok" as const, explain: "Total data read from the drive. Each unit = 1000 × 512 bytes = 500KB. So 12.8M units ≈ 6.1 TB total reads over the drive's lifetime." },
  { name: "Data Units Written", value: "36,291,082", status: "ok" as const, explain: "Total data the host has written. Compare this with the drive's internal NAND writes (vendor-specific SMART) to calculate the Write Amplification Factor (WAF) we discussed earlier." },
  { name: "Host Read Commands", value: "1,294,821,037", status: "ok" as const, explain: "Total NVMe Read commands received. If this is high relative to Data Units Read, it means the workload is dominated by small reads (many commands, little data each)." },
  { name: "Host Write Commands", value: "982,103,442", status: "ok" as const, explain: "Total NVMe Write commands. Compare with read commands to understand your workload profile — is it read-heavy, write-heavy, or mixed?" },
  { name: "Power Cycles", value: "847", status: "ok" as const, explain: "How many times the drive has been powered on and off. Each power cycle stresses the controller slightly. Server drives may show very few cycles (always on), while laptop drives show thousands." },
  { name: "Power On Hours", value: "2,847", status: "ok" as const, explain: "Total hours the drive has been powered on (~119 days). Server drives running 24/7 may show 40,000+ hours. This doesn't directly indicate wear — Percentage Used is a better wear indicator." },
  { name: "Unsafe Shutdowns", value: "12", status: "warn" as const, explain: "Power was lost without a graceful shutdown (no Flush command sent). The FTL mapping table in DRAM may have been dirty — the SSD had to rebuild it from NAND on next boot, which can take seconds. Frequent unsafe shutdowns increase the risk of data loss." },
  { name: "Media Errors", value: "0", status: "ok" as const, explain: "Uncorrectable ECC errors — data that even the ECC engine couldn't recover. Any value above 0 means some data was permanently lost. This is the single most serious SMART indicator. If it's growing, replace the drive immediately." },
  { name: "Error Log Entries", value: "3", status: "warn" as const, explain: "Number of NVMe commands that returned error status codes. Not necessarily critical — could be benign errors like 'namespace not ready' during boot. Check the Error Information Log (nvme error-log) for details on what failed and why." },
];

export default function SMART() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggleField = (i: number) => {
    setExpandedIdx(expandedIdx === i ? null : i);
  };

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
            <span className="text-text-muted text-xs font-mono">SMART Dashboard — click any field to see what it means</span>
          </div>
          <div className="p-4 space-y-1">
            {SMART_FIELDS.map((field, i) => {
              const isExpanded = expandedIdx === i;
              return (
                <div key={field.name}>
                  <button
                    onClick={() => toggleField(i)}
                    className={`w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-xs transition-all text-left ${
                      field.status === "warn"
                        ? isExpanded
                          ? "bg-nvme-amber/10 border border-nvme-amber/30"
                          : "bg-nvme-amber/5 border border-nvme-amber/20 hover:bg-nvme-amber/10"
                        : isExpanded
                        ? "bg-nvme-blue/5 border border-nvme-blue/20"
                        : "bg-story-surface hover:bg-story-border/30 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        className="flex-shrink-0 text-text-muted"
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      </motion.svg>
                      <span className="text-text-secondary">{field.name}</span>
                    </div>
                    <span
                      className={`font-mono ${
                        field.status === "warn"
                          ? "text-nvme-amber"
                          : "text-text-primary"
                      }`}
                    >
                      {field.value}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={`mx-3 mb-1 px-3 py-2.5 rounded-b-lg text-[11px] leading-relaxed ${
                          field.status === "warn"
                            ? "bg-nvme-amber/5 text-text-secondary border-l-2 border-nvme-amber/40"
                            : "bg-story-surface text-text-secondary border-l-2 border-nvme-blue/40"
                        }`}>
                          {field.explain}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-2">
            The most important SMART fields to watch
          </div>
          <p className="text-text-secondary text-xs mb-3 leading-relaxed">
            <em className="text-text-primary">Out of all 14 fields, which ones matter
            most?</em> Three fields should trigger immediate action if they change:
          </p>
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
