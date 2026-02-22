"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import RevealCard from "@/components/story/RevealCard";
import { CELL_TYPES } from "./nandData";

export default function NandCellTypes() {
  const [activeCell, setActiveCell] = useState(0);
  const cell = CELL_TYPES[activeCell];

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          SLC, MLC, TLC, QLC — Cell Types Compared
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The number of bits each cell stores determines its speed, capacity, cost, and
          lifespan. Select a type below to explore the tradeoffs:
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

          <div className="flex flex-col sm:flex-row items-start gap-8">
            {/* Voltage diagram — animated glass fill */}
            <div className="flex-1">
              <div className="text-text-muted text-xs font-mono mb-1 uppercase tracking-wider">
                Charge Levels in One Cell
              </div>
              <p className="text-text-muted text-xs mb-4">
                Each bar shows a voltage level. The bit pattern is what the level &ldquo;means.&rdquo;{" "}
                <em>Notice levels get closer with more bits — harder to tell apart.</em>
              </p>
              <div className="space-y-1.5">
                {Array.from({ length: Math.min(cell.levels, 8) }).map((_, i) => {
                  const label = cell.thresholds[i] || `L${i}`;
                  const width = 20 + ((i + 1) / Math.min(cell.levels, 8)) * 80;
                  return (
                    <motion.div
                      key={`${cell.name}-${i}`}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                    >
                      <code className="text-xs font-mono w-8 text-right" style={{ color: cell.color }}>
                        {label}
                      </code>
                      <div className="flex-1 h-5 bg-story-surface rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: `${cell.color}30`,
                            border: `2px solid ${cell.color}`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ delay: i * 0.06 + 0.1, duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-text-muted text-[10px] font-mono w-20">
                        {i === 0 ? "low charge" : i === Math.min(cell.levels, 8) - 1 ? "high charge" : ""}
                      </span>
                    </motion.div>
                  );
                })}
                {cell.levels > 8 && (
                  <div className="text-text-muted text-xs font-mono pl-11">
                    ...{cell.levels} levels total (too many to show individually)
                  </div>
                )}
              </div>
            </div>

            {/* Stats — animated counters */}
            <div className="w-48 space-y-4">
              <motion.div
                key={`bits-${cell.name}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-text-muted text-[10px] font-mono uppercase">Bits per cell</div>
                <div className="text-3xl font-bold" style={{ color: cell.color }}>{cell.bits}</div>
              </motion.div>
              <motion.div
                key={`levels-${cell.name}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <div className="text-text-muted text-[10px] font-mono uppercase">Charge levels</div>
                <div className="text-2xl font-bold text-text-primary">{cell.levels}</div>
              </motion.div>
              <motion.div
                key={`endurance-${cell.name}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <div className="text-text-muted text-[10px] font-mono uppercase">Lifespan</div>
                <div className="text-sm font-mono text-text-secondary">{cell.endurance}</div>
                <p className="text-text-muted text-[10px] mt-1">
                  (write+erase cycles before wearing out)
                </p>
              </motion.div>
            </div>
          </div>

          <p className="text-text-secondary text-sm mt-6 leading-relaxed">
            {cell.desc}
          </p>

          {/* Comparison bar chart */}
          <div className="mt-6 pt-6 border-t border-story-border">
            <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
              Comparison — Capacity vs Speed vs Endurance
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Storage Density", values: [1, 2, 3, 4] },
                { label: "Read Speed", values: [100, 75, 60, 40] },
                { label: "Endurance", values: [100, 30, 10, 3] },
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-text-muted text-[10px] font-mono mb-2">{metric.label}</div>
                  <div className="flex items-end justify-center gap-1 h-16">
                    {CELL_TYPES.map((ct, ci) => {
                      const val = metric.values[ci];
                      const max = Math.max(...metric.values);
                      const h = (val / max) * 100;
                      return (
                        <motion.div
                          key={ct.name}
                          className="w-6 rounded-t"
                          style={{ backgroundColor: ci === activeCell ? ct.color : `${ct.color}40` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.4, delay: ci * 0.05 }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-1 mt-1">
                    {CELL_TYPES.map((ct, ci) => (
                      <span key={ct.name} className="text-[7px] font-mono w-6 text-center" style={{ color: ci === activeCell ? ct.color : "#475569" }}>
                        {ct.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <RevealCard
          id="act1-nandtypes-quiz1"
          prompt="Why does SLC endure ~100x more P/E cycles than QLC? What is the precise physical mechanism that connects 'more bits per cell' to 'faster wear-out'?"
          answer="SLC distinguishes only 2 voltage levels with wide margins between them, so it can tolerate significant oxide degradation before misreads occur (~100,000 P/E cycles). QLC packs 16 voltage levels into the same voltage range, meaning the margins between adjacent levels are razor-thin. Even small amounts of oxide damage (trapped electrons shifting threshold voltages) cause the distributions to overlap, leading to bit errors. The progression is: SLC (~100K cycles, 2 levels), MLC (~10K cycles, 4 levels), TLC (~3K cycles, 8 levels), QLC (~1K cycles, 16 levels). Each doubling of levels roughly reduces endurance by 3-10x because the margin for error shrinks exponentially while oxide damage accumulates linearly with P/E cycles."
        />

        <RevealCard
          id="act1-nandtypes-drag1"
          prompt="If a manufacturer converts an SLC die to QLC without changing the physical cell count, the capacity quadruples. So why don't all SSDs just use QLC? What are the hidden costs of packing more bits into each cell?"
          answer="From lowest to highest density: SLC (1 bit/cell) < MLC (2 bits/cell) < TLC (3 bits/cell) < QLC (4 bits/cell). While QLC quadruples the storage per cell compared to SLC, the hidden costs are severe: (1) Write speed drops dramatically because programming 16 precise voltage levels requires iterative verify steps, (2) Read latency increases because the controller must make 15 voltage comparisons instead of 1, (3) Endurance plummets from ~100K to ~1K P/E cycles, and (4) Error rates skyrocket, demanding more powerful (and slower) ECC algorithms like LDPC with soft-decision decoding. This is why many SSDs use SLC as a write cache — incoming data is written quickly to SLC-mode cells, then slowly 'folded' into TLC/QLC cells in the background."
          hint="More bits per cell = more data stored in the same physical space."
        />
      </div>
    </SectionWrapper>
  );
}
