"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

/* ─── SSD Architecture Diagram ─── */
function SsdDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        SSD Architecture — Animated Data Flow
      </div>
      <svg viewBox="0 0 620 280" className="w-full max-w-3xl mx-auto" fill="none">
        {/* Host System */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <rect x="0" y="60" width="90" height="160" rx="10" fill="#00d4aa08" stroke="#00d4aa" strokeWidth="2" />
          <text x="45" y="85" textAnchor="middle" className="fill-nvme-green text-[10px] font-bold">Host</text>
          <text x="45" y="100" textAnchor="middle" className="fill-nvme-green text-[10px] font-bold">System</text>
          <rect x="10" y="112" width="70" height="28" rx="4" fill="#38bdf810" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="45" y="129" textAnchor="middle" className="fill-nvme-blue text-[8px] font-mono font-bold">CPU</text>
          <rect x="10" y="148" width="70" height="28" rx="4" fill="#a78bfa10" stroke="#a78bfa" strokeWidth="1.5" />
          <text x="45" y="165" textAnchor="middle" className="fill-nvme-violet text-[8px] font-mono font-bold">Host RAM</text>
          <text x="45" y="190" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">SQ + CQ here</text>
        </motion.g>

        {/* PCIe Bus */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 }}
        >
          <rect x="96" y="100" width="36" height="80" rx="4" fill="#00d4aa08" stroke="#00d4aa40" strokeWidth="1" strokeDasharray="4,3" />
          <text x="114" y="118" textAnchor="middle" className="fill-nvme-green text-[7px] font-mono">PCIe</text>
          <text x="114" y="130" textAnchor="middle" className="fill-nvme-green text-[7px] font-mono">x4</text>
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={`pcie-${i}`}
              r="2.5" fill="#00d4aa"
              animate={inView ? { cy: [108 + i * 16, 108 + i * 16], cx: [100, 128], opacity: [0.8, 0.3, 0.8] } : {}}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
            />
          ))}
        </motion.g>

        {/* SSD Controller */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <rect x="140" y="20" width="240" height="240" rx="12" fill="#38bdf806" stroke="#38bdf8" strokeWidth="2" />
          <text x="260" y="44" textAnchor="middle" className="fill-nvme-blue text-[12px] font-bold">SSD Controller (SoC)</text>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}>
            <rect x="155" y="55" width="105" height="40" rx="6" fill="#111927" stroke="#38bdf840" strokeWidth="1" />
            <text x="207" y="73" textAnchor="middle" className="fill-nvme-blue text-[8px] font-mono font-bold">NVMe Frontend</text>
            <text x="207" y="85" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">Command parsing</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.35 }}>
            <rect x="268" y="55" width="100" height="40" rx="6" fill="#111927" stroke="#38bdf840" strokeWidth="1" />
            <text x="318" y="73" textAnchor="middle" className="fill-nvme-blue text-[8px] font-mono font-bold">PCIe Interface</text>
            <text x="318" y="85" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">DMA engine</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
            <rect x="155" y="103" width="105" height="40" rx="6" fill="#111927" stroke="#a78bfa40" strokeWidth="1" />
            <text x="207" y="121" textAnchor="middle" className="fill-nvme-violet text-[8px] font-mono font-bold">FTL Engine</text>
            <text x="207" y="133" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">L2P mapping, GC</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45 }}>
            <rect x="268" y="103" width="100" height="40" rx="6" fill="#111927" stroke="#00d4aa40" strokeWidth="1" />
            <text x="318" y="121" textAnchor="middle" className="fill-nvme-green text-[8px] font-mono font-bold">ECC Engine</text>
            <text x="318" y="133" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">Error correction</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
            <rect x="155" y="151" width="105" height="40" rx="6" fill="#111927" stroke="#f5a62340" strokeWidth="1" />
            <text x="207" y="169" textAnchor="middle" className="fill-nvme-amber text-[8px] font-mono font-bold">Wear Leveling</text>
            <text x="207" y="181" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">Even cell usage</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.55 }}>
            <rect x="268" y="151" width="100" height="40" rx="6" fill="#111927" stroke="#e05d6f40" strokeWidth="1" />
            <text x="318" y="169" textAnchor="middle" className="fill-nvme-red text-[8px] font-mono font-bold">Write Buffer</text>
            <text x="318" y="181" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">SLC cache mgmt</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}>
            <rect x="155" y="200" width="213" height="35" rx="6" fill="#111927" stroke="#94a3b840" strokeWidth="1" />
            <text x="261" y="218" textAnchor="middle" className="fill-text-secondary text-[8px] font-mono font-bold">NAND Flash Interface (ONFI / Toggle)</text>
            <text x="261" y="228" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">8/16 channels to NAND packages</text>
          </motion.g>

          <text x="260" y="253" textAnchor="middle" className="fill-text-muted text-[6px] font-mono italic">ARM Cortex-R / proprietary RISC cores</text>
        </motion.g>

        {/* DRAM */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <rect x="400" y="25" width="90" height="60" rx="8" fill="#a78bfa08" stroke="#a78bfa" strokeWidth="2" />
          <text x="445" y="48" textAnchor="middle" className="fill-nvme-violet text-[10px] font-bold">DRAM</text>
          <text x="445" y="62" textAnchor="middle" className="fill-text-muted text-[7px]">FTL Table Cache</text>
          <text x="445" y="74" textAnchor="middle" className="fill-text-muted text-[7px]">Read/Write Buffer</text>
          <line x1="380" y1="55" x2="400" y2="55" stroke="#a78bfa" strokeWidth="1.5" />
          <polygon points="398,52 404,55 398,58" fill="#a78bfa" />
        </motion.g>

        {/* NAND packages */}
        {[0, 1, 2, 3].map((ch) => (
          <motion.g
            key={ch}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.65 + ch * 0.08 }}
          >
            <rect x={400 + ch * 56} y="105" width="50" height="150" rx="6" fill="#f5a62306" stroke="#f5a62340" strokeWidth="1" />
            <text x={425 + ch * 56} y="120" textAnchor="middle" className="fill-nvme-amber text-[7px] font-mono font-bold">CH{ch}</text>
            {[0, 1].map((die) => (
              <rect key={die} x={406 + ch * 56} y={128 + die * 58} width="38" height="50" rx="4" fill="#f5a62308" stroke="#f5a623" strokeWidth="1" />
            ))}
            {[0, 1].map((die) => (
              <g key={`label-${die}`}>
                <text x={425 + ch * 56} y={148 + die * 58} textAnchor="middle" className="fill-nvme-amber text-[7px] font-bold">NAND</text>
                <text x={425 + ch * 56} y={160 + die * 58} textAnchor="middle" className="fill-text-muted text-[6px]">Die {ch * 2 + die}</text>
                <text x={425 + ch * 56} y={170 + die * 58} textAnchor="middle" className="fill-text-muted text-[5px]">TLC/QLC</text>
              </g>
            ))}
            <motion.rect
              x={422 + ch * 56} y="105" width="6" height="3" rx="1" fill="#f5a623"
              animate={inView ? { y: [105, 240], opacity: [0.8, 0] } : {}}
              transition={{ delay: 1.2 + ch * 0.2, duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.g>
        ))}

        <motion.line
          x1="380" y1="218" x2="400" y2="180"
          stroke="#94a3b8" strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.3 }}
        />
      </svg>
    </div>
  );
}

