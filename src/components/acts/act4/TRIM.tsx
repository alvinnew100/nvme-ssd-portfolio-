"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import QuizCard from "@/components/story/QuizCard";

/* ─── GC animation data ─── */
type PageState = "valid" | "stale" | "free";

interface GcStep {
  title: string;
  description: string;
  why: string;
  blockA: PageState[];
  blockB: PageState[];
  highlight?: "copy" | "erase" | "done";
}

const GC_STEPS: GcStep[] = [
  {
    title: "Initial State — Block A is mixed",
    description: "Block A has 8 pages: 3 contain valid data (green), 5 are stale (red) — the data was overwritten elsewhere by the FTL. Block B is completely free (all pages erased and ready for writes).",
    why: "This is a common scenario after heavy usage. The FTL wrote new versions of the data to other blocks, but the old pages in Block A still physically exist — they just aren't referenced by the mapping table anymore.",
    blockA: ["valid", "stale", "valid", "stale", "stale", "stale", "valid", "stale"],
    blockB: ["free", "free", "free", "free", "free", "free", "free", "free"],
  },
  {
    title: "Step 1 — Copy valid pages to Block B",
    description: "The garbage collector reads the 3 valid pages from Block A and writes them to the beginning of Block B. The FTL mapping table is updated: those 3 LBAs now point to their new locations in Block B.",
    why: "This is the \"move\" step. The GC must preserve valid data before it can erase the block. These copies are internal NAND writes that the host never asked for — this is where Write Amplification comes from.",
    blockA: ["valid", "stale", "valid", "stale", "stale", "stale", "valid", "stale"],
    blockB: ["valid", "valid", "valid", "free", "free", "free", "free", "free"],
    highlight: "copy",
  },
  {
    title: "Step 2 — Erase Block A entirely",
    description: "Now that all valid data has been safely moved, the entire Block A is erased in one operation. Remember: you can't erase individual pages — only whole blocks. All 8 pages become free simultaneously.",
    why: "This is the erase step. It takes ~3-5ms for TLC NAND — much slower than a read (~50μs) or write (~500μs). The block's erase count increments by 1, bringing it one step closer to its P/E cycle limit.",
    blockA: ["free", "free", "free", "free", "free", "free", "free", "free"],
    blockB: ["valid", "valid", "valid", "free", "free", "free", "free", "free"],
    highlight: "erase",
  },
  {
    title: "Result — Block A is reclaimed",
    description: "Block A now has 8 free pages ready for new writes. Block B has the 3 valid pages plus 5 free pages. The SSD gained 8 usable pages by spending 3 internal writes and 1 block erase.",
    why: "The cost: 3 extra NAND writes (WAF contribution) and one erase cycle. The gain: 8 free pages. This is why having more stale pages in a block makes GC more efficient — fewer valid pages to copy means less write amplification.",
    blockA: ["free", "free", "free", "free", "free", "free", "free", "free"],
    blockB: ["valid", "valid", "valid", "free", "free", "free", "free", "free"],
    highlight: "done",
  },
];

const PAGE_COLORS: Record<PageState, { bg: string; border: string; label: string }> = {
  valid: { bg: "#00d4aa15", border: "#00d4aa", label: "Valid" },
  stale: { bg: "#ed5f7415", border: "#ed5f74", label: "Stale" },
  free:  { bg: "#f5f2ed", border: "#ddd6ca", label: "Free" },
};

