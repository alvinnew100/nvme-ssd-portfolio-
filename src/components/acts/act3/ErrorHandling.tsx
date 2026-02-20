"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const STATUS_CODES = [
  { code: "0x0000", meaning: "Successful Completion", type: "Generic" },
  { code: "0x0002", meaning: "Invalid Field in Command", type: "Generic" },
  { code: "0x0004", meaning: "Invalid Namespace or Format", type: "Generic" },
  { code: "0x000A", meaning: "Namespace Not Ready", type: "Generic" },
  { code: "0x0080", meaning: "LBA Out of Range", type: "Generic" },
  { code: "0x0081", meaning: "Capacity Exceeded", type: "Generic" },
  { code: "0x0180", meaning: "Write Fault", type: "Media" },
  { code: "0x0181", meaning: "Unrecovered Read Error", type: "Media" },
  { code: "0x0182", meaning: "End-to-End Guard Check Error", type: "Media" },
  { code: "0x0286", meaning: "Zone Is Read Only", type: "Command Specific" },
];

export default function ErrorHandling() {
  return (
    <SectionWrapper className="py-20 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Error Handling
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Every command gets a 16-byte Completion Queue Entry (CQE). The status
          field tells you what happened. It&apos;s split into: Status Code Type (SCT,
          3 bits), Status Code (SC, 8 bits), and the{" "}
          <strong className="text-text-primary">DNR</strong> (Do Not Retry) bit.
          If DNR=1, the error is permanent &mdash; retrying won&apos;t help.
        </p>

        <div className="bg-story-panel rounded-xl border border-story-border p-6 mb-6">
          <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
            CQE Status Field (bits 17:1 of DW3)
          </div>
          <div className="flex items-center gap-2 font-mono text-xs mb-6">
            <div className="h-8 flex-1 bg-nvme-red/10 border border-nvme-red/30 rounded flex items-center justify-center text-nvme-red">
              DNR (1 bit)
            </div>
            <div className="h-8 flex-1 bg-nvme-amber/10 border border-nvme-amber/30 rounded flex items-center justify-center text-nvme-amber">
              More (1 bit)
            </div>
            <div className="h-8 flex-[2] bg-nvme-violet/10 border border-nvme-violet/30 rounded flex items-center justify-center text-nvme-violet">
              SCT (3 bits)
            </div>
            <div className="h-8 flex-[4] bg-nvme-blue/10 border border-nvme-blue/30 rounded flex items-center justify-center text-nvme-blue">
              SC (8 bits)
            </div>
            <div className="h-8 flex-1 bg-story-bg border border-story-border rounded flex items-center justify-center text-text-muted">
              P
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-story-border">
                  <th className="text-left p-2 text-text-code font-mono">Code</th>
                  <th className="text-left p-2 text-text-muted">Type</th>
                  <th className="text-left p-2 text-text-muted">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {STATUS_CODES.map((s) => (
                  <tr key={s.code} className="border-b border-story-border/30">
                    <td className="p-2 text-text-code font-mono">{s.code}</td>
                    <td className="p-2 text-text-muted">{s.type}</td>
                    <td className="p-2 text-text-secondary">{s.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <InfoCard variant="warning" title="Async Event Requests (AER)">
          The controller can also send unsolicited notifications via AER. The host
          pre-posts AER commands, and the controller completes them when something
          important happens: SMART threshold crossed, namespace attribute changed,
          firmware activation starting, etc.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
