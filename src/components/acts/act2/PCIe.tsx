"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const GENS = [
  { gen: "Gen 1", gts: 2.5, encoding: "8b/10b", year: 2003 },
  { gen: "Gen 2", gts: 5, encoding: "8b/10b", year: 2007 },
  { gen: "Gen 3", gts: 8, encoding: "128b/130b", year: 2010 },
  { gen: "Gen 4", gts: 16, encoding: "128b/130b", year: 2017 },
  { gen: "Gen 5", gts: 32, encoding: "128b/130b", year: 2019 },
  { gen: "Gen 6", gts: 64, encoding: "PAM4", year: 2024 },
];

const LANES = [1, 2, 4, 8, 16];

function calcThroughput(gts: number, encoding: string, lanes: number): number {
  const overhead = encoding === "8b/10b" ? 0.8 : encoding === "128b/130b" ? 128 / 130 : 1.0;
  return (gts * overhead * lanes) / 8; // GB/s (gts is in GT/s, each transfer = 1 bit)
}

export default function PCIe() {
  const [selectedGen, setSelectedGen] = useState(3); // Gen 4
  const [selectedLanes, setSelectedLanes] = useState(4);

  const gen = GENS[selectedGen];
  const throughput = calcThroughput(gen.gts, gen.encoding, selectedLanes);

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          How the SSD Connects to Your Computer — PCIe
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          In Act 1 we looked inside the SSD — its cells, pages, blocks, controller, and
          FTL. But how does the SSD actually talk to your computer&apos;s CPU and memory?
          Through a high-speed connection called <strong className="text-text-primary">PCIe</strong>{" "}
          (Peripheral Component Interconnect Express).
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think of PCIe as a multi-lane highway between the CPU and the SSD.
          Each <strong className="text-text-primary">lane</strong> is like one lane on the
          highway — data flows in both directions simultaneously. An NVMe SSD typically
          uses <strong className="text-text-primary">4 lanes</strong> (written as
          &ldquo;x4&rdquo;), and newer generations of PCIe make each lane faster.
        </p>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Use the calculator below to see how bandwidth scales with generation and lane count:
        </p>

        {/* Interactive bandwidth calculator */}
        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-8">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            PCIe Bandwidth Calculator
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            {/* Gen selector */}
            <div>
              <div className="text-text-secondary text-sm font-medium mb-3">Generation</div>
              <div className="flex flex-wrap gap-2">
                {GENS.map((g, i) => (
                  <button
                    key={g.gen}
                    onClick={() => setSelectedGen(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      i === selectedGen
                        ? "bg-nvme-blue text-white shadow-md"
                        : "bg-story-surface text-text-secondary hover:bg-story-border"
                    }`}
                  >
                    {g.gen}
                  </button>
                ))}
              </div>
            </div>

            {/* Lane selector */}
            <div>
              <div className="text-text-secondary text-sm font-medium mb-3">Lanes</div>
              <div className="flex gap-2">
                {LANES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLanes(l)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      l === selectedLanes
                        ? "bg-nvme-green text-white shadow-md"
                        : "bg-story-surface text-text-secondary hover:bg-story-border"
                    }`}
                  >
                    x{l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-r from-nvme-blue/5 to-nvme-green/5 rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-text-muted text-xs font-mono">
                {gen.gen} x{selectedLanes} &middot; {gen.gts} GT/s &middot; {gen.encoding}
              </div>
              <div className="text-4xl font-bold text-text-primary mt-1">
                {throughput.toFixed(1)} <span className="text-lg text-text-muted">GB/s</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-text-muted text-xs">Per lane</div>
              <div className="text-text-secondary font-mono">
                {(throughput / selectedLanes).toFixed(2)} GB/s
              </div>
              <div className="text-text-muted text-xs mt-2">Transfer rate</div>
              <div className="text-text-secondary font-mono">
                {gen.gts} GT/s
              </div>
            </div>
          </div>
        </div>

        {/* Lane visualization */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            PCIe x{selectedLanes} — {selectedLanes} parallel lanes
          </div>
          <div className="flex items-center gap-4 overflow-hidden">
            {/* CPU */}
            <div className="bg-nvme-blue/10 border border-nvme-blue/30 rounded-xl px-4 py-3 text-center flex-shrink-0">
              <div className="text-nvme-blue font-mono font-bold text-xs">CPU</div>
            </div>
            {/* Lanes */}
            <div className="flex-1 flex flex-col gap-1.5">
              {Array.from({ length: Math.min(selectedLanes, 16) }, (_, i) => (
                <div key={i} className="relative h-3 bg-story-surface rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-full w-8 rounded-full bg-nvme-green/40"
                    animate={{ x: ["-2rem", "calc(100% + 2rem)"] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute h-full w-6 rounded-full bg-nvme-blue/30"
                    animate={{ x: ["calc(100% + 2rem)", "-2rem"] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: i * 0.15 + 0.5,
                      ease: "linear",
                    }}
                  />
                </div>
              ))}
            </div>
            {/* SSD */}
            <div className="bg-nvme-green/10 border border-nvme-green/30 rounded-xl px-4 py-3 text-center flex-shrink-0">
              <div className="text-nvme-green font-mono font-bold text-xs">SSD</div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-text-muted">
            <span>← Host memory reads</span>
            <span>Each lane = full-duplex (both directions simultaneously)</span>
            <span>DMA writes →</span>
          </div>
        </div>

        {/* TLP structure visual */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
            Transaction Layer Packet (TLP)
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            Data moves in TLPs — the packets that flow through the lanes above.
          </p>
          <div className="flex items-stretch gap-0 rounded-xl overflow-hidden mb-3">
            <div className="bg-nvme-violet/15 border-r border-nvme-violet/20 px-4 py-3 text-center">
              <div className="text-nvme-violet font-mono font-bold text-[10px]">Header</div>
              <div className="text-text-muted text-[9px]">12-16 B</div>
            </div>
            <div className="bg-nvme-green/10 flex-1 px-4 py-3 text-center border-r border-nvme-green/20">
              <div className="text-nvme-green font-mono font-bold text-[10px]">Data Payload</div>
              <div className="text-text-muted text-[9px]">up to 4 KB</div>
            </div>
            <div className="bg-nvme-amber/10 px-4 py-3 text-center">
              <div className="text-nvme-amber font-mono font-bold text-[10px]">ECRC</div>
              <div className="text-text-muted text-[9px]">4 B</div>
            </div>
          </div>
          <p className="text-text-muted text-[10px] italic">
            NVMe&apos;s efficiency: one doorbell write (a single TLP) can trigger the controller
            to fetch dozens of queued commands.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
