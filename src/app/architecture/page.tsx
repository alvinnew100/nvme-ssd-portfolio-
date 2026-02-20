"use client";

import { useState } from "react";

type Tab = "overview" | "queues" | "pcie" | "ftl";

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "System Overview" },
    { id: "queues", label: "Queue Mechanics" },
    { id: "pcie", label: "PCIe BAR Layout" },
    { id: "ftl", label: "Flash Translation Layer" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-warm-50 mb-4">
          NVMe Architecture
        </h1>
        <p className="text-warm-400 max-w-3xl">
          Interactive diagrams showing the NVMe architecture from host to NAND
          flash. Click on components to learn more about each layer.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-nvme-accent text-nvme-darker"
                : "bg-nvme-dark border border-warm-700 text-warm-300 hover:text-warm-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-nvme-dark rounded-xl border border-warm-800 p-6">
        {activeTab === "overview" && <OverviewDiagram />}
        {activeTab === "queues" && <QueueDiagram />}
        {activeTab === "pcie" && <PCIeBarDiagram />}
        {activeTab === "ftl" && <FTLDiagram />}
      </div>
    </div>
  );
}

function OverviewDiagram() {
  return (
    <div>
      <h2 className="text-xl font-bold text-warm-50 mb-4">
        Host ↔ NVMe Controller ↔ NAND Architecture
      </h2>
      <svg viewBox="0 0 800 480" className="w-full max-w-4xl mx-auto">
        {/* Host side */}
        <rect x="20" y="20" width="220" height="440" rx="8" fill="#2e2a20" stroke="#3a3022" strokeWidth="2" />
        <text x="130" y="50" textAnchor="middle" className="fill-warm-50 text-[14px] font-semibold">Host System</text>

        <rect x="40" y="70" width="180" height="50" rx="4" fill="#8b691420" stroke="#d4a853" strokeWidth="1.5" />
        <text x="130" y="100" textAnchor="middle" className="fill-nvme-accent text-[11px]">Application / Filesystem</text>

        <rect x="40" y="140" width="180" height="50" rx="4" fill="#8b691420" stroke="#d4a853" strokeWidth="1.5" />
        <text x="130" y="170" textAnchor="middle" className="fill-nvme-accent text-[11px]">Block Layer (bio)</text>

        <rect x="40" y="210" width="180" height="50" rx="4" fill="#7a9b5720" stroke="#7a9b57" strokeWidth="1.5" />
        <text x="130" y="240" textAnchor="middle" className="fill-nvme-green text-[11px]">NVMe Driver</text>

        <rect x="40" y="280" width="85" height="60" rx="4" fill="#7a9b5720" stroke="#7a9b57" strokeWidth="1.5" />
        <text x="82" y="305" textAnchor="middle" className="fill-nvme-green text-[10px]">Admin SQ</text>
        <text x="82" y="320" textAnchor="middle" className="fill-warm-500 text-[8px]">qid=0</text>

        <rect x="135" y="280" width="85" height="60" rx="4" fill="#7a9b5720" stroke="#7a9b57" strokeWidth="1.5" />
        <text x="177" y="305" textAnchor="middle" className="fill-nvme-green text-[10px]">I/O SQs</text>
        <text x="177" y="320" textAnchor="middle" className="fill-warm-500 text-[8px]">qid=1..N</text>

        <rect x="40" y="360" width="85" height="60" rx="4" fill="#c8794120" stroke="#c87941" strokeWidth="1.5" />
        <text x="82" y="385" textAnchor="middle" className="fill-nvme-orange text-[10px]">Admin CQ</text>
        <text x="82" y="400" textAnchor="middle" className="fill-warm-500 text-[8px]">cqid=0</text>

        <rect x="135" y="360" width="85" height="60" rx="4" fill="#c8794120" stroke="#c87941" strokeWidth="1.5" />
        <text x="177" y="385" textAnchor="middle" className="fill-nvme-orange text-[10px]">I/O CQs</text>
        <text x="177" y="400" textAnchor="middle" className="fill-warm-500 text-[8px]">cqid=1..M</text>

        {/* PCIe link */}
        <rect x="260" y="180" width="80" height="120" rx="4" fill="#54453020" stroke="#a89474" strokeWidth="2" strokeDasharray="4" />
        <text x="300" y="230" textAnchor="middle" className="fill-warm-300 text-[10px]">PCIe</text>
        <text x="300" y="245" textAnchor="middle" className="fill-warm-300 text-[10px]">Bus</text>
        <text x="300" y="265" textAnchor="middle" className="fill-warm-500 text-[8px]">x4 Gen4</text>

        {/* Arrows host to PCIe */}
        <line x1="220" y1="235" x2="260" y2="235" stroke="#a89474" strokeWidth="2" markerEnd="url(#arrowWarm)" />
        <line x1="260" y1="255" x2="220" y2="255" stroke="#a89474" strokeWidth="2" markerEnd="url(#arrowWarm)" />

        {/* Controller */}
        <rect x="360" y="20" width="220" height="440" rx="8" fill="#2e2a20" stroke="#3a3022" strokeWidth="2" />
        <text x="470" y="50" textAnchor="middle" className="fill-warm-50 text-[14px] font-semibold">NVMe Controller</text>

        {/* Arrow PCIe to controller */}
        <line x1="340" y1="235" x2="360" y2="235" stroke="#a89474" strokeWidth="2" markerEnd="url(#arrowWarm)" />
        <line x1="360" y1="255" x2="340" y2="255" stroke="#a89474" strokeWidth="2" markerEnd="url(#arrowWarm)" />

        <rect x="380" y="70" width="180" height="45" rx="4" fill="#7a9b5720" stroke="#7a9b57" strokeWidth="1.5" />
        <text x="470" y="97" textAnchor="middle" className="fill-nvme-green text-[11px]">Host Interface Controller</text>

        <rect x="380" y="130" width="180" height="45" rx="4" fill="#d4a85320" stroke="#d4a853" strokeWidth="1.5" />
        <text x="470" y="157" textAnchor="middle" className="fill-nvme-accent text-[11px]">Command Processor</text>

        <rect x="380" y="190" width="85" height="45" rx="4" fill="#c75c3a20" stroke="#c75c3a" strokeWidth="1.5" />
        <text x="422" y="217" textAnchor="middle" className="fill-nvme-red text-[10px]">DRAM</text>

        <rect x="475" y="190" width="85" height="45" rx="4" fill="#c75c3a20" stroke="#c75c3a" strokeWidth="1.5" />
        <text x="517" y="212" textAnchor="middle" className="fill-nvme-red text-[10px]">SRAM</text>
        <text x="517" y="225" textAnchor="middle" className="fill-warm-500 text-[8px]">Cache</text>

        <rect x="380" y="250" width="180" height="45" rx="4" fill="#7a9b5720" stroke="#7a9b57" strokeWidth="1.5" />
        <text x="470" y="277" textAnchor="middle" className="fill-nvme-green text-[11px]">Flash Translation Layer</text>

        <rect x="380" y="310" width="180" height="45" rx="4" fill="#c8794120" stroke="#c87941" strokeWidth="1.5" />
        <text x="470" y="337" textAnchor="middle" className="fill-nvme-orange text-[11px]">ECC Engine</text>

        <rect x="380" y="370" width="180" height="45" rx="4" fill="#8b691420" stroke="#c49b2a" strokeWidth="1.5" />
        <text x="470" y="397" textAnchor="middle" className="fill-warm-200 text-[11px]">NAND Flash Interface</text>

        {/* Arrow controller to NAND */}
        <line x1="580" y1="392" x2="620" y2="392" stroke="#c49b2a" strokeWidth="2" markerEnd="url(#arrowGold)" />

        {/* NAND packages */}
        <rect x="620" y="20" width="160" height="440" rx="8" fill="#2e2a20" stroke="#3a3022" strokeWidth="2" />
        <text x="700" y="50" textAnchor="middle" className="fill-warm-50 text-[14px] font-semibold">NAND Flash</text>

        {["Die 0", "Die 1", "Die 2", "Die 3"].map((die, i) => (
          <g key={die}>
            <rect x="640" y={70 + i * 100} width="120" height="80" rx="4" fill="#8b691415" stroke="#a89474" strokeWidth="1" />
            <text x="700" y={95 + i * 100} textAnchor="middle" className="fill-warm-200 text-[10px]">{die}</text>
            {["Plane 0", "Plane 1"].map((plane, j) => (
              <rect key={plane} x={650 + j * 55} y={103 + i * 100} width={50} height={35} rx={2} fill="#3a302215" stroke="#544530" strokeWidth={0.5} />
            ))}
            <text x={675} y={125 + i * 100} textAnchor="middle" className="fill-warm-500 text-[7px]">Blocks</text>
            <text x={730} y={125 + i * 100} textAnchor="middle" className="fill-warm-500 text-[7px]">Blocks</text>
          </g>
        ))}

        {/* Arrow markers */}
        <defs>
          <marker id="arrowWarm" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#a89474" />
          </marker>
          <marker id="arrowGold" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#c49b2a" />
          </marker>
        </defs>
      </svg>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="bg-nvme-darker rounded-lg p-4">
          <h3 className="text-warm-50 font-semibold mb-2">Host System</h3>
          <p className="text-warm-400 text-xs">
            The host CPU runs the NVMe driver, which places 64-byte command entries into Submission Queues in host memory. The driver rings doorbell registers to notify the controller.
          </p>
        </div>
        <div className="bg-nvme-darker rounded-lg p-4">
          <h3 className="text-warm-50 font-semibold mb-2">NVMe Controller</h3>
          <p className="text-warm-400 text-xs">
            The controller ASIC fetches commands via PCIe DMA, processes them through the FTL, manages ECC, and interfaces with NAND flash. It posts completions back to host CQs.
          </p>
        </div>
        <div className="bg-nvme-darker rounded-lg p-4">
          <h3 className="text-warm-50 font-semibold mb-2">NAND Flash</h3>
          <p className="text-warm-400 text-xs">
            Multiple NAND dies organized into planes and blocks. Each block contains pages (typically 16KB). Pages are the minimum write unit; blocks are the minimum erase unit.
          </p>
        </div>
      </div>
    </div>
  );
}

