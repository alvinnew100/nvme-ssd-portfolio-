"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import TerminalBlock from "@/components/story/TerminalBlock";

export default function Identify() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Identify &mdash; The First Command
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Before anything else, the host asks: &ldquo;Who are you?&rdquo; The{" "}
          <strong className="text-text-primary">Identify</strong> command (opcode{" "}
          <code className="text-text-code">0x06</code>) returns a 4096-byte data
          structure. With CNS=1, it returns the Controller Identify structure:
          model name, serial number, firmware revision, supported features,
          queue limits, and more.
        </p>

        <NvmeCliBlock command="nvme id-ctrl /dev/nvme0" />

        <div className="mt-4">
          <TerminalBlock
            title="output"
            lines={[
              "NVME Identify Controller:",
              "vid       : 0x144d",
              "ssvid     : 0x144d",
              'sn        : S6PENL0T123456',
              'mn        : Samsung SSD 990 PRO 2TB',
              'fr        : 4B2QJXD7',
              "rab       : 6",
              "ieee      : 002538",
              "cmic      : 0x6",
              "mdts      : 9",
              "cntlid    : 0x5",
              "ver       : 0x20000",
              "oacs      : 0x17",
              "sqes      : 0x66",
              "cqes      : 0x44",
              "nn        : 1",
              "oncs      : 0x5f",
            ]}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <code className="text-text-code text-xs">CNS=0</code>
            <div className="text-text-primary font-semibold mt-1">Identify Namespace</div>
            <p className="text-text-muted text-xs mt-1">
              Returns namespace size, capacity, LBA format, and protection info.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <code className="text-text-code text-xs">CNS=1</code>
            <div className="text-text-primary font-semibold mt-1">Identify Controller</div>
            <p className="text-text-muted text-xs mt-1">
              Returns model, serial, firmware, capabilities, queue limits.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
