"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

export default function Namespaces() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Namespaces &mdash; Splitting One Drive into Many
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          In Act 1, we learned about LBAs — numbered mailboxes that address the
          drive&apos;s storage. But here&apos;s a question: <em className="text-text-primary">
          what if you want one physical drive to act like multiple separate
          drives?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think of a building with separate offices. The building is one physical
          structure, but each office has its own door, its own lock, and its own
          address. Tenants in office 1 can&apos;t access files in office 2 — they&apos;re
          isolated.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          An NVMe <strong className="text-text-primary">namespace</strong> is like
          one of those offices. It&apos;s a logical chunk of the SSD with its own
          set of LBAs, its own size, and its own LBA format (block size). Most
          consumer SSDs have a single namespace (the whole drive is one big office),
          but enterprise drives can split into many — each namespace can even have
          a different block size.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why would you want multiple
          namespaces?</em> In a data center, you might give different virtual
          machines different namespaces — each VM sees its own
          &ldquo;drive&rdquo; but they all share one physical SSD. This is more
          efficient than having separate drives for each VM.
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            One controller, multiple namespaces
          </div>
          <svg viewBox="0 0 600 120" className="w-full max-w-xl mx-auto" fill="none">
            <rect x="10" y="10" width="130" height="100" rx="8" className="stroke-nvme-blue" strokeWidth="2" fill="#635bff08" />
            <text x="75" y="50" textAnchor="middle" className="fill-nvme-blue text-[11px] font-bold">NVMe Controller</text>
            <text x="75" y="70" textAnchor="middle" className="fill-text-muted text-[9px]">/dev/nvme0</text>

            {[1, 2, 3].map((ns, i) => (
              <g key={ns}>
                <line x1="140" y1="60" x2={200 + i * 150} y2="60" className="stroke-text-muted" strokeWidth="1" strokeDasharray="4,4" />
                <rect x={200 + i * 150 - 55} y="20" width="110" height="80" rx="6" className="stroke-nvme-green" strokeWidth="1.5" fill="#00d4aa08" />
                <text x={200 + i * 150} y="45" textAnchor="middle" className="fill-nvme-green text-[10px] font-bold">
                  Namespace {ns}
                </text>
                <text x={200 + i * 150} y="62" textAnchor="middle" className="fill-text-muted text-[8px]">
                  /dev/nvme0n{ns}
                </text>
                <text x={200 + i * 150} y="78" textAnchor="middle" className="fill-text-muted text-[8px]">
                  {ns === 1 ? "500 GB" : ns === 2 ? "250 GB" : "250 GB"}
                </text>
                <text x={200 + i * 150} y="90" textAnchor="middle" className="fill-text-muted text-[7px]">
                  {ns === 1 ? "Its own LBAs: 0 → N" : ns === 2 ? "Its own LBAs: 0 → M" : "Its own LBAs: 0 → K"}
                </text>
              </g>
            ))}
          </svg>
          <p className="text-text-muted text-xs text-center mt-3">
            Each namespace has its own device node (e.g., /dev/nvme0n1) and its own independent LBA range
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <NvmeCliBlock command="nvme list" note="Lists all NVMe devices and their namespaces" />
          <NvmeCliBlock command="nvme id-ns /dev/nvme0n1" note="Identify a specific namespace — shows size, LBA format, and features" />
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Every I/O command targets a namespace
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            Remember CDW1 in the 64-byte command structure? That&apos;s the
            Namespace ID (NSID). Every read, write, and TRIM command must specify
            which namespace it&apos;s targeting. For a drive with a single
            namespace, it&apos;s always NSID=1. The SSD rejects commands with an
            invalid NSID.
          </p>
        </div>

        <InfoCard variant="note" title="Creating and deleting namespaces">
          Enterprise drives support admin commands to create, delete, attach, and
          detach namespaces on the fly. You can carve a 2 TB drive into four 500 GB
          namespaces, each with its own LBA format. The commands are{" "}
          <code className="text-text-code">Namespace Management</code> (opcode 0x0D) and{" "}
          <code className="text-text-code">Namespace Attachment</code> (opcode 0x15).
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
