"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import QuizCard from "@/components/story/QuizCard";

const CELL_ENDURANCE = [
  { type: "SLC", pe: "~100,000", color: "#00d4aa", analogy: "A thick marker — lots of writes before it runs out" },
  { type: "MLC", pe: "~10,000", color: "#635bff", analogy: "A regular pen — moderate lifetime" },
  { type: "TLC", pe: "~3,000", color: "#7c5cfc", analogy: "A fine-tip pen — writes well but wears faster" },
  { type: "QLC", pe: "~1,000", color: "#f5a623", analogy: "A pencil — cheapest but needs replacing soonest" },
];

function WearHeatMap() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // Simulated wear distribution: without vs with wear leveling
  const withoutWL = [95, 88, 92, 5, 3, 7, 4, 2, 6, 3, 8, 5, 90, 85, 4, 3];
  const withWL =    [42, 45, 41, 43, 44, 40, 42, 43, 41, 44, 42, 43, 41, 42, 43, 44];

  const getColor = (pct: number) => {
    if (pct > 80) return "#f87171";
    if (pct > 50) return "#f5a623";
    if (pct > 30) return "#38bdf8";
    return "#00d4aa";
  };

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Block Wear Distribution — Without vs With Wear Leveling
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: "Without Wear Leveling", data: withoutWL, bad: true },
          { label: "With Wear Leveling", data: withWL, bad: false },
        ].map((scenario) => (
          <div key={scenario.label}>
            <div className={`text-xs font-semibold mb-2 ${scenario.bad ? "text-nvme-red" : "text-nvme-green"}`}>
              {scenario.label}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {scenario.data.map((wear, i) => (
                <motion.div
                  key={i}
                  className="aspect-square rounded flex items-center justify-center text-[7px] font-mono text-white font-bold"
                  style={{ backgroundColor: getColor(wear) }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: i * 0.03 + (scenario.bad ? 0 : 0.5), type: "spring" }}
                >
                  {wear}%
                </motion.div>
              ))}
            </div>
            <div className="text-text-muted text-[9px] mt-1 text-center">
              {scenario.bad
                ? "Hot blocks worn out (90%+), cold blocks barely used (3%)"
                : "All blocks evenly distributed (~42%)"}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center mt-4 text-[9px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ backgroundColor: "#f87171" }} /> &gt;80%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ backgroundColor: "#f5a623" }} /> 50-80%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ backgroundColor: "#38bdf8" }} /> 30-50%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ backgroundColor: "#00d4aa" }} /> &lt;30%</span>
      </div>
    </div>
  );
}

export default function WearLeveling() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Wear Leveling &mdash; Making Every Block Last
        </h3>
        <AnalogyCard
          concept="Wear Leveling Spreads the Load"
          analogy="Without wear leveling, frequently-written blocks would wear out quickly while rarely-written blocks stay fresh — like some lanes on a highway getting potholes while others stay pristine. Dynamic wear leveling picks the least-worn free block for new writes. Static wear leveling goes further: it periodically moves cold (rarely updated) data off low-wear blocks, forcing those blocks to take some hot writes too."
        />

        <TermDefinition term="Dynamic Wear Leveling" definition="Ensures new writes go to the free block with the lowest erase count. Effective for hot data, but cold data blocks that are never rewritten will accumulate a growing erase count gap." />

        <TermDefinition term="Static Wear Leveling" definition="Periodically moves cold (rarely written) data from low-wear blocks to high-wear blocks, then uses the freed low-wear blocks for new writes. Prevents cold blocks from hoarding low erase counts while hot blocks wear out." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          In Lesson 2, we learned that each NAND cell type has a different number of
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

        <WearHeatMap />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {CELL_ENDURANCE.map((c, i) => (
            <motion.div
              key={c.type}
              className="bg-story-card rounded-2xl p-5 card-shadow text-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="font-mono font-bold text-lg mb-1" style={{ color: c.color }}>
                {c.type}
              </div>
              <div className="text-text-primary font-mono text-sm">{c.pe}</div>
              <div className="text-text-muted text-xs mb-2">P/E cycles</div>
              <div className="text-text-muted text-[10px] italic">{c.analogy}</div>
            </motion.div>
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
                Dynamic Wear Leveling — Dynamic Blocks
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                When writing new data, the FTL picks a <strong className="text-text-primary">
                dynamic spare block</strong> with the lowest erase count as the next write
                target. The block that receives these hot writes becomes a{" "}
                <strong className="text-text-primary">dynamic block</strong>. This is simple
                and effective for actively written data.
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>Limitation:</em> cold data (rarely written) might sit on low-wear{" "}
                <strong>static blocks</strong> forever, wasting their remaining P/E cycles.
                See Lesson 4 for the complete block type taxonomy.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-2">
                Static Wear Leveling — Static &amp; Static Spare Blocks
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                Periodically moves cold data from low-wear <strong className="text-text-primary">
                static blocks</strong> to high-wear <strong className="text-text-primary">
                static spare blocks</strong>. The old static block (now empty) returns to the
                spare pool. This frees up fresh blocks for hot writes.
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>Better uniformity:</em> ensures ALL blocks wear evenly, not just
                the ones being actively written. The VPC (Valid Page Count) of static
                blocks is typically at max since the data rarely changes.
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

        <QuizCard
          id="act4-wear-quiz1"
          question="What is the key difference between static and dynamic wear leveling?"
          options={[
            { text: "Static is faster than dynamic", explanation: "Speed isn't the differentiator. It's about which data gets moved." },
            { text: "Dynamic only moves hot data; static also moves cold data from low-wear blocks", correct: true, explanation: "Correct! Dynamic wear leveling spreads writes by picking the lowest-wear free block for new writes. Static wear leveling goes further — it periodically moves cold (rarely-updated) data off low-wear blocks, freeing those blocks for hot data. This prevents cold data from hoarding low-wear blocks." },
            { text: "Static only works with SLC cells", explanation: "Both types work with all cell types. The difference is in their data movement strategy." },
            { text: "Dynamic uses more power", explanation: "Power consumption isn't the key difference. It's about whether cold data gets redistributed." },
          ]}
        />
      </div>
    </SectionWrapper>
  );
}
