"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

const REGISTERS = [
  { offset: "0x00", name: "CAP", size: "8B", desc: "Controller Capabilities — max queue size, doorbell stride, timeout" },
  { offset: "0x08", name: "VS", size: "4B", desc: "Version — NVMe spec version (e.g., 1.4, 2.0)" },
  { offset: "0x0C", name: "INTMS", size: "4B", desc: "Interrupt Mask Set" },
  { offset: "0x10", name: "INTMC", size: "4B", desc: "Interrupt Mask Clear" },
  { offset: "0x14", name: "CC", size: "4B", desc: "Controller Configuration — enable, I/O command set, page size" },
  { offset: "0x1C", name: "CSTS", size: "4B", desc: "Controller Status — ready, fatal, shutdown status" },
  { offset: "0x24", name: "AQA", size: "4B", desc: "Admin Queue Attributes — admin SQ/CQ sizes" },
  { offset: "0x28", name: "ASQ", size: "8B", desc: "Admin Submission Queue Base Address" },
  { offset: "0x30", name: "ACQ", size: "8B", desc: "Admin Completion Queue Base Address" },
  { offset: "0x1000+", name: "Doorbells", size: "4B each", desc: "Submission and Completion Queue doorbells start here" },
];

export default function BAR0() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          BAR0 Registers
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          When the system boots, the BIOS/UEFI assigns a PCIe Base Address
          Register (BAR) to the NVMe device. <strong className="text-text-primary">BAR0</strong> maps
          the controller&apos;s registers into the host&apos;s physical memory
          space. The NVMe driver accesses these via MMIO (Memory-Mapped I/O)
          &mdash; just regular memory reads and writes.
        </p>

        <div className="bg-story-panel rounded-xl border border-story-border overflow-hidden">
          <div className="px-4 py-3 border-b border-story-border bg-story-surface">
            <span className="text-text-muted text-xs font-mono">
              NVMe Controller Register Map (BAR0)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-story-border">
                  <th className="text-left p-3 text-text-code font-mono text-xs">
                    Offset
                  </th>
                  <th className="text-left p-3 text-text-primary font-mono text-xs">
                    Register
                  </th>
                  <th className="text-left p-3 text-text-muted font-mono text-xs">
                    Size
                  </th>
                  <th className="text-left p-3 text-text-muted text-xs">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {REGISTERS.map((reg) => (
                  <tr
                    key={reg.offset}
                    className="border-b border-story-border/30 hover:bg-story-surface/50"
                  >
                    <td className="p-3 text-text-code font-mono text-xs">
                      {reg.offset}
                    </td>
                    <td className="p-3 text-nvme-green font-mono font-bold text-xs">
                      {reg.name}
                    </td>
                    <td className="p-3 text-text-muted font-mono text-xs">
                      {reg.size}
                    </td>
                    <td className="p-3 text-text-secondary text-xs">
                      {reg.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
