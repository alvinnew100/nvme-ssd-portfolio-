"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

export default function TRIM() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          TRIM, Garbage Collection &amp; the FTL
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Remember: NAND pages can only be written to clean (erased) pages, and
          erasing happens at the block level. When data is overwritten, the old
          pages become &ldquo;stale&rdquo; but can&apos;t be reclaimed until
          the entire block is erased. The{" "}
          <strong className="text-text-primary">Flash Translation Layer (FTL)</strong>{" "}
          manages this complexity.
        </p>

        {/* FTL diagram */}
        <div className="bg-white rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Flash Translation Layer
          </div>
          <svg viewBox="0 0 600 200" className="w-full max-w-xl mx-auto" fill="none">
            {/* Logical addresses */}
            <text x="80" y="20" textAnchor="middle" className="fill-text-muted text-[10px]">Logical (Host sees)</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={`lba-${i}`}>
                <rect x={20 + i * 60} y="30" width="50" height="30" rx="4" className="stroke-nvme-green" strokeWidth="1.5" fill="#00d4aa10" />
                <text x={45 + i * 60} y="50" textAnchor="middle" className="fill-nvme-green text-[9px] font-bold">LBA {i}</text>
              </g>
            ))}

            {/* FTL mapping arrows */}
            <text x="380" y="80" textAnchor="middle" className="fill-nvme-violet text-[10px] font-bold">FTL Map</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={`arrow-${i}`} x1={45 + i * 60} y1="60" x2={45 + [2, 4, 0, 3, 1][i] * 60} y2="130" className="stroke-nvme-violet/40" strokeWidth="1" strokeDasharray="3,3" />
            ))}

            {/* Physical addresses */}
            <text x="80" y="125" textAnchor="middle" className="fill-text-muted text-[10px]">Physical (NAND)</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={`pba-${i}`}>
                <rect x={20 + i * 60} y="135" width="50" height="30" rx="4" className={i === 1 || i === 3 ? "stroke-nvme-amber" : "stroke-nvme-red"} strokeWidth="1.5" fill={i === 1 || i === 3 ? "#f5a62315" : "#ed5f7410"} />
                <text x={45 + i * 60} y="155" textAnchor="middle" className={`text-[9px] font-bold ${i === 1 || i === 3 ? "fill-nvme-amber" : "fill-nvme-red"}`}>
                  {i === 1 || i === 3 ? `Page ${i}` : "Stale"}
                </text>
              </g>
            ))}

            <text x="380" y="185" textAnchor="middle" className="fill-text-muted text-[9px]">Stale pages waste space until GC reclaims the block</text>
          </svg>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          <strong className="text-text-primary">TRIM</strong> (Dataset Management
          command, opcode <code className="text-text-code">0x09</code>) tells the
          SSD which LBAs the host no longer needs. Without TRIM, the controller
          doesn&apos;t know which pages are stale and must move valid data
          during garbage collection, amplifying writes (write amplification).
        </p>

        <NvmeCliBlock
          command="nvme dsm /dev/nvme0n1 -d --slbs=0 --blocks=256"
          note="TRIM 256 blocks starting at LBA 0"
        />

        <div className="mt-6">
          <InfoCard variant="warning" title="Write Amplification Factor (WAF)">
            WAF = (NAND writes) / (Host writes). Without TRIM, WAF can reach 3-5x
            on a full drive, meaning the SSD writes 3-5x more data to NAND than
            the host actually sends. TRIM keeps WAF close to 1.0.
          </InfoCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
