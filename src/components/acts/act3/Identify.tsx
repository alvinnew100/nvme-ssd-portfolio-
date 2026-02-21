"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import TerminalBlock from "@/components/story/TerminalBlock";
import InfoCard from "@/components/story/InfoCard";

export default function Identify() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The First Question &mdash; &ldquo;Who Are You?&rdquo;
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          During boot, we saw that the NVMe driver sends an Identify command as its
          very first question. <em className="text-text-primary">But why is this
          necessary?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think about meeting someone new. Before you can work together, you need
          to know: What&apos;s your name? What can you do? What are your limits?
          The Identify command (opcode{" "}
          <code className="text-text-code">0x06</code>) asks exactly these questions.
          It returns a 4,096-byte data structure — essentially the drive&apos;s
          &ldquo;resume.&rdquo;
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">What does the driver learn?</em> The
          drive&apos;s model name, serial number, firmware version, maximum queue
          size, supported features, and much more. Without this information, the
          driver can&apos;t properly configure the drive.
        </p>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          You can send this command yourself using{" "}
          <code className="text-text-code">nvme-cli</code>. The{" "}
          <code className="text-text-code">id-ctrl</code> subcommand is a shortcut
          for &ldquo;Identify Controller&rdquo;:
        </p>

        <NvmeCliBlock command="nvme id-ctrl /dev/nvme0" />

        <div className="mt-4">
          <TerminalBlock
            title={"output — the drive's \"resume\""}
            lines={[
              "NVME Identify Controller:",
              "vid       : 0x144d          ← Vendor ID (Samsung = 0x144d)",
              "sn        : S6PENL0T123456  ← Unique serial number",
              "mn        : Samsung SSD 990 PRO 2TB  ← Model name",
              "fr        : 4B2QJXD7        ← Firmware version",
              "mdts      : 9               ← Max data transfer = 2^9 pages = 2MB",
              "sqes      : 0x66            ← SQ entry size: min=64B, max=64B",
              "cqes      : 0x44            ← CQ entry size: min=16B, max=16B",
              "nn        : 1               ← Number of namespaces",
              "oncs      : 0x5f            ← Supported optional commands",
            ]}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <code className="text-text-code text-xs">CNS=1</code>
            <div className="text-text-primary font-semibold mt-1">Identify Controller</div>
            <p className="text-text-muted text-xs mt-1">
              Returns the drive&apos;s identity: model, serial, firmware, capabilities,
              queue limits. This is used during boot to configure the driver.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <code className="text-text-code text-xs">CNS=0</code>
            <div className="text-text-primary font-semibold mt-1">Identify Namespace</div>
            <p className="text-text-muted text-xs mt-1">
              Returns info about a specific namespace: total size, capacity, LBA
              format (512B or 4KB blocks), and protection features.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <InfoCard variant="tip" title="Why does the driver need to know queue limits?">
            The driver wants to create as many I/O queues as possible (ideally one
            per CPU core). But the drive has a limit — maybe it supports 128 queues
            maximum. The Identify data tells the driver this limit so it doesn&apos;t
            try to create more queues than the drive can handle.
          </InfoCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
