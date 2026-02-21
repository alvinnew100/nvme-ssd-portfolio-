"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
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

function EnduranceVisual({ activeCell }: { activeCell: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const cell = CELL_TYPES[activeCell];

  // Degradation stages for the oxide layer animation
  const stages = [
    { cycle: "0", label: "Fresh", trapped: 0, opacity: 0.1 },
    { cycle: "1K", label: "Light use", trapped: 2, opacity: 0.2 },
    { cycle: "10K", label: "Moderate", trapped: 5, opacity: 0.4 },
    { cycle: "50K", label: "Heavy use", trapped: 9, opacity: 0.6 },
    { cycle: "100K", label: "End of life", trapped: 14, opacity: 0.85 },
  ];

  return (
    <div ref={ref} className="mt-6 pt-6 border-t border-story-border">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Endurance &mdash; How Long a Cell Lasts
      </div>

      {/* What is endurance */}
      <div className="bg-nvme-blue/5 rounded-xl p-4 border border-nvme-blue/20 mb-6">
        <p className="text-text-secondary text-sm leading-relaxed">
          <strong className="text-text-primary">Endurance</strong> is a measure of how many times a NAND
          cell can be written to and erased before it becomes unreliable. Every time you write data and later
          erase the block to make room for new data, that counts as one <strong className="text-text-primary">
          P/E (Program/Erase) cycle</strong>. The endurance rating (e.g., &ldquo;~100,000 P/E&rdquo;) tells
          you the maximum number of these cycles the cell is designed to survive. After that, the cell&apos;s
          oxide insulator is too damaged to reliably store charge, and bit errors increase beyond what error
          correction can handle.
        </p>
        <p className="text-text-secondary text-xs mt-2 leading-relaxed">
          <em className="text-text-primary">Why does this matter?</em> Because the cell type you choose
          (SLC/MLC/TLC/QLC) directly determines how long the drive lasts. The current cell type
          ({cell.name}) has an endurance of <strong className="text-text-primary">{cell.endurance}</strong> cycles.
          Here&apos;s why:
        </p>
      </div>

      {/* Oxide degradation animation */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="flex-1">
          <div className="text-text-muted text-[10px] font-mono mb-2">
            Oxide degradation over P/E cycles
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.cycle}
                className="flex flex-col items-center min-w-[80px]"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.4 }}
              >
                <svg viewBox="0 0 80 100" className="w-full max-w-[80px]">
                  {/* Floating gate */}
                  <rect x="10" y="15" width="60" height="20" rx="3"
                    fill="#f5a62320" stroke="#f5a623" strokeWidth="1.5" />
                  <text x="40" y="28" textAnchor="middle" className="fill-nvme-amber text-[7px] font-mono">
                    Gate
                  </text>

                  {/* Oxide layer — gets increasingly damaged */}
                  <rect x="10" y="38" width="60" height="14" rx="2"
                    fill={`rgba(245, 166, 35, ${stage.opacity})`}
                    stroke="#f5a623" strokeWidth="1"
                    strokeDasharray={stage.trapped > 5 ? "2,2" : "3,2"} />

                  {/* Trapped electrons in oxide (damage) */}
                  {Array.from({ length: stage.trapped }).map((_, ei) => (
                    <motion.circle
                      key={ei}
                      cx={15 + (ei % 7) * 8}
                      cy={42 + Math.floor(ei / 7) * 5}
                      r="2"
                      fill="#ef4444"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={inView ? { opacity: 0.8, scale: 1 } : {}}
                      transition={{ delay: i * 0.15 + ei * 0.03, duration: 0.3 }}
                    />
                  ))}

                  {/* Substrate */}
                  <rect x="10" y="55" width="60" height="20" rx="3"
                    fill="#635bff10" stroke="#635bff" strokeWidth="1" />
                  <text x="40" y="68" textAnchor="middle" className="fill-nvme-blue text-[6px] font-mono">
                    Silicon
                  </text>
                </svg>
                <div className="text-text-primary text-[10px] font-mono font-bold">{stage.cycle}</div>
                <div className="text-text-muted text-[8px]">{stage.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[9px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500/80" /> Trapped electrons (oxide damage)
            </span>
          </div>
        </div>

        <div className="sm:w-64 space-y-3">
          <motion.div
            className="bg-nvme-amber/5 rounded-xl p-3 border-l-3 border-nvme-amber/40"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <div className="text-nvme-amber text-xs font-bold mb-1">What is a P/E cycle?</div>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              One <strong className="text-text-primary">Program</strong> (write) + <strong className="text-text-primary">Erase</strong> cycle.
              Each time you write data and later erase the block to make room, that&apos;s one P/E cycle counted against the cell&apos;s lifespan.
            </p>
          </motion.div>
          <motion.div
            className="bg-nvme-red/5 rounded-xl p-3 border-l-3 border-nvme-red/40"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <div className="text-nvme-red text-xs font-bold mb-1">Why cells wear out</div>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Each erase forces high voltage through the oxide insulator. Over time, electrons get
              permanently stuck in the oxide (<em className="text-text-primary">charge trapping</em>), making it leaky.
              Eventually, the floating gate can&apos;t reliably hold charge at the right level.
            </p>
          </motion.div>
        </div>
      </div>

      {/* More levels = faster wear + TBW + what happens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div
          className="bg-story-surface rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <div className="font-mono font-bold text-xs mb-1" style={{ color: cell.color }}>
            More levels = faster wear
          </div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            SLC only distinguishes 2 levels (big margin), so it tolerates more oxide damage.
            QLC distinguishes 16 levels (tiny margins) &mdash; even small oxide degradation
            causes read errors. That&apos;s why SLC lasts ~100K cycles but QLC only ~1K.
          </p>
        </motion.div>
        <motion.div
          className="bg-story-surface rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <div className="font-mono font-bold text-nvme-blue text-xs mb-1">
            TBW (Terabytes Written)
          </div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            The manufacturer&apos;s rated endurance for the whole drive. Example: 600 TBW on a 1TB TLC
            drive means ~600 full-drive writes before expected failures. TBW = drive capacity &times; P/E
            cycles &times; write amplification factor.
          </p>
        </motion.div>
        <motion.div
          className="bg-story-surface rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
        >
          <div className="font-mono font-bold text-nvme-green text-xs mb-1">
            What happens at 100%?
          </div>
          <p className="text-text-muted text-[11px] leading-relaxed">
            The drive doesn&apos;t instantly die. Error correction (ECC) handles increasing bit errors
            as oxide degrades. But eventually errors exceed what ECC can fix, and sectors become
            unreadable. SMART attribute &ldquo;Percentage Used&rdquo; tracks this.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FloatingGateVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        How a NAND Cell Stores a Bit — The Floating Gate
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Transistor cross-section */}
        <div className="flex-1 flex justify-center">
          <svg viewBox="0 0 240 200" className="w-full max-w-[240px]">
            {/* Substrate */}
            <motion.rect
              x="20" y="150" width="200" height="40" rx="4"
              fill="#635bff10" stroke="#635bff" strokeWidth="1.5"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
            />
            <text x="120" y="175" textAnchor="middle" className="fill-nvme-blue text-[10px] font-mono">
              Silicon Substrate
            </text>

            {/* Source & Drain */}
            <motion.rect
              x="30" y="130" width="40" height="25" rx="3"
              fill="#00d4aa20" stroke="#00d4aa" strokeWidth="1.5"
              initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            />
            <text x="50" y="146" textAnchor="middle" className="fill-nvme-green text-[8px] font-mono font-bold">
              Source
            </text>
            <motion.rect
              x="170" y="130" width="40" height="25" rx="3"
              fill="#00d4aa20" stroke="#00d4aa" strokeWidth="1.5"
              initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 }}
            />
            <text x="190" y="146" textAnchor="middle" className="fill-nvme-green text-[8px] font-mono font-bold">
              Drain
            </text>

            {/* Oxide layer */}
            <motion.rect
              x="70" y="110" width="100" height="20" rx="2"
              fill="#f5a62310" stroke="#f5a623" strokeWidth="1" strokeDasharray="3,2"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            />
            <text x="120" y="124" textAnchor="middle" className="fill-nvme-amber text-[7px] font-mono">
              Oxide (insulator)
            </text>

            {/* Floating gate */}
            <motion.rect
              x="75" y="80" width="90" height="28" rx="4"
              fill="#f5a62330" stroke="#f5a623" strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4, type: "spring" }}
            />
            <text x="120" y="98" textAnchor="middle" className="fill-nvme-amber text-[9px] font-mono font-bold">
              Floating Gate
            </text>

            {/* Electrons trapped inside */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.circle
                key={i}
                cx={88 + i * 16} cy={88}
                r="3"
                fill="#f5a623"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: [0, 1, 0.7], scale: [0, 1.2, 1] } : {}}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              />
            ))}

            {/* Oxide layer top */}
            <motion.rect
              x="70" y="68" width="100" height="12" rx="2"
              fill="#f5a62310" stroke="#f5a623" strokeWidth="1" strokeDasharray="3,2"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.35 }}
            />

            {/* Control gate */}
            <motion.rect
              x="75" y="40" width="90" height="26" rx="4"
              fill="#635bff20" stroke="#635bff" strokeWidth="2"
              initial={{ opacity: 0, y: -10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, type: "spring" }}
            />
            <text x="120" y="57" textAnchor="middle" className="fill-nvme-blue text-[9px] font-mono font-bold">
              Control Gate
            </text>

            {/* Arrow label */}
            <text x="120" y="18" textAnchor="middle" className="fill-text-muted text-[8px] font-mono">
              Voltage applied here →
            </text>
          </svg>
        </div>

        {/* Explanation */}
        <div className="flex-1 space-y-3">
          <motion.div
            className="bg-nvme-amber/5 rounded-xl p-3 border-l-3 border-nvme-amber/40"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <div className="text-nvme-amber text-xs font-bold mb-1">Floating Gate</div>
            <p className="text-text-secondary text-xs leading-relaxed">
              Electrons are trapped here by insulating oxide layers above and below.
              Once pushed in, they stay — even without power. That&apos;s non-volatile storage.
            </p>
          </motion.div>
          <motion.div
            className="bg-nvme-blue/5 rounded-xl p-3 border-l-3 border-nvme-blue/40"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6 }}
          >
            <div className="text-nvme-blue text-xs font-bold mb-1">Write (Program)</div>
            <p className="text-text-secondary text-xs leading-relaxed">
              High voltage on the control gate pushes electrons into the floating gate.
            </p>
          </motion.div>
          <motion.div
            className="bg-nvme-green/5 rounded-xl p-3 border-l-3 border-nvme-green/40"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.7 }}
          >
            <div className="text-nvme-green text-xs font-bold mb-1">Read</div>
            <p className="text-text-secondary text-xs leading-relaxed">
              A medium voltage is applied. If electrons are present, current is blocked (= &ldquo;0&rdquo;).
              If empty, current flows (= &ldquo;1&rdquo;).
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

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
          them into numbered blocks (LBAs). <em className="text-text-primary">But
          how does an SSD physically store a bit?</em> It doesn&apos;t have spinning
          platters like a hard drive. Instead, it uses <strong className="text-text-primary">
          NAND flash memory</strong>.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think of each memory cell as a <strong className="text-text-primary">tiny bucket
          that holds electrical charge</strong>. To store a &ldquo;1&rdquo;, you put charge
          in the bucket. To store a &ldquo;0&rdquo;, you leave it empty. To read the
          value, you check how much charge is in the bucket.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But how does the charge stay there when
          you unplug the power?</em> The bucket is actually a microscopic structure
          called a <strong className="text-text-primary">floating gate</strong> — a
          layer of material surrounded by insulation that <em>traps</em> electrons.
          Once electrons are pushed in, they can&apos;t escape (for years). That&apos;s
          why SSDs keep your data when power is off — the charge is physically trapped.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Here&apos;s the clever part: <em className="text-text-primary">what if you
          could store more than 1 bit per cell?</em> Instead of just &ldquo;empty&rdquo;
          or &ldquo;full,&rdquo; you can have 4, 8, or even 16 distinct charge levels
          in the same cell. Each level represents a different bit pattern.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But what&apos;s the catch?</em> More
          levels per cell means more storage, but it&apos;s harder to read accurately
          (the levels are closer together), slower to write, and the cell wears out
          faster. It&apos;s a fundamental tradeoff between capacity, speed, and
          durability. Click each type below to compare:
        </p>

        {/* Floating gate diagram */}
        <FloatingGateVisual />

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
                { label: "Storage Density", values: [1, 2, 3, 4], icon: "capacity" },
                { label: "Read Speed", values: [100, 75, 60, 40], icon: "speed" },
                { label: "Endurance", values: [100, 30, 10, 3], icon: "endurance" },
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

          {/* Endurance explanation */}
          <EnduranceVisual activeCell={activeCell} />
        </div>
      </div>
    </SectionWrapper>
  );
}
