"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

const FIO_OPTIONS: {
  name: string;
  flag: string;
  desc: string;
  why: string;
  values: string;
  gotcha?: string;
  category: string;
}[] = [
  { name: "Job Name", flag: "--name=", desc: "Identifies this job in output. You can have multiple jobs in one fio config file.", why: "When running multiple workloads (e.g., reads and writes simultaneously), the name lets you tell which stats belong to which job.", values: "any string", category: "basic" },
  { name: "Filename", flag: "--filename=", desc: "Device or file to test. Use raw block device for direct SSD testing.", why: "Testing a raw block device (/dev/nvme0n1) bypasses the filesystem entirely — you're measuring the SSD directly. Testing a file path (/tmp/fio.dat) includes filesystem overhead, which is more realistic for application benchmarks.", values: "/dev/nvme0n1, /tmp/fio.dat", gotcha: "Using a raw device DESTROYS all data on it. Triple-check the device name. Use 'lsblk' to verify.", category: "basic" },
  { name: "I/O Engine", flag: "--ioengine=", desc: "How fio submits I/O to the kernel.", why: "io_uring is the modern, fastest option (Linux 5.1+). It uses shared ring buffers between userspace and kernel — no system call overhead per I/O. libaio is the traditional async engine. sync means one I/O at a time (useless for benchmarking SSDs). The engine you choose determines the maximum achievable performance.", values: "io_uring, libaio, sync, psync", gotcha: "If you use 'sync', iodepth is forced to 1 — you can't test deep queues.", category: "basic" },
  { name: "Read/Write Pattern", flag: "--rw=", desc: "The I/O pattern to generate.", why: "SSDs perform very differently depending on the pattern. Sequential reads can hit 7 GB/s on PCIe 4.0, but random reads at QD1 might only do 15,000 IOPS. Testing only sequential reads and claiming '7 GB/s' is misleading if your workload is random.", values: "read, write, randread, randwrite, randrw, readwrite", category: "basic" },
  { name: "Block Size", flag: "--bs=", desc: "Size of each I/O request.", why: "Block size determines whether you measure IOPS or throughput. At 4K, you're measuring how many small operations the SSD can handle (IOPS). At 128K-1M, you're measuring raw bandwidth. Real databases use 4K-16K, file copies use 128K+, and video streaming uses 1M+. Match your block size to your actual workload.", values: "4k, 8k, 64k, 128k, 1m", gotcha: "Using bs=4k for a throughput test gives misleadingly low MB/s numbers. Using bs=1m for an IOPS test gives misleadingly high IOPS numbers.", category: "basic" },
  { name: "I/O Depth", flag: "--iodepth=", desc: "Number of I/O requests in flight simultaneously.", why: "This is perhaps the most important fio parameter for NVMe. Remember from Lesson 6: NVMe has deep queues (up to 65K entries). An SSD has multiple NAND chips that can work in parallel. At iodepth=1, you're only using one chip at a time — the SSD is mostly idle. At iodepth=128, you're keeping many chips busy simultaneously. NVMe drives can be 10-20x faster at high queue depth vs QD1.", values: "1, 4, 16, 32, 64, 128, 256", gotcha: "High iodepth with sync engine does nothing — sync can only have 1 in flight. Use io_uring or libaio.", category: "queue" },
  { name: "Num Jobs", flag: "--numjobs=", desc: "Number of parallel worker threads/processes.", why: "Each job gets its own I/O queue. Remember: NVMe creates one queue pair per CPU core. With numjobs=4 and iodepth=32, you have 4 threads × 32 = 128 total I/Os in flight. This simulates multi-threaded applications like databases.", values: "1, 4, 8, 16", gotcha: "numjobs × iodepth = total I/Os in flight. 16 jobs × 256 depth = 4096 in flight — that might overwhelm your system.", category: "queue" },
  { name: "Direct I/O", flag: "--direct=", desc: "Bypass the OS page cache.", why: "Without direct=1, your I/O goes through Linux's page cache (RAM). Reads hit the cache and return at RAM speed (~10 GB/s), not SSD speed. Writes get buffered in RAM and flushed later. You'd be measuring your RAM, not your SSD. direct=1 forces I/O to go straight to the device.", values: "0 (cached), 1 (direct)", gotcha: "Forgetting direct=1 is the #1 fio mistake. Your results will look impossibly fast because you're reading from RAM.", category: "important" },
  { name: "Runtime", flag: "--runtime=", desc: "Maximum test duration.", why: "Short tests (5-10s) measure burst performance — often from the SSD's SLC cache, which is much faster than the underlying TLC/QLC NAND. To see true sustained performance, run for at least 60 seconds for reads and 120+ seconds for writes (to exhaust the SLC cache). Enterprise testing runs for 30+ minutes.", values: "30s, 60s, 120s, 300s", category: "important" },
  { name: "Time Based", flag: "--time_based", desc: "Keep running for the full runtime even if the test file/device is exhausted.", why: "Without this, fio might finish early if 'size' worth of I/O completes before runtime expires. With time_based, fio loops and keeps going until the clock runs out.", values: "flag (no value)", category: "important" },
  { name: "Size", flag: "--size=", desc: "Total amount of I/O to generate, or the size of the test file.", why: "For raw device testing, this limits how much of the device fio accesses. Using size=100% means fio can access the entire device (all LBAs). Using size=1g means fio only writes to the first 1GB — the SSD's SLC cache can absorb that easily, giving unrealistically high numbers.", values: "1g, 10g, 100g, 100%", gotcha: "Testing with size=1g on a 1TB drive only touches 0.1% of the NAND. The SLC cache handles it all — you'll never see real TLC performance.", category: "important" },
  { name: "Group Reporting", flag: "--group_reporting", desc: "Aggregate statistics across all numjobs into one summary.", why: "Without this, fio prints separate stats for each job. With 16 jobs, that's 16 blocks of output. group_reporting gives you one clean summary with total IOPS and bandwidth.", values: "flag (no value)", category: "output" },
  { name: "Ramp Time", flag: "--ramp_time=", desc: "Warmup period — I/O runs but stats aren't collected.", why: "When a drive is idle, the first few seconds of I/O may show irregular performance: the controller is waking up, caches are filling, GC might kick in. Ramp time lets the drive reach steady state before you start measuring. Enterprise benchmarks use 30-60s ramp time.", values: "5s, 10s, 30s", category: "advanced" },
  { name: "Norandommap", flag: "--norandommap", desc: "Don't track which blocks were accessed during random I/O.", why: "By default, fio ensures every block is accessed exactly once during random I/O (using a bitmap). For large devices, this bitmap uses significant memory. norandommap uses true random addressing — some blocks might be hit multiple times, some never. For benchmarking, this is fine and uses less memory.", values: "flag (no value)", category: "advanced" },
  { name: "RW Mix Read", flag: "--rwmixread=", desc: "Percentage of reads in a mixed (randrw) workload.", why: "Real applications aren't pure reads or pure writes — they're mixed. A typical database is 70-80% reads, 20-30% writes. Email servers might be 50/50. Testing with the right mix reveals how the SSD handles concurrent read/write operations, which stresses the controller more than pure workloads.", values: "70, 50, 30", category: "advanced" },
  { name: "IO Depth Batch", flag: "--iodepth_batch=", desc: "Submit this many I/Os at once before waiting for completions.", why: "Instead of submitting one I/O and immediately checking for completions, batch submission lets you amortize the system call overhead. Submit 16 at once, then check for completions — more efficient for io_uring and libaio.", values: "8, 16, 32", category: "advanced" },
  { name: "IO Depth Batch Complete", flag: "--iodepth_batch_complete_min=", desc: "Wait for at least this many completions before submitting more.", why: "Controls the balance between submission and completion. Setting this to 1 means 'submit a new batch as soon as any I/O completes.' Setting it higher means 'wait for more completions before submitting' — reducing CPU overhead but potentially leaving the SSD idle briefly.", values: "1, 8, 16", category: "advanced" },
  { name: "Verify", flag: "--verify=", desc: "Data integrity verification — writes patterns, reads back, and verifies.", why: "Detects silent data corruption. fio writes known patterns (checksummed), then reads them back and verifies the checksum matches. If the SSD corrupts data silently (no error status, but wrong data), this catches it. Essential for qualifying new SSDs or testing after firmware updates.", values: "md5, crc32c, sha256, pattern", category: "verification" },
  { name: "Latency Target", flag: "--latency_target=", desc: "Target latency in microseconds. fio automatically adjusts queue depth.", why: "Instead of 'what's the max IOPS at QD128?', this answers 'what's the max IOPS while keeping latency under 500μs?' This is how real SLAs work — you care about both throughput AND latency. fio starts at high QD and backs off until latency meets the target.", values: "500, 1000, 5000", category: "advanced" },
  { name: "Fsync Interval", flag: "--fsync=", desc: "Call fsync() every N writes. Forces buffered writes to be flushed to the physical device.", why: "Without fsync, writes may sit in the OS buffer cache or the SSD's volatile write cache. Databases use fsync to guarantee durability — 'if I get an fsync success, this data survived a power loss.' SSDs with capacitor-backed caches can acknowledge fsync instantly; cheaper SSDs must actually write to NAND first.", values: "1, 8, 32, 128", gotcha: "fsync=1 means every single write is flushed — extremely slow but maximum durability. This is what databases like PostgreSQL do for WAL writes.", category: "advanced" },
  { name: "Sync I/O", flag: "--sync=", desc: "Open file with O_SYNC flag, making every single write synchronous.", why: "O_SYNC is like calling fsync after every write — the kernel won't return from write() until data is on stable storage. Very slow but maximum durability. This is how some embedded systems ensure crash safety without relying on application-level fsync calls.", values: "0 (default), 1 (sync)", gotcha: "This makes EVERY write synchronous, not just every Nth write. Expect QD=1-like performance regardless of iodepth setting.", category: "advanced" },
  { name: "End Fsync", flag: "--end_fsync=", desc: "Call fsync() once at the end of the test.", why: "Useful for measuring 'how long does it take for the SSD to flush its caches after a burst of writes?' Without end_fsync, writes may still be in the SSD's volatile cache when fio reports completion. The delta between runtime with and without end_fsync shows how much data was cached.", values: "0 (default), 1 (enabled)", category: "advanced" },
];

