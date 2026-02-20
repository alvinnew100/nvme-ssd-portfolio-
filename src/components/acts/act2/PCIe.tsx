"use client";

import { useState } from "react";
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
          PCIe Transport
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          NVMe rides on PCIe (Peripheral Component Interconnect Express). PCIe
          is a point-to-point serial bus organized into{" "}
          <strong className="text-text-primary">lanes</strong>. Each lane is a
          pair of differential signal wires (one TX, one RX). An NVMe SSD
          typically uses 4 lanes (x4).
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

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Data moves in <strong className="text-text-primary">Transaction Layer Packets (TLPs)</strong>.
          When the host writes an NVMe command to the SQ, the NVMe driver uses
          a PCIe memory write TLP. When the controller DMAs data back, it uses
          another memory write TLP targeting host memory. These are all
          memory-mapped I/O operations &mdash; no special I/O instructions needed.
        </p>

        <InfoCard variant="info" title="TLP Structure">
          A TLP has a header (12-16 bytes), an optional data payload (up to 4 KB
          per TLP), and an ECRC. NVMe&apos;s efficiency comes from batching: one
          doorbell write (a single TLP) can trigger the controller to fetch
          dozens of queued commands.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
