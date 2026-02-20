"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

const FIO_OPTIONS: {
  name: string;
  flag: string;
  desc: string;
  values: string;
  category: string;
}[] = [
  { name: "Job Name", flag: "--name=", desc: "Identifies this job in output. You can have multiple jobs in one file.", values: "any string", category: "basic" },
  { name: "Filename", flag: "--filename=", desc: "Device or file to test. Use raw block device for direct SSD testing.", values: "/dev/nvme0n1, /tmp/fio.dat", category: "basic" },
  { name: "I/O Engine", flag: "--ioengine=", desc: "How fio submits I/O. io_uring is fastest on Linux 5.1+, libaio is traditional async.", values: "io_uring, libaio, sync, psync", category: "basic" },
  { name: "Read/Write", flag: "--rw=", desc: "I/O pattern. Sequential vs random, read vs write vs mixed.", values: "read, write, randread, randwrite, randrw, readwrite", category: "basic" },
  { name: "Block Size", flag: "--bs=", desc: "I/O request size. 4k for IOPS testing, 128k-1M for throughput.", values: "4k, 8k, 64k, 128k, 1m", category: "basic" },
  { name: "I/O Depth", flag: "--iodepth=", desc: "Number of I/O requests in flight. NVMe shines at high QD (32-256).", values: "1, 4, 16, 32, 64, 128, 256", category: "queue" },
  { name: "Num Jobs", flag: "--numjobs=", desc: "Parallel workers. Each gets its own I/O queue. Use with --group_reporting.", values: "1, 4, 8, 16", category: "queue" },
  { name: "Direct I/O", flag: "--direct=", desc: "Bypass OS page cache. Must be 1 for raw SSD benchmarking.", values: "0 (cached), 1 (direct)", category: "important" },
  { name: "Runtime", flag: "--runtime=", desc: "How long to run. Use time_based to stop after this duration.", values: "30s, 60s, 120s, 300s", category: "important" },
  { name: "Time Based", flag: "--time_based", desc: "Run for the full runtime even if the file is exhausted.", values: "flag (no value)", category: "important" },
  { name: "Size", flag: "--size=", desc: "Total I/O to perform, or file size if creating a test file.", values: "1g, 10g, 100g, 100%", category: "important" },
  { name: "Group Reporting", flag: "--group_reporting", desc: "Aggregate stats across all numjobs into one summary.", values: "flag (no value)", category: "output" },
  { name: "Ramp Time", flag: "--ramp_time=", desc: "Warmup period before stats collection begins. Lets the drive reach steady state.", values: "5s, 10s, 30s", category: "advanced" },
  { name: "Norandommap", flag: "--norandommap", desc: "Don't track which blocks were accessed. Faster for large random tests.", values: "flag (no value)", category: "advanced" },
  { name: "RW Mix Read", flag: "--rwmixread=", desc: "Percentage of reads in mixed workload (randrw). Rest is writes.", values: "70, 50, 30", category: "advanced" },
  { name: "IO Depth Batch", flag: "--iodepth_batch=", desc: "Submit this many I/Os at once. Improves batching efficiency.", values: "8, 16, 32", category: "advanced" },
  { name: "IO Depth Batch Complete", flag: "--iodepth_batch_complete_min=", desc: "Wait for at least this many completions before submitting more.", values: "1, 8, 16", category: "advanced" },
  { name: "Verify", flag: "--verify=", desc: "Data integrity check. Writes patterns, reads back and verifies.", values: "md5, crc32c, sha256, pattern", category: "verification" },
  { name: "Latency Target", flag: "--latency_target=", desc: "Target latency in usec. Fio adjusts QD to maintain this.", values: "500, 1000, 5000", category: "advanced" },
];

