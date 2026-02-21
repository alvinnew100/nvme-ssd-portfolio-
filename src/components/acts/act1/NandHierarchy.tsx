"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

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

export default function NandHierarchy() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          How NAND Cells Are Organized
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          A single NAND cell is microscopic. To build a drive that holds terabytes
          of data, billions of cells are organized into a strict hierarchy &mdash;
          like pages in a notebook, notebooks on a shelf, shelves on a floor, and
          floors in a building.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Understanding this hierarchy is important because it explains a key rule
          of flash memory:{" "}
          <strong className="text-text-primary">
            you can read and write individual pages, but you can only erase entire blocks
          </strong>
          . This mismatch between write size and erase size is the root cause of many
          SSD behaviors we&apos;ll explore later (garbage collection, write
          amplification, and TRIM).
        </p>

        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            NAND Hierarchy — smallest to largest
          </div>
          <div className="flex flex-col items-center gap-4">
            {LEVELS.map((level) => (
              <div key={level.name} className="flex items-start gap-4 w-full max-w-lg">
                <div
                  className="h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    width: level.width,
                    backgroundColor: `${level.color}10`,
                    border: `2px solid ${level.color}50`,
                  }}
                >
                  <span className="font-mono font-bold text-sm" style={{ color: level.color }}>
                    {level.name}
                  </span>
                </div>
                <div className="min-w-0 pt-1">
                  <div className="text-text-muted text-xs font-mono">
                    {level.size}
                  </div>
                  <div className="text-text-secondary text-xs leading-relaxed mb-1">
                    {level.desc}
                  </div>
                  <div className="text-text-muted text-[10px] italic">
                    {level.analogy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
          <p className="text-text-secondary text-sm leading-relaxed">
            This is why SSDs don&apos;t overwrite data in place. Instead, they write new data
            to a different free page and update a mapping table. The old page becomes
            &ldquo;stale&rdquo; and will be cleaned up later. We&apos;ll see exactly how this
            works in the next section on the <strong className="text-text-primary">Flash
            Translation Layer (FTL)</strong>.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
