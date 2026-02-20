"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

const LEVELS = [
  {
    name: "Page",
    size: "4-16 KB",
    desc: "Smallest readable/writable unit. A page holds your data.",
    color: "nvme-green",
    width: "w-16",
  },
  {
    name: "Block",
    size: "128-256 pages",
    desc: "Smallest erasable unit. You must erase a whole block before rewriting any page in it.",
    color: "nvme-blue",
    width: "w-32",
  },
  {
    name: "Plane",
    size: "~1000 blocks",
    desc: "Enables parallel operations. Multi-plane commands speed up I/O.",
    color: "nvme-violet",
    width: "w-48",
  },
  {
    name: "Die",
    size: "2-4 planes",
    desc: "Independent unit with its own row decoder and page buffer. Dies interleave for speed.",
    color: "nvme-amber",
    width: "w-64",
  },
  {
    name: "Package",
    size: "1-8 dies",
    desc: "Physical chip. Multiple dies stacked vertically in a single NAND package.",
    color: "nvme-red",
    width: "w-80",
  },
];

export default function NandHierarchy() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Pages, Blocks, Planes, Dies
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          NAND flash has a strict hierarchy. Understanding it explains why SSDs
          behave the way they do &mdash; why writes slow down over time, why
          TRIM matters, and why garbage collection exists.
        </p>

        <div className="flex flex-col items-center gap-3">
          {LEVELS.map((level, i) => (
            <div key={level.name} className="flex items-center gap-4 w-full max-w-lg">
              <div
                className={`${level.width} h-12 rounded-lg border-2 border-${level.color}/50 bg-${level.color}/10 flex items-center justify-center flex-shrink-0`}
              >
                <span className={`text-${level.color} font-mono font-bold text-sm`}>
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
              {i < LEVELS.length - 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden">
                  &darr;
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-story-panel rounded-xl border border-story-border p-5">
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
