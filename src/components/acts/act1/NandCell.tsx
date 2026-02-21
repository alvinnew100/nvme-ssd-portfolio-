"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";

const CELL_TYPES = [
  {
    name: "SLC",
    bits: 1,
    levels: 2,
    color: "#00d4aa",
    thresholds: ["0", "1"],
    endurance: "~100,000 P/E",
    analogy: "A glass that's either empty or full. Easy to tell apart.",
    desc: "Each cell stores just 1 bit. Since there are only 2 states (empty or full), it's fast to read, easy to write, and very reliable. Used in enterprise SSDs and as a write cache (SLC cache) in consumer drives.",
  },
  {
    name: "MLC",
    bits: 2,
    levels: 4,
    color: "#635bff",
    thresholds: ["11", "10", "00", "01"],
    endurance: "~10,000 P/E",
    analogy: "A glass with 4 fill levels: empty, 1/3, 2/3, full.",
    desc: "Each cell stores 2 bits by using 4 distinct charge levels. Harder to read (must distinguish 4 levels), slower to write, but stores twice as much data per cell. Good balance of speed and density.",
  },
  {
    name: "TLC",
    bits: 3,
    levels: 8,
    color: "#7c5cfc",
    thresholds: ["111", "110", "101", "100", "011", "010", "001", "000"],
    endurance: "~3,000 P/E",
    analogy: "A glass with 8 fill levels — you need a precise ruler to tell them apart.",
    desc: "Each cell stores 3 bits using 8 voltage levels. The most common type in consumer SSDs today. Writes are slower and the cell wears out faster, but you get 3x the storage of SLC per cell.",
  },
  {
    name: "QLC",
    bits: 4,
    levels: 16,
    color: "#f5a623",
    thresholds: [],
    endurance: "~1,000 P/E",
    analogy: "A glass with 16 fill levels — incredibly precise, fragile, and slow to measure.",
    desc: "Each cell stores 4 bits using 16 voltage levels. Maximum storage density. The margins between levels are razor-thin, making reads slower and cells less durable. Best for read-heavy, cold storage workloads.",
  },
];

export default function NandCell() {
  const [activeCell, setActiveCell] = useState(0);
  const cell = CELL_TYPES[activeCell];

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          How an SSD Actually Stores a Bit
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Now we know that data is made of bits (0s and 1s) and that drives organize
          them into numbered blocks (LBAs). But how does an SSD physically store a
          bit? It doesn&apos;t have spinning platters like a hard drive. Instead, it
          uses <strong className="text-text-primary">NAND flash memory</strong>.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think of each memory cell as a <strong className="text-text-primary">tiny bucket
          that holds electrical charge</strong>. To store a &ldquo;1&rdquo;, you put charge
          in the bucket. To store a &ldquo;0&rdquo;, you leave it empty. To read the
          value, you check how much charge is in the bucket. The bucket is actually a
          microscopic structure called a <strong className="text-text-primary">floating gate
          </strong> — a layer of material that can trap electrons and hold them even when
          power is off. That&apos;s why SSDs keep your data when you unplug them.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Here&apos;s the clever part: you can store <em>more than 1 bit</em> per cell
          by using multiple charge levels. Instead of just &ldquo;empty&rdquo; or
          &ldquo;full,&rdquo; you can have 4, 8, or even 16 distinct charge levels in
          the same cell. Each level represents a different bit pattern.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The tradeoff? More levels per cell means more storage, but it&apos;s harder
          to read accurately (the levels are closer together), slower to write, and the
          cell wears out faster. Click each type below to compare:
        </p>

        {/* Cell type selector */}
        <div className="flex gap-2 mb-8">
          {CELL_TYPES.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveCell(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                i === activeCell
                  ? "text-white shadow-lg"
                  : "bg-story-card text-text-secondary hover:bg-story-surface border border-story-border"
              }`}
              style={
                i === activeCell
                  ? { backgroundColor: c.color, boxShadow: `0 4px 14px ${c.color}40` }
                  : undefined
              }
            >
              {c.name}
              <span className="ml-1.5 opacity-60 text-xs">{c.bits}b</span>
            </button>
          ))}
        </div>

        {/* Voltage level visualization */}
        <div className="bg-story-card rounded-2xl p-8 card-shadow">
          {/* Analogy */}
          <div
            className="rounded-xl p-4 mb-6 text-sm"
            style={{
              backgroundColor: `${cell.color}08`,
              borderLeft: `3px solid ${cell.color}`,
            }}
          >
            <span className="text-text-muted">Analogy: </span>
            <span className="text-text-secondary">{cell.analogy}</span>
          </div>

          <div className="flex items-start gap-8">
            {/* Voltage diagram */}
            <div className="flex-1">
              <div className="text-text-muted text-xs font-mono mb-1 uppercase tracking-wider">
                Charge Levels in One Cell
              </div>
              <p className="text-text-muted text-xs mb-4">
                Each bar represents a different charge level. The bit pattern next to it
                is what that level &ldquo;means.&rdquo;
              </p>
              <div className="space-y-2">
                {Array.from({ length: Math.min(cell.levels, 8) }).map((_, i) => {
                  const label = cell.thresholds[i] || `L${i}`;
                  const width = 20 + ((i + 1) / Math.min(cell.levels, 8)) * 80;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <code className="text-xs font-mono w-8 text-right" style={{ color: cell.color }}>
                        {label}
                      </code>
                      <div className="flex-1 h-6 bg-story-surface rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${width}%`,
                            backgroundColor: `${cell.color}30`,
                            border: `2px solid ${cell.color}`,
                          }}
                        />
                      </div>
                      <span className="text-text-muted text-[10px] font-mono w-20">
                        {i === 0 ? "low charge" : i === Math.min(cell.levels, 8) - 1 ? "high charge" : ""}
                      </span>
                    </div>
                  );
                })}
                {cell.levels > 8 && (
                  <div className="text-text-muted text-xs font-mono pl-11">
                    ...{cell.levels} levels total (too many to show individually)
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="w-48 space-y-4">
              <div>
                <div className="text-text-muted text-[10px] font-mono uppercase">Bits per cell</div>
                <div className="text-3xl font-bold" style={{ color: cell.color }}>{cell.bits}</div>
              </div>
              <div>
                <div className="text-text-muted text-[10px] font-mono uppercase">Charge levels</div>
                <div className="text-2xl font-bold text-text-primary">{cell.levels}</div>
              </div>
              <div>
                <div className="text-text-muted text-[10px] font-mono uppercase">Lifespan</div>
                <div className="text-sm font-mono text-text-secondary">{cell.endurance}</div>
                <p className="text-text-muted text-[10px] mt-1">
                  (how many times the cell can be written and erased before wearing out)
                </p>
              </div>
            </div>
          </div>

          <p className="text-text-secondary text-sm mt-6 leading-relaxed">
            {cell.desc}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
