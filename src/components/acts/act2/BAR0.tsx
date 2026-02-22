"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";

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
    { label: "CPU", sublabel: "Executes load/store to address 0xFE000014", color: "#38bdf8", icon: "CPU", detail: "The CPU doesn't know this address is an SSD register — it just runs a normal memory instruction" },
    { label: "Memory Controller", sublabel: "Checks: is this address RAM or MMIO?", color: "#a78bfa", icon: "MMU", detail: "The address falls outside physical RAM range, so it's routed to the PCIe root complex instead" },
    { label: "PCIe Root Complex", sublabel: "Matches address to device BAR range", color: "#00d4aa", icon: "RC", detail: "The root complex checks its routing table: 0xFE000000–0xFE001FFF belongs to NVMe SSD on Bus 1" },
    { label: "SSD BAR0 Register", sublabel: "Offset 0x14 = CC register accessed", color: "#f5a623", icon: "BAR0", detail: "The SSD hardware receives the write at offset 0x14 (CC register) — controller configuration is updated" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Memory-Mapped I/O — How CPU Talks to SSD Registers
      </div>

      {/* Flow diagram */}
      <div className="space-y-3 max-w-2xl mx-auto mb-4">
        {steps.map((step, i) => (
          <div key={step.label}>
            <motion.div
              className="flex items-start gap-4 rounded-xl p-3"
              style={{ backgroundColor: `${step.color}08`, border: `1px solid ${step.color}30` }}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.15, type: "spring" }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: `${step.color}15`, border: `2px solid ${step.color}` }}
              >
                <span style={{ color: step.color }}>{step.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary text-xs font-semibold">{step.label}</span>
                  <span className="text-text-muted text-[10px]">&mdash; {step.sublabel}</span>
                </div>
                <p className="text-text-muted text-[10px] mt-0.5 leading-relaxed">{step.detail}</p>
              </div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                className="flex justify-center py-1"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.15 + 0.1 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M10 2 L10 14 L6 10 M10 14 L14 10" stroke={step.color} strokeWidth="2" fill="none" />
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <motion.div
        className="bg-story-surface rounded-xl p-3 text-center"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
      >
        <p className="text-text-secondary text-[11px] leading-relaxed">
          <strong className="text-text-primary">The key insight:</strong> The CPU uses its normal memory
          instructions (load/store) — it doesn&apos;t need special I/O instructions. The hardware routing
          makes SSD registers &ldquo;look like&rdquo; regular memory addresses. This is why it&apos;s called
          <em> memory-mapped</em> I/O.
        </p>
      </motion.div>
    </div>
  );
}

export default function BAR0() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The Control Panel &mdash; BAR0 Registers
        </h3>
        <AnalogyCard concept="BAR0 Is the SSD's Control Panel" analogy="BAR0 is like a control panel mounted on the front of the SSD. Each register is a button or dial — one enables the controller, another reports status, another sets queue sizes. The CPU accesses these 'buttons' by reading/writing specific memory addresses." />
        <TermDefinition term="BAR0 (Base Address Register 0)" definition="A region of memory-mapped I/O space assigned to the SSD during PCIe enumeration. Contains the NVMe controller's registers — the CPU reads and writes these addresses to configure and control the SSD." />
        <TermDefinition term="MMIO (Memory-Mapped I/O)" definition="A technique where hardware device registers are mapped into the CPU's normal memory address space. The CPU accesses devices by reading/writing to specific memory addresses, just like accessing RAM." />

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
          registers</strong> — fixed locations where each knob and dial lives. Here
          are the key registers and what each one does:
        </p>

        {/* MMIO flow diagram */}
        <MmioFlowVisual />

        <div className="bg-story-card rounded-2xl card-shadow overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-story-border bg-story-surface">
            <span className="text-text-muted text-xs font-mono">
              NVMe Controller Register Map (BAR0)
            </span>
          </div>

          {/* Visual register map — all expanded */}
          <div className="p-4 space-y-1.5">
            {REGISTERS.map((reg, i) => (
              <motion.div
                key={reg.offset}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  backgroundColor: `${reg.color}08`,
                  boxShadow: `inset 3px 0 0 ${reg.color}`,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <code className="text-text-code font-mono text-xs w-16 text-right flex-shrink-0 mt-0.5">
                  {reg.offset}
                </code>
                <div
                  className="font-mono font-bold text-xs w-20 flex-shrink-0 mt-0.5"
                  style={{ color: reg.color }}
                >
                  {reg.name}
                </div>
                <span className="text-text-muted font-mono text-[10px] w-12 flex-shrink-0 mt-0.5">
                  {reg.size}
                </span>
                <span className="text-text-secondary text-xs flex-1">
                  {reg.desc}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* PCIe path mapping — lspci */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Finding Your NVMe SSD on the PCIe Bus &mdash; lspci
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            Every PCIe device has a unique address in the format{" "}
            <strong className="text-text-primary">Bus:Device.Function</strong> (BDF). When the BIOS
            scans the PCIe bus during boot, it assigns each device a BDF address and maps its
            BAR0 to a specific memory range. On Linux, you can see this with{" "}
            <code className="text-text-code">lspci</code>:
          </p>
          <pre className="text-xs bg-story-dark rounded-xl p-4 overflow-x-auto font-mono text-white/90 mb-3 whitespace-pre">
{`$ lspci -v | grep -A5 "NVMe"
01:00.0 Non-Volatile memory controller: Samsung NVM Express
        Subsystem: Samsung SSD 980 PRO
        Region 0: Memory at fe000000 (64-bit) [size=16K]
        Capabilities: [70] Express Endpoint, MSI-X: Enable+`}
          </pre>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
            <div className="bg-story-surface rounded-xl p-3">
              <code className="text-nvme-blue font-mono font-bold">01:00.0</code>
              <p className="text-text-muted mt-1 leading-relaxed">
                <strong className="text-text-primary">Bus 01</strong> : <strong className="text-text-primary">
                Device 00</strong> . <strong className="text-text-primary">Function 0</strong>. This is the
                PCIe address. Bus 01 means it&apos;s one hop from the root complex. Device 00 means it&apos;s
                the first device on that bus. Function 0 is the primary function.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-3">
              <code className="text-nvme-amber font-mono font-bold">Region 0: fe000000 [size=16K]</code>
              <p className="text-text-muted mt-1 leading-relaxed">
                This is <strong className="text-text-primary">BAR0</strong> — the memory range where the
                NVMe registers are mapped. The CPU writes to addresses starting at 0xFE000000, and PCIe
                routes those writes to the SSD&apos;s controller registers. 16K covers all registers + doorbells.
              </p>
            </div>
          </div>
          <p className="text-text-muted text-[10px] leading-relaxed">
            <strong className="text-text-primary">The full path:</strong> CPU &rarr; PCIe Root Complex
            (Bus 0) &rarr; PCIe Switch/Bridge &rarr; Bus 01, Device 00, Function 0 &rarr; NVMe SSD.
            The BDF address is how the kernel&apos;s NVMe driver finds and binds to the SSD. You&apos;ll also
            see this path in <code className="text-text-code">/sys/bus/pci/devices/0000:01:00.0/</code> where
            the kernel exposes the device&apos;s config space and resource mappings.
          </p>
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
