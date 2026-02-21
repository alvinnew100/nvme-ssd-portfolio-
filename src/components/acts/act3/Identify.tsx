"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import TerminalBlock from "@/components/story/TerminalBlock";
import InfoCard from "@/components/story/InfoCard";

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
      </div>
    </SectionWrapper>
  );
}
