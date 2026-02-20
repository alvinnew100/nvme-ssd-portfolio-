"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

export default function IOCommands() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          I/O Commands &mdash; Read, Write, Flush
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          I/O commands are sent on queues with QID &ge; 1. They operate on
          namespaces and are the workhorses of NVMe. The three most common:
        </p>

        <div className="space-y-4 mb-8">
          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-nvme-green font-mono font-bold">Read</span>
              <code className="text-text-code text-xs">opcode=0x02</code>
            </div>
            <p className="text-text-secondary text-sm mb-3">
              Reads data from NAND. Key fields: SLBA (starting LBA) in CDW10-11,
              NLB (number of logical blocks, 0-based) in CDW12 [15:0].
            </p>
            <NvmeCliBlock command="nvme read /dev/nvme0n1 --start-block=0 --block-count=7 --data-size=4096" />
          </div>

          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-nvme-blue font-mono font-bold">Write</span>
              <code className="text-text-code text-xs">opcode=0x01</code>
            </div>
            <p className="text-text-secondary text-sm mb-3">
              Writes data to NAND. Same SLBA/NLB fields. FUA (Force Unit Access)
              bit in CDW12 [30] bypasses volatile write cache.
            </p>
            <NvmeCliBlock command="nvme write /dev/nvme0n1 --start-block=0 --block-count=7 --data-size=4096 -d data.bin" />
          </div>

          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-nvme-violet font-mono font-bold">Flush</span>
              <code className="text-text-code text-xs">opcode=0x00</code>
            </div>
            <p className="text-text-secondary text-sm mb-3">
              Ensures all data in volatile write cache is committed to NAND. No
              command-specific fields &mdash; just the fixed SQE header.
            </p>
            <NvmeCliBlock command="nvme flush /dev/nvme0n1" />
          </div>
        </div>

        <InfoCard variant="tip" title="0-based NLB">
          NLB is 0-based: a value of 0 means 1 block, 7 means 8 blocks. This
          is a common source of off-by-one bugs in NVMe driver development.
          <code className="text-text-code ml-1">--block-count=7</code> reads 8 blocks (4 KB at 512B/block).
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
