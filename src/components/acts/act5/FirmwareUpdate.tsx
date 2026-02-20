"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";

export default function FirmwareUpdate() {
  return (
    <SectionWrapper className="py-24 px-4">
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

        <div className="space-y-4 mb-6">
          {[
            { step: 1, title: "Check current firmware", cmd: "nvme fw-log /dev/nvme0" },
            { step: 2, title: "Download the image", cmd: "nvme fw-download /dev/nvme0 --fw=firmware.bin" },
            { step: 3, title: "Commit to slot & activate", cmd: "nvme fw-commit /dev/nvme0 --slot=1 --action=1", note: "Action 1 = download to slot, activate on next reset" },
            { step: 4, title: "Reset controller", cmd: "nvme reset /dev/nvme0" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-nvme-blue/10 text-nvme-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                {item.step}
              </div>
              <div className="flex-1">
                <div className="text-text-primary text-sm font-semibold mb-2">{item.title}</div>
                <NvmeCliBlock command={item.cmd} note={item.note} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
