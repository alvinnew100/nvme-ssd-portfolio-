"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";

export default function Doorbells() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Doorbell Registers
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          After the host writes a command to the SQ, how does the controller
          know? The host writes the new SQ tail pointer to a{" "}
          <strong className="text-text-primary">doorbell register</strong>{" "}
          at offset <code className="text-text-code">0x1000</code> + (2 * QID + 0) * stride.
          Similarly, after consuming a CQ entry, the host writes the new CQ
          head to the CQ doorbell at offset <code className="text-text-code">0x1000</code> + (2 * QID + 1) * stride.
        </p>

        <div className="bg-story-panel rounded-xl border border-story-border p-6 mb-6">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-4">
              <span className="text-text-code w-24 text-right">0x1000</span>
              <div className="flex-1 h-8 bg-nvme-green/10 border border-nvme-green/30 rounded flex items-center px-3">
                <span className="text-nvme-green">Admin SQ Tail Doorbell (QID 0)</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-code w-24 text-right">0x1004</span>
              <div className="flex-1 h-8 bg-nvme-blue/10 border border-nvme-blue/30 rounded flex items-center px-3">
                <span className="text-nvme-blue">Admin CQ Head Doorbell (QID 0)</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-code w-24 text-right">0x1008</span>
              <div className="flex-1 h-8 bg-nvme-green/10 border border-nvme-green/30 rounded flex items-center px-3">
                <span className="text-nvme-green">I/O SQ 1 Tail Doorbell</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-code w-24 text-right">0x100C</span>
              <div className="flex-1 h-8 bg-nvme-blue/10 border border-nvme-blue/30 rounded flex items-center px-3">
                <span className="text-nvme-blue">I/O CQ 1 Head Doorbell</span>
              </div>
            </div>
            <div className="text-text-muted text-center">...</div>
          </div>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Each doorbell write is a single PCIe memory write TLP &mdash; very fast.
          Some controllers support <strong className="text-text-primary">Shadow Doorbells</strong>{" "}
          (Doorbell Buffer Config, opcode <code className="text-text-code">0x7C</code>),
          where the host writes doorbells to regular memory instead of MMIO,
          and the controller polls them. This can reduce latency in
          virtualized environments.
        </p>

        <NvmeCliBlock
          command="nvme id-ctrl /dev/nvme0 | grep -i oacs"
          note="OACS bit 8 indicates Doorbell Buffer Config support"
        />
      </div>
    </SectionWrapper>
  );
}
