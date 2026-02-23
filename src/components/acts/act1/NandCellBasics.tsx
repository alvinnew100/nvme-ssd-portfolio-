"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import RevealCard from "@/components/story/RevealCard";
import { CELL_TYPES, bellCurve } from "./nandData";

/* ─── Floating Gate Cross-Section ─── */
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

/* ─── Voltage Threshold Distribution ─── */
function VoltageDistributionDiagram({
  activeCell,
  onSelectCell,
}: {
  activeCell: number;
  onSelectCell: (i: number) => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const cell = CELL_TYPES[activeCell];

  const distributions = {
    SLC: { levels: 2, spread: 28, height: 70, labels: ["1", "0"] },
    MLC: { levels: 4, spread: 14, height: 60, labels: ["11", "10", "00", "01"] },
    TLC: { levels: 8, spread: 7, height: 50, labels: ["111", "110", "101", "100", "011", "010", "001", "000"] },
    QLC: { levels: 16, spread: 3.5, height: 40, labels: [] as string[] },
  };

  const dist = distributions[cell.name as keyof typeof distributions];
  const svgWidth = 400;
  const padding = 30;
  const usableWidth = svgWidth - padding * 2;

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
        Voltage Threshold Distributions
      </div>
      <p className="text-text-muted text-xs mb-4">
        Each bell curve shows the voltage distribution for one state. As you add more bits per cell,
        the curves squeeze closer together — increasing the chance of a misread.
      </p>

      <div className="flex gap-1 mb-4">
        {CELL_TYPES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => onSelectCell(i)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold transition-all ${
              i === activeCell
                ? "text-white"
                : "bg-story-surface text-text-muted hover:text-text-secondary"
            }`}
            style={i === activeCell ? { backgroundColor: c.color } : undefined}
          >
            {c.name}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${svgWidth} 120`} className="w-full max-w-[500px]">
        <line x1={padding} y1="105" x2={svgWidth - padding} y2="105" stroke="#ddd6ca" strokeWidth="1" />
        <text x={svgWidth / 2} y="118" textAnchor="middle" className="text-[8px] font-mono" fill="#9e9789">
          Threshold Voltage &rarr;
        </text>

        {Array.from({ length: dist.levels - 1 }).map((_, i) => {
          const gap = usableWidth / dist.levels;
          const x = padding + gap * (i + 1);
          return (
            <motion.line
              key={`thresh-${cell.name}-${i}`}
              x1={x} y1="10" x2={x} y2="105"
              stroke="#ef444460" strokeWidth="1" strokeDasharray="3,3"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.05 }}
            />
          );
        })}

        {Array.from({ length: dist.levels }).map((_, i) => {
          const gap = usableWidth / dist.levels;
          const centerX = padding + gap * i + gap / 2;
          const path = bellCurve(centerX, dist.spread, dist.height);
          const label = dist.labels[i] || "";

          return (
            <g key={`curve-${cell.name}-${i}`}>
              <motion.path
                d={path}
                fill={`${cell.color}15`}
                stroke={cell.color}
                strokeWidth="1.5"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={inView ? { opacity: 1, pathLength: 1 } : {}}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              />
              {label && dist.levels <= 8 && (
                <text
                  x={centerX}
                  y={100 - dist.height + 6}
                  textAnchor="middle"
                  className="text-[7px] font-mono font-bold"
                  fill={cell.color}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-text-secondary">
        <span className="text-nvme-red flex-shrink-0 mt-0.5">&#9888;</span>
        <span>
          The <span className="text-nvme-red font-mono">dashed red lines</span> are threshold voltages.
          When curves overlap these lines, the controller may misread the state — this is why
          {cell.name === "SLC" ? " SLC has virtually zero read errors." :
           cell.name === "MLC" ? " MLC needs stronger error correction than SLC." :
           cell.name === "TLC" ? " TLC requires sophisticated ECC (like LDPC)." :
           " QLC demands the most powerful ECC and read-retry algorithms."}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function NandCellBasics() {
  const [activeCell, setActiveCell] = useState(0);

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          How an SSD Actually Stores a Bit
        </h3>

        <AnalogyCard
          concept="NAND Cells Are Tiny Charge Buckets"
          analogy="Each NAND memory cell is like a tiny bucket that holds electrical charge. To store a '1', push charge into the bucket. To store a '0', leave it empty. The bucket is surrounded by insulation so the charge can't escape — that's why SSDs keep your data when power is off."
        />

        <TermDefinition term="NAND Flash Memory" definition="The type of non-volatile memory used in SSDs. Named after the NAND logic gate used in its circuit design. Stores data as electrical charges trapped in microscopic floating-gate transistors." />

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

        {/* Voltage threshold distribution diagram */}
        <VoltageDistributionDiagram activeCell={activeCell} onSelectCell={setActiveCell} />

        <RevealCard
          id="act1-nandbasics-kc1"
          prompt="Under what conditions do electrons leak from the floating gate, and what are the consequences for a powered-off SSD sitting on a shelf for years? How does prior wear affect this?"
          answer="Electrons slowly tunnel through the oxide insulator via quantum mechanical tunneling — a process called charge leakage or data retention loss. The rate depends heavily on temperature (heat provides energy for tunneling) and oxide degradation from prior P/E cycles. A fresh SSD can retain data for 10+ years at room temperature, but a heavily worn SSD (near its endurance limit) may only retain data for months because its oxide is damaged and leakier. This is why enterprise SSDs have stricter data retention specs at higher temperatures, and why it's risky to use a worn SSD for archival cold storage. Powered-on SSDs periodically refresh data (read and rewrite) to counteract leakage."
          hint="The name of each NAND type indicates how many bits each cell stores."
          options={[
            "Electrons escape when the drive exceeds its rated temperature for more than 24 hours",
            "Leakage only occurs during active read operations due to read disturb voltage",
            "Electrons slowly tunnel through oxide via quantum mechanics; worn oxide leaks faster, reducing retention from 10+ years to months",
            "Electrons are stable indefinitely — data loss in powered-off SSDs is caused by cosmic ray bit flips"
          ]}
          correctIndex={2}
        />
      </div>
    </SectionWrapper>
  );
}
