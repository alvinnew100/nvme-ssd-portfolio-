"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import FillInBlank from "@/components/story/FillInBlank";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";
import { CELL_TYPES } from "./nandData";

function EnduranceVisual({ activeCell }: { activeCell: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const cell = CELL_TYPES[activeCell];

  const stages = [
    { cycle: "0", label: "Fresh", trapped: 0, opacity: 0.1 },
    { cycle: "1K", label: "Light use", trapped: 2, opacity: 0.2 },
    { cycle: "10K", label: "Moderate", trapped: 5, opacity: 0.4 },
    { cycle: "50K", label: "Heavy use", trapped: 9, opacity: 0.6 },
    { cycle: "100K", label: "End of life", trapped: 14, opacity: 0.85 },
  ];

  return (
    <div ref={ref}>
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
                  <rect x="10" y="15" width="60" height="20" rx="3"
                    fill="#f5a62320" stroke="#f5a623" strokeWidth="1.5" />
                  <text x="40" y="28" textAnchor="middle" className="fill-nvme-amber text-[7px] font-mono">
                    Gate
                  </text>
                  <rect x="10" y="38" width="60" height="14" rx="2"
                    fill={`rgba(245, 166, 35, ${stage.opacity})`}
                    stroke="#f5a623" strokeWidth="1"
                    strokeDasharray={stage.trapped > 5 ? "2,2" : "3,2"} />
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

export default function NandEndurance() {
  const [activeCell, setActiveCell] = useState(2); // default TLC

  const cell = CELL_TYPES[activeCell];

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          NAND Endurance — How Long Cells Last
        </h3>

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

        {/* Cell type toggle */}
        <div className="flex gap-2 mb-6">
          {CELL_TYPES.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveCell(i)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                i === activeCell
                  ? "text-white"
                  : "bg-story-card text-text-muted hover:text-text-secondary border border-story-border"
              }`}
              style={i === activeCell ? { backgroundColor: c.color } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>

        <EnduranceVisual activeCell={activeCell} />

        <FillInBlank
          id="act1-endurance-fill1"
          prompt="A TLC cell can endure approximately {blank} P/E cycles."
          blanks={[{ answer: "3000", tolerance: 1000, placeholder: "?" }]}
          explanation="TLC cells typically survive ~3,000 P/E cycles. SLC is ~100K, MLC ~10K, and QLC ~1K. The more voltage levels, the faster the oxide degrades."
        />

        <KnowledgeCheck
          id="act1-endurance-kc1"
          question="What physically causes a NAND cell to wear out?"
          options={["Electrons trapped in oxide insulator", "The silicon substrate melts"]}
          correctIndex={0}
          explanation="Each high-voltage erase cycle pushes electrons through the oxide insulator. Some get permanently stuck (charge trapping), making the oxide leaky. Eventually, the floating gate can't hold charge at precise enough levels to distinguish between states."
        />
      </div>
    </SectionWrapper>
  );
}
