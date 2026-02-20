"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

const CELL_ENDURANCE = [
  { type: "SLC", pe: "~100,000", tbw: "High", color: "#00d4aa" },
  { type: "MLC", pe: "~10,000", tbw: "Medium", color: "#635bff" },
  { type: "TLC", pe: "~3,000", tbw: "Standard", color: "#7c5cfc" },
  { type: "QLC", pe: "~1,000", tbw: "Low", color: "#f5a623" },
];

export default function WearLeveling() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Wear Leveling &amp; Endurance
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Every NAND block has a limited number of{" "}
          <strong className="text-text-primary">Program/Erase (P/E) cycles</strong>{" "}
          before it wears out. The controller uses wear leveling to distribute
          writes evenly across all blocks, preventing any single block from
          dying prematurely.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {CELL_ENDURANCE.map((c) => (
            <div key={c.type} className="bg-story-card rounded-2xl p-5 card-shadow text-center">
              <div className="font-mono font-bold text-lg mb-1" style={{ color: c.color }}>
                {c.type}
              </div>
              <div className="text-text-primary font-mono text-sm">{c.pe}</div>
              <div className="text-text-muted text-xs">P/E cycles</div>
            </div>
          ))}
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          <strong className="text-text-primary">TBW (Terabytes Written)</strong> is
          the manufacturer&apos;s rated endurance. For example, a 1 TB TLC SSD
          might be rated for 600 TBW. You can check current usage via SMART:
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-muted text-xs font-mono mb-3">Endurance check</div>
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
        </div>

        <div className="mt-6 bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Two types of wear leveling
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-nvme-green font-mono font-bold text-xs mb-1">
                Dynamic
              </div>
              <p className="text-text-muted text-xs">
                Only moves data that&apos;s being actively written. Simple but
                doesn&apos;t help with &ldquo;cold&rdquo; data sitting on
                low-wear blocks.
              </p>
            </div>
            <div>
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">
                Static
              </div>
              <p className="text-text-muted text-xs">
                Periodically moves cold data from low-wear blocks to high-wear
                blocks, freeing up fresh blocks for hot writes. Better
                uniformity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
