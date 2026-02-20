"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

const IO_LAYERS = [
  {
    id: 0,
    name: "Application",
    detail: "App calls read(fd, buf, 4096). The file descriptor maps to an inode on the filesystem.",
    color: "#9e9789",
    icon: "APP",
  },
  {
    id: 1,
    name: "VFS (Virtual File System)",
    detail: "Linux VFS translates the file read into a filesystem-specific operation. Checks page cache first — if data is cached, return immediately (no I/O).",
    color: "#7c5cfc",
    icon: "VFS",
  },
  {
    id: 2,
    name: "Filesystem (ext4/XFS/Btrfs)",
    detail: "Maps file offset to logical block addresses (LBAs). Extent trees (ext4) or B-trees (Btrfs) resolve file offset → LBA. Creates a bio (block I/O) request.",
    color: "#635bff",
    icon: "FS",
  },
  {
    id: 3,
    name: "Block Layer",
    detail: "The bio enters the block layer. The I/O scheduler (mq-deadline, none, kyber) may merge or reorder requests. For NVMe, 'none' scheduler is recommended since the drive has its own scheduler.",
    color: "#635bff",
    icon: "BLK",
  },
  {
    id: 4,
    name: "NVMe Driver",
    detail: "The driver builds a 64-byte SQ entry (CDW0=opcode, CDW10/11=SLBA, CDW12=NLB, PRPs point to host buffer). Writes the entry to the I/O Submission Queue in host memory.",
    color: "#00b894",
    icon: "DRV",
  },
  {
    id: 5,
    name: "SQ Doorbell Write",
    detail: "Driver writes the new SQ tail pointer to the doorbell register (BAR0 + 0x1000 + QID*8). This is an MMIO write over PCIe — the controller now knows there's work to do.",
    color: "#00b894",
    icon: "DB",
  },
  {
    id: 6,
    name: "SSD Controller",
    detail: "Controller DMA-reads the SQE from host memory. Parses the command, looks up the FTL mapping (LBA → physical NAND page), and issues the NAND read.",
    color: "#e8a317",
    icon: "SSD",
  },
  {
    id: 7,
    name: "NAND Flash",
    detail: "The NAND die performs a page read (~50-100μs for TLC). Data passes through ECC engine for error correction. 4KB of data is ready.",
    color: "#e8a317",
    icon: "NAND",
  },
  {
    id: 8,
    name: "DMA to Host + CQE",
    detail: "Controller DMA-writes the 4KB data to the host buffer (via PRP addresses). Then DMA-writes a 16-byte CQ entry to the Completion Queue. Fires an MSI-X interrupt.",
    color: "#e05d6f",
    icon: "DMA",
  },
  {
    id: 9,
    name: "Completion",
    detail: "Interrupt handler reads the CQE, checks status (success/error), writes the CQ head doorbell. The driver wakes the waiting process. App's read() returns with data in buf.",
    color: "#e05d6f",
    icon: "IRQ",
  },
];

export default function IOPathDiagram() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animIdx, setAnimIdx] = useState(-1);

  const animateFlow = () => {
    setIsAnimating(true);
    setAnimIdx(0);
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
          The I/O Path &mdash; From read() to NAND
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          When your application calls <code className="text-text-code">read()</code>,
          the request travels through 10 layers before data arrives. Click each layer
          to see what happens, or hit &ldquo;Animate&rdquo; to watch the full journey.
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider">
              I/O Path — Click a layer or animate
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
                      {i === 0 ? "userspace" : i <= 3 ? "kernel" : i <= 5 ? "driver" : i <= 7 ? "hardware" : "return"}
                    </div>
                  </button>

                  {/* Detail panel */}
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
                          className="mx-3 mb-2 p-3 rounded-lg text-sm leading-relaxed"
                          style={{
                            backgroundColor: `${layer.color}08`,
                            borderLeft: `3px solid ${layer.color}`,
                          }}
                        >
                          <span className="text-text-secondary text-xs">{layer.detail}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Connector arrow */}
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
              ~70-120μs end-to-end at QD=1. NAND read (~50μs) dominates.
              Software overhead (VFS, block layer, driver) adds ~5-15μs.
              PCIe round-trip adds ~2-3μs.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-blue text-sm mb-1">
              Bypassing Layers
            </div>
            <p className="text-text-muted text-xs">
              io_uring with fixed buffers skips some VFS overhead. O_DIRECT
              bypasses the page cache. SPDK bypasses the kernel entirely by
              driving NVMe from userspace.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
