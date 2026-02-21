"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  },
  {
    id: 1,
    name: "VFS (Virtual File System)",
    detail: "Linux VFS is a universal translator. It receives your read() call and first checks the page cache — if the data was recently read, it's already in RAM and can be returned instantly without touching the SSD at all.",
    why: "The page cache is why a second read of the same file is much faster. VFS checks: \"Do I already have this data in RAM?\" If yes, return immediately. If no, pass the request down.",
    color: "#7c5cfc",
    icon: "VFS",
    zone: "kernel",
  },
  {
    id: 2,
    name: "Filesystem (ext4 / XFS / Btrfs)",
    detail: "The filesystem translates \"offset 8192 in file X\" into \"LBA 50000 on the block device.\" It uses data structures like extent trees (ext4) or B-trees (Btrfs) to map file offsets to LBAs.",
    why: "Your file isn't stored in one contiguous chunk on the SSD — it's scattered across many LBAs. The filesystem knows where all the pieces are. Think of it as a librarian who knows which shelf holds each book.",
    color: "#635bff",
    icon: "FS",
    zone: "kernel",
  },
  {
    id: 3,
    name: "Block Layer",
    detail: "The block layer receives the LBA request. The I/O scheduler may merge adjacent requests or reorder them. For NVMe, the 'none' scheduler is typical since the SSD has its own internal scheduling.",
    why: "Multiple applications may read nearby LBAs simultaneously. The block layer merges these into fewer, larger requests — sending one 64KB read is faster than sending sixteen 4KB reads.",
    color: "#635bff",
    icon: "BLK",
    zone: "kernel",
  },
  {
    id: 4,
    name: "NVMe Driver",
    detail: "The driver builds the 64-byte SQ entry: opcode=0x02 (Read), SLBA in CDW10-11, NLB in CDW12, and PRP pointers to the host buffer where data should be delivered.",
    why: "This is where everything we learned in Act 3 comes together — the driver fills out the 64-byte command form and places it in the Submission Queue in host RAM.",
    color: "#00b894",
    icon: "DRV",
    zone: "driver",
  },
  {
    id: 5,
    name: "Doorbell Write",
    detail: "The driver writes the new SQ tail pointer to the doorbell register at BAR0 + 0x1000 + QID×8. This is an MMIO write over PCIe that tells the SSD \"check the queue.\"",
    why: "Remember the hotel bell analogy from the Doorbells section? This is that moment — one PCIe write wakes up the SSD controller.",
    color: "#00b894",
    icon: "DB",
    zone: "driver",
  },
  {
    id: 6,
    name: "SSD Controller",
    detail: "The controller DMA-reads the 64-byte command from host memory, parses it, looks up the FTL mapping table (LBA → physical NAND page), and issues a NAND read to the correct die and page.",
    why: "The FTL lookup we learned in Act 1 happens right here. The controller translates your logical address into the actual physical location on the NAND chips.",
    color: "#e8a317",
    icon: "SSD",
    zone: "hardware",
  },
  {
    id: 7,
    name: "NAND Flash Read",
    detail: "The NAND die performs a page read (~50-100μs for TLC). The charge levels in the NAND cells are sensed, converted to bits, and passed through the ECC engine to correct any bit errors.",
    why: "This is the slowest part — NAND physics limits how fast you can sense charge levels. TLC needs multiple voltage comparisons, making it slower than SLC. ECC corrects the inevitable bit errors that accumulate over the cell's lifetime.",
    color: "#e8a317",
    icon: "NAND",
    zone: "hardware",
  },
  {
    id: 8,
    name: "DMA Data + Completion",
    detail: "The controller DMA-writes the 4KB data to the host buffer (using the PRP addresses from the command), then writes a 16-byte CQ entry to the Completion Queue, and fires an MSI-X interrupt.",
    why: "All three happen in quick succession: data delivery → completion posting → interrupt. The CPU doesn't need to poll — the interrupt wakes it up when the result is ready.",
    color: "#e05d6f",
    icon: "DMA",
    zone: "return",
  },
  {
    id: 9,
    name: "Completion & Return",
    detail: "The interrupt handler reads the CQE, checks the status code (success or error), writes the CQ head doorbell, and wakes the waiting process. Your application's read() call returns with data in the buffer.",
    why: "The loop completes. The data has traveled: NAND → SSD controller → PCIe → host RAM → your application's buffer. Your read() returns, and you have your 4KB of data.",
    color: "#e05d6f",
    icon: "IRQ",
    zone: "return",
  },
];

export default function IOPathDiagram() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animIdx, setAnimIdx] = useState(-1);

  const animateFlow = () => {
    setIsAnimating(true);
    setAnimIdx(0);
    setActiveLayer(null);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i >= IO_LAYERS.length) {
        clearInterval(timer);
        setIsAnimating(false);
      } else {
        setAnimIdx(i);
      }
    }, 800);
  };

  const currentLayer = activeLayer !== null ? activeLayer : animIdx >= 0 ? animIdx : null;

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The Complete Journey &mdash; From read() to NAND and Back
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Now that we understand all the protocol pieces — commands, queues,
          doorbells, completions — let&apos;s see the <em>entire journey</em> of a
          single 4KB read. It passes through 10 layers, each one doing something
          we&apos;ve already learned about.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Click each layer to see what happens and <em>why</em>, or click
          &ldquo;Animate&rdquo; to watch the full round-trip:
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider">
              I/O Path — Click a layer or animate the full trip
            </div>
            <button
              onClick={animateFlow}
              disabled={isAnimating}
              className="px-4 py-2 bg-nvme-blue text-white rounded-full text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              {isAnimating ? "Animating..." : "Animate Read Path"}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {IO_LAYERS.map((layer, i) => {
              const isActive = currentLayer === i;
              const isAnimated = animIdx >= i && animIdx >= 0;
              return (
                <div key={layer.id}>
                  <button
                    onClick={() => {
                      setActiveLayer(isActive ? null : i);
                      setAnimIdx(-1);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isActive
                        ? "ring-2 scale-[1.02]"
                        : isAnimated
                        ? "bg-story-surface"
                        : "hover:bg-story-surface"
                    }`}
                    style={isActive ? {
                      backgroundColor: `${layer.color}10`,
                      boxShadow: `0 0 0 2px ${layer.color}40`,
                    } : undefined}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-mono font-bold flex-shrink-0 transition-all ${
                        isAnimated || isActive ? "scale-110" : "opacity-60"
                      }`}
                      style={{ backgroundColor: isAnimated || isActive ? layer.color : "#9e9789" }}
                    >
                      {layer.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                        {layer.name}
                      </div>
                    </div>
                    <div className="text-text-muted text-[9px] font-mono flex-shrink-0">
                      {layer.zone}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mx-3 mb-2 p-4 rounded-lg text-sm leading-relaxed space-y-2"
                          style={{
                            backgroundColor: `${layer.color}08`,
                            borderLeft: `3px solid ${layer.color}`,
                          }}
                        >
                          <div className="text-text-secondary text-xs">{layer.detail}</div>
                          <div className="text-text-muted text-xs italic" style={{ color: layer.color }}>
                            {layer.why}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {i < IO_LAYERS.length - 1 && (
                    <div className="flex justify-center">
                      <div
                        className={`w-0.5 h-2 transition-colors ${
                          isAnimated && animIdx > i ? "bg-nvme-green" : "bg-story-border"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-green text-sm mb-1">
              Typical 4K Read Latency
            </div>
            <p className="text-text-muted text-xs">
              ~70-120μs end-to-end at queue depth 1. NAND read dominates (~50μs).
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
