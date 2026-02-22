"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import FillInBlank from "@/components/story/FillInBlank";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

function BusDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const components = [
    { label: "CPU", color: "#635bff", x: 0 },
    { label: "RAM", color: "#00d4aa", x: 1 },
    { label: "SSD (NVMe)", color: "#e8a317", x: 2 },
    { label: "GPU", color: "#7c5cfc", x: 3 },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 sm:p-8 border border-story-border card-shadow mb-8">
      <h4 className="text-sm font-mono text-nvme-blue uppercase tracking-wider mb-6 text-center">
        The Bus — A Shared Highway Between Components
      </h4>
      <div className="max-w-md mx-auto">
        {/* Components */}
        <div className="flex items-start justify-center gap-4 mb-4">
          {components.map((comp, i) => (
            <motion.div
              key={comp.label}
              initial={{ opacity: 0, y: -15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
              className="text-center"
            >
              <div
                className="rounded-xl px-3 py-3 border"
                style={{
                  backgroundColor: `${comp.color}10`,
                  borderColor: `${comp.color}40`,
                }}
              >
                <div className="font-bold text-xs" style={{ color: comp.color }}>{comp.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection lines */}
        <div className="flex justify-center gap-4 mb-2">
          {components.map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="w-0.5 h-4 bg-nvme-blue/30 mx-auto"
              style={{ width: 2 }}
            />
          ))}
        </div>

        {/* Bus bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-nvme-blue/10 border border-nvme-blue/30 rounded-lg px-4 py-2 text-center relative overflow-hidden"
        >
          <span className="text-nvme-blue text-xs font-mono font-semibold relative z-10">
            PCIe Bus (high-speed data highway)
          </span>
          {/* Animated packet */}
          <motion.div
            className="absolute h-full w-8 top-0 bg-nvme-blue/10 rounded"
            animate={isInView ? { x: ["-2rem", "calc(100% + 2rem)"] } : {}}
            transition={{ delay: 1.0, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-text-muted text-xs text-center mt-4"
      >
        All components connect through the bus — data travels as small packets between devices
      </motion.p>
    </div>
  );
}

export default function WhatIsABus() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-6">
          What Is a Bus?
        </h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          A <strong className="text-text-primary">bus</strong> is the data highway that connects the different
          parts of your computer together. The CPU, RAM, SSD, GPU, and other devices all need to send data
          to each other — the bus is the road system that makes this possible.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          <em className="text-text-primary">Why does this matter for SSDs?</em> Because no matter how fast
          the SSD&apos;s internal NAND chips are, data still has to travel over the bus to reach the CPU.
          The bus speed sets the upper limit on how fast data can move. Modern NVMe SSDs use a bus called{" "}
          <strong className="text-text-primary">PCIe</strong> (Peripheral Component Interconnect Express),
          which is the fastest bus available for storage devices.
        </p>

        <AnalogyCard
          concept="PCIe Is a Multi-Lane Highway"
          analogy="If data is cars, then PCIe is a multi-lane highway. Each 'lane' is an independent path for data. An NVMe SSD typically uses 4 lanes (called 'x4'). Adding lanes is like widening the highway — more traffic can flow simultaneously, even though each car drives at the same speed limit."
        />

        <BusDiagram />

        <p className="text-text-secondary leading-relaxed mb-4">
          Data travels over the bus in small chunks called <strong className="text-text-primary">packets</strong>.
          When the SSD needs to send data to the CPU, it packages the data into a packet, puts it on the
          bus, and the bus delivers it. We&apos;ll learn the details of these packets (called TLPs —
          Transaction Layer Packets) in Lesson 5.
        </p>
        <p className="text-text-secondary leading-relaxed mb-6">
          The key takeaway: <strong className="text-text-primary">the bus is the bottleneck</strong>. Old
          SATA SSDs were limited by the SATA bus (~600 MB/s). NVMe SSDs use PCIe and can reach
          7+ GB/s — over 10x faster — because PCIe has more lanes and faster per-lane speeds.
        </p>

        <FillInBlank
          id="act0-bus-fill1"
          prompt="PCIe 4.0 x4 provides approximately {blank} GB/s of usable bandwidth."
          blanks={[{ answer: "7", tolerance: 1, placeholder: "?" }]}
          explanation="PCIe 4.0 runs at ~16 GT/s per lane. With 128b/130b encoding and 4 lanes, that's roughly 7.88 GB/s usable."
          hint="The answer relates to the number of bits that can travel simultaneously on a bus."
        />

        <KnowledgeCheck
          id="act0-bus-kc1"
          question="Adding more PCIe lanes increases the speed of each lane."
          options={["True", "False"]}
          correctIndex={1}
          explanation="Each lane runs at the same speed (set by the PCIe generation). More lanes increase total bandwidth by adding parallel paths, not by making individual lanes faster."
          hint="Consider which bus type connects directly to high-speed devices like GPUs and SSDs."
        />
      </div>
    </SectionWrapper>
  );
}
