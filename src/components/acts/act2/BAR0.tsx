"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const REGISTERS = [
  { offset: "0x00", name: "CAP", size: "8B", desc: "Controller Capabilities — how many queue entries the drive supports, timing limits, and doorbell spacing", color: "#635bff" },
  { offset: "0x08", name: "VS", size: "4B", desc: "Version — which NVMe spec version the drive implements (e.g., 1.4, 2.0)", color: "#7c5cfc" },
  { offset: "0x14", name: "CC", size: "4B", desc: "Controller Configuration — the ON/OFF switch. Writing CC.EN=1 turns the drive on", color: "#00b894" },
  { offset: "0x1C", name: "CSTS", size: "4B", desc: "Controller Status — tells you if the drive is ready (CSTS.RDY=1) or has a fatal error", color: "#00b894" },
  { offset: "0x24", name: "AQA", size: "4B", desc: "Admin Queue Attributes — how big the admin submission and completion queues are", color: "#e8a317" },
  { offset: "0x28", name: "ASQ", size: "8B", desc: "Admin Submission Queue base address — where in RAM the admin command queue lives", color: "#e8a317" },
  { offset: "0x30", name: "ACQ", size: "8B", desc: "Admin Completion Queue base address — where in RAM the admin results queue lives", color: "#e8a317" },
  { offset: "0x1000+", name: "Doorbells", size: "4B each", desc: "Doorbell registers — one pair per queue, used to notify the drive of new commands", color: "#e05d6f" },
];

function MmioFlowVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const steps = [
    { label: "CPU", sublabel: "load/store instruction", color: "#38bdf8", icon: "CPU" },
    { label: "Memory Controller", sublabel: "routes by address", color: "#a78bfa", icon: "MEM" },
    { label: "PCIe Root Complex", sublabel: "forwards to device", color: "#00d4aa", icon: "PCIe" },
    { label: "SSD BAR0", sublabel: "register accessed", color: "#f5a623", icon: "BAR0" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Memory-Mapped I/O — How CPU Talks to SSD Registers
      </div>
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-shrink-0">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, type: "spring" }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg"
                style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}` }}
              >
                <span style={{ color: step.color }}>{step.icon}</span>
              </div>
              <div className="text-text-primary text-[10px] font-semibold mt-2 text-center">{step.label}</div>
              <div className="text-text-muted text-[8px] text-center max-w-[80px]">{step.sublabel}</div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                className="flex items-center mx-1"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={inView ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ delay: i * 0.15 + 0.1, duration: 0.3 }}
              >
                <div className="w-8 h-0.5 bg-text-muted" />
                <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-text-muted" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <motion.p
        className="text-text-muted text-[10px] text-center mt-3 italic"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
      >
        The CPU writes to a memory address, but PCIe routes it to the SSD&apos;s hardware register instead of RAM
      </motion.p>
    </div>
  );
}

export default function BAR0() {
  const [selectedReg, setSelectedReg] = useState<string | null>(null);

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The Control Panel &mdash; BAR0 Registers
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We just learned that PCIe connects the SSD to your computer like a highway.
          But here&apos;s a question: <em className="text-text-primary">when the computer
          turns on, how does it even talk to the SSD?</em> It doesn&apos;t know
          where the drive&apos;s controls are yet.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think of it like moving into a new apartment. The building has a control
          panel (thermostat, breaker box, etc.), but you first need to know <em>where
          the panel is</em> before you can use it. During startup, your computer&apos;s
          BIOS (the low-level firmware that runs before your operating system) scans
          the PCIe bus and says to each device: <em>&ldquo;Your control panel will be
          at this address in memory.&rdquo;</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          This assigned address is called <strong className="text-text-primary">BAR0</strong> (Base
          Address Register 0). It&apos;s a region of memory that the CPU can read
          and write to, but instead of accessing RAM, those reads and writes go
          directly to the SSD&apos;s hardware registers. This technique is called{" "}
          <strong className="text-text-primary">Memory-Mapped I/O (MMIO)</strong> —
          the SSD&apos;s controls <em>look like</em> regular memory addresses to
          software.
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But why not just use special I/O instructions?</em>{" "}
          Because memory-mapped access is faster — the CPU&apos;s normal load/store
          instructions work directly, and PCIe hardware routes them to the right
          device. No special CPU instructions needed.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Inside BAR0, the NVMe spec defines specific <strong className="text-text-primary">
          registers</strong> — fixed locations where each knob and dial lives. Click
          any register below to see what it does:
        </p>

        {/* MMIO flow diagram */}
        <MmioFlowVisual />

        <div className="bg-story-card rounded-2xl card-shadow overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-story-border bg-story-surface">
            <span className="text-text-muted text-xs font-mono">
              NVMe Controller Register Map (BAR0) — click to explore
            </span>
          </div>

          {/* Visual register map */}
          <div className="p-4 space-y-1.5">
            {REGISTERS.map((reg, i) => {
              const isSelected = selectedReg === reg.offset;
              return (
                <motion.button
                  key={reg.offset}
                  onClick={() => setSelectedReg(isSelected ? null : reg.offset)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left hover:bg-story-surface"
                  style={isSelected ? {
                    backgroundColor: `${reg.color}08`,
                    boxShadow: `inset 3px 0 0 ${reg.color}`,
                  } : undefined}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 3 }}
                >
                  <code className="text-text-code font-mono text-xs w-16 text-right flex-shrink-0">
                    {reg.offset}
                  </code>
                  <div
                    className="font-mono font-bold text-xs w-20 flex-shrink-0"
                    style={{ color: reg.color }}
                  >
                    {reg.name}
                  </div>
                  <span className="text-text-muted font-mono text-[10px] w-12 flex-shrink-0">
                    {reg.size}
                  </span>
                  {isSelected && (
                    <span className="text-text-secondary text-xs flex-1">
                      {reg.desc}
                    </span>
                  )}
                  {!isSelected && (
                    <span className="text-text-muted text-[10px]">
                      click to see
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Why does this matter?
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Every NVMe interaction starts and ends with these registers. When the
            NVMe driver wants to tell the drive &ldquo;I&apos;ve placed a command
            for you,&rdquo; it writes to a doorbell register. When it wants to turn
            the drive on, it writes to CC. When it wants to check if the drive is
            ready, it reads CSTS.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            <em className="text-text-primary">Think of it this way:</em> The NVMe
            spec is like a contract. It says &ldquo;at offset 0x14, there will be
            a configuration register.&rdquo; Any NVMe drive from any manufacturer
            follows this same layout. That&apos;s why one generic NVMe driver works
            with thousands of different SSDs.
          </p>
        </div>

        <InfoCard variant="tip" title="How big is BAR0?">
          The register area itself is small (a few hundred bytes for the core
          registers), but the doorbell area grows with the number of queues. Each
          queue needs two doorbells (submit + complete), and doorbells start at
          offset 0x1000. With 64 I/O queues, that&apos;s about 0x1000 + 128
          &times; 4 = ~0x1200 bytes total. The BIOS allocates enough space for
          the maximum the drive supports.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
