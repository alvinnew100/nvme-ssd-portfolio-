"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

export default function PCIe() {
  return (
    <SectionWrapper className="py-20 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          PCIe Transport
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          NVMe rides on PCIe (Peripheral Component Interconnect Express). PCIe
          is a point-to-point serial bus organized into{" "}
          <strong className="text-text-primary">lanes</strong>. Each lane is a
          pair of differential signal wires (one TX, one RX). An NVMe SSD
          typically uses 4 lanes (x4).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            {
              gen: "Gen 3",
              rate: "~1 GB/s/lane",
              total: "~3.5 GB/s (x4)",
              year: "2010",
            },
            {
              gen: "Gen 4",
              rate: "~2 GB/s/lane",
              total: "~7 GB/s (x4)",
              year: "2017",
            },
            {
              gen: "Gen 5",
              rate: "~4 GB/s/lane",
              total: "~14 GB/s (x4)",
              year: "2019",
            },
            {
              gen: "Gen 6",
              rate: "~8 GB/s/lane",
              total: "~28 GB/s (x4)",
              year: "2024",
            },
          ].map((g) => (
            <div
              key={g.gen}
              className="bg-story-panel rounded-lg border border-story-border p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-nvme-blue font-bold">{g.gen}</span>
                <span className="text-text-muted text-xs font-mono">
                  {g.year}
                </span>
              </div>
              <div className="text-text-primary font-mono text-sm">
                {g.total}
              </div>
              <div className="text-text-muted text-xs">{g.rate}</div>
            </div>
          ))}
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Data moves in <strong className="text-text-primary">Transaction Layer Packets (TLPs)</strong>.
          When the host writes an NVMe command to the SQ, the NVMe driver uses
          a PCIe memory write TLP. When the controller DMAs data back, it uses
          another memory write TLP targeting host memory. These are all
          memory-mapped I/O operations &mdash; no special I/O instructions needed.
        </p>

        <InfoCard variant="info" title="TLP Structure">
          A TLP has a header (12-16 bytes), an optional data payload (up to 4 KB
          per TLP), and an ECRC. NVMe&apos;s efficiency comes from batching: one
          doorbell write (a single TLP) can trigger the controller to fetch
          dozens of queued commands.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
