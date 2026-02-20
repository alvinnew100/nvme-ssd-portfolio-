"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";

export default function FirmwareUpdate() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Firmware Updates
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          SSD firmware can be updated in the field using two admin commands:
          <strong className="text-text-primary"> Firmware Image Download</strong>{" "}
          (opcode <code className="text-text-code">0x11</code>) transfers the image
          in chunks, and <strong className="text-text-primary">Firmware Commit</strong>{" "}
          (opcode <code className="text-text-code">0x10</code>) activates it on a
          specific slot.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-nvme-green/20 text-nvme-green flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <div className="text-text-primary text-sm font-semibold">Check current firmware</div>
              <NvmeCliBlock command="nvme fw-log /dev/nvme0" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-nvme-green/20 text-nvme-green flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <div className="text-text-primary text-sm font-semibold">Download the image</div>
              <NvmeCliBlock command="nvme fw-download /dev/nvme0 --fw=firmware.bin" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-nvme-green/20 text-nvme-green flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <div className="text-text-primary text-sm font-semibold">Commit to slot &amp; activate</div>
              <NvmeCliBlock command="nvme fw-commit /dev/nvme0 --slot=1 --action=1" note="Action 1 = download to slot, activate on next reset" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-nvme-green/20 text-nvme-green flex items-center justify-center text-xs font-bold">4</div>
            <div>
              <div className="text-text-primary text-sm font-semibold">Reset controller</div>
              <NvmeCliBlock command="nvme reset /dev/nvme0" />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
