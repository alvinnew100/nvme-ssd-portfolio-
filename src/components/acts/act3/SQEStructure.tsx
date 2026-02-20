"use client";

import dynamic from "next/dynamic";
import SectionWrapper from "@/components/story/SectionWrapper";
import { getAdminCommands } from "@/lib/nvme/decoder";

const SQEntryVisualizer = dynamic(
  () => import("@/components/commands/SQEntryVisualizer"),
  { ssr: false }
);

export default function SQEStructure() {
  const identifyCmd = getAdminCommands().find((c) => c.id === "admin-identify");

  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The 64-Byte Submission Queue Entry
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Every NVMe command is exactly 64 bytes &mdash; 16 dwords of 4 bytes each.
          The first 10 dwords (CDW0-CDW9) have a fixed format: opcode, command ID,
          namespace ID, metadata pointer, and PRP/SGL pointers. The last 6 dwords
          (CDW10-CDW15) are command-specific &mdash; they carry the actual parameters.
        </p>

        <div className="bg-story-panel rounded-xl border border-story-border p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-6">
            <div>
              <div className="text-text-muted mb-1">CDW0 (bytes 0-3)</div>
              <div className="text-text-secondary">
                <span className="text-nvme-green">Opcode [7:0]</span> | Fuse [9:8] | <span className="text-nvme-blue">CID [31:16]</span>
              </div>
            </div>
            <div>
              <div className="text-text-muted mb-1">CDW1 (bytes 4-7)</div>
              <div className="text-text-secondary">
                <span className="text-nvme-violet">NSID</span> &mdash; Namespace Identifier
              </div>
            </div>
            <div>
              <div className="text-text-muted mb-1">CDW2-3 (bytes 8-15)</div>
              <div className="text-text-secondary">Reserved</div>
            </div>
            <div>
              <div className="text-text-muted mb-1">CDW4-5 (bytes 16-23)</div>
              <div className="text-text-secondary">Metadata Pointer</div>
            </div>
            <div>
              <div className="text-text-muted mb-1">CDW6-9 (bytes 24-39)</div>
              <div className="text-text-secondary">
                PRP1 / SGL (data buffer addresses)
              </div>
            </div>
            <div>
              <div className="text-text-muted mb-1">CDW10-15 (bytes 40-63)</div>
              <div className="text-nvme-green">Command-specific fields</div>
            </div>
          </div>

          {identifyCmd && (
            <div>
              <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
                Example: Identify Command Layout
              </div>
              <SQEntryVisualizer command={identifyCmd} />
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
