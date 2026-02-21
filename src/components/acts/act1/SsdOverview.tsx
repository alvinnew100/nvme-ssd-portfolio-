"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

function SsdDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const controllerBlocks = [
    { x: 30, y: 55, w: 90, h: 35, label: "NVMe Frontend", color: "#38bdf8" },
    { x: 130, y: 55, w: 90, h: 35, label: "FTL Engine", color: "#a78bfa" },
    { x: 30, y: 100, w: 90, h: 35, label: "ECC Engine", color: "#00d4aa" },
    { x: 130, y: 100, w: 90, h: 35, label: "Wear Leveling", color: "#f5a623" },
    { x: 30, y: 145, w: 190, h: 30, label: "NAND Interface (ONFI)", color: "#94a3b8" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        SSD Architecture — Animated Data Flow
      </div>
      <svg viewBox="0 0 560 210" className="w-full max-w-2xl mx-auto" fill="none">
        {/* Host */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <rect x="0" y="80" width="80" height="50" rx="8" fill="#00d4aa10" stroke="#00d4aa" strokeWidth="2" />
          <text x="40" y="102" textAnchor="middle" className="fill-nvme-green text-[10px] font-bold">Host</text>
          <text x="40" y="118" textAnchor="middle" className="fill-text-muted text-[8px]">PCIe x4</text>
        </motion.g>

        {/* Arrow host → controller */}
        <motion.line
          x1="80" y1="105" x2="108" y2="105"
          stroke="#475569" strokeWidth="2" markerEnd="url(#ssd-arrow)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.4 }}
        />

        {/* Data packet animation */}
        <motion.circle
          r="4" fill="#00d4aa"
          animate={inView ? { cx: [85, 105], cy: [105, 105], opacity: [1, 0.5, 1] } : {}}
          transition={{ delay: 0.5, duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
        />

        {/* Controller group */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <rect x="110" y="20" width="230" height="170" rx="10" fill="#38bdf808" stroke="#38bdf8" strokeWidth="2" />
          <text x="225" y="42" textAnchor="middle" className="fill-nvme-blue text-[11px] font-bold">SSD Controller</text>

          {controllerBlocks.map((b, i) => (
            <motion.g
              key={b.label}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <rect
                x={110 + b.x} y={b.y} width={b.w} height={b.h} rx="5"
                fill="#111927" stroke={`${b.color}40`} strokeWidth="1"
              />
              <text
                x={110 + b.x + b.w / 2} y={b.y + b.h / 2 + 4}
                textAnchor="middle" fill={b.color} className="text-[8px] font-mono"
              >
                {b.label}
              </text>
            </motion.g>
          ))}
        </motion.g>

        {/* DRAM */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <rect x="360" y="30" width="80" height="50" rx="8" fill="#a78bfa10" stroke="#a78bfa" strokeWidth="2" />
          <text x="400" y="52" textAnchor="middle" className="fill-nvme-violet text-[10px] font-bold">DRAM</text>
          <text x="400" y="68" textAnchor="middle" className="fill-text-muted text-[8px]">FTL Table</text>
          <line x1="340" y1="55" x2="360" y2="55" stroke="#475569" strokeWidth="1.5" />
        </motion.g>

        {/* NAND packages */}
        {[0, 1, 2, 3].map((i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <rect
              x={365 + i * 50} y="110" width="42" height="70" rx="5"
              fill="#f5a62308" stroke="#f5a623" strokeWidth="1.5"
            />
            <text
              x={386 + i * 50} y="145" textAnchor="middle"
              className="fill-nvme-amber text-[8px] font-bold"
            >
              NAND
            </text>
            <text
              x={386 + i * 50} y="158" textAnchor="middle"
              className="fill-text-muted text-[7px]"
            >
              CH{i}
            </text>

            {/* Animated data flowing to NAND */}
            <motion.rect
              x={382 + i * 50} y="110" width="8" height="3" rx="1" fill="#f5a623"
              animate={inView ? { y: [110, 165], opacity: [0.8, 0] } : {}}
              transition={{ delay: 1 + i * 0.3, duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.g>
        ))}

        {/* Arrow controller → NAND */}
        <motion.line
          x1="340" y1="145" x2="365" y2="145"
          stroke="#475569" strokeWidth="2" markerEnd="url(#ssd-arrow)"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.3 }}
        />

        <defs>
          <marker id="ssd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function SsdOverview() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Inside the SSD — The Complete Picture
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          So far we&apos;ve seen the building blocks: bits, bytes, LBAs, and NAND cells
          organized into pages, blocks, and dies. <em className="text-text-primary">But
          how do all these pieces fit together inside an actual SSD?</em> An SSD
          isn&apos;t just a pile of NAND chips — it&apos;s a complete mini-computer.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why does an SSD need to be a computer?
          </em> Because someone has to manage all the complexity we just learned about
          — translating LBAs to physical pages, choosing which cells to write to,
          handling the read/write vs erase size mismatch, fixing bit errors,
          monitoring wear. That management software needs a processor, memory, and
          interfaces, just like a computer.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          An SSD has three main parts:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            <strong className="text-text-primary">Controller</strong> — The &ldquo;brain.&rdquo;
            A specialized processor that runs all the software (firmware) managing the drive.
            It handles every read, write, and erase operation.
          </li>
          <li>
            <strong className="text-text-primary">DRAM</strong> — Fast temporary memory
            (like your computer&apos;s RAM). <em className="text-text-primary">Why does
            the SSD need its own RAM?</em> To store the mapping table that translates
            LBAs to physical NAND locations. This table can be hundreds of MB for a large
            drive. Without DRAM, every read would need an extra NAND lookup first, adding
            latency.
          </li>
          <li>
            <strong className="text-text-primary">NAND Flash Packages</strong> — The actual
            storage chips where your data lives permanently. Multiple packages connected through
            separate channels allow parallel access — <em className="text-text-primary">this
            is the key to SSD speed</em>: the controller can read from many chips simultaneously.
          </li>
        </ul>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The diagram below shows how these parts connect. The host computer talks to the
          controller through the PCIe bus (we&apos;ll cover that in the next act), and the
          controller manages everything else.
        </p>

        {/* SSD block diagram with animated data flow */}
        <SsdDiagram />

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-blue font-semibold mb-1">Controller</div>
            <p className="text-text-muted text-xs">
              Processes NVMe commands, manages FTL mapping, handles ECC, and
              coordinates NAND operations. <em>Think of it as the SSD&apos;s CPU.</em>
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-violet font-semibold mb-1">DRAM</div>
            <p className="text-text-muted text-xs">
              Caches the FTL table for fast lookups. <em>What about
              DRAM-less SSDs?</em> They use HMB (Host Memory Buffer) — borrowing
              a slice of your computer&apos;s RAM instead.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-amber font-semibold mb-1">NAND Packages</div>
            <p className="text-text-muted text-xs">
              Multiple CE (chip enable) channels allow parallel access.
              <em> More channels = higher bandwidth</em> — a 4-channel controller
              can read from 4 NAND chips simultaneously.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
