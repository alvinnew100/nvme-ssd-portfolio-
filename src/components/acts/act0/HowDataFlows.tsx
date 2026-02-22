"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import InfoCard from "@/components/story/InfoCard";
import RevealCard from "@/components/story/RevealCard";

function DataFlowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const steps = [
    { label: "Application", desc: 'read("photo.jpg")', color: "#635bff" },
    { label: "OS / Kernel", desc: "Filesystem + Block Layer", color: "#7c5cfc" },
    { label: "NVMe Driver", desc: "Places command in queue", color: "#00d4aa" },
    { label: "PCIe Bus", desc: "Rings doorbell, DMA transfer", color: "#e8a317" },
    { label: "SSD Controller", desc: "Reads from NAND", color: "#e05d6f" },
    { label: "NAND Flash", desc: "Returns data", color: "#e05d6f" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 sm:p-8 border border-story-border card-shadow mb-8">
      <h4 className="text-sm font-mono text-nvme-blue uppercase tracking-wider mb-6 text-center">
        How a File Read Travels Through the System
      </h4>
      <div className="max-w-sm mx-auto space-y-2">
        {steps.map((step, i) => (
          <div key={step.label}>
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
              className="rounded-lg px-4 py-2 flex items-center justify-between"
              style={{
                backgroundColor: `${step.color}10`,
                border: `1px solid ${step.color}30`,
              }}
            >
              <span className="font-bold text-xs" style={{ color: step.color }}>{step.label}</span>
              <span className="text-text-muted text-[9px] font-mono">{step.desc}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.15 * i + 0.07, duration: 0.3 }}
                className="flex justify-center py-0.5"
              >
                <span className="text-text-muted text-[10px]">&darr;</span>
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-text-muted text-xs text-center mt-4"
      >
        The return path is the reverse — data flows back up through the same layers to your application
      </motion.p>
    </div>
  );
}

function RegistersDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 sm:p-8 border border-story-border card-shadow mb-8">
      <h4 className="text-sm font-mono text-nvme-blue uppercase tracking-wider mb-6 text-center">
        Memory-Mapped I/O — How the CPU Talks to Hardware
      </h4>
      <div className="max-w-sm mx-auto">
        <div className="flex items-start justify-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-nvme-blue/10 border border-nvme-blue/30 rounded-xl p-4 text-center flex-1"
          >
            <div className="text-nvme-blue font-bold text-xs mb-2">CPU</div>
            <div className="text-text-muted text-[9px] space-y-0.5">
              <div>Writes to address</div>
              <div className="text-nvme-blue font-mono">0xFE000000</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-text-muted text-xs font-mono self-center"
          >
            &rarr;
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-nvme-green/10 border border-nvme-green/30 rounded-xl p-4 text-center flex-1"
          >
            <div className="text-nvme-green font-bold text-xs mb-2">SSD Registers</div>
            <div className="text-text-muted text-[9px] space-y-0.5">
              <div>Receives as a</div>
              <div className="text-nvme-green font-mono">register write</div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-text-muted text-xs text-center mt-4"
        >
          The CPU doesn&apos;t &ldquo;know&rdquo; it&apos;s talking to an SSD — it just reads and writes memory addresses.
          The hardware maps those addresses to device registers.
        </motion.p>
      </div>
    </div>
  );
}

export default function HowDataFlows() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-6">
          How Data Gets From Disk to CPU
        </h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          When you open a file, a complex chain of events happens in milliseconds. Your application
          asks the <strong className="text-text-primary">operating system</strong> (the software that manages
          your computer&apos;s hardware — like Windows, macOS, or Linux), which passes the request through
          several layers down to the SSD hardware, and back up again.
        </p>

        <AnalogyCard
          concept="The I/O Path Is Like a Restaurant Order"
          analogy="You (the application) tell the waiter (the OS) what you want. The waiter writes it on an order slip (NVMe command) and puts it on the kitchen counter (submission queue). The chef (SSD controller) picks it up, retrieves the ingredients from the pantry (NAND flash), plates the dish, and puts it on the pickup counter (completion queue). The waiter delivers it to your table."
        />

        <DataFlowDiagram />

        <h4 className="text-text-primary font-semibold text-sm mb-3 mt-8">
          Registers and Memory-Mapped I/O
        </h4>
        <p className="text-text-secondary leading-relaxed mb-4">
          <em className="text-text-primary">But how does the CPU actually &ldquo;talk to&rdquo; the SSD?</em>{" "}
          Hardware devices have tiny built-in memory locations called <strong className="text-text-primary">
          registers</strong> — each one controls a specific function (like &ldquo;start processing commands&rdquo;
          or &ldquo;report your status&rdquo;). The CPU accesses these registers through a technique called{" "}
          <strong className="text-text-primary">Memory-Mapped I/O (MMIO)</strong>: the SSD&apos;s registers are
          assigned normal memory addresses, so the CPU can read or write them just like reading or writing RAM.
        </p>

        <RegistersDiagram />

        <p className="text-text-secondary leading-relaxed mb-4">
          This is exactly how NVMe works: the SSD&apos;s control registers are mapped into a region
          of memory called <strong className="text-text-primary">BAR0</strong> (Base Address Register 0).
          When the CPU writes to an address in BAR0, the SSD receives it as a command. We&apos;ll explore
          this in detail in Lesson 6.
        </p>

        <InfoCard variant="tip" title="Why This Matters">
          Understanding this data flow is the foundation for everything that follows. When we talk about
          queues, doorbells, DMA, and interrupts in later lessons, you&apos;ll know exactly where they fit
          in this pipeline. The entire NVMe protocol is designed to make this flow as fast as possible.
        </InfoCard>

        <RevealCard
          id="act0-dataflow-drag1"
          prompt="If the NVMe driver placed a command directly on the PCIe bus before the OS kernel processed the file read request, what would go wrong? Why must these I/O layers execute in a specific order?"
          answer="The I/O path must flow: Application > OS/Kernel > NVMe Driver > PCIe Bus > SSD Controller > NAND Flash. If the driver bypassed the OS, it wouldn't know which logical block addresses (LBAs) correspond to the requested file — the filesystem layer in the kernel is responsible for translating filenames into LBA ranges. Without that translation, the driver would send garbage addresses to the SSD. Similarly, the NVMe driver must format the request into a proper NVMe submission queue entry before the PCIe bus can carry it, and the SSD controller must decode that command before it can address the correct NAND dies. Each layer depends on the output of the layer above it."
          hint="Think about the layers from software (top) down to hardware (bottom)."
        />

        <RevealCard
          id="act0-dataflow-quiz1"
          prompt="Why is it elegant that the CPU 'doesn't know' it's talking to an SSD when using Memory-Mapped I/O? What would the alternative look like, and why would it be worse?"
          answer="In MMIO, the SSD's control registers are mapped to normal memory addresses. The CPU reads and writes these addresses as if they were RAM, but the hardware silently routes those accesses to the SSD's registers via PCIe. This is elegant because the CPU uses the same load/store instructions it already knows — no special I/O instructions needed. The alternative (port-mapped I/O using IN/OUT instructions) requires separate address spaces, special privilege levels, and can't leverage the CPU's existing memory infrastructure like caches and TLBs. MMIO also scales better: any number of devices can be mapped into the vast 64-bit address space, whereas I/O ports are limited to a 16-bit address range (65,536 ports total)."
        />
      </div>
    </SectionWrapper>
  );
}
