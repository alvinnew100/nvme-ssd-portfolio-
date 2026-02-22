"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import FillInBlank from "@/components/story/FillInBlank";

export default function WriteAmplification() {
  const [hostWritesGB, setHostWritesGB] = useState(100);
  const [trimEnabled, setTrimEnabled] = useState(true);
  const [driveFullness, setDriveFullness] = useState(50);

  const baseWaf = trimEnabled ? 1.05 : 1.5;
  const fullnessFactor = 1 + (driveFullness / 100) * (trimEnabled ? 0.3 : 2.5);
  const waf = Math.round(baseWaf * fullnessFactor * 100) / 100;
  const nandWritesGB = Math.round(hostWritesGB * waf);

  const wafColor = waf < 1.5 ? "#00b894" : waf < 2.5 ? "#e8a317" : "#e05d6f";

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Write Amplification &mdash; The Hidden Cost of Writing
        </h3>
        <AnalogyCard
          concept="Write Amplification Is Wasted Effort"
          analogy="Imagine you want to change one sentence in a book, but you have to rewrite the entire chapter. That's write amplification — the SSD writes more data to NAND than the host actually requested. A WAF of 3.0 means for every 1 GB the host writes, the SSD internally writes 3 GB (due to GC copying valid pages, metadata updates, etc.)."
        />

        <TermDefinition term="WAF (Write Amplification Factor)" definition="The ratio of actual NAND writes to host-requested writes. WAF = NAND writes / Host writes. Ideal WAF is 1.0 (no amplification). Real-world WAF ranges from 1.1 (sequential, TRIM-enabled) to 10+ (random writes, full drive, no TRIM). Lower WAF means better endurance and performance." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We just learned that garbage collection copies valid pages when reclaiming
          blocks. <em className="text-text-primary">But that copying is itself a
          write to NAND.</em> This means the SSD writes <em>more</em> data to NAND
          than the host actually sent.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The ratio is called the <strong className="text-text-primary">Write
          Amplification Factor (WAF)</strong>:
        </p>
        <div className="bg-story-card rounded-xl p-4 card-shadow mb-4 text-center">
          <span className="font-mono text-text-code text-lg">
            WAF = Total NAND Writes &divide; Host Writes
          </span>
        </div>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          A WAF of 1.0 is perfect — the SSD writes only what you asked. A WAF of
          3.0 means the SSD writes 3x the data to NAND — <em className="text-text-primary">
          tripling the wear on the NAND cells</em>. This directly reduces the
          drive&apos;s lifespan.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why does WAF matter?</em> Because NAND
          cells have limited P/E (Program/Erase) cycles. If WAF is 3x, your 600 TBW
          rated drive effectively only lasts 200 TBW of <em>your</em> data. Two
          factors dominate WAF:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li><strong className="text-text-primary">TRIM</strong> — tells the FTL which pages are free, so GC doesn&apos;t copy dead data</li>
          <li><strong className="text-text-primary">Drive fullness</strong> — a nearly-full drive has fewer free blocks, forcing GC to work harder</li>
          <li><strong className="text-text-primary">Workload pattern</strong> — sequential writes fill blocks cleanly (low WAF), while random 4KB writes scatter data across many blocks, leaving each partially valid and forcing GC to copy more valid pages during reclamation</li>
        </ul>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Typical WAF values: consumer SSDs under normal use see ~1.5-3x,
          enterprise drives with steady-state random writes can reach 3-5x,
          and well-tuned sequential workloads with TRIM approach the ideal 1.0x.
        </p>

        {/* Interactive WAF calculator */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            Interactive WAF Calculator — try different scenarios
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
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
                  <span className="text-text-muted text-xs">Actual NAND writes</span>
                  <span className="font-mono text-sm font-bold" style={{ color: wafColor }}>
                    {nandWritesGB} GB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-xs">Wasted writes (GC overhead)</span>
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
              <div className="text-[10px] text-text-muted font-mono mb-1">What you wrote</div>
              <div className="w-full bg-story-surface rounded-full h-4">
                <div
                  className="h-4 rounded-full bg-nvme-green transition-all"
                  style={{ width: `${Math.min((hostWritesGB / nandWritesGB) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted font-mono mb-1">What the SSD actually wrote to NAND (your data + GC overhead)</div>
              <div className="w-full bg-story-surface rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all"
                  style={{ width: "100%", backgroundColor: wafColor }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-green text-sm mb-1">
              How to reduce WAF
            </div>
            <ul className="text-text-muted text-xs space-y-1">
              <li>&#8226; Enable TRIM/discard</li>
              <li>&#8226; Leave 10-28% unpartitioned (over-provisioning)</li>
              <li>&#8226; Write sequentially when possible</li>
              <li>&#8226; Keep drive below 70% full</li>
            </ul>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-red text-sm mb-1">
              What increases WAF
            </div>
            <ul className="text-text-muted text-xs space-y-1">
              <li>&#8226; No TRIM (OS doesn&apos;t inform FTL)</li>
              <li>&#8226; Drive &gt;90% full</li>
              <li>&#8226; Random small writes (4KB)</li>
              <li>&#8226; Misaligned I/O</li>
            </ul>
          </div>
        </div>

        <InfoCard variant="tip" title="Measuring WAF in practice">
          Check SMART before and after a workload: <code className="text-text-code">
          Data Units Written</code> shows host writes. For NAND writes, you need
          the vendor-specific counter (varies by manufacturer). WAF = NAND writes /
          host writes. Run <code className="text-text-code">nvme smart-log /dev/nvme0
          </code> and note the values before and after.
        </InfoCard>

        <FillInBlank
          id="act4-waf-fill1"
          prompt="If the host writes 100 GB but the SSD writes 300 GB to NAND, the WAF is {blank}."
          blanks={[{ answer: "3", tolerance: 0, placeholder: "?" }]}
          explanation="WAF (Write Amplification Factor) = NAND writes / Host writes = 300 / 100 = 3. A WAF of 3 means for every 1 GB the host writes, the SSD internally writes 3 GB due to GC copying valid pages."
        />
      </div>
    </SectionWrapper>
  );
}
