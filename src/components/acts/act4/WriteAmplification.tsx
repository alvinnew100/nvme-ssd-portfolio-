"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

export default function WriteAmplification() {
  const [hostWritesGB, setHostWritesGB] = useState(100);
  const [trimEnabled, setTrimEnabled] = useState(true);
  const [driveFullness, setDriveFullness] = useState(50);

  // WAF model: trimmed and low fullness → ~1.1, no trim + 90% full → ~4.0
  const baseWaf = trimEnabled ? 1.05 : 1.5;
  const fullnessFactor = 1 + (driveFullness / 100) * (trimEnabled ? 0.3 : 2.5);
  const waf = Math.round(baseWaf * fullnessFactor * 100) / 100;
  const nandWritesGB = Math.round(hostWritesGB * waf);

  const wafColor = waf < 1.5 ? "#00b894" : waf < 2.5 ? "#e8a317" : "#e05d6f";

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Write Amplification Factor (WAF)
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Write amplification is the ratio of data actually written to NAND versus
          data the host sent. A WAF of 2.0 means the SSD writes 2x the host data
          to NAND — halving the drive&apos;s effective endurance. WAF is caused by
          garbage collection, which must copy valid pages when reclaiming blocks.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Two factors dominate WAF:{" "}
          <strong className="text-text-primary">TRIM</strong> (tells the FTL which
          pages are free) and <strong className="text-text-primary">drive fullness
          </strong> (a nearly-full drive has fewer free blocks for GC to work with).
        </p>

        {/* Interactive WAF calculator */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            Interactive WAF Calculator
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Controls */}
            <div className="space-y-5">
              <div>
                <label className="text-text-secondary text-sm font-medium block mb-2">
                  Host Data Written: <span className="text-text-code font-mono">{hostWritesGB} GB</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={500}
                  value={hostWritesGB}
                  onChange={(e) => setHostWritesGB(Number(e.target.value))}
                  className="w-full accent-nvme-blue"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>10 GB</span>
                  <span>500 GB</span>
                </div>
              </div>

              <div>
                <label className="text-text-secondary text-sm font-medium block mb-2">
                  Drive Fullness: <span className="text-text-code font-mono">{driveFullness}%</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={95}
                  value={driveFullness}
                  onChange={(e) => setDriveFullness(Number(e.target.value))}
                  className="w-full accent-nvme-amber"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>10% (mostly empty)</span>
                  <span>95% (nearly full)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTrimEnabled(!trimEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    trimEnabled ? "bg-nvme-green" : "bg-story-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      trimEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-text-secondary text-sm">
                  TRIM {trimEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <div className="text-text-muted text-xs font-mono mb-1">
                  Write Amplification Factor
                </div>
                <div
                  className="text-5xl font-bold font-mono"
                  style={{ color: wafColor }}
                >
                  {waf.toFixed(2)}x
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-xs">Host writes</span>
                  <span className="text-nvme-green font-mono text-sm font-bold">
                    {hostWritesGB} GB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-xs">NAND writes</span>
                  <span className="font-mono text-sm font-bold" style={{ color: wafColor }}>
                    {nandWritesGB} GB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-xs">Extra wear</span>
                  <span className="text-nvme-red font-mono text-sm font-bold">
                    +{nandWritesGB - hostWritesGB} GB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual bar comparison */}
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-text-muted font-mono mb-1">Host writes</div>
              <div className="w-full bg-story-surface rounded-full h-4">
                <div
                  className="h-4 rounded-full bg-nvme-green transition-all"
                  style={{ width: `${Math.min((hostWritesGB / nandWritesGB) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted font-mono mb-1">NAND writes (host + GC overhead)</div>
              <div className="w-full bg-story-surface rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all"
                  style={{ width: "100%", backgroundColor: wafColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* What affects WAF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-green text-sm mb-1">
              Reduces WAF
            </div>
            <ul className="text-text-muted text-xs space-y-1">
              <li>• TRIM/discard enabled</li>
              <li>• Over-provisioning (leaving 10-28% unpartitioned)</li>
              <li>• Sequential write patterns</li>
              <li>• Low drive fullness (&lt;70%)</li>
              <li>• Larger block sizes</li>
            </ul>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-red text-sm mb-1">
              Increases WAF
            </div>
            <ul className="text-text-muted text-xs space-y-1">
              <li>• No TRIM (OS doesn&apos;t inform FTL)</li>
              <li>• High drive fullness (&gt;90%)</li>
              <li>• Random small writes (4K)</li>
              <li>• No over-provisioning</li>
              <li>• Misaligned I/O</li>
            </ul>
          </div>
        </div>

        <InfoCard variant="tip" title="Measuring WAF in practice">
          Use SMART log attributes: <code className="text-text-code">Data Units Written</code>{" "}
          (host) and vendor-specific NAND writes counter. WAF = NAND writes / host writes.
          Run <code className="text-text-code">nvme smart-log /dev/nvme0</code> before and
          after a workload to calculate the delta.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