/* ─── Block Types Diagram — Interactive ─── */
type BlockType = "source" | "dynamic" | "static" | "spare" | "dynamicSpare" | "staticSpare";

const BLOCK_INFO: Record<BlockType, { label: string; color: string; desc: string; detail: string }> = {
  source: {
    label: "Source Block",
    color: "#e05d6f",
    desc: "A block selected for garbage collection",
    detail: "The GC engine picks source blocks based on their VPC (Valid Page Count) — blocks with fewer valid pages are better candidates because fewer pages need copying. The goal is to reclaim the most free pages with the least write amplification.",
  },
  dynamic: {
    label: "Dynamic Block",
    color: "#00d4aa",
    desc: "A block actively receiving host writes (hot data)",
    detail: "Dynamic blocks are the write destinations for incoming host data. The FTL assigns new writes here. Because they contain hot (frequently updated) data, they cycle through valid→stale pages quickly. Dynamic wear leveling picks the lowest-erase-count free block as the next dynamic block.",
  },
  static: {
    label: "Static Block",
    color: "#635bff",
    desc: "A block holding cold data that rarely changes",
    detail: "Static blocks contain data the host hasn't updated in a long time — think OS files, installed programs, or archived photos. They sit at low erase counts while dynamic blocks wear out faster. Static wear leveling periodically moves this cold data to high-wear blocks, freeing the low-wear blocks for hot writes.",
  },
  spare: {
    label: "Spare Block",
    color: "#f5a623",
    desc: "Over-provisioned blocks held in reserve",
    detail: "Spare blocks are part of the drive's over-provisioning (OP) — extra NAND capacity hidden from the host. They serve as replacement blocks when other blocks wear out or develop too many errors. The SMART 'Available Spare' field tracks how many remain. When spare blocks run low, the drive triggers a critical warning.",
  },
  dynamicSpare: {
    label: "Dynamic Spare Block",
    color: "#38bdf8",
    desc: "A spare block allocated as the next write target",
    detail: "When the current dynamic block fills up, the FTL picks a spare block with the lowest erase count and promotes it to a dynamic spare — it becomes the next block to receive host writes. This rotation ensures writes spread evenly across all available blocks.",
  },
  staticSpare: {
    label: "Static Spare Block",
    color: "#a78bfa",
    desc: "A spare block used for static wear leveling moves",
    detail: "During static wear leveling, the controller moves cold data from a low-wear static block into a high-wear spare block. The old static block (now empty) becomes a spare. This rotation prevents cold blocks from hoarding their low erase counts while hot blocks wear out.",
  },
};

