"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import RevealCard from "@/components/story/RevealCard";

function TransistorDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 sm:p-8 border border-story-border card-shadow mb-8">
      <h4 className="text-sm font-mono text-nvme-blue uppercase tracking-wider mb-6 text-center">
        Transistor — The Building Block of All Electronics
      </h4>
      <div className="max-w-xs mx-auto">
        <svg viewBox="0 0 200 160" className="w-full">
          {/* Gate */}
          <motion.rect
            x="60" y="10" width="80" height="30" rx="4"
            fill="#635bff10" stroke="#635bff" strokeWidth="2"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          />
          <text x="100" y="30" textAnchor="middle" className="fill-nvme-blue text-[10px] font-mono font-bold">
            Gate
          </text>

          {/* Insulator */}
          <motion.rect
            x="60" y="44" width="80" height="12" rx="2"
            fill="#e8a31710" stroke="#e8a317" strokeWidth="1" strokeDasharray="3,2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          />

          {/* Channel */}
          <motion.rect
            x="60" y="60" width="80" height="30" rx="4"
            fill="#00d4aa10" stroke="#00d4aa" strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.35 }}
          />

          {/* Source */}
          <motion.rect
            x="20" y="60" width="36" height="30" rx="4"
            fill="#00d4aa20" stroke="#00d4aa" strokeWidth="2"
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          />
          <text x="38" y="79" textAnchor="middle" className="fill-nvme-green text-[8px] font-mono font-bold">
            Source
          </text>

          {/* Drain */}
          <motion.rect
            x="144" y="60" width="36" height="30" rx="4"
            fill="#00d4aa20" stroke="#00d4aa" strokeWidth="2"
            initial={{ opacity: 0, x: 10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.45 }}
          />
          <text x="162" y="79" textAnchor="middle" className="fill-nvme-green text-[8px] font-mono font-bold">
            Drain
          </text>

          {/* Substrate */}
          <motion.rect
            x="20" y="95" width="160" height="30" rx="4"
            fill="#94a3b810" stroke="#94a3b8" strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          />
          <text x="100" y="114" textAnchor="middle" className="fill-text-muted text-[9px] font-mono">
            Silicon Substrate
          </text>

          {/* Labels */}
          <motion.text
            x="100" y="150"
            textAnchor="middle"
            className="fill-text-muted text-[8px] font-mono"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
          >
            Voltage on Gate controls current from Source to Drain
          </motion.text>
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="bg-nvme-green/5 border border-nvme-green/20 rounded-lg p-3 text-center"
        >
          <div className="text-nvme-green font-bold text-xs mb-1">Gate ON</div>
          <div className="text-text-muted text-[10px]">Current flows &rarr; &ldquo;1&rdquo;</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="bg-nvme-red/5 border border-nvme-red/20 rounded-lg p-3 text-center"
        >
          <div className="text-nvme-red font-bold text-xs mb-1">Gate OFF</div>
          <div className="text-text-muted text-[10px]">No current &rarr; &ldquo;0&rdquo;</div>
        </motion.div>
      </div>
    </div>
  );
}

function ScaleDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const items = [
    { label: "CPU (Apple M2)", count: "20 billion", color: "#635bff" },
    { label: "1 TB SSD (NAND)", count: "~8 trillion cells", color: "#e8a317" },
    { label: "DRAM (16 GB)", count: "~128 billion", color: "#00d4aa" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 border border-story-border card-shadow mb-8">
      <h4 className="text-sm font-mono text-nvme-blue uppercase tracking-wider mb-4 text-center">
        Transistor Count — Modern Chips
      </h4>
      <div className="space-y-3 max-w-sm mx-auto">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -15 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15 * i, duration: 0.4 }}
            className="flex items-center justify-between rounded-lg px-4 py-2"
            style={{
              backgroundColor: `${item.color}10`,
              border: `1px solid ${item.color}30`,
            }}
          >
            <span className="font-semibold text-xs" style={{ color: item.color }}>{item.label}</span>
            <span className="text-text-muted text-[10px] font-mono">{item.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function TransistorBasics() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-6">
          What Is a Transistor?
        </h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          Every digital device — CPUs, RAM, SSDs — is built from billions of tiny switches called{" "}
          <strong className="text-text-primary">transistors</strong>. A transistor is a microscopic
          electronic switch: apply voltage to its <strong className="text-text-primary">gate</strong>,
          and current flows between its <strong className="text-text-primary">source</strong> and{" "}
          <strong className="text-text-primary">drain</strong>. Remove the voltage, and current stops.
        </p>

        <AnalogyCard
          concept="A Transistor Is a Tiny Light Switch"
          analogy="Push the switch (apply voltage to the gate) and electricity flows — that's a '1'. Release it and the flow stops — that's a '0'. A CPU has billions of these switches flipping billions of times per second. An SSD's NAND cells are special transistors that can trap charge and remember their state even without power."
        />

        <TransistorDiagram />

        <p className="text-text-secondary leading-relaxed mb-4">
          <em className="text-text-primary">Why does this matter for SSDs?</em> Because NAND flash memory
          cells are a special type of transistor called a <strong className="text-text-primary">floating-gate
          transistor</strong>. Unlike regular transistors that forget their state when power is removed, floating-gate
          transistors can <em>trap electrons</em> in an insulated layer — this is how SSDs store data without
          power. We&apos;ll explore this in detail in Lesson 2.
        </p>

        <ScaleDiagram />

        <p className="text-text-secondary leading-relaxed mb-6">
          Modern SSDs contain trillions of these transistor cells, organized into a precise hierarchy
          (pages, blocks, planes, dies) that we&apos;ll learn about next. Understanding that they&apos;re
          all just tiny charge-trapping switches is the key intuition.
        </p>

        <RevealCard
          id="act0-transistor-reveal1"
          prompt="How many transistor cells does a modern 1TB SSD contain?"
          answerPreview="A very large number..."
          answer={<span>Approximately <strong className="text-nvme-amber">~8 trillion</strong> NAND cells. Each cell stores one or more bits, and a 1TB drive needs about 8 trillion bits (1 TB = 8 Tb). With multi-bit cells (TLC stores 3 bits per cell), the actual transistor count is around 2.7 trillion.</span>}
          hint="Think about what turns current flow on and off at the smallest scale."
          options={[
            "~8 trillion NAND cells (1 TB = 8 Tb, so at minimum one cell per bit)",
            "~500 billion NAND cells, since modern cells each store multiple bits",
            "~1 million per GB, so roughly 1 billion cells total",
            "~64 trillion cells — one per bit assuming QLC (4 bits per cell) density"
          ]}
          correctIndex={0}
        />

        <RevealCard
          id="act0-transistor-kc1"
          prompt="Why is a regular transistor useless for long-term data storage? What specific structural addition does a NAND cell have that solves this, and what would happen if that structure degraded?"
          answer="A regular transistor loses its state the instant power is removed — current either flows or it doesn't, with no memory. A NAND cell adds a floating gate, an extra conductive layer surrounded by oxide insulation that physically traps electrons. These trapped electrons shift the transistor's threshold voltage, encoding data that persists without power. If the oxide insulator degrades (from repeated program/erase cycles), electrons leak out or get stuck in the oxide itself, causing the cell to misread its stored voltage level — this is exactly how NAND cells wear out over time."
          hint="Consider which component acts as the fundamental on/off switch in all digital circuits."
          options={[
            "It uses a magnetic core instead of silicon to retain state",
            "It adds a floating gate surrounded by oxide insulation that traps electrons, enabling non-volatile storage",
            "It stores data in the transistor's base region using capacitive charge, similar to DRAM",
            "It uses a secondary power supply to maintain the gate voltage indefinitely"
          ]}
          correctIndex={1}
        />
      </div>
    </SectionWrapper>
  );
}
