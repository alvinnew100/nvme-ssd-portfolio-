"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import RevealCard from "@/components/story/RevealCard";

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
            className="absolute h-full w-8 top-0 rounded"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,91,255,0.15), transparent)" }}
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

        <RevealCard
          id="act0-bus-fill1"
          prompt="How would you derive the usable bandwidth of PCIe 4.0 x4 from first principles? What encoding overhead must you account for, and why does it exist?"
          answer="PCIe 4.0 runs at 16 GT/s (gigatransfers per second) per lane. With 4 lanes (x4), that's 64 GT/s raw. PCIe 4.0 uses 128b/130b encoding — for every 128 bits of payload, 2 bits of overhead are added for clock recovery and error detection. So usable bandwidth = 64 GT/s x (128/130) x (1 byte / 8 bits) = ~7.88 GB/s. The encoding overhead exists because without embedded clock transitions, the receiver can't distinguish data from noise at these speeds."
          hint="The answer relates to the number of bits that can travel simultaneously on a bus."
          options={[
            "16 GT/s x 4 lanes = 64 GT/s raw, then 128b/130b encoding gives ~7.88 GB/s usable",
            "16 GB/s x 4 lanes = 64 GB/s, minus 10% overhead = ~57.6 GB/s",
            "16 GT/s x 4 lanes = 64 GT/s, divided by 10 for encoding = 6.4 GB/s",
            "8 GT/s x 4 lanes x 2 (full duplex) = 64 GB/s"
          ]}
          correctIndex={0}
        />

        <RevealCard
          id="act0-bus-kc1"
          prompt="A colleague says 'adding more PCIe lanes makes each lane faster.' When is this true and when does it fail? What actually changes when you go from x1 to x4?"
          answer="This is never true — each lane runs at the same speed, determined solely by the PCIe generation (e.g., 16 GT/s for Gen 4). Adding lanes increases total bandwidth by providing parallel paths for data, not by speeding up individual lanes. Going from x1 to x4 quadruples the aggregate bandwidth (from ~2 GB/s to ~8 GB/s for Gen 4) because four independent data streams flow simultaneously. The per-lane speed only changes when you upgrade the PCIe generation itself (e.g., Gen 3 at 8 GT/s to Gen 4 at 16 GT/s)."
          hint="Consider which bus type connects directly to high-speed devices like GPUs and SSDs."
          options={[
            "True — more lanes share the clock signal more efficiently, increasing per-lane throughput",
            "True for Gen 4 and above due to lane bonding technology",
            "Never true — each lane runs at the same speed set by the PCIe generation; more lanes only add parallel bandwidth",
            "True only when the lanes are on the same PCIe root complex"
          ]}
          correctIndex={2}
        />
      </div>
    </SectionWrapper>
  );
}