const PRESETS = [
  {
    name: "4K Random Read (IOPS)",
    desc: "Standard IOPS benchmark. High queue depth to saturate the SSD. This is the headline number on SSD spec sheets.",
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
    desc: "Write IOPS. Run for 120s+ to exhaust the SLC cache and see true TLC/QLC write speed.",
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
    name: "128K Sequential Read (BW)",
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
    desc: "Measures raw device latency — one I/O at a time. No parallelism. This is the 'speed of light' for the SSD.",
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
    desc: "Writes data patterns, reads back and verifies checksums. Catches silent corruption.",
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
          Benchmarking with fio &mdash; Measuring Your SSD
        </h3>
        <AnalogyCard concept="fio Is a Storage Stress-Tester" analogy="fio (Flexible I/O tester) is like a gym workout program for your SSD. You specify the exercise (random reads, sequential writes, mixed), the intensity (queue depth, number of jobs), and the duration. fio runs the workout and reports how the SSD performed — IOPS, bandwidth, and latency percentiles." />
        <TermDefinition term="fio (Flexible I/O Tester)" definition="The industry-standard open-source tool for benchmarking and stress-testing storage devices. Supports custom workload definitions: I/O pattern, block size, queue depth, thread count, and duration. Results include IOPS, bandwidth, and latency histograms." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We&apos;ve set up a filesystem and mounted our NVMe drive. Now the
          question: <em className="text-text-primary">how fast is it actually?</em>{" "}
          SSD manufacturers advertise speeds like &ldquo;7,000 MB/s read,&rdquo; but
          those numbers only tell part of the story. Real-world performance depends
          on the I/O pattern: random vs sequential, read vs write, block size,
          and how many requests are in flight simultaneously.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why can&apos;t you just copy a large file
          and time it?</em> Because file copies are sequential reads and writes through
          the filesystem — they only test one dimension of SSD performance. A database
          server doing 10,000 random 4K reads per second has completely different needs
          than a video editor streaming 2 GB/s sequentially.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <strong className="text-text-primary">fio</strong> (Flexible I/O Tester)
          is the industry-standard tool for answering these questions. It lets you
          simulate any workload pattern and measures three critical metrics:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li><strong className="text-text-primary">IOPS</strong> — I/O Operations Per Second. How many individual read/write operations per second. The key metric for small random I/O (like database workloads).</li>
          <li><strong className="text-text-primary">Bandwidth (BW)</strong> — MB/s or GB/s. How fast data flows. The key metric for large sequential I/O (like video streaming or file copies).</li>
          <li><strong className="text-text-primary">Latency</strong> — How long each operation takes. <em className="text-text-primary">Why does the 99th percentile matter more than the average?</em> Because if your average latency is 100μs but the p99 is 10ms, one in every 100 requests is 100x slower — and that one slow request can stall your entire application pipeline.</li>
        </ul>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But wait — IOPS and bandwidth are related,
          right?</em> Yes! IOPS × block_size = bandwidth. If you do 1,000,000 IOPS at
          4K, that&apos;s 4 GB/s bandwidth. If you do 50,000 IOPS at 128K, that&apos;s
          6.4 GB/s. The SSD has a maximum for both — it can&apos;t exceed its IOPS limit
          OR its bandwidth limit, whichever it hits first.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          fio works by running &ldquo;jobs&rdquo; — you tell it what I/O pattern to
          generate, and it hammers the drive while collecting detailed statistics.
          Let&apos;s explore the presets first, then dive into what each parameter does.
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

        {/* SLC Cache + Steady State explanation */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-primary font-semibold text-sm mb-3">
            The SLC Cache Trap &mdash; Why Short Benchmarks Lie
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Why does my SSD benchmark show 5 GB/s
            for the first 30 seconds, then drop to 1.5 GB/s?</em> Because most consumer
            SSDs have an <strong className="text-text-primary">SLC cache</strong> — a
            portion of the TLC/QLC NAND that temporarily operates in faster SLC mode
            (1 bit per cell instead of 3-4). Writes go to this fast cache first.
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">But the SLC cache has a finite size</em>{" "}
            (typically 10-100 GB depending on the drive and how full it is). Once it
            fills up, writes fall back to direct TLC/QLC programming — which is 2-5x
            slower. Short benchmarks only measure cache speed. To see real sustained
            performance, you need to:
          </p>
          <div className="space-y-1.5 text-text-secondary text-xs mb-3">
            <div className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0">1.</span>
              <span>Run writes for <strong>120+ seconds</strong> to exhaust the SLC cache</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0">2.</span>
              <span>Use <strong>ramp_time=30s</strong> to skip the cache burst phase</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0">3.</span>
              <span>Use <strong>size=100%</strong> to access the full drive (not just the first GB)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-blue flex-shrink-0">4.</span>
              <span>Pre-fill the drive with data before testing (so the SLC cache is already busy)</span>
            </div>
          </div>
          <p className="text-text-muted text-[10px] italic">
            Enterprise SSDs with large over-provisioning have bigger SLC caches and more
            consistent performance. But even they have limits — steady-state testing is the
            only way to know the real sustained performance.
          </p>
        </div>

        {/* Jobfiles */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Jobfiles &mdash; Reusable Test Configurations
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            Instead of passing everything on the command line, fio can read a{" "}
            <code className="text-text-code">.fio</code> jobfile &mdash; an INI-style config file that
            defines one or more jobs. This is cleaner for complex tests and lets you save configurations
            for reproducible benchmarking.
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            A jobfile has a <code className="text-text-code">[global]</code> section that sets defaults,
            and each <code className="text-text-code">[job-name]</code> section can override any global
            setting. This lets you run <em className="text-text-primary">mixed workloads</em> &mdash;
            e.g., 70% read + 30% write simultaneously &mdash; in a single test run.
          </p>
          <pre className="text-xs bg-story-dark rounded-xl p-5 overflow-x-auto font-mono text-white/90 mb-4 whitespace-pre">
{`[global]
ioengine=io_uring
direct=1
runtime=60s
time_based
filename=/dev/nvme0n1
group_reporting

[seq-read]
rw=read
bs=128k
iodepth=32
numjobs=1

[rand-write]
rw=randwrite
bs=4k
iodepth=64
numjobs=2`}
          </pre>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex items-start gap-2">
              <span className="text-nvme-green font-mono font-bold flex-shrink-0">[global]</span>
              <span>Sets defaults for all jobs &mdash; engine, direct I/O, runtime, target device</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-blue font-mono font-bold flex-shrink-0">[seq-read]</span>
              <span>Sequential read job with 128K blocks &mdash; measures bandwidth</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-amber font-mono font-bold flex-shrink-0">[rand-write]</span>
              <span>Random write job with 4K blocks using 2 threads &mdash; measures IOPS</span>
            </div>
          </div>
          <p className="text-text-muted text-[10px] mt-3 italic">
            Run with: <code className="text-text-code">fio mytest.fio</code> &mdash; both jobs run
            simultaneously, simulating a realistic mixed workload where reads and writes compete for
            SSD resources.
          </p>
        </div>

        {/* Sync/Async and fsync */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Synchronous vs Asynchronous I/O &mdash; And Why It Matters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-amber font-mono font-bold text-xs mb-2">
                Synchronous I/O
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                One request at a time. The application sends a read/write and <strong className="text-text-primary">waits
                (blocks)</strong> until it completes before sending the next one. Like ordering food and standing
                at the counter until it&apos;s ready. Simple but slow &mdash; the SSD is idle while the app
                processes results.
              </p>
              <code className="text-text-code text-[10px] font-mono">--ioengine=sync</code>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                Asynchronous I/O
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                Submit multiple requests without waiting. The application fires off many reads/writes and
                collects completions later. Like ordering from multiple counters simultaneously. The
                SSD&apos;s <strong className="text-text-primary">multiple NAND channels stay busy</strong>.
              </p>
              <code className="text-text-code text-[10px] font-mono">--ioengine=io_uring</code>
              <span className="text-text-muted text-[10px]"> or </span>
              <code className="text-text-code text-[10px] font-mono">libaio</code>
            </div>
          </div>

          <div className="bg-nvme-violet/5 rounded-xl p-3 border border-nvme-violet/20 mb-4">
            <p className="text-text-secondary text-xs leading-relaxed">
              <strong className="text-nvme-violet">Connection to NVMe queues:</strong> Remember from
              Lesson 6 &mdash; NVMe has deep queues (64K entries). Synchronous I/O can only use QD=1. To
              leverage NVMe&apos;s parallelism, you <em className="text-text-primary">must</em> use async I/O.
            </p>
          </div>

          <div className="text-text-primary font-semibold text-sm mb-3">
            fsync &mdash; Guaranteeing Data Reaches NAND
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            When an application writes data, it may sit in the OS buffer cache or the SSD&apos;s volatile
            write cache. <code className="text-text-code">fsync()</code> forces all buffered writes to be
            flushed to stable storage. Databases use fsync to guarantee durability &mdash; &ldquo;if I get
            an fsync success, this data survived a power loss.&rdquo;
          </p>
          <div className="space-y-2 mb-4">
            {[
              { flag: "--fsync=N", desc: "Call fsync() every N writes. Balances durability vs performance. Databases typically use fsync=1 for WAL (Write-Ahead Log) writes." },
              { flag: "--fdatasync=N", desc: "Like fsync but only syncs file data, not metadata (slightly faster). Skips updating timestamps and file size." },
              { flag: "--sync=1", desc: "Opens the file with O_SYNC flag, making every single write synchronous. As if fsync is called after each write. Very slow but maximum durability." },
              { flag: "--end_fsync=1", desc: "Call fsync once at the end of the test. Measures how long the SSD takes to flush its caches after a write burst." },
            ].map((item) => (
              <div key={item.flag} className="bg-story-surface rounded-lg p-3 flex items-start gap-3">
                <code className="text-nvme-blue font-mono text-[11px] font-bold flex-shrink-0 mt-0.5">
                  {item.flag}
                </code>
                <p className="text-text-muted text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-nvme-amber/5 rounded-xl p-3 border border-nvme-amber/20">
            <div className="text-nvme-amber text-xs font-bold mb-1">Why this matters for real workloads</div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              When a database does <code className="text-text-code">INSERT</code> +{" "}
              <code className="text-text-code">fsync</code>, the database isn&apos;t done until fsync returns.
              The SSD must flush its volatile cache to NAND. SSDs with <strong className="text-text-primary">
              capacitor-backed caches</strong> can acknowledge fsync instantly (data is safe even on power loss).
              Cheaper SSDs without capacitors must actually write to NAND first &mdash; much slower.
            </p>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Common fio Mistakes &mdash; And Why They Give Wrong Results
          </div>
          <div className="space-y-3">
            {[
              { mistake: "Forgetting --direct=1", result: "You measure RAM speed (10+ GB/s reads), not SSD speed", fix: "Always use --direct=1 for raw device testing" },
              { mistake: "Using sync engine with high iodepth", result: "iodepth is silently capped to 1 — you measure QD1 latency, not throughput", fix: "Use --ioengine=io_uring (or libaio) for async I/O" },
              { mistake: "Testing only 1GB on a 1TB drive", result: "SLC cache absorbs everything — writes appear 3-5x faster than sustained", fix: "Use --size=100% or pre-fill the drive before testing" },
              { mistake: "5-second runtime for write test", result: "You only see SLC cache speed, not steady-state TLC/QLC performance", fix: "Use --runtime=120s or longer, with --ramp_time=10s" },
              { mistake: "Single thread, low queue depth", result: "SSD sits mostly idle — only one NAND chip busy at a time", fix: "Use --numjobs=4 --iodepth=32 for realistic multi-queue load" },
              { mistake: "Testing on a filesystem, not raw device", result: "Filesystem overhead (journaling, metadata) adds latency and reduces throughput", fix: "Test raw /dev/nvme0n1 for pure SSD performance" },
            ].map((item) => (
              <div key={item.mistake} className="bg-story-surface rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="text-nvme-red text-xs flex-shrink-0 mt-0.5">✗</span>
                  <div>
                    <span className="text-text-primary text-xs font-semibold">{item.mistake}</span>
                    <p className="text-text-muted text-[10px] mt-0.5">Result: {item.result}</p>
                    <p className="text-nvme-green text-[10px] mt-0.5">Fix: {item.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Option reference */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-text-muted text-xs font-mono uppercase tracking-wider">
              fio Option Reference — with explanations
            </div>
            <button
              onClick={() => setShowAllOptions(!showAllOptions)}
              className="text-xs text-nvme-blue hover:underline font-mono"
            >
              {showAllOptions ? "Filter by category" : "Show all options"}
            </button>
          </div>

          {/* Category tabs */}
          {!showAllOptions && (
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
          )}

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
                      <p className="text-text-secondary text-xs mt-0.5">{opt.desc}</p>
                      <p className="text-nvme-violet text-[10px] mt-1 italic">{opt.why}</p>
                      {opt.gotcha && (
                        <p className="text-nvme-amber text-[10px] mt-1">
                          <strong>Watch out:</strong> {opt.gotcha}
                        </p>
                      )}
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
            Reading fio Output &mdash; What Each Number Means
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            fio&apos;s output looks intimidating, but once you know what each line means,
            it tells you everything about your SSD&apos;s behavior:
          </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green font-mono font-bold">IOPS=985k</span>
              <p className="text-text-muted mt-1">
                985,000 I/O operations per second. This is the headline number for
                random 4K benchmarks. <em>How to know if this is good?</em> Consumer
                NVMe SSDs typically reach 500K-1M IOPS; enterprise drives can exceed 2M.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green font-mono font-bold">BW=3847MiB/s</span>
              <p className="text-text-muted mt-1">
                3.85 GB/s bandwidth. The headline number for sequential benchmarks.
                PCIe 4.0 x4 theoretical max is ~7 GB/s. PCIe 3.0 x4 caps at ~3.5 GB/s.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">slat (submission latency)</span>
              <p className="text-text-muted mt-1">
                Time from fio calling the kernel to the request being submitted.
                Measured in nanoseconds. Should be very low (~1-2μs). If high,
                there&apos;s overhead in the I/O path (filesystem, scheduler).
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">clat (completion latency)</span>
              <p className="text-text-muted mt-1">
                Time from submission to the device completing the I/O. <em>This is the
                most important latency number</em> — it measures actual SSD response time.
                For 4K reads: &lt;100μs is excellent, 100-200μs is good, &gt;500μs needs investigation.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-violet font-mono font-bold">lat (total latency)</span>
              <p className="text-text-muted mt-1">
                slat + clat = total end-to-end latency from fio&apos;s perspective.
                In most cases, lat ≈ clat because slat is tiny.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-amber font-mono font-bold">p99 / p99.9 / p99.99</span>
              <p className="text-text-muted mt-1">
                Tail latency percentiles. <em>p99=293μs means 99% of requests completed
                in under 293μs.</em> The remaining 1% were slower. Look at p99.9 and p99.99
                for the worst outliers — these are often GC stalls or thermal throttling.
              </p>
            </div>
          </div>
          <p className="text-text-muted text-[10px] italic">
            <em>Why does stdev (standard deviation) matter?</em> Low stdev means consistent
            performance — every I/O takes about the same time. High stdev means some I/Os are
            much slower than average, indicating inconsistency (GC, thermal throttling, or
            contention).
          </p>
        </div>

        {/* Steady state explanation */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Burst vs Steady State &mdash; Two Very Different Numbers
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">If you run two fio tests on the same
            drive and get wildly different results, what went wrong?</em> Probably
            nothing — you measured two different things:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                Burst Performance
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                Fresh drive, SLC cache not full, GC not active. This is what
                spec sheets advertise. Typically 2-5x higher than steady state
                for write workloads.
              </p>
              <p className="text-text-muted text-[10px] italic">
                Relevant for: boot times, app launches, short file transfers
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-amber font-mono font-bold text-xs mb-2">
                Steady State Performance
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                Drive is mostly full, SLC cache exhausted, GC running continuously.
                This is real-world performance under sustained load. The only
                number that matters for servers and databases.
              </p>
              <p className="text-text-muted text-[10px] italic">
                Relevant for: databases, servers, video editing, VM hosts
              </p>
            </div>
          </div>
        </div>

        <InfoCard variant="warning" title="CAUTION: fio on raw devices destroys data">
          Using <code className="text-text-code">--filename=/dev/nvme0n1</code> writes
          directly to the block device, overwriting ALL data — filesystem, partitions,
          everything. <em>Always double-check the device name with{" "}
          <code className="text-text-code">lsblk</code> before running fio.</em> For
          safe testing, use a file path (<code className="text-text-code">--filename=/tmp/fio.dat</code>)
          instead — slightly less accurate but won&apos;t destroy your data.
        </InfoCard>

        <KnowledgeCheck
          id="act5-fio-kc1"
          question="Which fio parameter controls queue depth?"
          options={["--iodepth", "--bs"]}
          correctIndex={0}
          explanation="--iodepth sets how many I/O operations fio keeps in-flight simultaneously (queue depth). --bs sets the block size (e.g., 4k, 128k) for each I/O operation."
        />
      </div>
    </SectionWrapper>
  );
}
