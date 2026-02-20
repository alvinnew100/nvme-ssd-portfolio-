"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

const VENDOR_EXAMPLES = [
  {
    vendor: "Generic",
    desc: "Send a vendor-specific admin command with opcode 0xC0",
    command:
      "nvme admin-passthru /dev/nvme0 --opcode=0xC0 --cdw10=0x00000001 --data-len=4096 -r",
  },
  {
    vendor: "Samsung",
    desc: "Vendor health check (example opcode, may vary by model/FW)",
    command:
      "nvme admin-passthru /dev/nvme0 --opcode=0xC0 --cdw10=0x00000002 --data-len=512 -r",
  },
  {
    vendor: "Intel",
    desc: "Internal latency statistics (example, varies by model)",
    command:
      "nvme admin-passthru /dev/nvme0 --opcode=0xC6 --cdw10=0x00000001 --data-len=4096 -r",
  },
  {
    vendor: "WD / SanDisk",
    desc: "Extended SMART data (example, varies by model)",
    command:
      "nvme admin-passthru /dev/nvme0 --opcode=0xCA --cdw10=0x00000001 --data-len=512 -r",
  },
];

export default function Passthru() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Vendor Passthrough Commands
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          The NVMe spec reserves admin opcodes{" "}
          <code className="text-text-code">0xC0-0xFF</code> and I/O opcodes{" "}
          <code className="text-text-code">0x80-0xFF</code> for vendor-specific
          commands. These are used for proprietary diagnostics, extended health
          data, and internal SSD management that isn&apos;t part of the standard.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The <code className="text-text-code">nvme admin-passthru</code> and{" "}
          <code className="text-text-code">nvme io-passthru</code> commands let
          you send arbitrary opcodes with raw CDW values. This is how SSD
          engineers and test teams interact with vendor-specific firmware features.
        </p>

        <div className="space-y-4 mb-6">
          {VENDOR_EXAMPLES.map((ex) => (
            <div
              key={ex.vendor}
              className="bg-white rounded-2xl p-6 card-shadow"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-nvme-blue font-mono font-bold text-sm">
                  {ex.vendor}
                </span>
              </div>
              <p className="text-text-muted text-xs mb-3">{ex.desc}</p>
              <NvmeCliBlock command={ex.command} />
            </div>
          ))}
        </div>

        <InfoCard variant="warning" title="Vendor opcodes are proprietary">
          The opcodes shown above are illustrative examples. Actual vendor
          opcodes, CDW values, and data formats are proprietary and vary by
          vendor, model, and firmware version. Always consult the vendor&apos;s
          internal documentation. Sending incorrect passthru commands can brick
          a drive.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
