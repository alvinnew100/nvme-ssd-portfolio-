"use client";

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
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-story-border/50">
                  <td className="p-3 text-text-primary font-medium">
                    {row.feature}
                  </td>
                  <td className="p-3 text-text-muted font-mono">{row.ahci}</td>
                  <td className="p-3 text-nvme-green font-mono">{row.nvme}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionWrapper>
  );
}