function BlockDiagram({ pages, label, isHighlighted }: { pages: PageState[]; label: string; isHighlighted?: boolean }) {
  return (
    <div className={`rounded-xl p-3 transition-all ${isHighlighted ? "ring-2 ring-nvme-blue/40 bg-nvme-blue/5" : "bg-story-surface"}`}>
      <div className="text-text-muted text-[10px] font-mono mb-2 text-center">{label}</div>
      <div className="grid grid-cols-8 gap-1">
        {pages.map((state, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded flex items-center justify-center text-[8px] font-mono font-bold border"
            style={{
              backgroundColor: PAGE_COLORS[state].bg,
              borderColor: PAGE_COLORS[state].border,
              color: PAGE_COLORS[state].border,
            }}
            initial={false}
            animate={{ scale: [0.9, 1], opacity: [0.5, 1] }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            {state === "valid" ? "V" : state === "stale" ? "S" : "F"}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function TRIM() {
  const [gcStep, setGcStep] = useState(0);

  const goNext = () => setGcStep((s) => Math.min(s + 1, GC_STEPS.length - 1));
  const goPrev = () => setGcStep((s) => Math.max(s - 1, 0));

  const currentGc = GC_STEPS[gcStep];

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          TRIM and GC &mdash; Keeping the SSD Fast
        </h3>
        <AnalogyCard
          concept="TRIM Bridges the Information Gap"
          analogy="When you delete a file, the filesystem marks those blocks as free — but the SSD doesn't know this. Without TRIM, the SSD thinks those blocks still contain valid data and wastes effort preserving them during garbage collection. TRIM is the message that says 'hey, these LBAs are no longer needed — you can erase them whenever.'"
        />

        <TermDefinition term="TRIM (Dataset Management)" definition="An NVMe command (opcode 0x09) that tells the SSD which LBAs are no longer in use by the filesystem. This allows the SSD to mark those pages as invalid immediately, improving garbage collection efficiency and reducing write amplification." />

        <TermDefinition term="Garbage Collection (GC)" definition="A background process in the SSD firmware that reclaims space from blocks containing stale/invalid pages. GC copies valid pages to a new block, then erases the old block to create free space for new writes." />

        {/* ─── Section 1: The Problem ─── */}
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          In Lesson 3, we learned about the FTL — the Flash Translation Layer that
          writes data to <em>new</em> pages instead of overwriting old ones. Old
          pages become &ldquo;stale.&rdquo; We also learned that erasing happens at
          the <em>block</em> level (hundreds of pages at once).
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But who cleans up those stale pages?</em>{" "}
          And <em className="text-text-primary">when?</em> If nobody cleans them up,
          the drive will eventually run out of free pages and have nowhere to write
          new data. This cleanup process is called <strong className="text-text-primary">
          Garbage Collection (GC)</strong>.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But here&apos;s a deeper question:</em>{" "}
          how does the SSD know which pages are stale? It knows about pages it
          overwrote (it updated the FTL mapping). But what about pages belonging to{" "}
          <em>deleted files</em>?
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          When you delete a file, the filesystem marks those LBAs as free in its own
          records. <em className="text-text-primary">But it doesn&apos;t tell the
          SSD.</em> Why would it? The filesystem just updates its own metadata. The
          SSD still thinks those pages hold valid data. During garbage collection,
          it will waste time copying those &ldquo;valid&rdquo; pages to a new block &mdash;
          burning through NAND write cycles for data that nobody needs anymore. <strong className="text-text-primary">
          This is the problem TRIM solves.</strong>
        </p>

        {/* ─── Section 2: TRIM Explained ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            What TRIM Does — Bridging the Information Gap
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            <strong className="text-text-primary">TRIM</strong> (via the NVMe Dataset
            Management command, opcode <code className="text-text-code">0x09</code>)
            is a message from the OS to the SSD: <em>&ldquo;These LBA ranges are no
            longer used — you can treat them as free.&rdquo;</em> It bridges the
            information gap between filesystem and SSD.
          </p>

          {/* Before/After TRIM comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-red font-mono font-bold text-xs mb-2">
                Without TRIM
              </div>
              <div className="space-y-1.5 text-text-secondary text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">1.</span>
                  <span>You delete a 1GB file</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">2.</span>
                  <span>Filesystem marks LBAs as free</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">3.</span>
                  <span>SSD doesn&apos;t know — still sees data as valid</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">4.</span>
                  <span>During GC, SSD copies these &ldquo;valid&rdquo; pages</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-nvme-red flex-shrink-0 font-bold">!</span>
                  <span className="text-nvme-red font-semibold">More copying = more NAND writes = higher WAF = shorter drive life</span>
                </div>
              </div>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                With TRIM
              </div>
              <div className="space-y-1.5 text-text-secondary text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">1.</span>
                  <span>You delete a 1GB file</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">2.</span>
                  <span>Filesystem marks LBAs as free</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">3.</span>
                  <span>OS sends TRIM command to SSD</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-text-muted flex-shrink-0">4.</span>
                  <span>SSD marks those pages as stale in FTL</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-nvme-green flex-shrink-0 font-bold">✓</span>
                  <span className="text-nvme-green font-semibold">GC skips them = less copying = lower WAF = longer drive life</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Section 3: How GC Works — Interactive Animation ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            How Garbage Collection Works — Step by Step
          </h4>
          <p className="text-text-secondary text-sm mb-2 leading-relaxed max-w-3xl">
            <em className="text-text-primary">Let&apos;s watch GC in action.</em> The
            SSD picks a block with many stale pages (Block A), copies the valid pages
            to a free block (Block B), then erases Block A to reclaim it. Use the
            buttons to step through the process:
          </p>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-text-muted text-xs font-mono">
              Step {gcStep + 1} of {GC_STEPS.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                disabled={gcStep === 0}
                className="px-3 py-1.5 bg-story-surface text-text-secondary rounded-lg text-xs font-semibold hover:bg-story-border disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              <button
                onClick={goNext}
                disabled={gcStep === GC_STEPS.length - 1}
                className="px-4 py-1.5 bg-nvme-blue text-white rounded-lg text-xs font-semibold hover:shadow-md disabled:opacity-30 transition-all"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Step progress */}
          <div className="flex gap-1 mb-5">
            {GC_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setGcStep(i)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i <= gcStep ? "bg-nvme-green" : "bg-story-border"
                }`}
              />
            ))}
          </div>

          {/* Block diagrams */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <BlockDiagram
              pages={currentGc.blockA}
              label="Block A (source)"
              isHighlighted={currentGc.highlight === "erase"}
            />
            <BlockDiagram
              pages={currentGc.blockB}
              label="Block B (destination)"
              isHighlighted={currentGc.highlight === "copy"}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-center mb-5">
            {(["valid", "stale", "free"] as PageState[]).map((state) => (
              <div key={state} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded border"
                  style={{
                    backgroundColor: PAGE_COLORS[state].bg,
                    borderColor: PAGE_COLORS[state].border,
                  }}
                />
                <span className="text-text-muted text-[10px] font-mono">{PAGE_COLORS[state].label}</span>
              </div>
            ))}
          </div>

          {/* Arrow between blocks */}
          <AnimatePresence mode="wait">
            {currentGc.highlight === "copy" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-4"
              >
                <div className="px-3 py-1 rounded-full bg-nvme-blue/10 text-nvme-blue text-[10px] font-mono">
                  Copying 3 valid pages → Block B
                </div>
              </motion.div>
            )}
            {currentGc.highlight === "erase" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-4"
              >
                <div className="px-3 py-1 rounded-full bg-nvme-amber/10 text-nvme-amber text-[10px] font-mono">
                  Erasing all pages in Block A
                </div>
              </motion.div>
            )}
            {currentGc.highlight === "done" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-4"
              >
                <div className="px-3 py-1 rounded-full bg-nvme-green/10 text-nvme-green text-[10px] font-mono">
                  Block A reclaimed — 8 free pages available
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step explanation */}
          <div className="bg-story-surface rounded-xl p-4">
            <div className="text-text-primary font-semibold text-sm mb-1">
              {currentGc.title}
            </div>
            <p className="text-text-secondary text-xs leading-relaxed mb-2">
              {currentGc.description}
            </p>
            <p className="text-xs italic leading-relaxed" style={{ color: "#635bff" }}>
              {currentGc.why}
            </p>
          </div>
        </div>

        {/* ─── Section 4: GC Deep Dive ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            GC Deep Dive &mdash; When, How, and the Costs
          </h4>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed max-w-3xl">
            Recall from <em className="text-text-primary">Lesson 3: SSD Architecture</em>{" "}
            that every block has a <strong className="text-text-primary">VPC (Valid Page Count)</strong> —
            the number of pages still holding current data. GC uses the VPC table to pick{" "}
            <strong className="text-text-primary">source blocks</strong> (lowest VPC = best candidate)
            and copies their valid pages to <strong className="text-text-primary">spare blocks</strong>{" "}
            before erasing. TRIM directly lowers VPC by telling the SSD which pages are no longer
            needed — making GC faster and cheaper.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-story-card rounded-2xl p-5 card-shadow">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                Background GC (Idle GC) — Uses Spare Blocks
              </div>
              <p className="text-text-secondary text-xs leading-relaxed mb-2">
                Runs when the SSD detects idle time — no host commands for a while.
                The controller proactively reclaims blocks so free pages are ready
                when writes arrive.
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>Why is this better?</em> Because it happens when nobody is waiting.
                No impact on your read/write performance. This is why SSDs can feel
                faster after sitting idle for a few minutes.
              </p>
            </div>
            <div className="bg-story-card rounded-2xl p-5 card-shadow">
              <div className="text-nvme-amber font-mono font-bold text-xs mb-2">
                Foreground GC (Urgent GC)
              </div>
              <p className="text-text-secondary text-xs leading-relaxed mb-2">
                Triggered when the SSD runs critically low on free pages and a write
                command arrives. The controller <em>must</em> free space before it can
                complete the write.
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>Why is this bad?</em> Because your write is waiting. The host
                sent a write command and the SSD can&apos;t process it until GC
                finishes. This causes the latency spikes you see in benchmarks
                when a drive is nearly full.
              </p>
            </div>
          </div>

          <div className="bg-story-card rounded-2xl p-5 card-shadow mb-6">
            <div className="text-text-primary font-semibold text-sm mb-3">
              What Makes GC Choose a Block?
            </div>
            <p className="text-text-secondary text-xs leading-relaxed mb-3">
              <em className="text-text-primary">Not all blocks are equally good
              candidates for GC.</em> The controller picks blocks based on:
            </p>
            <div className="space-y-2">
              {[
                { factor: "Stale page ratio", desc: "Blocks with more stale pages are better candidates — fewer valid pages to copy means lower WAF", color: "#00d4aa" },
                { factor: "Erase count", desc: "To balance wear leveling, the controller may prefer blocks with lower erase counts (giving worn blocks a rest)", color: "#635bff" },
                { factor: "Age of data", desc: "\"Cold\" data (rarely updated) may be moved to high-wear blocks, freeing low-wear blocks for hot data", color: "#7c5cfc" },
                { factor: "Block health", desc: "Blocks with increasing bit error rates may be retired proactively, moving data out before failure", color: "#f5a623" },
              ].map((item) => (
                <div key={item.factor} className="flex items-start gap-3 bg-story-surface rounded-lg p-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="text-text-primary text-xs font-semibold">{item.factor}</span>
                    <span className="text-text-muted text-xs"> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Section 5: Over-Provisioning ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Over-Provisioning &mdash; The GC Safety Net
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">If GC needs free blocks to work, what
            happens when the drive is 100% full?</em> This is where{" "}
            <strong className="text-text-primary">over-provisioning (OP)</strong>{" "}
            comes in. The drive reserves a percentage of its total NAND capacity that
            the host can never see or write to.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="bg-story-surface rounded-xl p-3 text-center">
              <div className="text-text-primary font-mono font-bold text-sm">7%</div>
              <div className="text-text-muted text-[10px]">Consumer SSDs (typical)</div>
              <div className="text-text-muted text-[10px]">1TB drive = ~70GB reserved</div>
            </div>
            <div className="bg-story-surface rounded-xl p-3 text-center">
              <div className="text-text-primary font-mono font-bold text-sm">28%</div>
              <div className="text-text-muted text-[10px]">Enterprise SSDs (typical)</div>
              <div className="text-text-muted text-[10px]">1TB NAND = ~720GB usable</div>
            </div>
            <div className="bg-story-surface rounded-xl p-3 text-center">
              <div className="text-text-primary font-mono font-bold text-sm">50%+</div>
              <div className="text-text-muted text-[10px]">Write-intensive enterprise</div>
              <div className="text-text-muted text-[10px]">Maximum GC headroom</div>
            </div>
          </div>
          <p className="text-text-muted text-[10px] italic">
            More over-provisioning means: more free blocks for GC → less foreground GC →
            more consistent performance → lower WAF → longer drive life. The tradeoff is
            less usable capacity.
          </p>
        </div>

        {/* ─── Section 6: TRIM Modes ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            TRIM in Practice &mdash; Continuous vs Periodic
          </h4>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed max-w-3xl">
            <em className="text-text-primary">If TRIM is so important, should you
            run it constantly?</em> There are two approaches, each with tradeoffs:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-story-card rounded-2xl p-5 card-shadow">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-2">
                Continuous TRIM (discard)
              </div>
              <NvmeCliBlock
                command="mount -o discard /dev/nvme0n1p1 /mnt"
                note="TRIM sent immediately on every file delete"
              />
              <div className="mt-3 space-y-1 text-text-muted text-[10px]">
                <div className="flex items-start gap-1">
                  <span className="text-nvme-green">+</span>
                  <span>SSD always has up-to-date information</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-nvme-red">−</span>
                  <span>Can cause latency spikes during heavy file deletion</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-nvme-red">−</span>
                  <span>Many small TRIMs are less efficient than one batch</span>
                </div>
              </div>
            </div>
            <div className="bg-story-card rounded-2xl p-5 card-shadow">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                Periodic TRIM (fstrim)
              </div>
              <NvmeCliBlock
                command="sudo fstrim -v /mnt"
                note="TRIMs all free space at once — run weekly via systemd timer"
              />
              <div className="mt-3 space-y-1 text-text-muted text-[10px]">
                <div className="flex items-start gap-1">
                  <span className="text-nvme-green">+</span>
                  <span>No impact on normal file operations</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-nvme-green">+</span>
                  <span>Batched TRIM is more efficient for the SSD</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-nvme-red">−</span>
                  <span>Stale pages build up between runs</span>
                </div>
              </div>
            </div>
          </div>

          <NvmeCliBlock
            command="nvme dsm /dev/nvme0n1 -d --slbs=0 --blocks=256"
            note="Raw NVMe TRIM: deallocate 256 blocks starting at LBA 0. -d = deallocate flag."
          />
        </div>

        {/* ─── Section 7: The Full Picture ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            The Connection: TRIM → GC → WAF → Drive Life
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            These concepts form a chain — each one affects the next:
          </p>
          <div className="flex flex-col gap-2">
            {[
              { step: "TRIM tells the SSD which pages are stale", icon: "📨", color: "#38bdf8" },
              { step: "GC uses this info to skip stale pages during cleanup", icon: "♻️", color: "#00d4aa" },
              { step: "Fewer copies during GC = lower Write Amplification Factor", icon: "📉", color: "#635bff" },
              { step: "Lower WAF = fewer NAND writes = slower wear", icon: "⏳", color: "#7c5cfc" },
              { step: "Slower wear = longer drive life + consistent performance", icon: "✓", color: "#00b894" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: `${item.color}10` }}>
                  {item.icon}
                </div>
                <div className="flex-1 text-xs text-text-secondary">
                  {item.step}
                </div>
                {i < 4 && (
                  <div className="text-text-muted text-xs">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <InfoCard variant="note" title="Why a nearly-full SSD slows down">
          When a drive is 90%+ full, there are very few free blocks. Background GC
          has limited room to work. Writes trigger foreground GC, which blocks your
          I/O. Combined with less over-provisioning headroom, this is why SSD performance
          degrades significantly when nearly full. <em>General rule: keep at least
          10-20% free space for consistent performance.</em>
        </InfoCard>

        <QuizCard
          id="act4-trim-quiz1"
          question="What problem does TRIM solve?"
          options={[
            { text: "Speeds up sequential reads", explanation: "TRIM doesn't directly affect read speed. Its benefit is about write performance and endurance." },
            { text: "Tells the SSD which blocks are no longer in use, reducing GC overhead", correct: true, explanation: "Correct! When you delete a file, the OS knows those LBAs are free, but the SSD doesn't — it still sees them as valid data. TRIM bridges this gap by telling the SSD which LBAs are no longer needed, allowing it to mark pages as stale and improve GC efficiency." },
            { text: "Encrypts data at rest", explanation: "Encryption is handled by different mechanisms (TCG Opal, AES). TRIM is about space management." },
            { text: "Increases the drive's physical capacity", explanation: "TRIM doesn't add capacity. It helps the SSD manage existing free space more efficiently." },
          ]}
        />
      </div>
    </SectionWrapper>
  );
}
