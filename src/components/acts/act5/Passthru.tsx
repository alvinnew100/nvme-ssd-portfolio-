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
          Vendor Passthrough &mdash; The Secret Menu
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We&apos;ve covered NVMe&apos;s <em>standard</em> commands — the ones defined
          in the NVMe specification that every drive must support. But here&apos;s
          something interesting: <em className="text-text-primary">every SSD manufacturer
          also has their own secret commands.</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why would vendors need custom commands?</em>{" "}
          Because the NVMe spec defines <em>what</em> the drive does (read, write, erase)
          but not <em>how</em> the internal firmware works. Samsung&apos;s garbage
          collection is different from Intel&apos;s. WD&apos;s wear leveling algorithm
          is different from Micron&apos;s. Each vendor has internal diagnostics, debug
          logs, and tuning parameters that are specific to their firmware.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The NVMe spec accounts for this by <strong className="text-text-primary">
          reserving opcode ranges</strong> for vendor use:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            Admin opcodes <code className="text-text-code">0xC0-0xFF</code> — for
            vendor-specific admin commands
          </li>
          <li>
            I/O opcodes <code className="text-text-code">0x80-0xFF</code> — for
            vendor-specific I/O commands
          </li>
        </ul>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          <em className="text-text-primary">How do you send these?</em> With the
          {" "}<code className="text-text-code">nvme admin-passthru</code> and
          {" "}<code className="text-text-code">nvme io-passthru</code> commands.
          &ldquo;Passthru&rdquo; means &ldquo;pass this raw command through to the
          drive without the driver trying to interpret it.&rdquo; You specify the
          opcode and CDW values directly — the same dword fields we learned about
          in the SQE structure from Act 3.
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Passthru Flags — Building a Raw Command
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            Since vendor commands aren&apos;t in the spec, <code className="text-text-code">nvme-cli</code> can&apos;t
            know what fields they need. Instead, you provide everything manually:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { flag: "--opcode=0xNN", desc: "The vendor-specific opcode (0xC0-0xFF for admin)" },
              { flag: "--cdw10=0x...", desc: "Command Dword 10 — vendor-defined parameter" },
              { flag: "--cdw11=0x...", desc: "Command Dword 11 — vendor-defined parameter" },
              { flag: "--cdw12=0x...", desc: "Command Dword 12 — vendor-defined parameter" },
              { flag: "--data-len=N", desc: "Size of the data buffer to allocate (bytes)" },
              { flag: "-r / --read", desc: "Read data from the drive (vs -w for write)" },
            ].map((f) => (
              <div key={f.flag} className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono text-xs">{f.flag}</code>
                <span className="text-text-muted"> — {f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Vendor-Specific Examples
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed max-w-3xl">
            These are <em>illustrative examples</em> of the kinds of vendor commands
            that exist. SSD test engineers and firmware developers use these daily:
          </p>
          <div className="space-y-4">
            {VENDOR_EXAMPLES.map((ex) => (
              <div
                key={ex.vendor}
                className="bg-story-card rounded-2xl p-6 card-shadow"
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
        </div>

        <InfoCard variant="warning" title="Vendor opcodes are proprietary — handle with care">
          The opcodes above are illustrative examples. <em>Actual</em> vendor opcodes,
          CDW values, and data formats are proprietary and vary by vendor, model, and
          firmware version. They&apos;re typically documented in internal engineering
          specs, not public documentation. <strong>Sending incorrect passthru commands
          can brick a drive</strong> — always know exactly what you&apos;re sending
          before you send it.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
