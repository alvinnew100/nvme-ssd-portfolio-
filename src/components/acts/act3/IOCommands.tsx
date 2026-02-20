"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

const IO_CMDS = [
  {
    name: "Read",
    opcode: "0x02",
    color: "#00b894",
    desc: "Reads data from NAND. Key fields: SLBA (starting LBA) in CDW10-11, NLB (number of logical blocks, 0-based) in CDW12 [15:0].",
    cli: "nvme read /dev/nvme0n1 --start-block=0 --block-count=7 --data-size=4096",
    note: "Reads 8 blocks (NLB is 0-based: 7 = 8 blocks) starting at LBA 0",
  },
  {
    name: "Write",
    opcode: "0x01",
    color: "#635bff",
    desc: "Writes data to NAND. Same SLBA/NLB fields. FUA (Force Unit Access) bit in CDW12 [30] bypasses volatile write cache.",
    cli: "nvme write /dev/nvme0n1 --start-block=0 --block-count=7 --data-size=4096 -d data.bin",
    note: "-d specifies the data file to write. Add --force-unit-access for FUA writes",
  },
  {
    name: "Flush",
    opcode: "0x00",
    color: "#7c5cfc",
    desc: "Ensures all data in volatile write cache is committed to NAND. No command-specific fields — just the fixed SQE header.",
    cli: "nvme flush /dev/nvme0n1",
    note: "No arguments needed. Flushes all pending writes to non-volatile storage",
  },
  {
    name: "Compare",
    opcode: "0x05",
    color: "#e8a317",
    desc: "Reads data from NAND and compares it to a host buffer. Used for atomic test-and-set patterns. Returns success only if data matches exactly.",
    cli: "nvme compare /dev/nvme0n1 --start-block=0 --block-count=0 --data-size=512 -d expected.bin",
    note: "Compares 1 block at LBA 0 against expected.bin",
  },
  {
    name: "Write Zeroes",
    opcode: "0x08",
    color: "#9e9789",
    desc: "Zeroes a range of LBAs without transferring data. Much faster than writing actual zero-filled buffers — the FTL can mark blocks as zero internally.",
    cli: "nvme write-zeroes /dev/nvme0n1 --start-block=0 --block-count=255",
    note: "Zeros 256 blocks starting at LBA 0. No data transfer required",
  },
  {
    name: "Dataset Management (TRIM)",
    opcode: "0x09",
    color: "#e05d6f",
    desc: "Tells the FTL which LBA ranges are no longer in use (deallocate/TRIM). The FTL can then reclaim those blocks during garbage collection, reducing write amplification.",
    cli: "nvme dsm /dev/nvme0n1 --ad --slbs=0 --blocks=256",
    note: "--ad = deallocate (TRIM). Multiple ranges can be specified in one command",
  },
  {
    name: "Verify",
    opcode: "0x0C",
    color: "#00b894",
    desc: "Reads data from NAND and verifies integrity (ECC check) without transferring to host. Useful for scrubbing — finding latent media errors before they cause read failures.",
    cli: "nvme verify /dev/nvme0n1 --start-block=0 --block-count=255",
    note: "Verifies 256 blocks. No data transfer — only integrity check on the drive",
  },
  {
    name: "Write Uncorrectable",
    opcode: "0x04",
    color: "#e05d6f",
    desc: "Marks a range of LBAs as unreadable. Any subsequent read returns an error. Used for testing error handling paths in drivers and applications.",
    cli: "nvme write-uncor /dev/nvme0n1 --start-block=1000 --block-count=0",
    note: "Marks LBA 1000 as uncorrectable. Reads will fail with Unrecovered Read Error",
  },
];

export default function IOCommands() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          I/O Commands &mdash; The Workhorses of NVMe
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          I/O commands are sent on queues with QID &ge; 1. They operate on
          namespaces and handle all data movement. Each command shows both the
          NVMe spec opcode and the <strong className="text-text-primary">nvme-cli
          terminal command</strong> you&apos;d actually type.
        </p>

        <div className="space-y-4 mb-8">
          {IO_CMDS.map((cmd) => (
            <div key={cmd.opcode} className="bg-story-card rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono font-bold text-sm" style={{ color: cmd.color }}>
                  {cmd.name}
                </span>
                <code className="text-text-code text-xs">opcode={cmd.opcode}</code>
              </div>
              <p className="text-text-secondary text-sm mb-3">
                {cmd.desc}
              </p>
              <NvmeCliBlock command={cmd.cli} note={cmd.note} />
            </div>
          ))}
        </div>

        {/* Passthru for custom I/O commands */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold mb-3">
            Raw I/O Passthru &mdash; Any Opcode
          </div>
          <p className="text-text-secondary text-sm mb-3">
            For vendor-specific or non-standard I/O commands, use{" "}
            <code className="text-text-code">io-passthru</code> to send any opcode
            with arbitrary CDW values:
          </p>
          <NvmeCliBlock
            command={`nvme io-passthru /dev/nvme0n1 --opcode=0x81 \\
  --cdw10=0x00000000 --cdw11=0x000000ff \\
  --data-len=4096 -r`}
            note="Sends vendor I/O opcode 0x81 with custom dword fields. -r = read data from device"
          />
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
