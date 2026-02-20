"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";

const SMART_FIELDS = [
  { name: "Critical Warning", value: "0x00", status: "ok" as const },
  { name: "Temperature", value: "315 K (42 C)", status: "ok" as const },
  { name: "Available Spare", value: "100%", status: "ok" as const },
  { name: "Available Spare Threshold", value: "10%", status: "ok" as const },
  { name: "Percentage Used", value: "3%", status: "ok" as const },
  { name: "Data Units Read", value: "12,847,231", status: "ok" as const },
  { name: "Data Units Written", value: "36,291,082", status: "ok" as const },
  { name: "Host Read Commands", value: "1,294,821,037", status: "ok" as const },
  { name: "Host Write Commands", value: "982,103,442", status: "ok" as const },
  { name: "Controller Busy Time", value: "1,842 minutes", status: "ok" as const },
  { name: "Power Cycles", value: "847", status: "ok" as const },
  { name: "Power On Hours", value: "2,847", status: "ok" as const },
  { name: "Unsafe Shutdowns", value: "12", status: "warn" as const },
  { name: "Media Errors", value: "0", status: "ok" as const },
  { name: "Error Log Entries", value: "3", status: "warn" as const },
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
          SMART Health Monitoring
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          The <strong className="text-text-primary">SMART / Health Information</strong> log
          (Log ID <code className="text-text-code">0x02</code>) is retrieved via{" "}
          <code className="text-text-code">Get Log Page</code>. It returns 512
          bytes of critical health data: temperature, wear level, error counts,
          power-on hours, and data throughput statistics.
        </p>

        <NvmeCliBlock command="nvme smart-log /dev/nvme0" />

        <div className="mt-6 bg-story-card rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 py-3 border-b border-story-border bg-story-surface flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-nvme-green animate-pulse" />
            <span className="text-text-muted text-xs font-mono">SMART Dashboard</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SMART_FIELDS.map((field, i) => (
              <div
                key={field.name}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs transition-opacity duration-300 ${
                  i < animatedIdx ? "opacity-100" : "opacity-0"
                } ${
                  field.status === "warn"
                    ? "bg-nvme-amber/5 border border-nvme-amber/20"
                    : "bg-story-surface"
                }`}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
