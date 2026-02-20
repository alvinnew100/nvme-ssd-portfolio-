"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

export default function LBA() {
  const [lbaSize, setLbaSize] = useState(512);
  const [lba, setLba] = useState(0);

  const byteOffset = lba * lbaSize;
  const byteOffsetHex = byteOffset.toString(16).toUpperCase().padStart(8, "0");
  const lbaHex = lba.toString(16).toUpperCase().padStart(8, "0");

  // Example: 1TB drive
  const driveSize = 1_000_000_000_000;
  const totalLBAs = Math.floor(driveSize / lbaSize);

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Logical Block Addressing (LBA)
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The host doesn&apos;t talk to individual NAND pages. Instead, it
          addresses storage through <strong className="text-text-primary">Logical Block Addresses (LBAs)</strong>.
          Each LBA is a fixed-size block (typically 512 bytes or 4096 bytes).
          The SSD&apos;s FTL translates LBAs to physical NAND locations.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          When you issue <code className="text-text-code">nvme read --start-block=100 --block-count=7</code>,
          you&apos;re asking for LBAs 100 through 107. The SSD figures out
          which NAND pages hold that data.
        </p>

        {/* Interactive LBA calculator */}
        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            LBA Calculator
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* LBA Size selector */}
            <div>
              <div className="text-text-secondary text-sm font-medium mb-3">Block Size</div>
              <div className="flex gap-2">
                {[512, 4096].map((size) => (
                  <button
                    key={size}
                    onClick={() => setLbaSize(size)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                      size === lbaSize
                        ? "bg-nvme-blue text-white shadow-md"
                        : "bg-story-surface text-text-secondary hover:bg-story-border"
                    }`}
                  >
                    {size}B
                  </button>
                ))}
              </div>
            </div>

            {/* LBA input */}
            <div>
              <div className="text-text-secondary text-sm font-medium mb-3">LBA Number</div>
              <input
                type="number"
                min={0}
                max={totalLBAs}
                value={lba}
                onChange={(e) => setLba(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-story-surface border border-story-border rounded-lg px-4 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-nvme-blue"
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-story-surface rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">LBA</span>
              <span className="text-text-primary font-mono font-bold">
                {lba.toLocaleString()} (0x{lbaHex})
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Byte Offset</span>
              <span className="text-text-code font-mono font-bold">
                0x{byteOffsetHex} ({byteOffset.toLocaleString()} bytes)
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Block Size</span>
              <span className="text-text-secondary font-mono">{lbaSize} bytes</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">1 TB Drive Total LBAs</span>
              <span className="text-text-secondary font-mono">{totalLBAs.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Visual LBA map */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            LBA Address Space
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const isSelected = i === Math.min(Math.floor(lba / (totalLBAs / 32)), 31);
              return (
                <div
                  key={i}
                  className="flex-1 h-8 rounded-sm transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? "#635bff" : `rgba(99, 91, 255, ${0.05 + (i / 32) * 0.15})`,
                    border: isSelected ? "2px solid #635bff" : "1px solid #ddd6ca",
                  }}
                  onClick={() => setLba(Math.floor((i / 32) * totalLBAs))}
                  title={`LBA ~${Math.floor((i / 32) * totalLBAs).toLocaleString()}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
            <span>LBA 0</span>
            <span>LBA {totalLBAs.toLocaleString()}</span>
          </div>
        </div>

        <InfoCard variant="tip" title="512B vs 4KB sectors">
          Most modern NVMe SSDs use 4096-byte (4KB) LBAs internally but expose
          512-byte LBAs for compatibility. The <code className="text-text-code">nvme id-ns</code> command
          shows the supported LBA formats. You can switch with{" "}
          <code className="text-text-code">nvme format --lbaf=1</code>.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