function QueueDiagram() {
  const [sqTail, setSqTail] = useState(3);
  const [sqHead, setSqHead] = useState(0);
  const queueSize = 8;

  return (
    <div>
      <h2 className="text-xl font-bold text-warm-50 mb-4">
        Submission &amp; Completion Queue Mechanics
      </h2>
      <div className="mb-6">
        <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
          {/* SQ Ring */}
          <text x="180" y="25" textAnchor="middle" className="fill-warm-50 text-[13px] font-semibold">
            Submission Queue (Circular Buffer)
          </text>
          {Array.from({ length: queueSize }).map((_, i) => {
            const angle = (i / queueSize) * 2 * Math.PI - Math.PI / 2;
            const cx = 180 + Math.cos(angle) * 90;
            const cy = 160 + Math.sin(angle) * 90;
            const isFilled = sqHead <= sqTail
              ? i >= sqHead && i < sqTail
              : i >= sqHead || i < sqTail;
            const isHead = i === sqHead;
            const isTail = i === sqTail;

            return (
              <g key={i}>
                <rect
                  x={cx - 22}
                  y={cy - 16}
                  width={44}
                  height={32}
                  rx={4}
                  fill={isFilled ? "#d4a85320" : "#242018"}
                  stroke={isHead ? "#c75c3a" : isTail ? "#7a9b57" : isFilled ? "#d4a853" : "#3a3022"}
                  strokeWidth={isHead || isTail ? 2.5 : 1}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" className="fill-warm-200 text-[10px] font-mono">
                  [{i}]
                </text>
                {isHead && (
                  <text x={cx} y={cy + 22} textAnchor="middle" className="fill-nvme-red text-[8px] font-semibold">
                    HEAD
                  </text>
                )}
                {isTail && (
                  <text x={cx} y={cy - 22} textAnchor="middle" className="fill-nvme-green text-[8px] font-semibold">
                    TAIL
                  </text>
                )}
              </g>
            );
          })}

          {/* Arrow from SQ to Controller */}
          <line x1="290" y1="160" x2="380" y2="160" stroke="#d4a853" strokeWidth="2" markerEnd="url(#arrowAccent)" />
          <text x="335" y="150" textAnchor="middle" className="fill-nvme-accent text-[9px]">Fetch SQE</text>

          {/* Controller box */}
          <rect x="380" y="120" width="120" height="80" rx="8" fill="#2e2a20" stroke="#7a9b57" strokeWidth="2" />
          <text x="440" y="155" textAnchor="middle" className="fill-nvme-green text-[11px]">NVMe</text>
          <text x="440" y="172" textAnchor="middle" className="fill-nvme-green text-[11px]">Controller</text>

          {/* Arrow to CQ */}
          <line x1="500" y1="160" x2="560" y2="160" stroke="#c87941" strokeWidth="2" markerEnd="url(#arrowCopper)" />
          <text x="530" y="150" textAnchor="middle" className="fill-nvme-orange text-[9px]">Post CQE</text>

          {/* CQ simplified */}
          <rect x="560" y="110" width="120" height="100" rx="8" fill="#c8794115" stroke="#c87941" strokeWidth="1.5" />
          <text x="620" y="140" textAnchor="middle" className="fill-nvme-orange text-[11px]">Completion</text>
          <text x="620" y="158" textAnchor="middle" className="fill-nvme-orange text-[11px]">Queue</text>
          <text x="620" y="180" textAnchor="middle" className="fill-warm-400 text-[9px]">16B entries</text>
          <text x="620" y="195" textAnchor="middle" className="fill-warm-400 text-[9px]">+ Phase Bit</text>

          <defs>
            <marker id="arrowAccent" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#d4a853" />
            </marker>
            <marker id="arrowCopper" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#c87941" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <button
          onClick={() => setSqTail((t) => (t + 1) % queueSize)}
          className="px-4 py-2 bg-nvme-green/10 border border-nvme-green/40 text-nvme-green rounded-lg text-sm hover:bg-nvme-green/20 transition-colors"
        >
          Enqueue (advance tail)
        </button>
        <button
          onClick={() => setSqHead((h) => (h + 1) % queueSize)}
          className="px-4 py-2 bg-nvme-red/10 border border-nvme-red/40 text-nvme-red rounded-lg text-sm hover:bg-nvme-red/20 transition-colors"
        >
          Dequeue (advance head)
        </button>
        <button
          onClick={() => { setSqHead(0); setSqTail(3); }}
          className="px-4 py-2 bg-nvme-gray border border-warm-700 text-warm-300 rounded-lg text-sm hover:text-warm-50 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="bg-nvme-darker rounded-lg p-4 text-sm text-warm-400">
        <p className="mb-2">
          <strong className="text-warm-50">Circular Buffer:</strong> The SQ is a
          ring buffer. The host advances the <span className="text-nvme-green">tail</span> when
          adding commands, and the controller advances the <span className="text-nvme-red">head</span> when
          fetching them. Filled slots (between head and tail) contain pending commands.
        </p>
        <p>
          <strong className="text-warm-50">Doorbell:</strong> After writing to the
          tail, the host writes the new tail value to the SQ Tail Doorbell
          register (MMIO write to BAR0). This notifies the controller of new
          work.
        </p>
      </div>
    </div>
  );
}

