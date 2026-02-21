"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import TerminalBlock from "@/components/story/TerminalBlock";
import CodeBlock from "@/components/story/CodeBlock";
import InfoCard from "@/components/story/InfoCard";

export default function Tracing() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          ftrace NVMe Tracing &mdash; Watching Commands in Real Time
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We&apos;ve learned how NVMe commands work: the host writes a 64-byte
          Submission Queue Entry, rings a doorbell, the drive processes it, and
          posts a Completion Queue Entry. But when something goes wrong — a command
          takes too long, an error appears, performance drops — <em className="text-text-primary">
          how do you actually see what&apos;s happening?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">You trace it.</em> Linux has a built-in
          tracing framework called <strong className="text-text-primary">ftrace</strong>{" "}
          (short for &ldquo;function tracer&rdquo;). It can record events inside the
          kernel — including every NVMe command that&apos;s submitted and completed.
          Think of it as a security camera for the I/O path: you can see exactly what
          commands were sent, when, to which queue, and whether they succeeded.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why not just use application-level logging?</em>{" "}
          Because application logs only show what the app <em>asked</em> for. They don&apos;t
          show what the kernel actually <em>did</em>. A single application write() call
          might be split into multiple NVMe commands, reordered by the I/O scheduler, or
          delayed by write-back caching. ftrace shows the ground truth — what actually
          hit the hardware.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">How does ftrace work internally?</em> The
          Linux kernel has tracepoints — pre-defined instrumentation hooks in the source
          code. When you enable a tracepoint, the kernel writes a record to a ring buffer
          every time that code path executes. Reading the trace pipe gives you a real-time
          stream of these records, timestamped to microsecond precision.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why is this useful?</em>
        </p>
        <ul className="text-text-secondary mb-8 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            <strong className="text-text-primary">Debugging</strong> — see exactly which
            command failed and its error status
          </li>
          <li>
            <strong className="text-text-primary">Performance analysis</strong> — measure
            the time between setup and completion to find slow commands
          </li>
          <li>
            <strong className="text-text-primary">Verification</strong> — confirm that
            your application is sending the commands you expect (right opcode, right LBA,
            right queue)
          </li>
          <li>
            <strong className="text-text-primary">Learning</strong> — watch real NVMe
            traffic to understand how the kernel driver translates filesystem operations
            into NVMe commands
          </li>
        </ul>

        {/* ─── NVMe Trace Events ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            NVMe Trace Events — Command Lifecycle
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            The NVMe driver exposes two trace events. Together, they give you the
            complete lifecycle of every command:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-1">
                nvme_setup_cmd
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Fires when a command is <em>submitted</em> — the SQE is placed into
                the submission queue. The kernel decodes the command and logs it with
                human-readable field names (not raw CDW hex values). For a read command,
                you&apos;ll see the starting LBA, number of blocks, and control flags.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">
                nvme_complete_rq
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Fires when the drive&apos;s response arrives — the CQE is processed.
                Shows the status code (success or error), command result, retries, and
                flags. The time between setup and complete is the command&apos;s latency.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Block Layer Trace Events ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Block Layer Trace Events — The I/O Pipeline Above NVMe
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            <em className="text-text-primary">But NVMe events only show what hits the
            drive. What about everything that happens before that?</em> A write() system
            call goes through the filesystem, the block layer (I/O scheduler, merging,
            reordering), and then finally the NVMe driver. The block layer has its own
            trace events that show the I/O pipeline:
          </p>
          <div className="space-y-2">
            {[
              { event: "block_bio_queue", desc: "A BIO (block I/O) is queued by the filesystem. This is where a filesystem write becomes a block device request.", why: "Shows the raw I/O requests before the scheduler touches them. One application write might create multiple BIOs." },
              { event: "block_rq_issue", desc: "A request is issued to the device driver. At this point, the I/O scheduler has decided this request should be sent to the hardware now.", why: "The moment the kernel decides to actually send I/O to the SSD. The gap between bio_queue and rq_issue is time spent in the I/O scheduler." },
              { event: "block_rq_complete", desc: "The device driver reports that the request is complete. The drive finished the I/O.", why: "The time between rq_issue and rq_complete is the actual device latency — how long the SSD took to process the command." },
              { event: "block_rq_merge", desc: "Two adjacent requests are merged into one. The scheduler detected sequential I/O and combined them.", why: "Merging is good for throughput — sending one 128K request is more efficient than thirty-two 4K requests. This shows the scheduler optimizing your I/O." },
              { event: "block_rq_requeue", desc: "A request that was issued is put back in the queue (e.g., the device was busy).", why: "If you see many requeues, the device might be overwhelmed or experiencing errors that trigger retries." },
            ].map((e) => (
              <div key={e.event} className="bg-story-surface rounded-xl p-3">
                <div className="text-nvme-violet font-mono font-bold text-xs mb-1">{e.event}</div>
                <p className="text-text-muted text-xs leading-relaxed mb-1">{e.desc}</p>
                <p className="text-nvme-blue text-[10px] italic">{e.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Enable Tracing ─── */}
        <div className="space-y-4 mb-6">
          <CodeBlock
            title="Enable NVMe tracing"
            language="bash"
            code={`# Enable NVMe driver trace events
echo 1 > /sys/kernel/debug/tracing/events/nvme/nvme_setup_cmd/enable
echo 1 > /sys/kernel/debug/tracing/events/nvme/nvme_complete_rq/enable

# Read the trace (streams in real time — Ctrl+C to stop)
cat /sys/kernel/debug/tracing/trace_pipe`}
          />

          <CodeBlock
            title="Enable block layer trace events (separate from NVMe events)"
            language="bash"
            code={`# Enable block layer events — these fire for ALL block devices
echo 1 > /sys/kernel/debug/tracing/events/block/block_bio_queue/enable
echo 1 > /sys/kernel/debug/tracing/events/block/block_rq_issue/enable
echo 1 > /sys/kernel/debug/tracing/events/block/block_rq_complete/enable

# Or enable ALL block events at once
echo 1 > /sys/kernel/debug/tracing/events/block/enable

# Filter to only your NVMe device (optional — reduces noise)
echo 'common_pid > 0' > /sys/kernel/debug/tracing/events/block/filter

# Read the combined trace (NVMe + block events interleaved by timestamp)
cat /sys/kernel/debug/tracing/trace_pipe`}
          />

          <CodeBlock
            title="Enable both NVMe + block events together"
            language="bash"
            code={`# One-liner to enable everything and start tracing
cd /sys/kernel/debug/tracing
echo 0 > tracing_on                     # pause tracing
echo > trace                             # clear buffer
echo 1 > events/nvme/enable             # all nvme events
echo 1 > events/block/block_rq_issue/enable
echo 1 > events/block/block_rq_complete/enable
echo 1 > tracing_on                     # start tracing
cat trace_pipe                           # stream output`}
          />
        </div>

        {/* ─── Real NVMe Trace Output ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            Real NVMe Trace Output
          </h4>
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">The kernel decodes NVMe commands into
            human-readable fields.</em> Here&apos;s what the output actually looks like
            for a 4K read at LBA 0 (8 sectors):
          </p>

          <TerminalBlock
            title="nvme trace output — 4K read command"
            lines={[
              "# tracer: nop",
              "#                                _-----=> irqs-off/BH-disabled",
              "#                               / _----=> need-resched",
              "#                              | / _---=> hardirq/softirq",
              "#                              || / _--=> preempt-depth",
              "#                              ||| / _-=> migrate-disable",
              "#                              |||| /     delay",
              "#           TASK-PID     CPU#  |||||  TIMESTAMP  FUNCTION",
              "#              | |         |   |||||     |         |",
              "  fio-18234   [003] d..1. 284731.205: nvme_setup_cmd: nvme0n1: io_cmd_read slba=0, len=7, ctrl=0x0, dsmgmt=0, reftag=0",
              "  fio-18234   [003] d..1. 284731.312: nvme_complete_rq: nvme0n1: cmdid=0, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />

          <p className="text-text-secondary text-xs mt-3 mb-4 leading-relaxed max-w-3xl">
            <em className="text-text-primary">Note:</em> The kernel decodes{" "}
            <code className="text-text-code">opcode 0x02</code> into{" "}
            <code className="text-text-code">io_cmd_read</code> and shows the command
            fields by name. <code className="text-text-code">slba=0</code> is the
            starting LBA, <code className="text-text-code">len=7</code> means 8 blocks
            (0-indexed, so len=7 means 8). For writes you&apos;ll see{" "}
            <code className="text-text-code">io_cmd_write</code> with the same fields.
          </p>

          <TerminalBlock
            title="nvme trace output — write command"
            lines={[
              "  fio-18234   [005] d..1. 284731.450: nvme_setup_cmd: nvme0n1: io_cmd_write slba=4096, len=255, ctrl=0x0, dsmgmt=0, reftag=0",
              "  fio-18234   [005] d..1. 284731.823: nvme_complete_rq: nvme0n1: cmdid=1, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />

          <TerminalBlock
            title="nvme trace output — admin identify command"
            lines={[
              "  nvme-19001  [000] d..1. 284735.112: nvme_setup_cmd: nvme0: admin_cmd_identify cns=1, ctrlid=0, nsid=0",
              "  nvme-19001  [000] d..1. 284735.245: nvme_complete_rq: nvme0: cmdid=5, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />
        </div>

        {/* ─── Block Layer Trace Output ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            Block Layer Trace Output
          </h4>
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">Block layer events use a different
            format</em> — they show the device, sector number, size, and operation type:
          </p>

          <TerminalBlock
            title="block layer trace output"
            lines={[
              "  fio-18234   [003] d..1. 284731.190: block_rq_issue: 259,0 R 4096 0 + 8 [fio]",
              "  fio-18234   [003] d..1. 284731.312: block_rq_complete: 259,0 R () 0 + 8 [0]",
              "  fio-18234   [005] d..1. 284731.440: block_rq_issue: 259,0 W 4096 32768 + 256 [fio]",
              "  fio-18234   [005] d..1. 284731.823: block_rq_complete: 259,0 W () 32768 + 256 [0]",
            ]}
          />
        </div>

        {/* ─── Trace Line Anatomy ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Trace Line Anatomy — NVMe Events
          </div>
          <div className="font-mono text-[10px] text-text-code overflow-x-auto mb-4">
            <span className="text-nvme-amber">fio-18234</span>{" "}
            <span className="text-text-muted">[003]</span>{" "}
            <span className="text-text-muted">d..1.</span>{" "}
            <span className="text-nvme-violet">284731.205</span>:{" "}
            <span className="text-nvme-green">nvme_setup_cmd</span>:{" "}
            <span className="text-text-primary">nvme0n1</span>:{" "}
            <span className="text-nvme-blue">io_cmd_read</span>{" "}
            <span className="text-text-secondary">slba=0, len=7, ctrl=0x0</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-amber font-mono font-bold">fio-18234</span>
              <p className="text-text-muted mt-1">
                The process name and PID that issued the command. Here, the{" "}
                <code className="text-text-code">fio</code> benchmarking tool, process
                ID 18234.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-muted font-mono font-bold">[003]</span>
              <p className="text-text-muted mt-1">
                Which CPU core handled this. Useful for spotting unbalanced I/O
                across cores. <em>Ideally, I/O should spread across all cores.</em>
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-muted font-mono font-bold">d..1.</span>
              <p className="text-text-muted mt-1">
                Flags: d = interrupts disabled, . = not in need-resched, . = not in
                hardirq, 1 = preempt depth 1, . = not migration-disabled. Mostly
                useful for kernel developers debugging scheduling issues.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-violet font-mono font-bold">284731.205</span>
              <p className="text-text-muted mt-1">
                Timestamp in seconds since boot (with microsecond precision). The
                difference between setup and complete timestamps gives you the
                command latency.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green font-mono font-bold">nvme_setup_cmd</span>
              <p className="text-text-muted mt-1">
                Event type: setup_cmd = command submitted to the queue,
                complete_rq = response received from the drive.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">io_cmd_read</span>
              <p className="text-text-muted mt-1">
                The decoded command name. The kernel translates the opcode into a
                human-readable name: io_cmd_read (0x02), io_cmd_write (0x01),
                io_cmd_flush (0x00), admin_cmd_identify, etc.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Block Layer Trace Anatomy ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Trace Line Anatomy — Block Layer Events
          </div>
          <div className="font-mono text-[10px] text-text-code overflow-x-auto mb-4">
            <span className="text-nvme-amber">fio-18234</span>{" "}
            <span className="text-text-muted">[003]</span>{" "}
            <span className="text-text-muted">d..1.</span>{" "}
            <span className="text-nvme-violet">284731.190</span>:{" "}
            <span className="text-nvme-green">block_rq_issue</span>:{" "}
            <span className="text-text-primary">259,0</span>{" "}
            <span className="text-nvme-blue">R</span>{" "}
            <span className="text-text-secondary">4096 0 + 8 [fio]</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-primary font-mono font-bold">259,0</span>
              <p className="text-text-muted mt-1">
                The block device major:minor number. 259 is the NVMe device class.
                Use <code className="text-text-code">lsblk</code> to map
                these numbers to device names.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">R / W / D</span>
              <p className="text-text-muted mt-1">
                Operation type: R = Read, W = Write, D = Discard (TRIM).
                Some kernels show additional flags like RS (read sync) or WS (write sync).
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-secondary font-mono font-bold">4096</span>
              <p className="text-text-muted mt-1">
                Request size in bytes. Here, 4096 = 4K. For sequential reads you might
                see larger sizes after the scheduler merges adjacent requests.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-secondary font-mono font-bold">0 + 8</span>
              <p className="text-text-muted mt-1">
                Sector address and count. Sector 0, 8 sectors (each sector = 512 bytes,
                so 8 × 512 = 4096 bytes). This matches the NVMe trace&apos;s slba=0, len=7
                (0-indexed).
              </p>
            </div>
          </div>
        </div>

        {/* ─── Measuring Latency ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Practical Example: Measuring Command Latency at Each Layer
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">With both block and NVMe events enabled,
            you can trace a single I/O through the entire stack:</em>
          </p>
          <div className="space-y-2 text-xs font-mono mb-4">
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-violet">block_rq_issue</span>
              <span className="text-text-secondary">284731.190</span>
              <span className="text-text-muted">Block layer sends to driver</span>
            </div>
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green">nvme_setup_cmd</span>
              <span className="text-text-secondary">284731.205</span>
              <span className="text-text-muted">Driver submits to SQ</span>
            </div>
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue">nvme_complete_rq</span>
              <span className="text-text-secondary">284731.312</span>
              <span className="text-text-muted">Drive completes, CQE posted</span>
            </div>
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-violet">block_rq_complete</span>
              <span className="text-text-secondary">284731.312</span>
              <span className="text-text-muted">Block layer marks complete</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-nvme-violet/5 rounded-lg p-3 border border-nvme-violet/20">
              <span className="text-nvme-violet font-bold">Driver overhead</span>
              <div className="text-text-muted text-[10px] mt-1">
                rq_issue → setup_cmd = <strong>15μs</strong>
              </div>
              <p className="text-text-muted text-[10px]">
                Time the NVMe driver spent preparing the SQE
              </p>
            </div>
            <div className="bg-nvme-green/5 rounded-lg p-3 border border-nvme-green/20">
              <span className="text-nvme-green font-bold">Device latency</span>
              <div className="text-text-muted text-[10px] mt-1">
                setup_cmd → complete_rq = <strong>107μs</strong>
              </div>
              <p className="text-text-muted text-[10px]">
                Time the SSD took to execute the command
              </p>
            </div>
            <div className="bg-nvme-blue/5 rounded-lg p-3 border border-nvme-blue/20">
              <span className="text-nvme-blue font-bold">Total I/O time</span>
              <div className="text-text-muted text-[10px] mt-1">
                rq_issue → rq_complete = <strong>122μs</strong>
              </div>
              <p className="text-text-muted text-[10px]">
                End-to-end from block layer&apos;s perspective
              </p>
            </div>
          </div>
          <p className="text-text-muted text-xs mt-4 leading-relaxed">
            <em className="text-text-primary">Why is this breakdown useful?</em> If
            total I/O latency is high but device latency is normal, the bottleneck is
            in the software stack (I/O scheduler, filesystem, or driver overhead). If
            device latency is high, the SSD itself is slow (GC, thermal throttling, or
            a firmware issue).
          </p>
        </div>

        {/* ─── Useful Commands ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Useful Tracing Recipes
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-text-primary text-xs font-semibold mb-1">
                Trace only writes (filter by command)
              </div>
              <CodeBlock
                title=""
                language="bash"
                code={`# Filter NVMe traces to only show write commands
echo 'flags & 1' > /sys/kernel/debug/tracing/events/nvme/nvme_setup_cmd/filter
# To remove filter:
echo 0 > /sys/kernel/debug/tracing/events/nvme/nvme_setup_cmd/filter`}
              />
            </div>
            <div>
              <div className="text-text-primary text-xs font-semibold mb-1">
                Save trace to file for analysis
              </div>
              <CodeBlock
                title=""
                language="bash"
                code={`# Capture 10 seconds of trace to a file
timeout 10 cat /sys/kernel/debug/tracing/trace_pipe > /tmp/nvme_trace.txt
# Then analyze: count commands by type, find slow completions, etc.
grep 'nvme_setup_cmd' /tmp/nvme_trace.txt | wc -l    # total commands
grep 'io_cmd_write' /tmp/nvme_trace.txt | wc -l       # write commands
grep 'status=0x4' /tmp/nvme_trace.txt                  # errors (status != 0)`}
              />
            </div>
            <div>
              <div className="text-text-primary text-xs font-semibold mb-1">
                Disable tracing when done (important!)
              </div>
              <CodeBlock
                title=""
                language="bash"
                code={`# Always disable when done — tracing has overhead
echo 0 > /sys/kernel/debug/tracing/events/nvme/enable
echo 0 > /sys/kernel/debug/tracing/events/block/enable
echo 0 > /sys/kernel/debug/tracing/tracing_on`}
              />
            </div>
          </div>
        </div>

        {/* ─── What You Can Learn ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            What You Can Learn from Traces
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { q: "Why is my app slow?", a: "Compare block_rq_issue to nvme_complete_rq timestamps. If device latency is normal but total I/O time is high, the bottleneck is in the kernel I/O path, not the SSD." },
              { q: "Is my filesystem sending TRIMs?", a: "Look for 'D' (discard) in block_rq_issue events, or admin_cmd_dsm in NVMe events. If absent, TRIM might not be enabled (check mount options for 'discard' or run fstrim)." },
              { q: "Which queue is busiest?", a: "NVMe events include qid. Count events per queue ID — ideally balanced across all I/O queues (one per CPU core). Imbalance means some cores are doing more I/O." },
              { q: "Are there errors?", a: "Look for nvme_complete_rq lines where status ≠ 0x0. Status codes: 0x0=success, 0x2=invalid field, 0x4=data transfer error, 0x5=aborted by power loss." },
              { q: "Is the I/O scheduler merging requests?", a: "Enable block_rq_merge events. Many merges mean your app is doing sequential I/O that the scheduler is combining. Few merges mean random I/O." },
              { q: "Is GC causing latency spikes?", a: "Look for write commands with suddenly higher completion times (>1ms when normal is <200μs). These spikes often correlate with foreground garbage collection." },
            ].map((item) => (
              <div key={item.q} className="bg-story-surface rounded-lg p-3">
                <div className="text-text-primary font-semibold mb-1">{item.q}</div>
                <p className="text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <InfoCard variant="note" title="ftrace vs blktrace vs bpftrace">
          <em>ftrace</em> is built into the kernel — no installation needed, always
          available. <em>blktrace</em> is a dedicated block layer tracing tool with
          richer formatting but requires installation. <em>bpftrace</em> (eBPF-based)
          is the most powerful — you can write custom scripts that filter, aggregate,
          and compute histograms in kernel space. For quick debugging, ftrace is
          fastest to set up. For production monitoring, bpftrace is more flexible.{" "}
          <em className="text-text-primary">All three read from the same kernel
          tracepoints</em> — they just present the data differently.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
