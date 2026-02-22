"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import RevealCard from "@/components/story/RevealCard";

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
              <div className="text-[7px] font-mono font-bold" style={{ color: bi.color }}>B{i}</div>
              <div className="text-[6px] font-mono text-text-muted">VPC:{block.vpc}</div>
              <div className="text-[6px] font-mono text-text-muted">PE:{block.eraseCount}</div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl p-4"
        style={{ backgroundColor: `${info.color}08`, borderLeft: `3px solid ${info.color}` }}
      >
        <div className="font-semibold text-sm mb-1" style={{ color: info.color }}>{info.label}</div>
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
    { label: "Erased \u2192 Free", color: "#f5a623", desc: "Valid pages copied out, block erased, returns to pool" },
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
                <div className="text-xs font-semibold" style={{ color: stage.color }}>{stage.label}</div>
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
export default function BlockManagement() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Block Management — VPC, Block Types, and GC
        </h3>
        <AnalogyCard
          concept="Block Management Is Like a Parking Garage"
          analogy="Think of NAND blocks as parking spaces in a garage. Some are actively being used (dynamic blocks), some hold cars that never move (static/cold blocks), and some are kept empty in reserve (spare blocks). The garage manager (FTL) tracks which spaces have the most abandoned cars (low VPC) and periodically clears them out (garbage collection) to free up space."
        />

        <TermDefinition term="VPC (Valid Page Count)" definition="The number of pages in a NAND block that still contain current, referenced data. Lower VPC means fewer valid pages to copy during garbage collection, making that block a more efficient candidate for reclamation." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The controller&apos;s FTL firmware manages thousands of NAND blocks. To understand
          how <strong className="text-text-primary">garbage collection</strong>,{" "}
          <strong className="text-text-primary">wear leveling</strong>, and{" "}
          <strong className="text-text-primary">TRIM</strong> work (covered in{" "}
          <em className="text-text-primary">Lesson 11</em>), you need to understand
          how the FTL classifies and manages these blocks.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why does block classification matter?</em>{" "}
          Because the FTL makes different decisions for different block types — where to
          write new data, what to move during wear leveling, and which blocks to erase
          during garbage collection. These decisions directly affect performance, endurance,
          and write amplification.
        </p>

        <VpcDiagram />
        <BlockTypeDiagram />
        <GcBlockLifecycle />

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
                <em className="text-text-secondary"> See Lesson 11: TRIM &amp; GC for the full GC animation.</em>
              </span>
            </div>
            <div className="flex items-start gap-2 bg-story-surface rounded-lg p-3">
              <div className="w-2 h-2 rounded-full bg-nvme-blue flex-shrink-0 mt-1" />
              <span className="text-text-muted">
                <strong className="text-text-primary">Block types</strong> determine how
                wear leveling distributes writes. Dynamic blocks handle hot data; static
                wear leveling rotates cold data off low-wear blocks.
                <em className="text-text-secondary"> See Lesson 11: Wear Leveling for details.</em>
              </span>
            </div>
          </div>
        </div>

        <RevealCard
          id="act1-block-quiz1"
          prompt="Why does the garbage collector prioritize blocks with the fewest valid pages rather than the oldest blocks or random blocks? What metric does it optimize, and what would happen if it chose blocks randomly instead?"
          answer="The GC engine picks the block with the lowest VPC (Valid Page Count) because it must copy all valid pages to a new block before erasing. Choosing the block with the fewest valid pages minimizes write amplification — the ratio of actual NAND writes to host-requested writes. A block with VPC=2 out of 256 pages requires copying only 2 pages to reclaim 254 free pages (excellent efficiency). A block with VPC=250 would require copying 250 pages to reclaim only 6 pages (terrible efficiency). Random selection would average these extremes, dramatically increasing write amplification, which accelerates wear and reduces the drive's effective lifespan. The GC maintains a VPC table in DRAM for O(1) lookup of the best candidate. Erase count, by contrast, is used for wear leveling decisions, not GC source selection — these are separate optimization goals."
        />
      </div>
    </SectionWrapper>
  );
}
