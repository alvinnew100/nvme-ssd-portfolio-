"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

const COMPARISON = [
  { feature: "Protocol", ahci: "AHCI (2004)", nvme: "NVMe (2011)" },
  { feature: "Bus", ahci: "SATA III", nvme: "PCIe" },
  { feature: "Max Queues", ahci: "1", nvme: "65,535" },
  { feature: "Queue Depth", ahci: "32", nvme: "65,536" },
  { feature: "Bandwidth", ahci: "~600 MB/s", nvme: "~7,000+ MB/s (Gen4)" },
  { feature: "Latency", ahci: "~6 us", nvme: "~2 us" },
  { feature: "CPU Overhead", ahci: "High (register reads)", nvme: "Low (memory-mapped)" },
  { feature: "MSI-X Vectors", ahci: "1", nvme: "2,048" },
];

function ComparisonBars() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const metrics = [
    { label: "Bandwidth", ahci: 600, nvme: 7000, unit: "MB/s" },
    { label: "Queues", ahci: 1, nvme: 65535, unit: "" },
    { label: "Queue Depth", ahci: 32, nvme: 65536, unit: "" },
    { label: "Latency", ahci: 6, nvme: 2, unit: "us", inverted: true },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        AHCI vs NVMe — Visual Comparison
      </div>
      <div className="space-y-4">
        {metrics.map((m, i) => {
          const max = Math.max(m.ahci, m.nvme);
          const ahciPct = (m.ahci / max) * 100;
          const nvmePct = (m.nvme / max) * 100;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-text-secondary text-xs font-medium mb-1">{m.label}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-[10px] font-mono w-10">AHCI</span>
                  <div className="flex-1 h-4 bg-story-surface rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-nvme-red/40"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${ahciPct}%` } : {}}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-text-muted text-[10px] font-mono w-20 text-right">
                    {m.ahci.toLocaleString()}{m.unit ? ` ${m.unit}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-nvme-green text-[10px] font-mono w-10">NVMe</span>
                  <div className="flex-1 h-4 bg-story-surface rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-nvme-green/50"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${nvmePct}%` } : {}}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-nvme-green text-[10px] font-mono w-20 text-right font-bold">
                    {m.nvme.toLocaleString()}{m.unit ? ` ${m.unit}` : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function WhyNVMe() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          AHCI vs. NVMe &mdash; Why NVMe Exists
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          AHCI was designed for spinning disks. It has one command queue with 32
          slots and requires expensive register reads for every operation. When
          SSDs arrived with sub-millisecond latency and massive parallelism,
          AHCI became the bottleneck. NVMe was built from scratch for flash
          storage over PCIe &mdash; no legacy, no compromises.
        </p>

        {/* Visual bandwidth comparison */}
        <ComparisonBars />

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-text-muted font-mono text-xs border-b border-story-border">
                  Feature
                </th>
                <th className="text-left p-3 text-nvme-red/80 font-mono text-xs border-b border-story-border">
                  AHCI / SATA
                </th>
                <th className="text-left p-3 text-nvme-green font-mono text-xs border-b border-story-border">
                  NVMe / PCIe
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  className="border-b border-story-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="p-3 text-text-primary font-medium">
                    {row.feature}
                  </td>
                  <td className="p-3 text-text-muted font-mono">{row.ahci}</td>
                  <td className="p-3 text-nvme-green font-mono">{row.nvme}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionWrapper>
  );
}
