"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

export default function Namespaces() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Namespaces
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          An NVMe <strong className="text-text-primary">namespace</strong> is a
          logical chunk of storage that the host can address. Think of it like a
          partition, but at the NVMe protocol level. Most consumer SSDs have a
          single namespace (NSID=1), but enterprise drives can have many &mdash;
          each with its own LBA range, format, and access controls.
        </p>

        <div className="bg-story-panel rounded-xl border border-story-border p-6 mb-6">
          <svg viewBox="0 0 600 120" className="w-full max-w-xl mx-auto" fill="none">
            <rect x="10" y="10" width="130" height="100" rx="8" className="stroke-nvme-blue" strokeWidth="2" fill="#38bdf808" />
            <text x="75" y="50" textAnchor="middle" className="fill-nvme-blue text-[11px] font-bold">NVMe Controller</text>
            <text x="75" y="70" textAnchor="middle" className="fill-text-muted text-[9px]">/dev/nvme0</text>

            {[1, 2, 3].map((ns, i) => (
              <g key={ns}>
                <line x1="140" y1="60" x2={200 + i * 150} y2="60" className="stroke-text-muted" strokeWidth="1" strokeDasharray="4,4" />
                <rect x={200 + i * 150 - 55} y="20" width="110" height="80" rx="6" className="stroke-nvme-green" strokeWidth="1.5" fill="#6db33f08" />
                <text x={200 + i * 150} y="50" textAnchor="middle" className="fill-nvme-green text-[10px] font-bold">
                  Namespace {ns}
                </text>
                <text x={200 + i * 150} y="68" textAnchor="middle" className="fill-text-muted text-[8px]">
                  /dev/nvme0n{ns}
                </text>
                <text x={200 + i * 150} y="84" textAnchor="middle" className="fill-text-muted text-[8px]">
                  {ns === 1 ? "500 GB" : ns === 2 ? "250 GB" : "250 GB"}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <NvmeCliBlock command="nvme list" note="Lists all NVMe devices and their namespaces" />

        <div className="mt-4">
          <NvmeCliBlock command="nvme id-ns /dev/nvme0n1" note="Identify a specific namespace — shows size, format, features" />
        </div>

        <div className="mt-6">
          <InfoCard variant="note" title="Namespace management">
            Admin commands <code className="text-text-code">Namespace Management</code> (0x0D) and{" "}
            <code className="text-text-code">Namespace Attachment</code> (0x15) let you create,
            delete, attach, and detach namespaces on the fly. This is common in
            enterprise multi-tenant setups.
          </InfoCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
