"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

const CELL_TYPES = [
  {
    name: "SLC",
    bits: 1,
    levels: 2,
    color: "nvme-green",
    thresholds: ["0", "1"],
    desc: "Fastest and most durable. One threshold voltage = 2 states.",
  },
  {
    name: "MLC",
    bits: 2,
    levels: 4,
    color: "nvme-blue",
    thresholds: ["11", "10", "00", "01"],
    desc: "4 voltage levels per cell. Good balance of density and speed.",
  },
  {
    name: "TLC",
    bits: 3,
    levels: 8,
    color: "nvme-violet",
    thresholds: ["111", "110", "101", "100", "011", "010", "001", "000"],
    desc: "8 levels. Most common in consumer SSDs. Slower writes.",
  },
  {
    name: "QLC",
    bits: 4,
    levels: 16,
    color: "nvme-amber",
    thresholds: [],
    desc: "16 levels packed into one cell. Maximum density, lowest endurance.",
  },
];

export default function NandCell() {
  return (
    <SectionWrapper className="py-20 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The NAND Cell
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          At the heart of every SSD is a floating-gate transistor &mdash; the{" "}
          <strong className="text-text-primary">NAND flash cell</strong>. It
          stores data by trapping electrons on a floating gate. The number of
          electrons determines the voltage threshold, and each threshold
          represents a different bit pattern.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The more bits you pack into each cell, the more voltage levels you
          need to distinguish. More levels means tighter margins, slower reads,
          and shorter lifespan &mdash; but also more storage per chip.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CELL_TYPES.map((cell) => (
            <div
              key={cell.name}
              className="bg-story-panel rounded-xl border border-story-border p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-${cell.color} font-bold text-lg font-mono`}
                >
                  {cell.name}
                </span>
                <span className="text-text-muted text-xs">
                  {cell.bits} bit/cell
                </span>
              </div>

              {/* Voltage level visualization */}
              <div className="mb-3 space-y-1">
                {Array.from({ length: Math.min(cell.levels, 8) }).map(
                  (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className={`h-1.5 rounded-full bg-${cell.color}/60`}
                        style={{
                          width: `${((i + 1) / Math.min(cell.levels, 8)) * 100}%`,
                        }}
                      />
                      {cell.thresholds[i] && (
                        <span className="text-text-code text-[10px] font-mono">
                          {cell.thresholds[i]}
                        </span>
                      )}
                    </div>
                  )
                )}
                {cell.levels > 8 && (
                  <div className="text-text-muted text-[10px] font-mono">
                    ...{cell.levels} levels total
                  </div>
                )}
              </div>

              <p className="text-text-muted text-xs leading-relaxed">
                {cell.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
