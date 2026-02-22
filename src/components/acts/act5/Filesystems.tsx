"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

interface Filesystem {
  name: string;
  color: string;
  year: string;
  journaling: string;
  maxFileSize: string;
  maxVolSize: string;
  cow: boolean;
  checksums: boolean;
  snapshots: boolean;
  compression: boolean;
  trimSupport: string;
  bestFor: string;
  desc: string;
}

const FILESYSTEMS: Filesystem[] = [
  {
    name: "ext2",
    color: "#9e9789",
    year: "1993",
    journaling: "None",
    maxFileSize: "2 TB",
    maxVolSize: "32 TB",
    cow: false,
    checksums: false,
    snapshots: false,
    compression: false,
    trimSupport: "Basic",
    bestFor: "USB drives, /boot partitions",
    desc: "The original Linux filesystem. No journaling means writes go directly to disk — fast, but if power is lost mid-write, the data structure can become corrupted. Recovery requires scanning the entire drive (fsck), which can take minutes. Still used for /boot because bootloaders understand it and it's tiny.",
  },
  {
    name: "ext3",
    color: "#e8a317",
    year: "2001",
    journaling: "Journal (3 modes)",
    maxFileSize: "2 TB",
    maxVolSize: "32 TB",
    cow: false,
    checksums: false,
    snapshots: false,
    compression: false,
    trimSupport: "Basic",
    bestFor: "Legacy systems",
    desc: "Added journaling to ext2. Before changing data on disk, ext3 first writes what it's about to do to a \"journal\" — like writing a to-do list before doing the task. If power is lost, the system checks the journal and either finishes or undoes the pending change. Recovery takes seconds instead of minutes.",
  },
  {
    name: "ext4",
    color: "#635bff",
    year: "2008",
    journaling: "Journal (3 modes)",
    maxFileSize: "16 TB",
    maxVolSize: "1 EB",
    cow: false,
    checksums: true,
    snapshots: false,
    compression: false,
    trimSupport: "Full (discard + fstrim)",
    bestFor: "General-purpose, databases",
    desc: "The default Linux filesystem. Added extents — instead of tracking each block individually, it says \"blocks 1000-5000 belong to this file.\" One extent replaces thousands of block pointers, dramatically improving performance on large files and sequential reads on NVMe. Also adds delayed allocation (batches writes for efficiency) and journal checksumming.",
  },
  {
    name: "XFS",
    color: "#00b894",
    year: "1994 (SGI), 2001 (Linux)",
    journaling: "Metadata journal",
    maxFileSize: "8 EB",
    maxVolSize: "8 EB",
    cow: false,
    checksums: true,
    snapshots: false,
    compression: false,
    trimSupport: "Full (discard + fstrim)",
    bestFor: "Large files, enterprise, RHEL default",
    desc: "Designed by SGI for handling massive files on supercomputers. Its key innovation is allocation groups (AGs) — independent regions of the filesystem that allow multiple threads to allocate space simultaneously without contention. This makes XFS excellent for parallel I/O workloads on NVMe SSDs. The RHEL/CentOS default.",
  },
  {
    name: "Btrfs",
    color: "#7c5cfc",
    year: "2009 (stable 2013+)",
    journaling: "Copy-on-Write (no journal)",
    maxFileSize: "16 EB",
    maxVolSize: "16 EB",
    cow: true,
    checksums: true,
    snapshots: true,
    compression: true,
    trimSupport: "Full (discard + fstrim + async)",
    bestFor: "Snapshots, compression, data integrity",
    desc: "A modern copy-on-write (CoW) filesystem. Instead of overwriting data in place, Btrfs writes to a new location and updates the pointer — exactly like the SSD's FTL! This makes snapshots nearly free (just preserve old pointers). Also detects silent data corruption (bit rot) via checksums on every block, and supports transparent compression.",
  },
];

const FEATURE_ROWS: { label: string; key: keyof Filesystem }[] = [
  { label: "Year", key: "year" },
  { label: "Journaling", key: "journaling" },
  { label: "Max File Size", key: "maxFileSize" },
  { label: "Max Volume", key: "maxVolSize" },
  { label: "Copy-on-Write", key: "cow" },
  { label: "Checksums", key: "checksums" },
  { label: "Snapshots", key: "snapshots" },
  { label: "Compression", key: "compression" },
  { label: "TRIM Support", key: "trimSupport" },
  { label: "Best For", key: "bestFor" },
];

function StorageStackVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const layers = [
    { label: "Application", sublabel: "open(), read(), write()", color: "#94a3b8" },
    { label: "Filesystem (ext4/XFS/Btrfs)", sublabel: "files → LBAs, journaling, TRIM", color: "#a78bfa" },
    { label: "Block Layer", sublabel: "I/O scheduling, merging", color: "#38bdf8" },
    { label: "NVMe Driver", sublabel: "SQ/CQ commands, doorbells", color: "#00d4aa" },
    { label: "PCIe + SSD Controller", sublabel: "DMA, FTL, NAND", color: "#f5a623" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Linux Storage Stack — From Application to NAND
      </div>
      <div className="flex flex-col items-center gap-1.5 max-w-sm mx-auto">
        {layers.map((layer, i) => (
          <div key={layer.label} className="w-full flex flex-col items-center">
            <motion.div
              className="w-full rounded-lg p-3 text-center"
              style={{
                backgroundColor: `${layer.color}10`,
                border: `2px solid ${layer.color}40`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1, type: "spring" }}
            >
              <div className="font-mono font-bold text-[11px]" style={{ color: layer.color }}>
                {layer.label}
              </div>
              <div className="text-text-muted text-[9px]">{layer.sublabel}</div>
            </motion.div>
            {i < layers.length - 1 && (
              <motion.div
                className="text-text-muted text-[10px] my-0.5"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.1 + 0.05 }}
              >
                ▼
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Filesystems() {
  const [activeFs, setActiveFs] = useState(2);

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Filesystems &mdash; How Files Become LBAs
        </h3>

        <AnalogyCard concept="Filesystems Translate Files to Blocks" analogy="A filesystem is like a librarian's catalog system — it translates human-readable names (photo.jpg, report.pdf) into specific storage locations (LBAs). Different filesystems (ext4, XFS, Btrfs) use different organization strategies, affecting how well they work with SSDs." />
        <TermDefinition term="ext4" definition="The default Linux filesystem. Uses extents (contiguous block ranges) for efficient allocation. Supports TRIM/discard for SSDs. Good general-purpose choice." />
        <TermDefinition term="XFS" definition="A high-performance filesystem optimized for large files and parallel I/O. Excels at sequential workloads and scales well on multi-core systems. Often preferred for database and media storage." />
        <TermDefinition term="Btrfs" definition="A copy-on-write (CoW) filesystem with built-in snapshots, compression, and RAID support. CoW writes create new copies instead of overwriting — similar to how SSDs do out-of-place writes internally." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          So far, we&apos;ve been talking about LBAs — numbered blocks on the SSD.
          But when you save a document, you don&apos;t think in LBAs. You think in
          files and folders. <em className="text-text-primary">Who translates between
          the two?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The <strong className="text-text-primary">filesystem</strong>. It&apos;s a
          layer of software that turns file operations (open, read, write, delete)
          into block I/O commands (NVMe Read, Write, TRIM). It tracks which LBAs
          belong to which file, manages free space, and handles crash recovery.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why does the filesystem choice matter
          for NVMe?</em> Because different filesystems interact differently with the
          SSD&apos;s internals:
        </p>
        <ul className="text-text-secondary mb-8 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li><strong className="text-text-primary">TRIM support</strong> — does the filesystem tell the SSD when files are deleted?</li>
          <li><strong className="text-text-primary">Alignment</strong> — does it write in 4KB-aligned blocks matching the SSD&apos;s internal page size?</li>
          <li><strong className="text-text-primary">Write pattern</strong> — does it use copy-on-write (spreading writes) or in-place updates?</li>
          <li><strong className="text-text-primary">Journaling overhead</strong> — how much extra writing does it do for crash safety?</li>
        </ul>

        {/* Filesystem concepts explained */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Filesystem Concepts Explained
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            Before comparing filesystems, let&apos;s define the terms you&apos;ll see in the table below.
            Each of these concepts solves a specific problem:
          </p>
          <div className="space-y-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="font-mono font-bold text-nvme-blue text-sm mb-1">Metadata</div>
              <p className="text-text-secondary text-xs leading-relaxed">
                Data about your data. When you save a file, the filesystem stores not just the file contents
                but also: who owns it, when it was created/modified, its size, and <em className="text-text-primary">which
                LBAs it occupies on the SSD</em>. This bookkeeping data IS the metadata. Without it, the
                filesystem wouldn&apos;t know where your files are.
              </p>
            </div>

            <div className="bg-story-surface rounded-xl p-4">
              <div className="font-mono font-bold text-nvme-amber text-sm mb-1">Journaling</div>
              <p className="text-text-secondary text-xs leading-relaxed mb-3">
                A crash-safety mechanism. Before the filesystem makes any change (writing a file, renaming,
                deleting), it first writes a note to a special area called the &ldquo;journal&rdquo; describing
                what it&apos;s about to do. If power is lost mid-operation, the system checks the journal on
                boot and either completes or rolls back the pending change. Without journaling (ext2), recovery
                requires scanning the entire drive &mdash; which can take minutes.
              </p>
              <div className="bg-story-card rounded-lg p-3">
                <div className="text-text-muted text-[10px] font-mono mb-2 uppercase">Three journal modes (ext3/ext4):</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-2">
                    <code className="text-nvme-green font-mono font-bold flex-shrink-0">journal</code>
                    <span className="text-text-muted">Journals both metadata AND file data (safest, slowest &mdash; doubles write traffic)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="text-nvme-blue font-mono font-bold flex-shrink-0">ordered</code>
                    <span className="text-text-muted">Journals only metadata, but ensures data is written before metadata is committed (good default)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="text-nvme-amber font-mono font-bold flex-shrink-0">writeback</code>
                    <span className="text-text-muted">Journals only metadata, data may be written in any order (fastest, but data can be corrupted on crash)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-story-surface rounded-xl p-4">
              <div className="font-mono font-bold text-nvme-violet text-sm mb-1">Copy-on-Write (CoW)</div>
              <p className="text-text-secondary text-xs leading-relaxed">
                Instead of overwriting data in place, the filesystem writes the new version to a different
                location and updates the pointer. <em className="text-text-primary">Sound familiar?</em> It&apos;s
                the same principle as the SSD&apos;s FTL from Lesson 3! Btrfs does this at the filesystem level.
                Benefits: old versions of data are preserved (enabling snapshots), and partial writes can never
                corrupt existing data.
              </p>
            </div>

            <div className="bg-story-surface rounded-xl p-4">
              <div className="font-mono font-bold text-nvme-green text-sm mb-1">Checksums</div>
              <p className="text-text-secondary text-xs leading-relaxed">
                A small mathematical fingerprint computed from your data. Every time data is read back, the
                filesystem recomputes the checksum and compares it. If they don&apos;t match, the data was
                silently corrupted (<em className="text-text-primary">bit rot</em>). Without checksums (ext4 on
                data), corruption goes undetected until the file is actually used and looks wrong.
              </p>
            </div>

            <div className="bg-story-surface rounded-xl p-4">
              <div className="font-mono font-bold text-nvme-blue text-sm mb-1">Snapshots</div>
              <p className="text-text-secondary text-xs leading-relaxed">
                A frozen-in-time copy of the filesystem. With CoW, creating a snapshot is nearly instant &mdash;
                you just tell the filesystem &ldquo;preserve all current pointers.&rdquo; New writes go to new
                locations, while the snapshot still points to the old data. Used for: backups (snapshot before
                updating), rollbacks (revert to last known good state), and testing (snapshot, experiment, revert).
              </p>
            </div>

            <div className="bg-story-surface rounded-xl p-4">
              <div className="font-mono font-bold text-nvme-amber text-sm mb-1">Compression</div>
              <p className="text-text-secondary text-xs leading-relaxed">
                The filesystem automatically compresses data before writing to NAND and decompresses when reading.
                Btrfs supports zstd, lzo, and zlib. Benefits: less data written to the SSD (less wear, more
                effective capacity), and reads can be faster because less data needs to come off the NAND
                (decompression is fast on modern CPUs). Downside: uses CPU time.
              </p>
            </div>

            <div className="bg-story-surface rounded-xl p-4">
              <div className="font-mono font-bold text-nvme-red text-sm mb-1">TRIM Support Levels</div>
              <p className="text-text-secondary text-xs leading-relaxed mb-3">
                In the comparison table, you&apos;ll see TRIM support labeled as &ldquo;Basic&rdquo; or &ldquo;Full.&rdquo;
                Here&apos;s what each level means and how TRIM can be delivered to the SSD:
              </p>
              <div className="bg-story-card rounded-lg p-3 mb-3">
                <div className="text-text-muted text-[10px] font-mono mb-2 uppercase">TRIM delivery methods:</div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start gap-2">
                    <code className="text-nvme-blue font-mono font-bold flex-shrink-0">discard</code>
                    <span className="text-text-muted">
                      <strong className="text-text-primary">Continuous TRIM.</strong> A mount option (<code className="text-text-code">mount -o discard</code>)
                      that sends TRIM commands to the SSD immediately whenever a file is deleted. The SSD always knows
                      which blocks are free, but each delete operation takes slightly longer because it waits for the
                      TRIM command to complete.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="text-nvme-green font-mono font-bold flex-shrink-0">fstrim</code>
                    <span className="text-text-muted">
                      <strong className="text-text-primary">Periodic/batched TRIM.</strong> A command (<code className="text-text-code">sudo fstrim -v /</code>)
                      that scans the filesystem for all free space and sends TRIM for everything at once. Usually run
                      weekly via a systemd timer (<code className="text-text-code">fstrim.timer</code>). More efficient
                      because the SSD receives one large batch instead of many small TRIMs. No impact on normal file operations.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="text-nvme-violet font-mono font-bold flex-shrink-0">async</code>
                    <span className="text-text-muted">
                      <strong className="text-text-primary">Asynchronous discard (Btrfs only).</strong> A newer approach
                      (<code className="text-text-code">mount -o discard=async</code>) that queues TRIM commands and sends
                      them in batches during idle time, instead of blocking on every delete. Combines the best of both:
                      near-continuous TRIM awareness without the per-delete latency penalty. This is the recommended mode
                      for Btrfs on NVMe.
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-story-card rounded-lg p-3">
                <div className="text-text-muted text-[10px] font-mono mb-2 uppercase">Support levels in the table:</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="text-text-muted font-mono font-bold flex-shrink-0 w-8">Basic</span>
                    <span className="text-text-muted">
                      Only supports <code className="text-text-code">fstrim</code> (periodic batched TRIM). Does not
                      support the <code className="text-text-code">discard</code> mount option for continuous TRIM.
                      ext2 and ext3 fall here &mdash; they can tell the SSD about free space, but only when you manually
                      run fstrim.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-nvme-blue font-mono font-bold flex-shrink-0 w-8">Full</span>
                    <span className="text-text-muted">
                      Supports both <code className="text-text-code">discard</code> (continuous) and <code className="text-text-code">fstrim</code>{" "}
                      (periodic). ext4 and XFS support both modes. Btrfs goes further with{" "}
                      <code className="text-text-code">discard=async</code> for batched asynchronous TRIM.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage stack layer diagram */}
        <StorageStackVisual />

        {/* Filesystem selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILESYSTEMS.map((fs, i) => (
            <button
              key={fs.name}
              onClick={() => setActiveFs(i)}
              className={`px-4 py-2.5 rounded-xl text-sm font-mono font-semibold transition-all ${
                i === activeFs
                  ? "text-white shadow-md"
                  : "bg-story-card border border-story-border text-text-secondary hover:text-text-primary card-shadow"
              }`}
              style={i === activeFs ? { backgroundColor: fs.color } : undefined}
            >
              {fs.name}
            </button>
          ))}
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: FILESYSTEMS[activeFs].color }}
            />
            <h4 className="text-lg font-bold text-text-primary">
              {FILESYSTEMS[activeFs].name}
            </h4>
            <span className="text-text-muted text-xs font-mono">
              ({FILESYSTEMS[activeFs].year})
            </span>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            {FILESYSTEMS[activeFs].desc}
          </p>

          <div className="flex flex-wrap gap-2">
            {FILESYSTEMS[activeFs].cow && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-nvme-violet/10 text-nvme-violet">
                Copy-on-Write
              </span>
            )}
            {FILESYSTEMS[activeFs].checksums && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-nvme-green/10 text-nvme-green">
                Checksums
              </span>
            )}
            {FILESYSTEMS[activeFs].snapshots && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-nvme-blue/10 text-nvme-blue">
                Snapshots
              </span>
            )}
            {FILESYSTEMS[activeFs].compression && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-nvme-amber/10 text-nvme-amber">
                Compression
              </span>
            )}
          </div>
        </div>

        {/* Comparison table */}
        <div className="mb-8">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Side-by-Side Comparison
          </div>
          <div className="bg-story-card rounded-2xl card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-story-border">
                    <th className="text-left py-3 px-4 text-text-muted font-mono whitespace-nowrap">Feature</th>
                    {FILESYSTEMS.map((fs) => (
                      <th key={fs.name} className="text-center py-3 px-3 font-mono font-bold whitespace-nowrap" style={{ color: fs.color }}>
                        {fs.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-story-border/50">
                      <td className="py-2.5 px-4 text-text-muted font-mono whitespace-nowrap">{row.label}</td>
                      {FILESYSTEMS.map((fs) => {
                        const val = fs[row.key];
                        return (
                          <td key={fs.name} className="py-2.5 px-3 text-center text-text-secondary">
                            {typeof val === "boolean" ? (
                              <span className={val ? "text-nvme-green font-bold" : "text-text-muted"}>
                                {val ? "Yes" : "No"}
                              </span>
                            ) : (
                              <span className="text-[11px]">{String(val)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Workflow */}
        <div className="mb-8">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Setting Up a Filesystem on NVMe
          </div>
          <div className="space-y-3">
            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">1. Find your NVMe device</div>
              <NvmeCliBlock command="nvme list" note="Shows all NVMe devices with model, serial, and capacity" />
            </div>
            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">2. Create a partition</div>
              <NvmeCliBlock command="sudo parted /dev/nvme0n1 mklabel gpt && sudo parted /dev/nvme0n1 mkpart primary 0% 100%" note="Creates a GPT partition table with one partition spanning the entire drive" />
            </div>
            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">3. Format with your chosen filesystem</div>
              <div className="space-y-2">
                <NvmeCliBlock command="sudo mkfs.ext4 -L nvme-test /dev/nvme0n1p1" note="ext4 — safe default for most workloads" />
                <NvmeCliBlock command="sudo mkfs.xfs -L nvme-test /dev/nvme0n1p1" note="XFS — best for large files and parallel I/O" />
                <NvmeCliBlock command="sudo mkfs.btrfs -L nvme-test /dev/nvme0n1p1" note="Btrfs — snapshots, compression, checksums" />
              </div>
            </div>
            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">4. Mount with TRIM support</div>
              <NvmeCliBlock command="sudo mount -o discard,noatime /dev/nvme0n1p1 /mnt/nvme" note="discard = TRIM on delete, noatime = skip access time updates (reduces writes to SSD)" />
            </div>
            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">5. Ready for benchmarking</div>
              <p className="text-text-muted text-xs">
                Your filesystem is mounted. In the next section, we&apos;ll use{" "}
                <strong className="text-text-primary">fio</strong> to benchmark
                performance — both on the raw device and through the filesystem.
              </p>
            </div>
          </div>
        </div>

        <InfoCard variant="tip" title="Btrfs CoW and the SSD's FTL — double indirection">
          Here&apos;s an interesting parallel: Btrfs uses copy-on-write to avoid
          overwriting data in place. The SSD&apos;s FTL does the same thing at the
          hardware level. So with Btrfs on an NVMe SSD, writes are redirected
          twice — once by Btrfs and once by the FTL. This can increase write
          amplification but also improves crash consistency.
        </InfoCard>

        <KnowledgeCheck
          id="act5-fs-kc1"
          question="What is the most common Linux filesystem for NVMe SSDs?"
          options={["ext4", "NTFS"]}
          correctIndex={0}
          explanation="ext4 is the default and most widely-used Linux filesystem. It supports TRIM/discard, has mature tooling, and works well with NVMe SSDs. NTFS is a Windows filesystem."
          hint="Consider how the filesystem translates file operations into block device I/O."
        />

      </div>
    </SectionWrapper>
  );
}