const PRESETS = [
  {
    name: "4K Random Read (IOPS)",
    desc: "Standard IOPS benchmark. High queue depth to saturate the SSD.",
    cmd: `fio --name=4k-randread \\
  --filename=/dev/nvme0n1 \\
  --ioengine=io_uring \\
  --rw=randread \\
  --bs=4k \\
  --iodepth=128 \\
  --numjobs=4 \\
  --direct=1 \\
  --runtime=60s \\
  --time_based \\
  --group_reporting \\
  --ramp_time=5s`,
  },
  {
    name: "4K Random Write (IOPS)",
    desc: "Write IOPS. Watch for steady-state degradation after SLC cache fills.",
    cmd: `fio --name=4k-randwrite \\
  --filename=/dev/nvme0n1 \\
  --ioengine=io_uring \\
  --rw=randwrite \\
  --bs=4k \\
  --iodepth=64 \\
  --numjobs=4 \\
  --direct=1 \\
  --runtime=120s \\
  --time_based \\
  --group_reporting \\
  --ramp_time=10s \\
  --norandommap`,
  },
  {
    name: "128K Sequential Read (Throughput)",
    desc: "Maximum sequential bandwidth. Larger block size saturates PCIe lanes.",
    cmd: `fio --name=seq-read \\
  --filename=/dev/nvme0n1 \\
  --ioengine=io_uring \\
  --rw=read \\
  --bs=128k \\
  --iodepth=32 \\
  --numjobs=1 \\
  --direct=1 \\
  --runtime=30s \\
  --time_based \\
  --group_reporting`,
  },
  {
    name: "Mixed 70/30 Read/Write",
    desc: "Realistic workload simulation. Most database/app patterns are read-heavy.",
    cmd: `fio --name=mixed-rw \\
  --filename=/dev/nvme0n1 \\
  --ioengine=io_uring \\
  --rw=randrw \\
  --rwmixread=70 \\
  --bs=4k \\
  --iodepth=32 \\
  --numjobs=4 \\
  --direct=1 \\
  --runtime=60s \\
  --time_based \\
  --group_reporting \\
  --ramp_time=5s`,
  },
  {
    name: "QD=1 Latency Test",
    desc: "Measures raw device latency at low queue depth. No parallelism.",
    cmd: `fio --name=latency \\
  --filename=/dev/nvme0n1 \\
  --ioengine=io_uring \\
  --rw=randread \\
  --bs=4k \\
  --iodepth=1 \\
  --numjobs=1 \\
  --direct=1 \\
  --runtime=30s \\
  --time_based \\
  --group_reporting`,
  },
  {
    name: "Data Integrity Verify",
    desc: "Write patterns then read back and verify. Catches silent corruption.",
    cmd: `fio --name=verify \\
  --filename=/dev/nvme0n1 \\
  --ioengine=io_uring \\
  --rw=randwrite \\
  --bs=4k \\
  --iodepth=16 \\
  --numjobs=1 \\
  --direct=1 \\
  --size=1g \\
  --verify=crc32c \\
  --do_verify=1`,
  },
];

const CATEGORIES = [
  { key: "basic", label: "Basic" },
  { key: "important", label: "Important" },
  { key: "queue", label: "Queue Depth" },
  { key: "advanced", label: "Advanced" },
  { key: "output", label: "Output" },
  { key: "verification", label: "Verify" },
];

