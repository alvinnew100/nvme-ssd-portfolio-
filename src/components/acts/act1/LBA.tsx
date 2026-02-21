"use client";

import { useState, useMemo } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const BLOCK_COUNT = 24;

export default function LBA() {
  const [lbaSize, setLbaSize] = useState(512);
  const [lba, setLba] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(0);

  // Example: 1TB drive
  const driveSize = 1_000_000_000_000;
  const totalLBAs = Math.floor(driveSize / lbaSize);
  const byteOffset = lba * lbaSize;

  // Format large numbers readably
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  // Precompute block boundaries for the address bar
  const blockLbas = useMemo(() =>
    Array.from({ length: BLOCK_COUNT }, (_, i) =>
      Math.floor((i / BLOCK_COUNT) * totalLBAs)
    ), [totalLBAs]
  );

  const handleBlockClick = (i: number) => {
    setSelectedBlock(i);
    setLba(blockLbas[i]);
  };

  // Use selectedBlock directly (avoids floating-point round-trip bug)

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Addressing Storage &mdash; LBA
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We know data is made of bits and bytes. But an SSD holds a trillion bytes
          &mdash; <em className="text-text-primary">how does the computer know where
          to find a specific piece of data?</em> It needs an addressing system, like
          street addresses for houses.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Imagine a very long row of numbered mailboxes. Each mailbox holds a small,
          fixed amount of data. When you want to read or write data, you just say{" "}
          &ldquo;give me mailbox number 42&rdquo; &mdash; you don&apos;t need to know
          where it physically sits on the drive.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          That&apos;s exactly how{" "}
          <strong className="text-text-primary">Logical Block Addressing (LBA)</strong>{" "}
          works. The entire storage drive is divided into fixed-size blocks, numbered
          starting from 0. Each block is called an <strong className="text-text-primary">
          LBA</strong>. The &ldquo;logical&rdquo; part means these are <em>virtual</em>{" "}
          addresses &mdash; your computer uses them, but the SSD internally maps them
          to the actual physical locations on the NAND chips.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But why &ldquo;logical&rdquo;? Why not
          just use physical addresses directly?</em> Because the SSD constantly moves
          data around internally (for wear leveling, garbage collection, and error
          recovery). If the OS used physical addresses, every internal move would
          break the OS&apos;s bookkeeping. The LBA abstraction means the OS sees a
          stable, unchanging address space while the SSD manages the physical chaos
          underneath. (We&apos;ll see exactly how this mapping works when we cover
          the FTL later.)
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Each LBA has a fixed size &mdash; either <strong className="text-text-primary">
          512 bytes</strong> (the traditional size from hard disk days) or{" "}
          <strong className="text-text-primary">4096 bytes (4 KB)</strong> (which
          matches how modern SSDs work internally, making them more efficient).
        </p>

        {/* Interactive LBA calculator */}
        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            LBA Calculator &mdash; See how addresses map to byte positions
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Block size selector */}
            <div>
              <div className="text-text-secondary text-sm font-medium mb-2">Block Size</div>
              <p className="text-text-muted text-xs mb-3">
                How many bytes each &ldquo;mailbox&rdquo; holds. <em>Why does size
                matter?</em> Larger blocks mean fewer total addresses but potentially
                wasted space for small files.
              </p>
              <div className="flex gap-2">
                {[512, 4096].map((size) => (
                  <button
                    key={size}
                    onClick={() => { setLbaSize(size); setLba(0); setSelectedBlock(0); }}
                    className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                      size === lbaSize
                        ? "bg-nvme-blue text-white shadow-md"
                        : "bg-story-surface text-text-secondary hover:bg-story-border"
                    }`}
                  >
                    {size} bytes{size === 4096 ? " (4 KB)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* LBA input */}
            <div>
              <div className="text-text-secondary text-sm font-medium mb-2">LBA Number</div>
              <p className="text-text-muted text-xs mb-3">
                Which &ldquo;mailbox&rdquo; to look at (0 = first one).
              </p>
              <input
                type="number"
                min={0}
                max={totalLBAs}
                value={lba}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setLba(val);
                  setSelectedBlock(Math.min(Math.floor((val / totalLBAs) * BLOCK_COUNT), BLOCK_COUNT - 1));
                }}
                className="w-full bg-story-surface border border-story-border rounded-lg px-4 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-nvme-blue"
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-story-surface rounded-xl p-5 space-y-3 mb-6">
            <div className="text-text-muted text-[10px] font-mono mb-2">
              HOW THE MATH WORKS: Byte Offset = LBA &times; Block Size = {lba.toLocaleString()} &times; {lbaSize} = {byteOffset.toLocaleString()}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">LBA number</span>
              <span className="text-text-primary font-mono font-bold">
                {lba.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Byte position on drive</span>
              <span className="text-text-code font-mono font-bold">
                {byteOffset.toLocaleString()} bytes ({formatBytes(byteOffset)})
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Total LBAs on a 1 TB drive</span>
              <span className="text-text-secondary font-mono">{totalLBAs.toLocaleString()}</span>
            </div>
          </div>

          {/* Visual address bar */}
          <div>
            <div className="text-text-muted text-[10px] font-mono mb-2">
              CLICK A SEGMENT TO JUMP — each segment represents ~{formatBytes(Math.floor(driveSize / BLOCK_COUNT))} of the drive
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: BLOCK_COUNT }).map((_, i) => {
                const isActive = selectedBlock === i;
                return (
                  <button
                    key={i}
                    className="flex-1 h-10 rounded transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? "#635bff" : `rgba(99, 91, 255, ${0.06 + (i / BLOCK_COUNT) * 0.12})`,
                      border: isActive ? "2px solid #635bff" : "1px solid #ddd6ca",
                      transform: isActive ? "scaleY(1.15)" : undefined,
                    }}
                    onClick={() => handleBlockClick(i)}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
              <span>LBA 0 (start)</span>
              <span>LBA {totalLBAs.toLocaleString()} (end of drive)</span>
            </div>
          </div>
        </div>

        <InfoCard variant="tip" title="512 bytes vs 4 KB — why two sizes?">
          Older hard drives used 512-byte sectors, so most software was written for
          that size. Modern SSDs internally use 4 KB pages, but they can{" "}
          <strong>emulate</strong> 512-byte sectors for compatibility. <em>What
          happens when the OS writes 512 bytes to a 4KB-native SSD?</em> The SSD
          must read the full 4KB page, modify the 512 bytes, and write the whole page
          back — a read-modify-write cycle that wastes bandwidth. Using native 4 KB
          sectors avoids this entirely. You can check what your drive supports (and
          switch) using <code className="text-text-code">nvme id-ns</code>.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
