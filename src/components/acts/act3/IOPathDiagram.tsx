"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

const IO_LAYERS = [
  {
    id: 0,
    name: "Your Application",
    detail: "Your program calls read(fd, buf, 4096) — \"read 4KB from this file into my buffer.\" The file descriptor (fd) is just a number the OS uses to track which file you opened.",
    why: "This is where it all starts. Your code doesn't know anything about NVMe, LBAs, or NAND. It just says \"give me my file.\"",
    color: "#9e9789",
    icon: "APP",
    zone: "userspace",
    latency: "~0.1μs",
    latencyUs: 0.1,
  },
  {
    id: 1,
    name: "VFS (Virtual File System)",
    detail: "Linux VFS is a universal translator. It receives your read() call and first checks the page cache — if the data was recently read, it's already in RAM and can be returned instantly without touching the SSD at all.",
    why: "The page cache is why a second read of the same file is much faster. VFS checks: \"Do I already have this data in RAM?\" If yes, return immediately. If no, pass the request down.",
    color: "#7c5cfc",
    icon: "VFS",
    zone: "kernel",
    latency: "~0.5μs",
    latencyUs: 0.5,
  },
  {
    id: 2,
    name: "Filesystem (ext4 / XFS / Btrfs)",
    detail: "The filesystem translates \"offset 8192 in file X\" into \"LBA 50000 on the block device.\" It uses data structures like extent trees (ext4) or B-trees (Btrfs) to map file offsets to LBAs.",
    why: "Your file isn't stored in one contiguous chunk on the SSD — it's scattered across many LBAs. The filesystem knows where all the pieces are. Think of it as a librarian who knows which shelf holds each book.",
    color: "#635bff",
    icon: "FS",
    zone: "kernel",
    latency: "~1μs",
    latencyUs: 1,
  },
  {
    id: 3,
    name: "Block Layer",
    detail: "The block layer receives the LBA request. The I/O scheduler may merge adjacent requests or reorder them. For NVMe, the 'none' scheduler is typical since the SSD has its own internal scheduling.",
    why: "Multiple applications may read nearby LBAs simultaneously. The block layer merges these into fewer, larger requests — sending one 64KB read is faster than sixteen 4KB reads.",
    color: "#635bff",
    icon: "BLK",
    zone: "kernel",
    latency: "~1μs",
    latencyUs: 1,
  },
  {
    id: 4,
    name: "NVMe Driver",
    detail: "The driver builds the 64-byte SQ entry: opcode=0x02 (Read), SLBA in CDW10-11, NLB in CDW12, and PRP pointers to the host buffer where data should be delivered.",
    why: "This is where everything we learned in Lesson 8 comes together — the driver fills out the 64-byte command form and places it in the Submission Queue in host RAM.",
    color: "#00b894",
    icon: "DRV",
    zone: "driver",
    latency: "~0.5μs",
    latencyUs: 0.5,
  },
  {
    id: 5,
    name: "Doorbell Write",
    detail: "The driver writes the new SQ tail pointer to the doorbell register at BAR0 + 0x1000 + QID×8. This is an MMIO write over PCIe that tells the SSD \"check the queue.\"",
    why: "Remember the hotel bell analogy from the Doorbells section? This is that moment — one PCIe write wakes up the SSD controller.",
    color: "#00b894",
    icon: "DB",
    zone: "driver",
    latency: "~0.5μs",
    latencyUs: 0.5,
  },
  {
    id: 6,
    name: "SSD Controller",
    detail: "The controller DMA-reads the 64-byte command from host memory, parses it, looks up the FTL mapping table (LBA → physical NAND page), and issues a NAND read to the correct die and page.",
    why: "The FTL lookup we learned in Lesson 3 happens right here. The controller translates your logical address into the actual physical location on the NAND chips.",
    color: "#e8a317",
    icon: "SSD",
    zone: "hardware",
    latency: "~5μs",
    latencyUs: 5,
  },
  {
    id: 7,
    name: "NAND Flash Read",
    detail: "The NAND die performs a page read (~50-100μs for TLC). The charge levels in the NAND cells are sensed, converted to bits, and passed through the ECC engine to correct any bit errors.",
    why: "This is the slowest part — NAND physics limits how fast you can sense charge levels. TLC needs multiple voltage comparisons, making it slower than SLC. ECC corrects the inevitable bit errors that accumulate over the cell's lifetime.",
    color: "#e8a317",
    icon: "NAND",
    zone: "hardware",
    latency: "~75μs",
    latencyUs: 75,
  },
  {
    id: 8,
    name: "DMA Data + Completion",
    detail: "The controller DMA-writes the 4KB data to the host buffer (using the PRP addresses from the command), then writes a 16-byte CQ entry to the Completion Queue, and fires an MSI-X interrupt.",
    why: "All three happen in quick succession: data delivery → completion posting → interrupt. The CPU doesn't need to poll — the interrupt wakes it up when the result is ready.",
    color: "#e05d6f",
    icon: "DMA",
    zone: "return",
    latency: "~2μs",
    latencyUs: 2,
  },
  {
    id: 9,
    name: "Completion & Return",
    detail: "The interrupt handler reads the CQE, checks the status code (success or error), writes the CQ head doorbell, and wakes the waiting process. Your application's read() call returns with data in the buffer.",
    why: "The loop completes. The data has traveled: NAND → SSD controller → PCIe → host RAM → your application's buffer. Your read() returns, and you have your 4KB of data.",
    color: "#e05d6f",
    icon: "IRQ",
    zone: "return",
    latency: "~1μs",
    latencyUs: 1,
  },
];

