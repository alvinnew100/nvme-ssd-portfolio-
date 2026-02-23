"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import TerminalBlock from "@/components/story/TerminalBlock";
import InfoCard from "@/components/story/InfoCard";
import RevealCard from "@/components/story/RevealCard";

function IdentifyCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const fields = [
    { label: "Model", value: "Samsung 990 PRO 2TB", color: "#38bdf8" },
    { label: "Serial", value: "S6PENL0T123456", color: "#a78bfa" },
    { label: "Firmware", value: "4B2QJXD7", color: "#00d4aa" },
    { label: "Max Queues", value: "128", color: "#f5a623" },
    { label: "Namespaces", value: "1", color: "#94a3b8" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
        The Drive&apos;s &ldquo;Resume&rdquo; — 4,096 Bytes of Identity Data
      </div>
      <div className="bg-gradient-to-br from-nvme-blue/5 to-nvme-violet/5 rounded-xl p-5 border border-nvme-blue/20">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="w-12 h-12 rounded-xl bg-nvme-blue/10 border-2 border-nvme-blue flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <span className="text-nvme-blue font-mono font-bold text-xs">ID</span>
          </motion.div>
          <div>
            <div className="text-text-primary font-semibold text-sm">NVMe Controller Identity</div>
            <div className="text-text-muted text-[10px] font-mono">opcode 0x06 · CNS=1 · 4,096 bytes</div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {fields.map((f, i) => (
            <motion.div
              key={f.label}
              className="bg-story-surface/50 rounded-lg p-2.5 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <div className="text-[8px] font-mono text-text-muted uppercase">{f.label}</div>
              <div className="font-mono text-[10px] font-bold mt-0.5" style={{ color: f.color }}>
                {f.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Identify() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          The First Question &mdash; &ldquo;Who Are You?&rdquo;
        </h3>

        <AnalogyCard
          concept="Identify Is the SSD's ID Card"
          analogy="The Identify command asks the SSD 'who are you and what can you do?' — like checking someone's ID card. Identify Controller returns the SSD's model, serial number, firmware version, and capabilities. Identify Namespace returns details about a specific storage partition."
        />

        <p className="text-text-secondary mb-2 leading-relaxed max-w-3xl">
          <TermDefinition term="CNS (Controller or Namespace Structure)" definition="A field in the Identify command that specifies what information to return. CNS=1 returns controller info, CNS=0 returns namespace info. Think of it as choosing which 'page' of the ID card to read." />
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          During boot, we saw that the NVMe driver sends an Identify command as its
          very first question. <em className="text-text-primary">But why is this
          necessary?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think about meeting someone new. Before you can work together, you need
          to know: What&apos;s your name? What can you do? What are your limits?
          The Identify command (opcode{" "}
          <code className="text-text-code">0x06</code>) asks exactly these questions.
          It returns a 4,096-byte data structure — essentially the drive&apos;s
          &ldquo;resume.&rdquo;
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">What does the driver learn?</em> The
          drive&apos;s model name, serial number, firmware version, maximum queue
          size, supported features, and much more. Without this information, the
          driver can&apos;t properly configure the drive.
        </p>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          You can send this command yourself using{" "}
          <code className="text-text-code">nvme-cli</code>. The{" "}
          <code className="text-text-code">id-ctrl</code> subcommand is a shortcut
          for &ldquo;Identify Controller&rdquo;:
        </p>

        {/* Animated ID card visual */}
        <IdentifyCard />

        <NvmeCliBlock command="nvme id-ctrl /dev/nvme0" />

        <div className="mt-4">
          <TerminalBlock
            title={"output — the drive's \"resume\""}
            lines={[
              "NVME Identify Controller:",
              "vid       : 0x144d          ← Vendor ID (Samsung = 0x144d)",
              "sn        : S6PENL0T123456  ← Unique serial number",
              "mn        : Samsung SSD 990 PRO 2TB  ← Model name",
              "fr        : 4B2QJXD7        ← Firmware version",
              "mdts      : 9               ← Max data transfer = 2^9 pages = 2MB",
              "sqes      : 0x66            ← SQ entry size: min=64B, max=64B",
              "cqes      : 0x44            ← CQ entry size: min=16B, max=16B",
              "nn        : 1               ← Number of namespaces",
              "oncs      : 0x5f            ← Supported optional commands",
            ]}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <code className="text-text-code text-xs">CNS=1</code>
            <div className="text-text-primary font-semibold mt-1">Identify Controller</div>
            <p className="text-text-muted text-xs mt-1">
              Returns the drive&apos;s identity: model, serial, firmware, capabilities,
              queue limits. This is used during boot to configure the driver.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <code className="text-text-code text-xs">CNS=0</code>
            <div className="text-text-primary font-semibold mt-1">Identify Namespace</div>
            <p className="text-text-muted text-xs mt-1">
              Returns info about a specific namespace: total size, capacity, LBA
              format (512B or 4KB blocks), and protection features.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <InfoCard variant="tip" title="Why does the driver need to know queue limits?">
            The driver wants to create as many I/O queues as possible (ideally one
            per CPU core). But the drive has a limit — maybe it supports 128 queues
            maximum. The Identify data tells the driver this limit so it doesn&apos;t
            try to create more queues than the drive can handle.
          </InfoCard>
        </div>

        <RevealCard
          id="act3-identify-kc1"
          prompt="Why does NVMe split the Identify command into separate Controller (CNS=1) and Namespace (CNS=0) variants, instead of returning all information in a single response? What would go wrong with a 'return everything' approach?"
          answer="Identify Controller (CNS=1) returns device-wide information — model number, firmware version, maximum queue entries, and supported features. Identify Namespace (CNS=0) returns per-namespace data — capacity, LBA format, and protection settings. They're separate because: (1) A single controller can have hundreds of namespaces. Returning all namespace data in one response would require a massive, variable-size buffer — but NVMe Identify always returns exactly 4,096 bytes for simplicity and predictability. (2) The driver needs controller info first (during boot) to know the device's limits before it even asks about namespaces. (3) Namespace info can change at runtime (namespaces can be created, deleted, or resized), while controller info is mostly static. Separating them lets the driver re-query just the namespace data when a change occurs, without re-fetching the entire controller identity. The CNS field is the selector — like choosing which page of an ID card to read."
          hint="The Identify command returns a fixed 4,096-byte data structure — consider why one response can't cover everything."
          options={["They are separate because controller info uses big-endian and namespace info uses little-endian encoding", "It is a legacy decision from the first NVMe spec that has not been updated", "Each always returns exactly 4,096 bytes; combining them would require variable-size buffers, and the driver needs controller info first during boot", "The split allows different security permissions — controller info is public but namespace info requires authentication"]}
          correctIndex={2}
        />
      </div>
    </SectionWrapper>
  );
}
