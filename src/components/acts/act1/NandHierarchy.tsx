"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";

const LEVELS = [
  {
    name: "Page",
    size: "4-16 KB",
    desc: "The smallest unit you can read or write. One page holds about 4,000-16,000 bytes of your data — roughly one or a few text files.",
    color: "#00d4aa",
    width: "64px",
    analogy: "A single sheet of paper — you read or write one page at a time.",
  },
  {
    name: "Block",
    size: "128-256 pages",
    desc: "The smallest unit you can erase. To erase even one page, you must erase the entire block (all 128-256 pages). This is the fundamental constraint that makes SSDs different from hard drives.",
    color: "#635bff",
    width: "128px",
    analogy: "A notebook — you can write on any page, but to erase, you must shred the whole notebook.",
  },
  {
    name: "Plane",
    size: "~1,000 blocks",
    desc: "A group of blocks that can operate in parallel. Having multiple planes lets the SSD read/write to different areas simultaneously, improving speed.",
    color: "#7c5cfc",
    width: "192px",
    analogy: "A bookshelf — multiple notebooks accessible at the same time.",
  },
  {
    name: "Die",
    size: "2-4 planes",
    desc: "An independent processing unit with its own circuitry. Multiple dies can work on different commands simultaneously, multiplying throughput.",
    color: "#f5a623",
    width: "256px",
    analogy: "A library floor — each floor operates independently with its own librarian.",
  },
  {
    name: "Package",
    size: "1-8 dies",
    desc: "The physical chip you can see on the SSD's circuit board. Multiple dies are stacked vertically inside one tiny package to maximize density.",
    color: "#ed5f74",
    width: "320px",
    analogy: "The library building — containing multiple floors, all in one physical structure.",
  },
];

function HierarchyVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
        NAND Hierarchy — smallest to largest
      </div>

      {/* Nested containment visual */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {[...LEVELS].reverse().map((level, ri) => {
            const i = LEVELS.length - 1 - ri;
            const pad = (LEVELS.length - 1 - i) * 12;
            return (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: ri * 0.15, duration: 0.4 }}
                className="rounded-xl p-3 mb-0"
                style={{
                  backgroundColor: `${level.color}08`,
                  border: `2px solid ${level.color}30`,
                  marginLeft: pad,
                  marginRight: pad,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs" style={{ color: level.color }}>
                    {level.name}
                  </span>
                  <span className="text-text-muted text-[10px] font-mono">{level.size}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail cards */}
      <div className="space-y-2">
        {LEVELS.map((level, i) => (
          <motion.div
            key={level.name}
            className="flex items-start gap-4 w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.8 + i * 0.1 }}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: level.color }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs" style={{ color: level.color }}>
                  {level.name}
                </span>
                <span className="text-text-muted text-[10px] font-mono">{level.size}</span>
              </div>
              <div className="text-text-secondary text-xs leading-relaxed">
                {level.desc}
              </div>
              <div className="text-text-muted text-[10px] italic mt-0.5">
                {level.analogy}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function NandHierarchy() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          How NAND Cells Are Organized
        </h3>
        <AnalogyCard
          concept="NAND Hierarchy Is Like a Library"
          analogy="Pages are like sheets of paper (you read/write one at a time). Blocks are notebooks (you can only shred a whole notebook at once). Planes are bookshelves (multiple notebooks accessible in parallel). Dies are library floors (each operates independently). Packages are the building (containing everything in one physical chip)."
        />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          A single NAND cell is microscopic — it stores just 1 to 4 bits. <em className="text-text-primary">
          So how do you get from a tiny cell to a 1 TB drive?</em> By organizing
          billions of cells into a strict hierarchy, like a library system: pages in
          notebooks, notebooks on shelves, shelves on floors, floors in a building.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why does this hierarchy matter?</em> Because
          it explains the most important rule of flash memory:{" "}
          <strong className="text-text-primary">
            you can read and write individual pages, but you can only erase entire blocks
          </strong>
          . This mismatch between write size and erase size is the root cause of many
          SSD behaviors we&apos;ll explore later. <em className="text-text-primary">
          But why can&apos;t you erase a single page?</em> Because of how NAND physics
          works — erasing requires a high voltage pulse that affects all cells connected
          to the same block&apos;s circuitry.
        </p>

        <HierarchyVisual />

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-2">
            The critical rule: Read/Write pages, Erase blocks
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            You can read or write to a single <strong className="text-nvme-green">page</strong> (4-16
            KB), but erasing must happen at the <strong className="text-nvme-blue">block</strong> level
            (hundreds of pages at once). Imagine needing to shred an entire notebook just to
            correct one page — that&apos;s the constraint the SSD&apos;s firmware must work around.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            <em className="text-text-primary">So what happens when you want to change
            just one page&apos;s data?</em> The SSD can&apos;t erase that one page —
            it would destroy the other 127+ pages in the same block. Instead, it writes
            the new data to a <em>different</em> free page and updates a mapping table.
            The old page becomes &ldquo;stale.&rdquo;
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            <em className="text-text-primary">But then stale pages pile up — who cleans
            them?</em> That&apos;s exactly the problem the <strong className="text-text-primary">
            Flash Translation Layer (FTL)</strong> solves. Let&apos;s see how in the
            next section.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
