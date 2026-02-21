"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

export default function TRIM() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          TRIM &amp; Garbage Collection &mdash; Keeping the SSD Fast
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          In Act 1, we learned about the FTL — the Flash Translation Layer that
          writes data to new pages instead of overwriting old ones. Old pages become
          &ldquo;stale.&rdquo; We also learned that erasing happens at the block
          level (hundreds of pages at once).
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But who cleans up those stale pages?</em>{" "}
          That&apos;s <strong className="text-text-primary">Garbage Collection
          (GC)</strong>. When free pages run low, the SSD picks a block with many
          stale pages, copies the still-valid pages to a new block, then erases the
          entire old block — reclaiming it for reuse.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Here&apos;s the problem: <em className="text-text-primary">how does the
          SSD know which pages are truly stale?</em> When you delete a file, the
          filesystem marks those LBAs as free — but it only tells the filesystem,
          not the SSD. The SSD still thinks those pages hold valid data and will
          waste time copying them during garbage collection.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          That&apos;s where <strong className="text-text-primary">TRIM</strong> comes
          in. TRIM (via the Dataset Management command, opcode{" "}
          <code className="text-text-code">0x09</code>) tells the SSD: &ldquo;these
          LBA ranges are no longer used — you can treat them as free.&rdquo; This
          simple notification has a profound effect:
        </p>

        {/* Before/After TRIM comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-red font-mono font-bold text-sm mb-2">
              Without TRIM
            </div>
            <div className="space-y-2 text-text-secondary text-xs">
              <p>1. You delete a 1GB file</p>
              <p>2. Filesystem marks LBAs as free</p>
              <p>3. SSD doesn&apos;t know — still thinks data is valid</p>
              <p>4. During GC, SSD copies these &ldquo;valid&rdquo; pages</p>
              <p>5. <strong className="text-nvme-red">More copying = more NAND writes = higher WAF</strong></p>
            </div>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-green font-mono font-bold text-sm mb-2">
              With TRIM
            </div>
            <div className="space-y-2 text-text-secondary text-xs">
              <p>1. You delete a 1GB file</p>
              <p>2. Filesystem marks LBAs as free</p>
              <p>3. OS sends TRIM command to SSD</p>
              <p>4. SSD marks those pages as invalid (stale)</p>
              <p>5. <strong className="text-nvme-green">GC skips them = less copying = lower WAF</strong></p>
            </div>
          </div>
        </div>

        {/* FTL diagram */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            How garbage collection reclaims space
          </div>
          <svg viewBox="0 0 600 200" className="w-full max-w-xl mx-auto" fill="none">
            <text x="100" y="20" textAnchor="middle" className="fill-text-muted text-[10px]">Before GC — block has 3 stale pages</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={`before-${i}`}>
                <rect x={20 + i * 60} y="30" width="50" height="30" rx="4"
                  className={[1, 3, 4].includes(i) ? "stroke-nvme-red" : "stroke-nvme-green"}
                  strokeWidth="1.5"
                  fill={[1, 3, 4].includes(i) ? "#ed5f7410" : "#00d4aa10"}
                />
                <text x={45 + i * 60} y="50" textAnchor="middle"
                  className={`text-[9px] font-bold ${[1, 3, 4].includes(i) ? "fill-nvme-red" : "fill-nvme-green"}`}
                >
                  {[1, 3, 4].includes(i) ? "Stale" : "Valid"}
                </text>
              </g>
            ))}

            {/* Arrow */}
            <text x="300" y="95" textAnchor="middle" className="fill-nvme-violet text-[10px] font-bold">GC: copy valid → erase block</text>
            <line x1="300" y1="65" x2="300" y2="105" className="stroke-nvme-violet" strokeWidth="1.5" strokeDasharray="4,4" />

            <text x="100" y="125" textAnchor="middle" className="fill-text-muted text-[10px]">After GC — block erased, 5 free pages</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={`after-${i}`}>
                <rect x={20 + i * 60} y="135" width="50" height="30" rx="4"
                  className="stroke-story-border"
                  strokeWidth="1.5"
                  fill="#f0ece4"
                />
                <text x={45 + i * 60} y="155" textAnchor="middle"
                  className="fill-text-muted text-[9px]"
                >
                  Free
                </text>
              </g>
            ))}

            <text x="450" y="155" textAnchor="middle" className="fill-text-muted text-[9px]">Valid pages moved to a new block</text>
          </svg>
        </div>

        <NvmeCliBlock
          command="nvme dsm /dev/nvme0n1 -d --slbs=0 --blocks=256"
          note="TRIM 256 blocks starting at LBA 0. -d = deallocate flag"
        />

        <div className="mt-6">
          <InfoCard variant="warning" title="TRIM isn't instant — and can cause latency spikes">
            <em>But if TRIM is so important, why not run it constantly?</em> Because
            processing TRIM commands takes time — the FTL needs to update its mapping
            tables. On a busy drive, continuous TRIM (mount -o discard) can cause
            latency spikes during writes. That&apos;s why production systems often use{" "}
            <strong>periodic TRIM</strong> instead — running{" "}
            <code className="text-text-code">fstrim</code> weekly via systemd&apos;s{" "}
            <code className="text-text-code">fstrim.timer</code>.
          </InfoCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
