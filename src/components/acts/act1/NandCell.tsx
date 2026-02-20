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
    desc: "Fastest and most durable. One threshold voltage = 2 states.",
  },
  {
    name: "MLC",
    bits: 2,
    levels: 4,
    color: "#635bff",
    thresholds: ["11", "10", "00", "01"],
    endurance: "~10,000 P/E",
    desc: "4 voltage levels per cell. Good balance of density and speed.",
  },
  {
    name: "TLC",
    bits: 3,
    levels: 8,
    color: "#7c5cfc",
    thresholds: ["111", "110", "101", "100", "011", "010", "001", "000"],
    endurance: "~3,000 P/E",
    desc: "8 levels. Most common in consumer SSDs. Slower writes.",
  },
  {
    name: "QLC",
    bits: 4,
    levels: 16,
    color: "#f5a623",
    thresholds: [],
    endurance: "~1,000 P/E",
    desc: "16 levels packed into one cell. Maximum density, lowest endurance.",
  },
];

export default function NandCell() {
  const [activeCell, setActiveCell] = useState(0);
  const cell = CELL_TYPES[activeCell];

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
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
          need to distinguish &mdash; tighter margins, slower reads, shorter
          lifespan, but more storage per chip.
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
                  : "bg-white text-text-secondary hover:bg-story-surface border border-story-border"
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
        <div className="bg-white rounded-2xl p-8 card-shadow">
          <div className="flex items-start gap-8">
            {/* Voltage diagram */}
            <div className="flex-1">
              <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
                Voltage Distribution &mdash; {cell.levels} levels
              </div>
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
                      <span className="text-text-muted text-[10px] font-mono w-16">
                        V{i} threshold
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
                <div className="text-text-muted text-[10px] font-mono uppercase">Bits/Cell</div>
                <div className="text-3xl font-bold" style={{ color: cell.color }}>{cell.bits}</div>
              </div>
              <div>
                <div className="text-text-muted text-[10px] font-mono uppercase">Voltage Levels</div>
                <div className="text-2xl font-bold text-text-primary">{cell.levels}</div>
              </div>
              <div>
                <div className="text-text-muted text-[10px] font-mono uppercase">Endurance</div>
                <div className="text-sm font-mono text-text-secondary">{cell.endurance}</div>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                {cell.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