const TOTAL_LATENCY = IO_LAYERS.reduce((sum, l) => sum + l.latencyUs, 0);

function LatencyWaterfall() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Latency Waterfall &mdash; Where Does the Time Go?
      </div>
      <div className="space-y-1.5">
        {IO_LAYERS.map((layer, i) => {
          const pct = (layer.latencyUs / TOTAL_LATENCY) * 100;
          const barWidth = Math.max(pct, 1.5);
          return (
            <motion.div
              key={layer.id}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <div className="text-[9px] font-mono text-text-muted w-20 text-right flex-shrink-0 truncate">
                {layer.name.length > 12 ? layer.icon : layer.name}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <motion.div
                  className="h-5 rounded flex items-center justify-end pr-1.5"
                  style={{ backgroundColor: `${layer.color}25`, borderLeft: `3px solid ${layer.color}` }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${barWidth}%` } : {}}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.5, ease: "easeOut" }}
                >
                  {pct > 8 && (
                    <span className="text-[8px] font-mono font-bold" style={{ color: layer.color }}>
                      {layer.latency}
                    </span>
                  )}
                </motion.div>
                {pct <= 8 && (
                  <span className="text-[8px] font-mono" style={{ color: layer.color }}>
                    {layer.latency}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-[9px] font-mono text-text-muted">
        <span>0μs</span>
        <span className="text-text-primary font-bold">NAND read dominates: ~87% of total latency</span>
        <span>~{TOTAL_LATENCY.toFixed(1)}μs total</span>
      </div>
    </div>
  );
}

export default function IOPathDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The Complete Journey &mdash; From read() to NAND and Back
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Now that we understand all the protocol pieces — commands, queues,
          doorbells, completions — let&apos;s trace the <em className="text-text-primary">
          entire journey</em> of a single 4KB read. It passes through
          10 layers, each one doing something we&apos;ve already learned about.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why trace the whole path?</em> Because
          understanding each layer in isolation is different from seeing how they
          connect. When something goes wrong — a slow read, a timeout, an error —
          knowing the full path tells you <em>where</em> to look.
        </p>

        <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-5 uppercase tracking-wider">
            10-Layer I/O Path &mdash; All Layers
          </div>

          {/* All layers shown expanded */}
          <div className="flex flex-col gap-1">
            {IO_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.35 }}
              >
                <div
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                  style={{
                    backgroundColor: `${layer.color}10`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-mono font-bold flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  >
                    {layer.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary">
                      {layer.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono" style={{ color: layer.color }}>
                      {layer.latency}
                    </span>
                    <span className="text-text-muted text-[9px] font-mono flex-shrink-0 w-16 text-right">
                      {layer.zone}
                    </span>
                  </div>
                </div>

                {/* Detail always visible */}
                <div
                  className="mx-3 mb-2 p-4 rounded-lg text-sm leading-relaxed space-y-3"
                  style={{
                    backgroundColor: `${layer.color}08`,
                    borderLeft: `3px solid ${layer.color}`,
                  }}
                >
                  <div className="text-text-secondary text-xs leading-relaxed">{layer.detail}</div>
                  <div className="text-xs italic leading-relaxed" style={{ color: layer.color }}>
                    {layer.why}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                    <span>Layer {i + 1} of {IO_LAYERS.length}</span>
                    <span className="text-text-muted">|</span>
                    <span>Typical latency: <strong style={{ color: layer.color }}>{layer.latency}</strong></span>
                  </div>
                </div>

                {/* Connector */}
                {i < IO_LAYERS.length - 1 && (
                  <div className="flex justify-center">
                    <motion.div
                      className="w-0.5 h-3"
                      style={{ backgroundColor: layer.color }}
                      initial={{ scaleY: 0 }}
                      animate={inView ? { scaleY: 1 } : {}}
                      transition={{ delay: i * 0.08 + 0.15, duration: 0.2 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Latency waterfall */}
        <LatencyWaterfall />

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-green text-sm mb-1">
              Typical 4K Read Latency
            </div>
            <p className="text-text-muted text-xs">
              ~70-120μs end-to-end at queue depth 1. NAND read dominates (~50-100μs).
              Software layers add ~5-15μs. PCIe round-trip adds ~2-3μs.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-blue text-sm mb-1">
              Bypassing Layers for Speed
            </div>
            <p className="text-text-muted text-xs">
              <strong>O_DIRECT</strong> skips the page cache. <strong>io_uring</strong>{" "}
              reduces syscall overhead. <strong>SPDK</strong> bypasses the kernel
              entirely, driving NVMe from userspace for lowest possible latency.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
