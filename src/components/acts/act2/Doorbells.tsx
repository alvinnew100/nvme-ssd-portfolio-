"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

export default function Doorbells() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Doorbell Registers
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          After the host writes a command to the SQ, how does the controller
          know? The host writes the new SQ tail pointer to a{" "}
          <strong className="text-text-primary">doorbell register</strong>{" "}
          at offset <code>0x1000</code> + (2 &times; QID + 0) &times; stride.
          Similarly, after consuming a CQ entry, the host writes the new CQ
          head to the CQ doorbell at offset <code>0x1000</code> + (2 &times; QID + 1) &times; stride.
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="space-y-2 font-mono text-xs">
            {[
              { offset: "0x1000", label: "Admin SQ Tail Doorbell", type: "sq" as const, qid: 0 },
              { offset: "0x1004", label: "Admin CQ Head Doorbell", type: "cq" as const, qid: 0 },
              { offset: "0x1008", label: "I/O SQ 1 Tail Doorbell", type: "sq" as const, qid: 1 },
              { offset: "0x100C", label: "I/O CQ 1 Head Doorbell", type: "cq" as const, qid: 1 },
            ].map((db) => (
              <div key={db.offset} className="flex items-center gap-4">
                <span className="text-nvme-blue w-16 text-right font-bold">{db.offset}</span>
                <div
                  className={`flex-1 h-10 rounded-lg flex items-center px-4 ${
                    db.type === "sq"
                      ? "bg-nvme-blue/5 border border-nvme-blue/20"
                      : "bg-nvme-green/5 border border-nvme-green/20"
                  }`}
                >
                  <span className={db.type === "sq" ? "text-nvme-blue" : "text-nvme-green"}>
                    {db.label}
                  </span>
                </div>
              </div>
            ))}
            <div className="text-text-muted text-center py-1">
              ... one SQ + CQ doorbell pair per queue ...
            </div>
          </div>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Each doorbell write is a single PCIe memory write TLP &mdash; very fast.
          Some controllers support <strong className="text-text-primary">Shadow Doorbells</strong>,
          where the host writes doorbells to regular memory instead of MMIO,
          and the controller polls them. This reduces latency in
          virtualized environments by avoiding costly MMIO traps.
        </p>

        <InfoCard variant="tip" title="One write to start many commands">
          The host can queue multiple commands into the SQ and then ring the
          doorbell once. The controller reads the new tail pointer and processes
          all pending entries. This batching is one reason NVMe achieves
          millions of IOPS.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
