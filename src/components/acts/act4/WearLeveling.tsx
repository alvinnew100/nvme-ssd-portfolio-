"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

const CELL_ENDURANCE = [
  { type: "SLC", pe: "~100,000", color: "#00d4aa", analogy: "A thick marker — lots of writes before it runs out" },
  { type: "MLC", pe: "~10,000", color: "#635bff", analogy: "A regular pen — moderate lifetime" },
  { type: "TLC", pe: "~3,000", color: "#7c5cfc", analogy: "A fine-tip pen — writes well but wears faster" },
  { type: "QLC", pe: "~1,000", color: "#f5a623", analogy: "A pencil — cheapest but needs replacing soonest" },
];

export default function WearLeveling() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Wear Leveling &mdash; Making Every Block Last
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          In Act 1, we learned that each NAND cell type has a different number of
          voltage levels (SLC=2, MLC=4, TLC=8, QLC=16). <em className="text-text-primary">
          But there&apos;s a consequence we haven&apos;t discussed yet:</em> the more
          voltage levels you pack into a cell, the faster it wears out.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Every time a NAND block is erased and reprogrammed, the oxide insulation
          around the floating gate degrades slightly. After enough cycles, the
          cell can no longer reliably hold charge. This limit is called the{" "}
          <strong className="text-text-primary">P/E (Program/Erase) cycle</strong> count:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {CELL_ENDURANCE.map((c) => (
            <div key={c.type} className="bg-story-card rounded-2xl p-5 card-shadow text-center">
              <div className="font-mono font-bold text-lg mb-1" style={{ color: c.color }}>
                {c.type}
              </div>
              <div className="text-text-primary font-mono text-sm">{c.pe}</div>
              <div className="text-text-muted text-xs mb-2">P/E cycles</div>
              <div className="text-text-muted text-[10px] italic">{c.analogy}</div>
            </div>
          ))}
        </div>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Here&apos;s the problem:</em> if the SSD
          always wrote to the same blocks (e.g., the OS swap partition), those blocks
          would wear out quickly while others sit barely used. The drive would fail
          long before its rated lifetime.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <strong className="text-text-primary">Wear leveling</strong> solves this.
          The SSD&apos;s controller distributes writes across all blocks as evenly
          as possible, so no single block dies prematurely. Think of it like rotating
          tires on a car — you wear them evenly so they all last longer.
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Two types of wear leveling
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                Dynamic Wear Leveling
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                When writing new data, the FTL picks the block with the lowest erase
                count. Simple and effective for active data.
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>Limitation:</em> cold data (rarely written) might sit on low-wear
                blocks forever, wasting their remaining P/E cycles.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-2">
                Static Wear Leveling
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                Periodically moves cold data from low-wear blocks to high-wear blocks.
                This frees up fresh blocks for hot writes.
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>Better uniformity:</em> ensures ALL blocks wear evenly, not just
                the ones being actively written.
              </p>
            </div>
          </div>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          <strong className="text-text-primary">TBW (Terabytes Written)</strong> is
          the manufacturer&apos;s rated endurance — how much data you can write before
          the drive is expected to start failing. For a 1 TB TLC SSD, a typical
          rating is 600 TBW. You can check current usage in SMART:
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-3">Endurance check — from SMART</div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-text-secondary">Percentage Used</span>
              <span className="text-nvme-green">3%</span>
            </div>
            <div className="w-full bg-story-surface rounded-full h-2.5">
              <div className="bg-nvme-green h-2.5 rounded-full" style={{ width: "3%" }} />
            </div>
            <div className="flex justify-between text-text-muted">
              <span>0 TBW</span>
              <span>600 TBW (rated)</span>
            </div>
          </div>
          <p className="text-text-muted text-[10px] mt-3 italic">
            Note: 100% doesn&apos;t mean the drive stops working — it means the
            manufacturer&apos;s warranty period for wear is over. Many drives
            continue working well beyond 100%.
          </p>
        </div>

        <InfoCard variant="note" title="Wear leveling + WAF — the connection">
          Wear leveling and write amplification are interconnected. Static wear
          leveling involves <em>moving</em> data, which is additional NAND writes
          (increasing WAF). The FTL must balance wear uniformity against write
          amplification — aggressively moving data evens wear but costs more writes.
          This is one of the hardest tradeoffs in SSD firmware design.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