export default function FioGuide() {
  const [activePreset, setActivePreset] = useState(0);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [activeCategory, setActiveCategory] = useState("basic");

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Mastering fio &mdash; The Flexible I/O Tester
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <strong className="text-text-primary">fio</strong> is the industry-standard
          tool for benchmarking and stress-testing storage devices. Every SSD
          engineer, performance analyst, and storage admin uses it. Understanding
          fio is essential for characterizing NVMe performance.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          fio works by running &ldquo;jobs&rdquo; that define an I/O pattern.
          Each job specifies what to read/write, how big the blocks are, how many
          requests to keep in flight, and how long to run. The results show
          throughput (MB/s), IOPS, and latency percentiles (p50, p99, p99.9).
        </p>

        {/* Preset commands */}
        <div className="mb-8">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Common fio Presets — click to explore
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setActivePreset(i)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                  i === activePreset
                    ? "bg-nvme-blue text-white shadow-md"
                    : "bg-story-card border border-story-border text-text-secondary hover:text-nvme-blue hover:border-nvme-blue/40 card-shadow"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="text-text-primary font-semibold mb-1">
              {PRESETS[activePreset].name}
            </div>
            <p className="text-text-muted text-xs mb-4">
              {PRESETS[activePreset].desc}
            </p>
            <pre className="text-nvme-green text-xs bg-story-dark rounded-xl p-5 overflow-x-auto font-mono whitespace-pre">
              <span className="text-text-muted select-none">$ </span>
              {PRESETS[activePreset].cmd}
            </pre>
          </div>
        </div>

        {/* Option reference */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider">
              fio Option Reference
            </div>
            <button
              onClick={() => setShowAllOptions(!showAllOptions)}
              className="text-xs text-nvme-blue hover:underline font-mono"
            >
              {showAllOptions ? "Show less" : "Show all options"}
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                  activeCategory === cat.key
                    ? "bg-nvme-blue/10 text-nvme-blue border border-nvme-blue/30"
                    : "bg-story-surface text-text-muted hover:text-text-secondary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {FIO_OPTIONS
              .filter((opt) => showAllOptions || opt.category === activeCategory)
              .map((opt) => (
                <div key={opt.flag} className="bg-story-card rounded-xl p-4 card-shadow">
                  <div className="flex items-start gap-3">
                    <code className="text-nvme-blue font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                      {opt.flag}
                    </code>
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary text-sm font-semibold">{opt.name}</div>
                      <p className="text-text-muted text-xs mt-0.5">{opt.desc}</p>
                      <div className="mt-1">
                        <span className="text-[10px] text-text-muted">Values: </span>
                        <span className="text-[10px] text-text-code font-mono">{opt.values}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Understanding fio output */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold mb-3">
            Reading fio Output
          </div>
          <pre className="text-xs bg-story-dark rounded-xl p-4 overflow-x-auto font-mono text-white/90 mb-4">
{`  read: IOPS=985k, BW=3847MiB/s (4034MB/s)(225GiB/60001msec)
    slat (nsec): min=900, max=123456, avg=1523.45, stdev=892.31
    clat (usec): min=12, max=8234, avg=127.32, stdev=45.67
     lat (usec): min=14, max=8236, avg=128.84, stdev=45.89
    clat percentiles (usec):
     |  1.00th=[   62],  5.00th=[   76], 10.00th=[   84],
     | 50.00th=[  118], 90.00th=[  174], 95.00th=[  200],
     | 99.00th=[  293], 99.50th=[  343], 99.90th=[  523],
     | 99.95th=[  668], 99.99th=[ 1942]`}
          </pre>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green font-mono font-bold">IOPS</span>
              <span className="text-text-muted"> = I/O operations per second. The headline number for random 4K.</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green font-mono font-bold">BW</span>
              <span className="text-text-muted"> = Bandwidth. The headline number for sequential workloads.</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">slat</span>
              <span className="text-text-muted"> = Submission latency. Time from fio submit to kernel.</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">clat</span>
              <span className="text-text-muted"> = Completion latency. Kernel to completion. This is what matters.</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-violet font-mono font-bold">lat</span>
              <span className="text-text-muted"> = Total latency (slat + clat). End-to-end from fio&apos;s perspective.</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-amber font-mono font-bold">p99/p99.9</span>
              <span className="text-text-muted"> = Tail latency. More important than averages for real workloads.</span>
            </div>
          </div>
        </div>

        <InfoCard variant="warning" title="Always use --direct=1">
          Without direct=1, I/O goes through the Linux page cache. You&apos;ll
          measure RAM speed, not SSD speed. For raw device testing, always set{" "}
          <code className="text-text-code">--direct=1</code> and use the block device
          (<code className="text-text-code">/dev/nvme0n1</code>), not a filesystem path.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
