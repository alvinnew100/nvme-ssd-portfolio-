"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

function NamespaceDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const namespaces = [
    { id: 1, size: "500 GB", lba: "0 → N" },
    { id: 2, size: "250 GB", lba: "0 → M" },
    { id: 3, size: "250 GB", lba: "0 → K" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        One controller, multiple namespaces
      </div>
      <div className="flex items-center gap-4 overflow-x-auto py-2">
        {/* Controller */}
        <motion.div
          className="bg-nvme-blue/5 border-2 border-nvme-blue rounded-xl px-5 py-6 text-center flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ type: "spring" }}
        >
          <div className="text-nvme-blue font-mono font-bold text-xs">NVMe Controller</div>
          <div className="text-text-muted text-[9px] font-mono mt-1">/dev/nvme0</div>
        </motion.div>

        {/* Arrow lines */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-8 h-0.5 bg-text-muted" style={{ opacity: 0.4 + i * 0.2 }} />
          ))}
        </motion.div>

        {/* Namespaces */}
        <div className="flex gap-3">
          {namespaces.map((ns, i) => (
            <motion.div
              key={ns.id}
              className="bg-nvme-green/5 border-2 border-nvme-green/40 rounded-xl px-4 py-4 text-center flex-shrink-0 min-w-[120px]"
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.12, type: "spring" }}
            >
              <div className="text-nvme-green font-mono font-bold text-xs">Namespace {ns.id}</div>
              <div className="text-text-muted text-[9px] font-mono mt-1">/dev/nvme0n{ns.id}</div>
              <div className="text-text-secondary text-[10px] font-mono mt-2">{ns.size}</div>
              <div className="text-text-muted text-[8px] font-mono">LBAs: {ns.lba}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <p className="text-text-muted text-xs text-center mt-3">
        Each namespace has its own device node and independent LBA range
      </p>
    </div>
  );
}

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

        <NamespaceDiagram />


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
