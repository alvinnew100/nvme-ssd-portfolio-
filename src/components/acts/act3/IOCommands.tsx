"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

const IO_CMDS = [
  {
    name: "Read",
    opcode: "0x02",
    color: "#00b894",
    desc: "Reads data from the SSD into host memory. You specify which LBA to start at (SLBA) and how many blocks to read (NLB).",
    why: "This is the most common NVMe command. Every time your OS loads a file, it translates the file request into one or more NVMe Read commands.",
    cli: "nvme read /dev/nvme0n1 --start-block=0 --block-count=7 --data-size=4096",
    note: "Reads 8 blocks (NLB is 0-based: 7 = 8 blocks) starting at LBA 0",
  },
  {
    name: "Write",
    opcode: "0x01",
    color: "#635bff",
    desc: "Writes data from host memory to the SSD. Same SLBA/NLB fields as Read. Can optionally set the FUA (Force Unit Access) bit to bypass the SSD's volatile write cache.",
    why: "When you save a file, the filesystem converts it into Write commands. FUA ensures data reaches NAND immediately — critical for databases that need crash consistency.",
    cli: "nvme write /dev/nvme0n1 --start-block=0 --block-count=7 --data-size=4096 -d data.bin",
    note: "-d specifies the data file to write. Add --force-unit-access for FUA writes",
  },
  {
    name: "Flush",
    opcode: "0x00",
    color: "#7c5cfc",
    desc: "Forces all data in the SSD's volatile write cache to be committed to NAND. No data transfer — just a signal to persist everything.",
    why: "SSDs buffer writes in fast volatile cache (DRAM) before writing to NAND. If power is lost before flushing, cached data is lost. Databases call Flush after every transaction commit.",
    cli: "nvme flush /dev/nvme0n1",
    note: "No arguments needed. Ensures all pending writes are safely on NAND",
  },
  {
    name: "Compare",
    opcode: "0x05",
    color: "#e8a317",
    desc: "Reads data from NAND and compares it to a host buffer. Returns success only if they match exactly.",
    why: "Used for atomic test-and-set patterns — \"change this data only if it hasn't been modified since I last read it.\" Enables concurrent access without locks.",
    cli: "nvme compare /dev/nvme0n1 --start-block=0 --block-count=0 --data-size=512 -d expected.bin",
    note: "Compares 1 block at LBA 0 against expected.bin",
  },
  {
    name: "Write Zeroes",
    opcode: "0x08",
    color: "#9e9789",
    desc: "Fills a range of LBAs with zeros, but without actually transferring zero-filled data over PCIe. The SSD handles it internally.",
    why: "Much faster than writing actual zeros — no data moves over the bus. The FTL can just mark those LBAs as \"contains zeros\" in its mapping table. Great for initializing storage.",
    cli: "nvme write-zeroes /dev/nvme0n1 --start-block=0 --block-count=255",
    note: "Zeros 256 blocks starting at LBA 0. No data transfer needed — handled internally by the SSD",
  },
  {
    name: "Dataset Management (TRIM)",
    opcode: "0x09",
    color: "#e05d6f",
    desc: "Tells the SSD which LBA ranges are no longer in use. The SSD can then reclaim those physical blocks during garbage collection.",
    why: "Remember the FTL from Lesson 3? When you delete a file, the filesystem frees the LBAs, but the SSD doesn't know — it still thinks those pages contain valid data. TRIM bridges this gap, reducing write amplification and keeping the drive fast.",
    cli: "nvme dsm /dev/nvme0n1 --ad --slbs=0 --blocks=256",
    note: "--ad = deallocate (TRIM). Multiple ranges can be specified in one command",
  },
  {
    name: "Verify",
    opcode: "0x0C",
    color: "#00b894",
    desc: "Reads data from NAND and checks its integrity (ECC) without transferring data to the host.",
    why: "Used for \"scrubbing\" — proactively finding bit rot before it causes real failures. The SSD reads and checks ECC, but doesn't send data over PCIe, so it's faster than a full read.",
    cli: "nvme verify /dev/nvme0n1 --start-block=0 --block-count=255",
    note: "Verifies 256 blocks. No data transfer — only integrity check on the drive",
  },
  {
    name: "Write Uncorrectable",
    opcode: "0x04",
    color: "#e05d6f",
    desc: "Marks a range of LBAs as intentionally corrupted. Any read to these LBAs will return an error.",
    why: "Used by driver developers and test teams to verify that error handling code works correctly. \"I need to test what happens when a read fails — let me create a guaranteed failure.\"",
    cli: "nvme write-uncor /dev/nvme0n1 --start-block=1000 --block-count=0",
    note: "Marks LBA 1000 as uncorrectable. Reads will fail with Unrecovered Read Error",
  },
];