function PCIeBarDiagram() {
  const registers = [
    { offset: "0x00", name: "CAP", size: "8B", desc: "Controller Capabilities" },
    { offset: "0x08", name: "VS", size: "4B", desc: "Version" },
    { offset: "0x0C", name: "INTMS", size: "4B", desc: "Interrupt Mask Set" },
    { offset: "0x10", name: "INTMC", size: "4B", desc: "Interrupt Mask Clear" },
    { offset: "0x14", name: "CC", size: "4B", desc: "Controller Configuration" },
    { offset: "0x1C", name: "CSTS", size: "4B", desc: "Controller Status" },
    { offset: "0x20", name: "NSSR", size: "4B", desc: "NVM Subsystem Reset" },
    { offset: "0x24", name: "AQA", size: "4B", desc: "Admin Queue Attributes" },
    { offset: "0x28", name: "ASQ", size: "8B", desc: "Admin SQ Base Address" },
    { offset: "0x30", name: "ACQ", size: "8B", desc: "Admin CQ Base Address" },
    { offset: "0x1000", name: "SQ0TDBL", size: "4B", desc: "Admin SQ Tail Doorbell" },
    { offset: "0x1004", name: "CQ0HDBL", size: "4B", desc: "Admin CQ Head Doorbell" },
    { offset: "0x1008", name: "SQ1TDBL", size: "4B", desc: "I/O SQ 1 Tail Doorbell" },
    { offset: "0x100C", name: "CQ1HDBL", size: "4B", desc: "I/O CQ 1 Head Doorbell" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-warm-50 mb-4">
        PCIe BAR0 Register Map
      </h2>
      <p className="text-warm-400 text-sm mb-6">
        BAR0 (Base Address Register 0) maps the NVMe controller&apos;s registers
        into the host&apos;s memory-mapped I/O (MMIO) space. The first 0x1000
        bytes contain controller properties and configuration registers. Starting
        at offset 0x1000 are the doorbell registers — one pair per queue.
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {registers.map((reg, i) => {
            const isDoorbell = reg.offset.startsWith("0x100");
            return (
              <div
                key={i}
                className={`flex items-center border-b border-warm-800 py-2 px-3 text-sm ${
                  isDoorbell ? "bg-nvme-orange/5" : ""
                }`}
              >
                <span className="w-20 font-mono text-nvme-accent text-xs">
                  {reg.offset}
                </span>
                <span className="w-24 font-mono text-warm-50 font-semibold text-xs">
                  {reg.name}
                </span>
                <span className="w-12 text-warm-500 text-xs">{reg.size}</span>
                <span className="text-warm-300 text-xs">{reg.desc}</span>
              </div>
            );
          })}
          <div className="flex items-center py-2 px-3 text-sm bg-nvme-orange/5">
            <span className="w-20 font-mono text-warm-500 text-xs">...</span>
            <span className="text-warm-500 text-xs italic">
              More doorbell registers for additional queues (stride = 4 &lt;&lt; DSTRD)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-nvme-darker rounded-lg p-4 text-sm text-warm-400">
        <p className="mb-2">
          <strong className="text-warm-50">Key insight:</strong> The doorbell
          stride (DSTRD from CAP register) determines the spacing between
          doorbell registers. Most controllers use stride=0 (4 bytes apart).
        </p>
        <p>
          <strong className="text-warm-50">Performance note:</strong> Each
          doorbell write is a PCIe posted write — it crosses the PCIe bus. Shadow
          doorbells (Doorbell Buffer Config command, opcode 0x7C) can reduce
          these MMIO writes for better performance.
        </p>
      </div>
    </div>
  );
}

function FTLDiagram() {
  return (
    <div>
      <h2 className="text-xl font-bold text-warm-50 mb-4">
        Flash Translation Layer (FTL)
      </h2>
      <svg viewBox="0 0 700 400" className="w-full max-w-3xl mx-auto mb-6">
        {/* Host I/O */}
        <rect x="20" y="30" width="160" height="50" rx="6" fill="#d4a85320" stroke="#d4a853" strokeWidth="1.5" />
        <text x="100" y="60" textAnchor="middle" className="fill-nvme-accent text-[11px]">Host I/O (LBAs)</text>

        <line x1="100" y1="80" x2="100" y2="110" stroke="#d4a853" strokeWidth="2" markerEnd="url(#arrowAccent2)" />

        {/* FTL Box */}
        <rect x="20" y="110" width="660" height="160" rx="8" fill="#2e2a20" stroke="#7a9b57" strokeWidth="2" />
        <text x="350" y="135" textAnchor="middle" className="fill-nvme-green text-[13px] font-semibold">Flash Translation Layer (FTL)</text>

        {/* L2P Map */}
        <rect x="40" y="150" width="140" height="70" rx="4" fill="#7a9b5720" stroke="#7a9b57" strokeWidth="1" />
        <text x="110" y="175" textAnchor="middle" className="fill-nvme-green text-[10px]">L2P Mapping Table</text>
        <text x="110" y="195" textAnchor="middle" className="fill-warm-400 text-[8px]">LBA → Physical Page</text>
        <text x="110" y="210" textAnchor="middle" className="fill-warm-600 text-[7px]">Stored in DRAM</text>

        {/* GC */}
        <rect x="200" y="150" width="140" height="70" rx="4" fill="#c8794120" stroke="#c87941" strokeWidth="1" />
        <text x="270" y="175" textAnchor="middle" className="fill-nvme-orange text-[10px]">Garbage Collection</text>
        <text x="270" y="195" textAnchor="middle" className="fill-warm-400 text-[8px]">Reclaim invalid pages</text>
        <text x="270" y="210" textAnchor="middle" className="fill-warm-600 text-[7px]">Copy valid → erase block</text>

        {/* Wear Leveling */}
        <rect x="360" y="150" width="140" height="70" rx="4" fill="#c75c3a20" stroke="#c75c3a" strokeWidth="1" />
        <text x="430" y="175" textAnchor="middle" className="fill-nvme-red text-[10px]">Wear Leveling</text>
        <text x="430" y="195" textAnchor="middle" className="fill-warm-400 text-[8px]">Balance erase counts</text>
        <text x="430" y="210" textAnchor="middle" className="fill-warm-600 text-[7px]">Extend drive lifetime</text>

        {/* Write Buffer */}
        <rect x="520" y="150" width="140" height="70" rx="4" fill="#d4a85320" stroke="#d4a853" strokeWidth="1" />
        <text x="590" y="175" textAnchor="middle" className="fill-nvme-accent text-[10px]">Write Buffer</text>
        <text x="590" y="195" textAnchor="middle" className="fill-warm-400 text-[8px]">Coalesce writes</text>
        <text x="590" y="210" textAnchor="middle" className="fill-warm-600 text-[7px]">Program full pages</text>

        {/* Arrow to NAND */}
        <line x1="350" y1="270" x2="350" y2="300" stroke="#c49b2a" strokeWidth="2" markerEnd="url(#arrowGold2)" />

        {/* NAND */}
        <rect x="20" y="300" width="660" height="80" rx="8" fill="#2e2a20" stroke="#a89474" strokeWidth="2" />
        <text x="350" y="325" textAnchor="middle" className="fill-warm-200 text-[13px] font-semibold">NAND Flash Array</text>

        {["Block 0", "Block 1", "Block 2", "Block 3", "Block N"].map((b, i) => (
          <g key={b}>
            <rect x={40 + i * 128} y={340} width={110} height={25} rx={3} fill="#3a302215" stroke="#544530" strokeWidth={0.5} />
            <text x={95 + i * 128} y={357} textAnchor="middle" className="fill-warm-400 text-[9px]">{b}</text>
          </g>
        ))}

        <defs>
          <marker id="arrowAccent2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#d4a853" />
          </marker>
          <marker id="arrowGold2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="#c49b2a" />
          </marker>
        </defs>
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-nvme-darker rounded-lg p-4">
          <h3 className="text-nvme-green font-semibold mb-2">L2P Mapping</h3>
          <p className="text-warm-400 text-xs">
            The Logical-to-Physical mapping table translates host LBAs to
            physical NAND locations. This table lives in DRAM for fast lookup.
            For a 1TB drive with 4KB pages, the table needs ~1GB of DRAM.
          </p>
        </div>
        <div className="bg-nvme-darker rounded-lg p-4">
          <h3 className="text-nvme-orange font-semibold mb-2">
            Garbage Collection
          </h3>
          <p className="text-warm-400 text-xs">
            NAND can only be erased in entire blocks but written in pages. When a
            page is overwritten, the old page becomes &quot;invalid&quot; but the block
            can&apos;t be erased until all valid pages are copied out. GC does this
            background data migration.
          </p>
        </div>
        <div className="bg-nvme-darker rounded-lg p-4">
          <h3 className="text-nvme-red font-semibold mb-2">
            Wear Leveling
          </h3>
          <p className="text-warm-400 text-xs">
            NAND blocks have a limited number of program/erase (P/E) cycles.
            Wear leveling ensures no single block wears out prematurely by
            distributing writes across all blocks, even for cold data.
          </p>
        </div>
        <div className="bg-nvme-darker rounded-lg p-4">
          <h3 className="text-nvme-accent font-semibold mb-2">Write Amplification</h3>
          <p className="text-warm-400 text-xs">
            WAF = (NAND writes) / (Host writes). GC causes extra NAND writes
            beyond what the host requested. A WAF of 2.0 means the SSD writes
            twice as much data to NAND as the host sent. Lower is better.
          </p>
        </div>
      </div>
    </div>
  );
}
