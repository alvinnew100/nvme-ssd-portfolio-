"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import QuizCard from "@/components/story/QuizCard";

/* ─── SSD Architecture Diagram ─── */
function SsdDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        SSD Architecture — Animated Data Flow
      </div>
      <svg viewBox="0 0 620 280" className="w-full max-w-3xl mx-auto" fill="none">
        {/* Host System */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          <rect x="0" y="60" width="90" height="160" rx="10" fill="#00d4aa08" stroke="#00d4aa" strokeWidth="2" />
          <text x="45" y="85" textAnchor="middle" className="fill-nvme-green text-[10px] font-bold">Host</text>
          <text x="45" y="100" textAnchor="middle" className="fill-nvme-green text-[10px] font-bold">System</text>
          <rect x="10" y="112" width="70" height="28" rx="4" fill="#38bdf810" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="45" y="129" textAnchor="middle" className="fill-nvme-blue text-[8px] font-mono font-bold">CPU</text>
          <rect x="10" y="148" width="70" height="28" rx="4" fill="#a78bfa10" stroke="#a78bfa" strokeWidth="1.5" />
          <text x="45" y="165" textAnchor="middle" className="fill-nvme-violet text-[8px] font-mono font-bold">Host RAM</text>
          <text x="45" y="190" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">SQ + CQ here</text>
        </motion.g>

        {/* PCIe Bus */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 }}
        >
          <rect x="96" y="100" width="36" height="80" rx="4" fill="#00d4aa08" stroke="#00d4aa40" strokeWidth="1" strokeDasharray="4,3" />
          <text x="114" y="118" textAnchor="middle" className="fill-nvme-green text-[7px] font-mono">PCIe</text>
          <text x="114" y="130" textAnchor="middle" className="fill-nvme-green text-[7px] font-mono">x4</text>
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={`pcie-${i}`}
              r="2.5" fill="#00d4aa"
              animate={inView ? { cy: [108 + i * 16, 108 + i * 16], cx: [100, 128], opacity: [0.8, 0.3, 0.8] } : {}}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
            />
          ))}
        </motion.g>

        {/* SSD Controller */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          <rect x="140" y="20" width="240" height="240" rx="12" fill="#38bdf806" stroke="#38bdf8" strokeWidth="2" />
          <text x="260" y="44" textAnchor="middle" className="fill-nvme-blue text-[12px] font-bold">SSD Controller (SoC)</text>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}>
            <rect x="155" y="55" width="105" height="40" rx="6" fill="#111927" stroke="#38bdf840" strokeWidth="1" />
            <text x="207" y="73" textAnchor="middle" className="fill-nvme-blue text-[8px] font-mono font-bold">NVMe Frontend</text>
            <text x="207" y="85" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">Command parsing</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.35 }}>
            <rect x="268" y="55" width="100" height="40" rx="6" fill="#111927" stroke="#38bdf840" strokeWidth="1" />
            <text x="318" y="73" textAnchor="middle" className="fill-nvme-blue text-[8px] font-mono font-bold">PCIe Interface</text>
            <text x="318" y="85" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">DMA engine</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
            <rect x="155" y="103" width="105" height="40" rx="6" fill="#111927" stroke="#a78bfa40" strokeWidth="1" />
            <text x="207" y="121" textAnchor="middle" className="fill-nvme-violet text-[8px] font-mono font-bold">FTL Engine</text>
            <text x="207" y="133" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">L2P mapping, GC</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45 }}>
            <rect x="268" y="103" width="100" height="40" rx="6" fill="#111927" stroke="#00d4aa40" strokeWidth="1" />
            <text x="318" y="121" textAnchor="middle" className="fill-nvme-green text-[8px] font-mono font-bold">ECC Engine</text>
            <text x="318" y="133" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">Error correction</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
            <rect x="155" y="151" width="105" height="40" rx="6" fill="#111927" stroke="#f5a62340" strokeWidth="1" />
            <text x="207" y="169" textAnchor="middle" className="fill-nvme-amber text-[8px] font-mono font-bold">Wear Leveling</text>
            <text x="207" y="181" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">Even cell usage</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.55 }}>
            <rect x="268" y="151" width="100" height="40" rx="6" fill="#111927" stroke="#e05d6f40" strokeWidth="1" />
            <text x="318" y="169" textAnchor="middle" className="fill-nvme-red text-[8px] font-mono font-bold">Write Buffer</text>
            <text x="318" y="181" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">SLC cache mgmt</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}>
            <rect x="155" y="200" width="213" height="35" rx="6" fill="#111927" stroke="#94a3b840" strokeWidth="1" />
            <text x="261" y="218" textAnchor="middle" className="fill-text-secondary text-[8px] font-mono font-bold">NAND Flash Interface (ONFI / Toggle)</text>
            <text x="261" y="228" textAnchor="middle" className="fill-text-muted text-[6px] font-mono">8/16 channels to NAND packages</text>
          </motion.g>

          <text x="260" y="253" textAnchor="middle" className="fill-text-muted text-[6px] font-mono italic">ARM Cortex-R / proprietary RISC cores</text>
        </motion.g>

        {/* DRAM */}
        <motion.g initial={{ opacity: 0, y: -10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
          <rect x="400" y="25" width="90" height="60" rx="8" fill="#a78bfa08" stroke="#a78bfa" strokeWidth="2" />
          <text x="445" y="48" textAnchor="middle" className="fill-nvme-violet text-[10px] font-bold">DRAM</text>
          <text x="445" y="62" textAnchor="middle" className="fill-text-muted text-[7px]">FTL Table Cache</text>
          <text x="445" y="74" textAnchor="middle" className="fill-text-muted text-[7px]">Read/Write Buffer</text>
          <line x1="380" y1="55" x2="400" y2="55" stroke="#a78bfa" strokeWidth="1.5" />
          <polygon points="398,52 404,55 398,58" fill="#a78bfa" />
        </motion.g>

        {/* NAND packages */}
        {[0, 1, 2, 3].map((ch) => (
          <motion.g key={ch} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.65 + ch * 0.08 }}>
            <rect x={400 + ch * 56} y="105" width="50" height="150" rx="6" fill="#f5a62306" stroke="#f5a62340" strokeWidth="1" />
            <text x={425 + ch * 56} y="120" textAnchor="middle" className="fill-nvme-amber text-[7px] font-mono font-bold">CH{ch}</text>
            {[0, 1].map((die) => (
              <rect key={die} x={406 + ch * 56} y={128 + die * 58} width="38" height="50" rx="4" fill="#f5a62308" stroke="#f5a623" strokeWidth="1" />
            ))}
            {[0, 1].map((die) => (
              <g key={`label-${die}`}>
                <text x={425 + ch * 56} y={148 + die * 58} textAnchor="middle" className="fill-nvme-amber text-[7px] font-bold">NAND</text>
                <text x={425 + ch * 56} y={160 + die * 58} textAnchor="middle" className="fill-text-muted text-[6px]">Die {ch * 2 + die}</text>
                <text x={425 + ch * 56} y={170 + die * 58} textAnchor="middle" className="fill-text-muted text-[5px]">TLC/QLC</text>
              </g>
            ))}
            <motion.rect
              x={422 + ch * 56} y="105" width="6" height="3" rx="1" fill="#f5a623"
              animate={inView ? { y: [105, 240], opacity: [0.8, 0] } : {}}
              transition={{ delay: 1.2 + ch * 0.2, duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.g>
        ))}

        <motion.line x1="380" y1="218" x2="400" y2="180" stroke="#94a3b8" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ delay: 0.6, duration: 0.3 }} />
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
        <AnalogyCard
          concept="An SSD Is a Mini-Computer"
          analogy="An SSD isn't just a storage chip — it's a complete mini-computer with its own processor (controller), its own RAM (DRAM), and its own storage (NAND flash). The controller runs firmware that manages all the complexity: translating addresses, fixing errors, balancing wear, and talking to your computer over PCIe."
        />

        <TermDefinition term="SSD Controller" definition="The 'brain' of the SSD — a specialized processor (often ARM Cortex-R cores) that runs firmware to manage address mapping, error correction, wear leveling, and communication with the host computer." />

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
            A specialized processor (often ARM Cortex-R cores or proprietary RISC designs) that
            runs all the firmware managing the drive. It contains multiple engines: an NVMe
            frontend that parses commands, an FTL engine that manages address mapping, an ECC
            engine for error correction, and a NAND interface that talks to the flash chips.
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
            separate <strong className="text-text-primary">channels</strong> allow parallel access —{" "}
            <em className="text-text-primary">this is the key to SSD speed</em>: the controller
            can read from many chips simultaneously. A typical consumer SSD has 4-8 channels,
            each with 1-2 NAND dies.
          </li>
        </ul>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The diagram below shows how these parts connect. The host computer talks to the
          controller through the PCIe bus (covered in the next lesson), and the controller
          manages everything else.
        </p>

        <SsdDiagram />

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-blue font-semibold mb-1">Controller</div>
            <p className="text-text-muted text-xs">
              Processes NVMe commands, manages FTL mapping, handles ECC, coordinates
              wear leveling, and manages the SLC write cache. Contains embedded CPU cores,
              hardware accelerators for ECC, and DMA engines for PCIe data transfer.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-violet font-semibold mb-1">DRAM</div>
            <p className="text-text-muted text-xs">
              Caches the FTL table for fast lookups (~4 bytes per LBA = ~4 GB for a 1 TB drive).
              Also serves as a read/write buffer. <em>DRAM-less SSDs</em> use HMB
              (Host Memory Buffer) — borrowing a slice of your computer&apos;s RAM instead.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-amber font-semibold mb-1">NAND Channels</div>
            <p className="text-text-muted text-xs">
              Each channel is an independent data path to a group of NAND dies. The controller
              can read/write different channels in parallel — 4 channels means 4x the bandwidth
              of a single channel. More channels = higher throughput and lower latency.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-green font-semibold mb-1">Link Width &amp; Link Speed</div>
            <p className="text-text-muted text-xs">
              The SSD connects to the host via PCIe. <strong>Link width</strong> (e.g., x4) is
              how many PCIe lanes the SSD uses — typically 4 for NVMe. <strong>Link speed</strong>{" "}
              (e.g., 16 GT/s for Gen 4) is how fast each lane transfers data. Together they determine
              the maximum bandwidth between the host and the SSD controller.
            </p>
          </div>
        </div>

        <QuizCard
          id="act1-ssd-quiz1"
          question="What is the main role of the SSD controller?"
          options={[
            { text: "Store data directly in its own memory", explanation: "The controller doesn't store user data — it orchestrates data flow to/from NAND chips." },
            { text: "Runs firmware managing address mapping, ECC, wear leveling, host communication", correct: true, explanation: "Correct! The controller is the 'brain' of the SSD. It runs firmware that handles the FTL (address mapping), error correction (ECC), wear leveling, garbage collection, and the NVMe protocol for host communication." },
            { text: "Convert between different file formats", explanation: "File formats are handled by the OS filesystem, not the SSD controller." },
            { text: "Provide power to the NAND chips", explanation: "Power management is handled by voltage regulators, not the main controller logic." },
          ]}
        />
      </div>
    </SectionWrapper>
  );
}