export default function IOCommands() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          I/O Commands &mdash; Reading and Writing Your Data
        </h3>

        <AnalogyCard
          concept="I/O Commands Move Your Data"
          analogy="While admin commands manage the SSD, I/O commands are the workhorses that actually read and write your data. A Read command says 'give me N blocks starting at LBA X.' A Write command says 'store this data at LBA X.' These flow through I/O queues (not the admin queue) for maximum parallelism."
        />

        <p className="text-text-secondary mb-2 leading-relaxed max-w-3xl">
          <TermDefinition term="NLB (Number of Logical Blocks)" definition="A field in Read/Write commands specifying how many LBAs to transfer. NLB is 0-indexed, so NLB=0 means 1 block, NLB=7 means 8 blocks." />{" "}
          <TermDefinition term="SLBA (Starting Logical Block Address)" definition="The first LBA to read from or write to. Combined with NLB, it defines the complete range: 'read NLB+1 blocks starting at SLBA.'" />
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Admin commands manage the drive. <strong className="text-text-primary">
          I/O commands</strong> handle your actual data — they&apos;re the workhorses
          of NVMe. Every file you open, every save, every download ultimately
          becomes one or more I/O commands.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          I/O commands use queues with <strong className="text-text-primary">QID
          &ge; 1</strong> (the I/O queues created during boot, one per CPU core).
          Each command targets a specific <strong className="text-text-primary">
          namespace</strong> (NSID in CDW1) and specifies a range of LBAs.
        </p>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Each command below shows <em>what</em> it does, <em>why</em> it exists,
          and the <strong className="text-text-primary">nvme-cli terminal
          command</strong> you&apos;d type to run it:
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
              <p className="text-text-secondary text-sm mb-2">
                {cmd.desc}
              </p>
              <p className="text-text-muted text-xs italic mb-3"
                style={{ borderLeft: `3px solid ${cmd.color}`, paddingLeft: "12px" }}
              >
                {cmd.why}
              </p>
              <NvmeCliBlock command={cmd.cli} note={cmd.note} />
            </div>
          ))}
        </div>

        {/* Passthru for custom I/O commands */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold mb-3">
            Raw I/O Passthru &mdash; When Standard Commands Aren&apos;t Enough
          </div>
          <p className="text-text-secondary text-sm mb-3">
            Some SSD vendors add proprietary I/O commands (opcodes 0x80-0xFF) for
            special diagnostics or features. The{" "}
            <code className="text-text-code">io-passthru</code> command lets you
            send any opcode with raw CDW values — it&apos;s like having a skeleton
            key:
          </p>
          <NvmeCliBlock
            command={`nvme io-passthru /dev/nvme0n1 --opcode=0x81 \\
  --cdw10=0x00000000 --cdw11=0x000000ff \\
  --data-len=4096 -r`}
            note="Sends vendor I/O opcode 0x81 with custom dword fields. -r = read data from device"
          />
        </div>

        <InfoCard variant="tip" title="The 0-based NLB gotcha">
          NLB (Number of Logical Blocks) is 0-based: a value of 0 means 1 block,
          7 means 8 blocks. <em>Why?</em> Because NLB is stored in 16 bits, giving
          a range of 0-65535. If it were 1-based, the maximum would be 65535 blocks.
          By being 0-based, you get 65536 blocks. This is a common source of off-by-one
          bugs in NVMe driver development.
        </InfoCard>

        <KnowledgeCheck
          id="act3-io-kc1"
          question="Which I/O command ensures data has been persisted to non-volatile storage?"
          options={["Flush", "Read"]}
          correctIndex={0}
          explanation="The Flush command forces all data in the SSD's volatile write buffer (DRAM cache) to be written to NAND flash. This guarantees persistence — critical for databases and filesystems that need crash consistency."
          hint="Consider the difference between reading data and writing data in terms of NVMe opcodes."
        />
      </div>
    </SectionWrapper>
  );
}
