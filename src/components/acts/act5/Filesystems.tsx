"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

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
    trimSupport: "Basic (mount -o discard)",
    bestFor: "USB drives, /boot partitions, embedded systems",
    desc: "The original Linux extended filesystem. No journaling means fast writes but risk of data corruption after unclean shutdown. Still used for /boot because bootloaders understand it and journaling adds unnecessary overhead for a read-only partition.",
  },
  {
    name: "ext3",
    color: "#e8a317",
    year: "2001",
    journaling: "Journal (ordered, writeback, journal)",
    maxFileSize: "2 TB",
    maxVolSize: "32 TB",
    cow: false,
    checksums: false,
    snapshots: false,
    compression: false,
    trimSupport: "Basic (mount -o discard)",
    bestFor: "Legacy systems, upgrades from ext2",
    desc: "Added journaling to ext2 — the journal records metadata changes before they hit disk, so recovery after a crash is fast (seconds, not minutes of fsck). Three journal modes: ordered (default, safest), writeback (fastest), and full journal (slowest, journals data too).",
  },
  {
    name: "ext4",
    color: "#635bff",
    year: "2008",
    journaling: "Journal (same modes as ext3)",
    maxFileSize: "16 TB",
    maxVolSize: "1 EB",
    cow: false,
    checksums: true,
    snapshots: false,
    compression: false,
    trimSupport: "Full (discard, fstrim, fitrim ioctl)",
    bestFor: "General-purpose Linux, databases, most workloads",
    desc: "The default Linux filesystem. Adds extents (replacing indirect block mapping), delayed allocation, multiblock allocation, and journal checksumming. Extents map contiguous blocks efficiently — a 1GB file might need just 1 extent instead of 262,144 indirect block pointers. This dramatically improves sequential I/O on NVMe.",
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
    trimSupport: "Full (discard, fstrim)",
    bestFor: "Large files, media, NAS, enterprise storage, RHEL default",
    desc: "Designed by SGI for IRIX, now the RHEL/CentOS default. Excels at large files and parallel I/O thanks to allocation groups (AGs) — independent regions of the filesystem that allow concurrent metadata operations. Supports online grow (but not shrink). Delayed allocation and extent-based allocation make it very efficient on NVMe SSDs.",
  },
  {
    name: "Btrfs",
    color: "#7c5cfc",
    year: "2009 (stable 2013+)",
    journaling: "Copy-on-Write (no journal needed)",
    maxFileSize: "16 EB",
    maxVolSize: "16 EB",
    cow: true,
    checksums: true,
    snapshots: true,
    compression: true,
    trimSupport: "Full (discard, fstrim, async discard)",
    bestFor: "Snapshots, compression, RAID, data integrity, Fedora/openSUSE default",
    desc: "A modern copy-on-write (CoW) filesystem. Instead of overwriting data in place, Btrfs writes modified data to a new location and updates the pointer — this makes snapshots nearly free (just preserve old pointers). Built-in checksumming detects silent data corruption (bit rot). Supports transparent compression (zstd, lzo, zlib), built-in RAID, subvolumes, and send/receive for incremental backups.",
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

export default function Filesystems() {
  const [activeFs, setActiveFs] = useState(2); // ext4 default

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Linux Filesystems &mdash; ext2, ext3, ext4, XFS, Btrfs
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          An NVMe SSD is a raw block device. To store files, you need a{" "}
          <strong className="text-text-primary">filesystem</strong> — a layer that
          translates file operations (open, read, write) into block I/O commands.
          The filesystem determines how data is organized, how metadata is tracked,
          and how the drive&apos;s TRIM/discard capabilities are utilized.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Understanding filesystems matters for NVMe because different filesystems
          interact differently with the drive&apos;s FTL, alignment, and TRIM support.
          The wrong choice can halve your IOPS or cause premature write amplification.
        </p>

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

        {/* Active filesystem detail */}
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

          {/* Feature badges */}
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
                    <th className="text-left py-3 px-4 text-text-muted font-mono whitespace-nowrap">
                      Feature
                    </th>
                    {FILESYSTEMS.map((fs) => (
                      <th
                        key={fs.name}
                        className="text-center py-3 px-3 font-mono font-bold whitespace-nowrap"
                        style={{ color: fs.color }}
                      >
                        {fs.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-story-border/50">
                      <td className="py-2.5 px-4 text-text-muted font-mono whitespace-nowrap">
                        {row.label}
                      </td>
                      {FILESYSTEMS.map((fs) => {
                        const val = fs[row.key];
                        return (
                          <td
                            key={fs.name}
                            className="py-2.5 px-3 text-center text-text-secondary"
                          >
                            {typeof val === "boolean" ? (
                              <span
                                className={
                                  val
                                    ? "text-nvme-green font-bold"
                                    : "text-text-muted"
                                }
                              >
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

        {/* Partition, format, mount workflow */}
        <div className="mb-8">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Partition → Format → Mount Workflow
          </div>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed">
            Here&apos;s the typical workflow for setting up an NVMe drive for benchmarking
            with fio. We&apos;ll create a partition, format it, mount it, and then
            run fio against the filesystem.
          </p>

          <div className="space-y-3">
            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">
                1. Check the NVMe device
              </div>
              <NvmeCliBlock command="nvme list" note="Lists all NVMe devices with model, serial, firmware, and capacity" />
            </div>

            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">
                2. Create a GPT partition table and partition
              </div>
              <NvmeCliBlock
                command="sudo parted /dev/nvme0n1 mklabel gpt && sudo parted /dev/nvme0n1 mkpart primary 0% 100%"
                note="Creates a single partition spanning the entire drive"
              />
            </div>

            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">
                3. Format with your chosen filesystem
              </div>
              <div className="space-y-2">
                <NvmeCliBlock command="sudo mkfs.ext4 -L nvme-test /dev/nvme0n1p1" note="ext4 — general purpose, safe default" />
                <NvmeCliBlock command="sudo mkfs.xfs -L nvme-test /dev/nvme0n1p1" note="XFS — best for large files and parallel I/O" />
                <NvmeCliBlock command="sudo mkfs.btrfs -L nvme-test /dev/nvme0n1p1" note="Btrfs — snapshots, compression, checksums" />
              </div>
            </div>

            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">
                4. Mount with TRIM support
              </div>
              <NvmeCliBlock command="sudo mount -o discard,noatime /dev/nvme0n1p1 /mnt/nvme" note="discard = online TRIM, noatime = skip access time updates (reduces writes)" />
            </div>

            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">
                5. Verify alignment and TRIM
              </div>
              <div className="space-y-2">
                <NvmeCliBlock command="sudo fstrim -v /mnt/nvme" note="Manual TRIM — reports bytes trimmed" />
                <NvmeCliBlock command="cat /sys/block/nvme0n1/queue/discard_granularity" note="Should show 4096 or 512 — the TRIM granularity" />
              </div>
            </div>

            <div className="bg-story-card rounded-xl p-4 card-shadow">
              <div className="text-text-primary text-sm font-semibold mb-2">
                6. Run fio on the filesystem
              </div>
              <NvmeCliBlock
                command={`fio --name=fs-test --directory=/mnt/nvme \\
  --ioengine=io_uring --rw=randread --bs=4k \\
  --iodepth=64 --numjobs=4 --direct=1 \\
  --runtime=60s --time_based --group_reporting \\
  --size=1g`}
                note="Tests filesystem-level performance (includes filesystem overhead)"
              />
            </div>
          </div>
        </div>

        {/* NVMe-specific filesystem considerations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-xl p-5 card-shadow">
            <div className="font-mono font-bold text-nvme-blue text-sm mb-2">
              Alignment Matters
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              NVMe SSDs have an internal page size (typically 4KB or 16KB). If your
              filesystem block size doesn&apos;t align, every I/O crosses a page boundary,
              causing read-modify-write amplification. Always use 4K sectors:{" "}
              <code className="text-text-code">mkfs.ext4 -b 4096</code>.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-5 card-shadow">
            <div className="font-mono font-bold text-nvme-green text-sm mb-2">
              TRIM / Discard
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              When you delete a file, the filesystem marks blocks as free but the SSD
              doesn&apos;t know. TRIM tells the FTL which blocks are unused so it can
              reclaim them during garbage collection. Use{" "}
              <code className="text-text-code">fstrim</code> (periodic) or{" "}
              <code className="text-text-code">mount -o discard</code> (continuous).
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-5 card-shadow">
            <div className="font-mono font-bold text-nvme-violet text-sm mb-2">
              CoW vs In-Place
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              ext4/XFS overwrite data in-place. Btrfs uses copy-on-write — writes go
              to new locations, old data stays until the pointer updates. CoW naturally
              spreads writes across the drive (implicit wear leveling) but can fragment
              random write workloads.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-5 card-shadow">
            <div className="font-mono font-bold text-nvme-amber text-sm mb-2">
              Raw Device vs Filesystem
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Benchmarking on a raw device (<code className="text-text-code">/dev/nvme0n1</code>)
              measures pure SSD performance. Through a filesystem, you add filesystem
              overhead (journaling, metadata, CoW) — typically 5-15% lower IOPS.
              Test both to understand the filesystem&apos;s cost.
            </p>
          </div>
        </div>

        <InfoCard variant="warning" title="Online TRIM vs Periodic TRIM">
          <code className="text-text-code">mount -o discard</code> sends TRIM commands
          on every delete, which can cause latency spikes on busy systems. For
          production, prefer periodic TRIM via{" "}
          <code className="text-text-code">fstrim.timer</code> (systemd) which runs
          weekly. For benchmarking, either approach works fine.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
