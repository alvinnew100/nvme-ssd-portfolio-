"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

const LEVELS = [
  {
    name: "Page",
    size: "4-16 KB",
    desc: "Smallest readable/writable unit. A page holds your data.",
    color: "#00d4aa",
    width: "64px",
  },
  {
    name: "Block",
    size: "128-256 pages",
    desc: "Smallest erasable unit. You must erase a whole block before rewriting any page in it.",
    color: "#635bff",
    width: "128px",
  },
  {
    name: "Plane",
    size: "~1000 blocks",
    desc: "Enables parallel operations. Multi-plane commands speed up I/O.",
    color: "#7c5cfc",
    width: "192px",
  },
  {
    name: "Die",
    size: "2-4 planes",
    desc: "Independent unit with its own row decoder and page buffer. Dies interleave for speed.",
    color: "#f5a623",
    width: "256px",
  },
  {
    name: "Package",
    size: "1-8 dies",
    desc: "Physical chip. Multiple dies stacked vertically in a single NAND package.",
    color: "#ed5f74",
    width: "320px",
  },
];

export default function NandHierarchy() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Pages, Blocks, Planes, Dies
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          NAND flash has a strict hierarchy. Understanding it explains why SSDs
          behave the way they do &mdash; why writes slow down over time, why
          TRIM matters, and why garbage collection exists.
        </p>

        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="flex flex-col items-center gap-3">
            {LEVELS.map((level) => (
              <div key={level.name} className="flex items-center gap-4 w-full max-w-lg">
                <div
                  className="h-12 rounded-lg flex items-center justify-center flex-shrink-0"
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
                <div className="min-w-0">
                  <div className="text-text-muted text-xs font-mono">
                    {level.size}
                  </div>
                  <div className="text-text-secondary text-xs leading-relaxed">
                    {level.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Key insight: Read vs. Erase asymmetry
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            You can read or program (write) individual <strong className="text-nvme-green">pages</strong>, but you can only
            erase entire <strong className="text-nvme-blue">blocks</strong>. This asymmetry is why SSDs need a Flash
            Translation Layer (FTL) to manage writes, and why TRIM commands are critical for
            long-term performance.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
