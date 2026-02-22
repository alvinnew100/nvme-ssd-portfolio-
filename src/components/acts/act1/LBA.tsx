"use client";

import { useState, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import QuizCard from "@/components/story/QuizCard";
import FillInBlank from "@/components/story/FillInBlank";

const BLOCK_COUNT = 24;

function MailboxVisual({ selectedLba, lbaSize }: { selectedLba: number; lbaSize: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const boxes = 12;

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        LBA = Numbered Mailboxes
      </div>
      <div className="flex items-end gap-1 justify-center mb-4">
        {Array.from({ length: boxes }).map((_, i) => {
          const isSelected = i === (selectedLba % boxes);
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 150 }}
            >
              <div
                className={`w-10 h-14 rounded-t-lg border-2 flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? "border-nvme-blue bg-nvme-blue/10 scale-110 shadow-lg shadow-nvme-blue/20"
                    : "border-story-border bg-story-surface"
                }`}
              >
                <div className={`text-[8px] font-mono ${isSelected ? "text-nvme-blue font-bold" : "text-text-muted"}`}>
                  {lbaSize}B
                </div>
              </div>
              <div className={`text-[9px] font-mono mt-1 ${isSelected ? "text-nvme-blue font-bold" : "text-text-muted"}`}>
                {i}
              </div>
            </motion.div>
          );
        })}
        <motion.div
          className="text-text-muted text-xs font-mono ml-1 self-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          ...
        </motion.div>
      </div>
      <div className="flex justify-center gap-4 text-[10px] text-text-muted">
        <span>Each mailbox = one LBA = {lbaSize} bytes</span>
        <span>|</span>
        <span>Address by number, not physical location</span>
      </div>
    </div>
  );
}

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

        <AnalogyCard
          concept="LBA Is Like Numbered Mailboxes"
          analogy="Imagine a very long row of numbered mailboxes. Each mailbox holds a small, fixed amount of data. To read or write data, you just say 'give me mailbox #42' — you don't need to know where it physically sits. The SSD handles the physical location internally."
        />

        <TermDefinition term="LBA (Logical Block Addressing)" definition="A numbering system that divides the entire storage drive into fixed-size blocks, numbered starting from 0. 'Logical' means these are virtual addresses — the OS uses them, but the SSD maps them to physical NAND locations internally." />

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

        {/* Mailbox analogy visual */}
        <MailboxVisual selectedLba={lba} lbaSize={lbaSize} />

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
                  <motion.button
                    key={i}
                    className="flex-1 h-10 rounded transition-colors duration-150"
                    style={{
                      backgroundColor: isActive ? "#635bff" : `rgba(99, 91, 255, ${0.06 + (i / BLOCK_COUNT) * 0.12})`,
                      border: isActive ? "2px solid #635bff" : "1px solid #1e2d42",
                    }}
                    animate={isActive ? { scaleY: 1.2 } : { scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => handleBlockClick(i)}
                    whileHover={{ scaleY: 1.1 }}
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

        <QuizCard
          id="act1-lba-quiz1"
          question="Why does the OS use logical addresses (LBAs) instead of physical NAND addresses?"
          options={[
            { text: "Physical addresses are too long to store", explanation: "Address length isn't the main reason. LBAs can be just as long." },
            { text: "The SSD moves data internally, so physical addresses would break", correct: true, explanation: "Correct! The SSD constantly moves data for wear leveling, garbage collection, and error recovery. If the OS used physical addresses, every internal move would break the OS's references. LBAs provide a stable abstraction." },
            { text: "LBAs are faster to compute", explanation: "Speed of address computation isn't the issue. The key is that physical locations change." },
            { text: "Physical addresses don't exist on SSDs", explanation: "Physical addresses do exist — the SSD's internal firmware uses them. They're just hidden from the OS." },
          ]}
        />

        <FillInBlank
          id="act1-lba-fill1"
          prompt="A 1 TB drive with 512-byte LBAs has approximately {blank} billion LBAs."
          blanks={[{ answer: "1.95", tolerance: 0.1, placeholder: "?" }]}
          explanation="1 TB = 1,000,000,000,000 bytes. Divided by 512 bytes per LBA = ~1,953,125,000 LBAs, or approximately 1.95 billion."
          hint="Each sector is 512 bytes. Divide the total capacity by the sector size."
        />
      </div>
    </SectionWrapper>
  );
}
