"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
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

function M2ConnectorVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // M.2 M-key pin groups (simplified but accurate grouping)
  const pinGroups = [
    { label: "GND", pins: 3, color: "#475569", desc: "Ground" },
    { label: "3.3V", pins: 2, color: "#ef4444", desc: "Power" },
    { label: "PCIe Lane 0\nTX+/TX-/RX+/RX-", pins: 4, color: "#00d4aa", desc: "Lane 0" },
    { label: "PCIe Lane 1\nTX+/TX-/RX+/RX-", pins: 4, color: "#38bdf8", desc: "Lane 1" },
    { label: "GND", pins: 2, color: "#475569", desc: "Ground" },
    { label: "M-key notch", pins: 0, color: "transparent", desc: "Key", isNotch: true },
    { label: "PCIe Lane 2\nTX+/TX-/RX+/RX-", pins: 4, color: "#7c5cfc", desc: "Lane 2" },
    { label: "PCIe Lane 3\nTX+/TX-/RX+/RX-", pins: 4, color: "#f5a623", desc: "Lane 3" },
    { label: "GND", pins: 2, color: "#475569", desc: "Ground" },
    { label: "SMBUS/LED", pins: 2, color: "#94a3b8", desc: "Mgmt" },
    { label: "3.3V", pins: 2, color: "#ef4444", desc: "Power" },
    { label: "PERST#/CLKREQ#", pins: 2, color: "#94a3b8", desc: "Ctrl" },
    { label: "REFCLK+/-", pins: 2, color: "#94a3b8", desc: "Clock" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        M.2 Edge Connector — What Each &ldquo;Golden Tooth&rdquo; Does
      </div>
      <p className="text-text-secondary text-xs mb-4 leading-relaxed">
        The golden contacts on the bottom of an M.2 SSD are the <strong className="text-text-primary">
        edge connector</strong> — they plug directly into the M.2 slot on your motherboard. Each contact
        (&ldquo;tooth&rdquo;) carries a specific signal. The <strong className="text-text-primary">M-key
        notch</strong> (the gap in the contacts) ensures you can only insert the SSD in the correct
        orientation, and identifies it as an NVMe device (not SATA).
      </p>

      {/* Connector diagram */}
      <div className="bg-story-dark rounded-xl p-4 mb-4 overflow-x-auto">
        <div className="min-w-[500px]">
          {/* SSD body */}
          <motion.div
            className="bg-story-surface/10 border border-story-border/30 rounded-t-lg mx-8 h-12 flex items-center justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            <span className="text-text-muted text-[10px] font-mono">M.2 2280 NVMe SSD PCB</span>
          </motion.div>

          {/* Edge connector pins */}
          <div className="flex items-end justify-center gap-[1px] mx-8">
            {pinGroups.map((group, gi) => {
              if (group.isNotch) {
                return (
                  <motion.div
                    key={gi}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-8 h-6 bg-story-dark border-t-2 border-dashed border-text-muted/30 flex items-center justify-center">
                      <span className="text-text-muted text-[7px] font-mono">M-Key</span>
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={gi}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + gi * 0.03 }}
                >
                  <div className="flex gap-[1px]">
                    {Array.from({ length: group.pins }).map((_, pi) => (
                      <div
                        key={pi}
                        className="w-3 h-6 rounded-b-sm"
                        style={{ backgroundColor: group.color, opacity: 0.8 }}
                      />
                    ))}
                  </div>
                  <div className="text-[7px] font-mono mt-1 text-center whitespace-pre-line leading-tight" style={{ color: group.color }}>
                    {group.desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pin legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#00d4aa]" />
          <span className="text-text-muted"><strong className="text-text-primary">Lane 0</strong> — TX+, TX-, RX+, RX-</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#38bdf8]" />
          <span className="text-text-muted"><strong className="text-text-primary">Lane 1</strong> — TX+, TX-, RX+, RX-</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#7c5cfc]" />
          <span className="text-text-muted"><strong className="text-text-primary">Lane 2</strong> — TX+, TX-, RX+, RX-</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#f5a623]" />
          <span className="text-text-muted"><strong className="text-text-primary">Lane 3</strong> — TX+, TX-, RX+, RX-</span>
        </div>
      </div>
      <p className="text-text-muted text-[10px] mt-3 leading-relaxed">
        Each PCIe lane uses 4 physical contacts: <strong className="text-text-primary">TX+/TX-</strong> (transmit
        differential pair) and <strong className="text-text-primary">RX+/RX-</strong> (receive differential pair).
        The differential signaling (two wires carrying opposite signals) allows the receiver to cancel out
        noise — this is how PCIe achieves multi-GHz speeds over a short PCB trace. An x4 NVMe SSD uses
        4 lanes = 16 signal contacts + ground, power, clock, and control pins.
      </p>
    </div>
  );
}

export default function PCIe() {
  const [selectedGen, setSelectedGen] = useState(3); // Gen 4
  const [selectedLanes, setSelectedLanes] = useState(4);

  const gen = GENS[selectedGen];
  const throughput = calcThroughput(gen.gts, gen.encoding, selectedLanes);
  const encodingRatio = gen.encoding === "8b/10b" ? "8/10" : gen.encoding === "128b/130b" ? "128/130" : "1";
  const encodingPct = gen.encoding === "8b/10b" ? "80%" : gen.encoding === "128b/130b" ? "98.5%" : "~100%";

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

        {/* Link Width and Link Speed explanation */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
            Link Width &amp; Link Speed — Two Dimensions of PCIe Bandwidth
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-sm mb-1">Link Width (x1, x4, x8, x16)</div>
              <p className="text-text-secondary text-xs leading-relaxed">
                <strong className="text-text-primary">How many lanes</strong> the device uses simultaneously.
                Written as &ldquo;x4&rdquo; (pronounced &ldquo;by four&rdquo;). Each lane is an independent
                bidirectional data path. An NVMe SSD uses <strong className="text-text-primary">x4</strong>{" "}
                (4 lanes). A GPU typically uses x16 (16 lanes). More lanes = more parallel data paths = more
                bandwidth. When you see &ldquo;PCIe x4&rdquo; in an SSD spec, that&apos;s the link width.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-sm mb-1">Link Speed (GT/s)</div>
              <p className="text-text-secondary text-xs leading-relaxed">
                <strong className="text-text-primary">How fast each lane transfers data</strong>, measured in
                GT/s (Giga-Transfers per second). Each &ldquo;transfer&rdquo; sends 1 bit. PCIe Gen 4 runs at
                16 GT/s per lane — meaning each lane toggles its signal 16 billion times per second. When SSD
                specs say &ldquo;PCIe Gen 4&rdquo;, they&apos;re referring to the link speed.
              </p>
            </div>
          </div>
          <div className="bg-nvme-blue/5 rounded-xl p-3 border border-nvme-blue/20">
            <p className="text-text-secondary text-xs leading-relaxed">
              <strong className="text-text-primary">Total bandwidth = link speed &times; link width.</strong>{" "}
              A &ldquo;PCIe Gen 4 x4&rdquo; SSD means: 16 GT/s per lane &times; 4 lanes = 64 GT/s raw.
              After encoding overhead, that&apos;s about <strong className="text-text-primary">~7.88 GB/s</strong> of
              usable bandwidth. This is why SSD specs advertise &ldquo;up to 7 GB/s&rdquo; — it&apos;s the
              theoretical maximum of the PCIe link.
            </p>
          </div>
        </div>

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
              <div className="text-text-secondary text-sm font-medium mb-3">Generation (Link Speed)</div>
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
              <div className="text-text-secondary text-sm font-medium mb-3">Lanes (Link Width)</div>
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
          <div className="bg-gradient-to-r from-nvme-blue/5 to-nvme-green/5 rounded-xl p-6 flex items-center justify-between mb-6">
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

          {/* Transfer rate calculation breakdown */}
          <div className="bg-story-surface rounded-xl p-4">
            <div className="text-text-muted text-[10px] font-mono mb-2 uppercase">
              How we calculate {throughput.toFixed(1)} GB/s
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-nvme-blue/10 text-nvme-blue font-mono font-bold px-2 py-1 rounded">
                {gen.gts} GT/s
              </span>
              <span className="text-text-muted">&times;</span>
              <span className="bg-nvme-green/10 text-nvme-green font-mono font-bold px-2 py-1 rounded">
                {selectedLanes} lanes
              </span>
              <span className="text-text-muted">=</span>
              <span className="text-text-secondary font-mono font-bold">
                {(gen.gts * selectedLanes).toFixed(0)} Gbit/s raw
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs mt-2">
              <span className="text-text-secondary font-mono font-bold">
                {(gen.gts * selectedLanes).toFixed(0)} Gbit/s
              </span>
              <span className="text-text-muted">&times;</span>
              <span className="bg-nvme-amber/10 text-nvme-amber font-mono font-bold px-2 py-1 rounded">
                {encodingRatio} encoding ({encodingPct} efficient)
              </span>
              <span className="text-text-muted">&divide; 8 bits/byte =</span>
              <span className="text-text-primary font-mono font-bold text-sm">
                {throughput.toFixed(2)} GB/s
              </span>
            </div>
            <p className="text-text-muted text-[10px] mt-2 leading-relaxed">
              <strong className="text-text-primary">Why encoding overhead?</strong>{" "}
              {gen.encoding === "8b/10b"
                ? "8b/10b encoding converts every 8 data bits into 10 transmitted bits (adding clock recovery and DC balance). 20% of the bandwidth is overhead."
                : gen.encoding === "128b/130b"
                ? "128b/130b encoding sends 128 data bits with 2 framing bits. Only 1.5% overhead — a huge improvement over the older 8b/10b scheme."
                : "PAM4 uses 4-level pulse amplitude modulation, sending 2 bits per symbol. This doubles data rate without doubling clock speed."}
              {" "}Each &ldquo;transfer&rdquo; in GT/s sends 1 raw bit (including encoding overhead).
              We multiply by the encoding efficiency to get usable data bits, then divide by 8 to convert
              bits to bytes.
            </p>
          </div>
        </div>

        {/* Lane visualization — no stagger delay */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            PCIe x{selectedLanes} — {selectedLanes} parallel lanes
          </div>
          <div className="flex items-center gap-4 overflow-hidden">
            {/* CPU */}
            <div className="bg-nvme-blue/10 border border-nvme-blue/30 rounded-xl px-4 py-3 text-center flex-shrink-0">
              <div className="text-nvme-blue font-mono font-bold text-xs">CPU</div>
            </div>
            {/* Lanes — all appear simultaneously */}
            <div className="flex-1 flex flex-col gap-1.5" key={selectedLanes}>
              {Array.from({ length: Math.min(selectedLanes, 16) }, (_, i) => {
                const laneColors = ["#00d4aa", "#38bdf8", "#7c5cfc", "#f5a623"];
                const color = laneColors[i % 4];
                return (
                  <div key={`${selectedLanes}-${i}`} className="relative h-3 bg-story-surface rounded-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-text-muted text-[6px] font-mono z-10">Lane {i}</span>
                    </div>
                    <motion.div
                      className="absolute h-full w-8 rounded-full"
                      style={{ backgroundColor: `${color}50` }}
                      animate={{ x: ["-2rem", "calc(100% + 2rem)"] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: (i % 4) * 0.08,
                        ease: "linear",
                      }}
                    />
                    <motion.div
                      className="absolute h-full w-6 rounded-full"
                      style={{ backgroundColor: `${color}30` }}
                      animate={{ x: ["calc(100% + 2rem)", "-2rem"] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: (i % 4) * 0.08 + 0.3,
                        ease: "linear",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* SSD */}
            <div className="bg-nvme-green/10 border border-nvme-green/30 rounded-xl px-4 py-3 text-center flex-shrink-0">
              <div className="text-nvme-green font-mono font-bold text-xs">SSD</div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-text-muted">
            <span>&larr; Host memory reads</span>
            <span>Each lane = full-duplex (both directions simultaneously)</span>
            <span>DMA writes &rarr;</span>
          </div>
        </div>

        {/* TLP structure visual — with NVMe mapping */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
            Transaction Layer Packet (TLP) — How NVMe Commands Travel
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            Data moves through PCIe in <strong className="text-text-primary">TLPs</strong> — the packets
            that flow through the lanes above. Every NVMe interaction is one or more TLPs.
          </p>

          {/* TLP structure */}
          <div className="flex items-stretch gap-0 rounded-xl overflow-hidden mb-4">
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

          {/* How NVMe maps to TLPs */}
          <div className="text-text-muted text-[10px] font-mono mb-2 uppercase">
            How NVMe operations map to TLP types
          </div>
          <div className="space-y-1.5 mb-4">
            {[
              { nvme: "Doorbell write (host → SSD)", tlp: "Memory Write TLP", payload: "4 bytes (new tail/head pointer)", color: "#635bff", detail: "CPU writes to BAR0 doorbell register → PCIe sends a Memory Write TLP to the SSD's MMIO address" },
              { nvme: "SSD fetches command from SQ", tlp: "Memory Read TLP + Completion", payload: "64 bytes (NVMe command)", color: "#7c5cfc", detail: "SSD initiates DMA read → sends Memory Read Request TLP → host responds with Completion TLP containing the 64-byte NVMe command" },
              { nvme: "SSD delivers read data", tlp: "Memory Write TLP", payload: "up to 4 KB per TLP", color: "#00b894", detail: "SSD writes data to host RAM via DMA → sends Memory Write TLP(s) with the data payload. Large transfers use multiple TLPs" },
              { nvme: "SSD posts completion entry", tlp: "Memory Write TLP", payload: "16 bytes (completion entry)", color: "#00d4aa", detail: "SSD writes to the CQ in host RAM → Memory Write TLP with status, command ID, and result" },
              { nvme: "MSI-X interrupt", tlp: "Memory Write TLP", payload: "4 bytes (interrupt vector)", color: "#e05d6f", detail: "SSD writes to the CPU's interrupt controller address → Memory Write TLP. Yes, even interrupts are memory writes in PCIe!" },
            ].map((item) => (
              <div key={item.nvme} className="bg-story-surface rounded-lg p-3 flex items-start gap-3">
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-text-primary text-[11px] font-semibold">{item.nvme}</span>
                    <span className="text-text-muted text-[9px]">&rarr;</span>
                    <span className="font-mono text-[10px] font-bold" style={{ color: item.color }}>{item.tlp}</span>
                    <span className="text-text-muted text-[9px]">({item.payload})</span>
                  </div>
                  <p className="text-text-muted text-[10px] mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-text-muted text-[10px] italic">
            NVMe&apos;s efficiency: one doorbell write (a single 4-byte Memory Write TLP) can trigger the
            controller to fetch dozens of queued 64-byte commands via DMA. The CPU does minimal work —
            the SSD drives most of the data transfer.
          </p>
        </div>

        {/* M.2 connector diagram */}
        <M2ConnectorVisual />

        <InfoCard variant="tip" title="PCIe link negotiation">
          When the SSD powers on, the PCIe link doesn&apos;t just start at full speed. The SSD and
          motherboard perform <strong>link training</strong> — they negotiate the fastest speed and
          widest link both sides support. If your M.2 slot only has 2 PCIe lanes wired, an x4 SSD
          will run at x2 (half bandwidth). You can check the negotiated link with:{" "}
          <code className="text-text-code">lspci -vv | grep &quot;LnkSta&quot;</code> — it shows
          both the current speed (e.g., 16 GT/s) and width (e.g., x4).
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