const BLOCK_TYPES_ORDER: BlockType[] = ["source", "dynamic", "static", "spare", "dynamicSpare", "staticSpare"];

function BlockTypeDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [selected, setSelected] = useState<BlockType>("source");
  const info = BLOCK_INFO[selected];

  // Simulated block pool — 16 blocks
  const blockPool: { type: BlockType; vpc: number; eraseCount: number }[] = [
    { type: "source", vpc: 2, eraseCount: 450 },
    { type: "dynamic", vpc: 6, eraseCount: 380 },
    { type: "dynamic", vpc: 4, eraseCount: 420 },
    { type: "static", vpc: 8, eraseCount: 50 },
    { type: "static", vpc: 8, eraseCount: 60 },
    { type: "static", vpc: 8, eraseCount: 45 },
    { type: "spare", vpc: 0, eraseCount: 200 },
    { type: "spare", vpc: 0, eraseCount: 180 },
    { type: "dynamicSpare", vpc: 0, eraseCount: 150 },
    { type: "source", vpc: 1, eraseCount: 500 },
    { type: "dynamic", vpc: 5, eraseCount: 390 },
    { type: "static", vpc: 8, eraseCount: 55 },
    { type: "spare", vpc: 0, eraseCount: 220 },
    { type: "staticSpare", vpc: 0, eraseCount: 470 },
    { type: "static", vpc: 8, eraseCount: 70 },
    { type: "source", vpc: 3, eraseCount: 480 },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Block Types in the SSD&apos;s NAND Pool
      </div>

      {/* Block type selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {BLOCK_TYPES_ORDER.map((bt) => {
          const b = BLOCK_INFO[bt];
          const isActive = selected === bt;
          return (
            <button
              key={bt}
              onClick={() => setSelected(bt)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold transition-all ${
                isActive
                  ? "text-white shadow-md scale-105"
                  : "bg-story-surface text-text-muted hover:text-text-secondary"
              }`}
              style={isActive ? { backgroundColor: b.color } : undefined}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {/* Block pool grid */}
      <div className="grid grid-cols-8 gap-2 mb-5">
        {blockPool.map((block, i) => {
          const bi = BLOCK_INFO[block.type];
          const isHighlighted = block.type === selected;
          return (
            <motion.div
              key={i}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center border-2 transition-all ${
                isHighlighted ? "scale-110 shadow-md" : "opacity-40"
              }`}
              style={{
                borderColor: bi.color,
                backgroundColor: isHighlighted ? `${bi.color}15` : `${bi.color}05`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: isHighlighted ? 1 : 0.4, scale: isHighlighted ? 1.1 : 1 } : {}}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <div className="text-[7px] font-mono font-bold" style={{ color: bi.color }}>
                B{i}
              </div>
              <div className="text-[6px] font-mono text-text-muted">
                VPC:{block.vpc}
              </div>
              <div className="text-[6px] font-mono text-text-muted">
                PE:{block.eraseCount}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected block type detail */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl p-4"
        style={{
          backgroundColor: `${info.color}08`,
          borderLeft: `3px solid ${info.color}`,
        }}
      >
        <div className="font-semibold text-sm mb-1" style={{ color: info.color }}>
          {info.label}
        </div>
        <div className="text-text-secondary text-xs mb-2">{info.desc}</div>
        <div className="text-text-muted text-[11px] leading-relaxed">{info.detail}</div>
      </motion.div>
    </div>
  );
}

/* ─── VPC (Valid Page Count) Diagram ─── */
function VpcDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // 3 blocks with different VPC values to show GC selection
  const blocks = [
    { id: "A", vpc: 2, pages: ["V","S","S","S","V","S","S","S"], erases: 450, gcScore: "Best" },
    { id: "B", vpc: 5, pages: ["V","V","S","V","V","S","V","S"], erases: 300, gcScore: "Ok" },
    { id: "C", vpc: 7, pages: ["V","V","V","V","V","S","V","V"], erases: 200, gcScore: "Worst" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
        Valid Page Count (VPC) — How GC Picks Blocks
      </div>
      <p className="text-text-secondary text-xs mb-4 leading-relaxed">
        Every block has a <strong className="text-text-primary">VPC (Valid Page Count)</strong> —
        how many of its pages still contain current, referenced data. Lower VPC = fewer pages to
        copy during GC = less write amplification. The GC engine maintains a VPC table and
        picks <strong className="text-text-primary">the block with the lowest VPC</strong> as
        the source block.
      </p>

      <div className="space-y-3 mb-4">
        {blocks.map((block, bi) => (
          <motion.div
            key={block.id}
            className={`rounded-xl p-3 ${bi === 0 ? "ring-2 ring-nvme-green/40 bg-nvme-green/5" : "bg-story-surface"}`}
            initial={{ opacity: 0, x: -15 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: bi * 0.12, duration: 0.35 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-xs font-mono font-bold">Block {block.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-story-surface" style={{ color: bi === 0 ? "#00d4aa" : bi === 1 ? "#f5a623" : "#e05d6f" }}>
                  VPC = {block.vpc}/8
                </span>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-mono text-text-muted">
                <span>Erases: {block.erases}</span>
                <span className={`font-bold ${bi === 0 ? "text-nvme-green" : bi === 1 ? "text-nvme-amber" : "text-nvme-red"}`}>
                  GC: {block.gcScore}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {block.pages.map((p, pi) => (
                <motion.div
                  key={pi}
                  className="aspect-square rounded flex items-center justify-center text-[8px] font-mono font-bold border"
                  style={{
                    backgroundColor: p === "V" ? "#00d4aa15" : "#ed5f7415",
                    borderColor: p === "V" ? "#00d4aa" : "#ed5f74",
                    color: p === "V" ? "#00d4aa" : "#ed5f74",
                  }}
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: bi * 0.12 + pi * 0.03, type: "spring" }}
                >
                  {p}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-story-surface rounded-lg p-3 text-xs text-text-muted leading-relaxed">
        <strong className="text-nvme-green">Block A (VPC=2)</strong> is the best GC candidate —
        only 2 valid pages to copy. <strong className="text-nvme-red">Block C (VPC=7)</strong>{" "}
        would require copying 7 pages to reclaim just 1 free page — terrible efficiency.
        The GC engine uses the VPC table to make this decision in O(1) time.
      </div>
    </div>
  );
}

/* ─── Queue Depth Diagram ─── */
function QueueDepthDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const depths = [
    { qd: 1, iops: 15000, latency: "70μs", pct: 6 },
    { qd: 4, iops: 55000, latency: "73μs", pct: 22 },
    { qd: 8, iops: 100000, latency: "80μs", pct: 40 },
    { qd: 16, iops: 160000, latency: "100μs", pct: 64 },
    { qd: 32, iops: 220000, latency: "145μs", pct: 88 },
    { qd: 64, iops: 250000, latency: "256μs", pct: 100 },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
        Queue Depth — Filling the Pipeline
      </div>
      <p className="text-text-secondary text-xs mb-4 leading-relaxed">
        <strong className="text-text-primary">Queue Depth (QD)</strong> is how many commands are
        in-flight simultaneously — submitted to the SSD but not yet completed. A single
        NVMe submission queue can hold up to 65,535 entries. Higher QD lets the SSD&apos;s
        controller keep all its NAND dies busy in parallel.
      </p>

      {/* IOPS vs QD bar chart */}
      <div className="space-y-2 mb-4">
        {depths.map((d, i) => (
          <motion.div
            key={d.qd}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <div className="text-[10px] font-mono text-text-muted w-10 text-right flex-shrink-0">
              QD{d.qd}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <motion.div
                className="h-5 rounded flex items-center justify-end pr-2"
                style={{
                  backgroundColor: `${i < 3 ? "#00d4aa" : i < 5 ? "#f5a623" : "#e05d6f"}20`,
                  borderLeft: `3px solid ${i < 3 ? "#00d4aa" : i < 5 ? "#f5a623" : "#e05d6f"}`,
                }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${d.pct}%` } : {}}
                transition={{ delay: i * 0.08 + 0.15, duration: 0.5, ease: "easeOut" }}
              >
                <span className="text-[8px] font-mono font-bold text-text-primary whitespace-nowrap">
                  {(d.iops / 1000).toFixed(0)}K IOPS
                </span>
              </motion.div>
              <span className="text-[8px] font-mono text-text-muted flex-shrink-0">
                {d.latency} avg
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-story-surface rounded-lg p-3">
          <div className="text-nvme-green font-mono font-bold text-[10px] mb-1">QD1 — Single Command</div>
          <p className="text-text-muted text-[10px] leading-relaxed">
            Only 1 command in-flight. The CPU waits idle while the SSD reads NAND.
            Most NAND dies are idle. Measures <em>pure latency</em> but wastes bandwidth.
          </p>
        </div>
        <div className="bg-story-surface rounded-lg p-3">
          <div className="text-nvme-amber font-mono font-bold text-[10px] mb-1">QD16-32 — Sweet Spot</div>
          <p className="text-text-muted text-[10px] leading-relaxed">
            Enough commands to keep most NAND dies busy. Latency increases slightly
            but IOPS scales dramatically. This is the typical operating range for
            high-performance storage workloads.
          </p>
        </div>
        <div className="bg-story-surface rounded-lg p-3">
          <div className="text-nvme-red font-mono font-bold text-[10px] mb-1">QD64+ — Diminishing Returns</div>
          <p className="text-text-muted text-[10px] leading-relaxed">
            All dies are saturated — adding more commands just increases queue wait
            time. Latency climbs steeply while IOPS barely improves. The SSD is at
            maximum throughput.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── GC Block Lifecycle Flow ─── */
function GcBlockLifecycle() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const stages = [
    { label: "Free / Spare", color: "#f5a623", desc: "Erased, empty, ready for allocation" },
    { label: "Dynamic (Write Target)", color: "#00d4aa", desc: "Receiving host writes, VPC increasing" },
    { label: "Static (Cold Data)", color: "#635bff", desc: "Full, rarely updated, VPC stable at max" },
    { label: "Mixed (Stale + Valid)", color: "#7c5cfc", desc: "Some pages overwritten elsewhere, VPC decreasing" },
    { label: "Source (GC Candidate)", color: "#e05d6f", desc: "Low VPC, selected for garbage collection" },
    { label: "Erased → Free", color: "#f5a623", desc: "Valid pages copied out, block erased, returns to pool" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
        Block Lifecycle — From Spare to GC and Back
      </div>
      <p className="text-text-secondary text-xs mb-4 leading-relaxed">
        Every NAND block cycles through these stages. Understanding this lifecycle is
        key to understanding GC, wear leveling, and TRIM — they all operate on blocks
        at different stages.
      </p>

      <div className="flex flex-col gap-1">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.label}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-mono font-bold flex-shrink-0"
                style={{ backgroundColor: stage.color }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: stage.color }}>
                  {stage.label}
                </div>
                <div className="text-[10px] text-text-muted">{stage.desc}</div>
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className="flex justify-start ml-[15px]">
                <motion.div
                  className="w-0.5 h-3"
                  style={{ backgroundColor: stage.color }}
                  initial={{ scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : {}}
                  transition={{ delay: i * 0.1 + 0.1, duration: 0.2 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 bg-story-surface rounded-lg p-3 text-xs text-text-muted leading-relaxed">
        The cycle repeats continuously. A well-functioning SSD always has a healthy
        pool of spare/free blocks. When this pool shrinks (drive nearly full, or
        insufficient TRIM), the GC engine must work harder and more urgently — causing
        the performance degradation we see in nearly-full drives.
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function SsdOverview() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Inside the SSD — The Complete Picture
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          So far we&apos;ve seen the building blocks: bits, bytes, LBAs, and NAND cells
          organized into pages, blocks, and dies. <em className="text-text-primary">But
          how do all these pieces fit together inside an actual SSD?</em> An SSD
          isn&apos;t just a pile of NAND chips — it&apos;s a complete mini-computer.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why does an SSD need to be a computer?
          </em> Because someone has to manage all the complexity we just learned about
          — translating LBAs to physical pages, choosing which cells to write to,
          handling the read/write vs erase size mismatch, fixing bit errors,
          monitoring wear. That management software needs a processor, memory, and
          interfaces, just like a computer.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          An SSD has three main parts:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            <strong className="text-text-primary">Controller</strong> — The &ldquo;brain.&rdquo;
            A specialized processor (often ARM Cortex-R cores or proprietary RISC designs) that
            runs all the firmware managing the drive. It contains multiple engines: an NVMe
            frontend that parses commands, an FTL engine that manages address mapping, an ECC
            engine for error correction, and a NAND interface that talks to the flash chips.
          </li>
          <li>
            <strong className="text-text-primary">DRAM</strong> — Fast temporary memory
            (like your computer&apos;s RAM). <em className="text-text-primary">Why does
            the SSD need its own RAM?</em> To store the mapping table that translates
            LBAs to physical NAND locations. This table can be hundreds of MB for a large
            drive. Without DRAM, every read would need an extra NAND lookup first, adding
            latency.
          </li>
          <li>
            <strong className="text-text-primary">NAND Flash Packages</strong> — The actual
            storage chips where your data lives permanently. Multiple packages connected through
            separate <strong className="text-text-primary">channels</strong> allow parallel access —{" "}
            <em className="text-text-primary">this is the key to SSD speed</em>: the controller
            can read from many chips simultaneously. A typical consumer SSD has 4-8 channels,
            each with 1-2 NAND dies.
          </li>
        </ul>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The diagram below shows how these parts connect. The host computer talks to the
          controller through the PCIe bus (covered in the next lesson), and the controller
          manages everything else.
        </p>

        {/* SSD block diagram with animated data flow */}
        <SsdDiagram />

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-12">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-blue font-semibold mb-1">Controller</div>
            <p className="text-text-muted text-xs">
              Processes NVMe commands, manages FTL mapping, handles ECC, coordinates
              wear leveling, and manages the SLC write cache. Contains embedded CPU cores,
              hardware accelerators for ECC, and DMA engines for PCIe data transfer.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-violet font-semibold mb-1">DRAM</div>
            <p className="text-text-muted text-xs">
              Caches the FTL table for fast lookups (~4 bytes per LBA = ~4 GB for a 1 TB drive).
              Also serves as a read/write buffer. <em>DRAM-less SSDs</em> use HMB
              (Host Memory Buffer) — borrowing a slice of your computer&apos;s RAM instead.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-amber font-semibold mb-1">NAND Channels</div>
            <p className="text-text-muted text-xs">
              Each channel is an independent data path to a group of NAND dies. The controller
              can read/write different channels in parallel — 4 channels means 4x the bandwidth
              of a single channel. More channels = higher throughput and lower latency.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-green font-semibold mb-1">Link Width &amp; Link Speed</div>
            <p className="text-text-muted text-xs">
              The SSD connects to the host via PCIe. <strong>Link width</strong> (e.g., x4) is
              how many PCIe lanes the SSD uses — typically 4 for NVMe. <strong>Link speed</strong>{" "}
              (e.g., 16 GT/s for Gen 4) is how fast each lane transfers data. Together they determine
              the maximum bandwidth between the host and the SSD controller.
            </p>
          </div>
        </div>

        {/* ─── SSD Internals Deep Dive ─── */}
        <h4 className="text-xl font-bold text-text-primary mb-3" id="sec-ssd-internals">
          SSD Internals — Block Types, VPC, and Queue Depth
        </h4>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The controller&apos;s FTL firmware manages thousands of NAND blocks. To understand
          how <strong className="text-text-primary">garbage collection</strong>,{" "}
          <strong className="text-text-primary">wear leveling</strong>, and{" "}
          <strong className="text-text-primary">TRIM</strong> work (covered in{" "}
          <em className="text-text-primary">Lesson 10</em>), you need to understand
          how the FTL classifies and manages these blocks.
        </p>

        {/* VPC Diagram */}
        <VpcDiagram />

        {/* Block Types */}
        <BlockTypeDiagram />

        {/* GC Block Lifecycle */}
        <GcBlockLifecycle />

        {/* Queue Depth */}
        <QueueDepthDiagram />

        {/* Connection card */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-3">
            How It All Connects
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            These concepts form the foundation of SSD performance and longevity:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 bg-story-surface rounded-lg p-3">
              <div className="w-2 h-2 rounded-full bg-nvme-green flex-shrink-0 mt-1" />
              <span className="text-text-muted">
                <strong className="text-text-primary">VPC</strong> drives GC efficiency —
                the lower a block&apos;s VPC, the less copying needed. TRIM helps by
                reducing VPC on blocks with deleted data.
                <em className="text-text-secondary"> See Lesson 10: TRIM &amp; GC for the full GC animation.</em>
              </span>
            </div>
            <div className="flex items-start gap-2 bg-story-surface rounded-lg p-3">
              <div className="w-2 h-2 rounded-full bg-nvme-blue flex-shrink-0 mt-1" />
              <span className="text-text-muted">
                <strong className="text-text-primary">Block types</strong> determine how
                wear leveling distributes writes. Dynamic blocks handle hot data; static
                wear leveling rotates cold data off low-wear blocks.
                <em className="text-text-secondary"> See Lesson 10: Wear Leveling for details.</em>
              </span>
            </div>
            <div className="flex items-start gap-2 bg-story-surface rounded-lg p-3">
              <div className="w-2 h-2 rounded-full bg-nvme-amber flex-shrink-0 mt-1" />
              <span className="text-text-muted">
                <strong className="text-text-primary">Queue depth</strong> determines how
                well the controller can parallelize work across NAND dies. Higher QD =
                more parallelism = higher IOPS, but also higher latency.
                <em className="text-text-secondary"> See Lesson 5: Queues for how SQ/CQ enable this.</em>
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
