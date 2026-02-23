"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import TerminalBlock from "@/components/story/TerminalBlock";
import CodeBlock from "@/components/story/CodeBlock";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import RevealCard from "@/components/story/RevealCard";

export default function Tracing() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          ftrace NVMe Tracing &mdash; Watching Commands in Real Time
        </h3>

        <AnalogyCard concept="Tracing Shows What's Really Happening" analogy="Tracing tools (ftrace, blktrace, perf) are like putting sensors on every step of the I/O path. They show exactly how long each layer takes, where bottlenecks occur, and which operations are being queued. Essential for diagnosing 'the SSD feels slow' problems — usually the bottleneck isn't the SSD itself." />
        <TermDefinition term="ftrace" definition="Linux's built-in function tracer. Can trace kernel functions related to NVMe and block I/O with nanosecond precision. Accessed via /sys/kernel/debug/tracing/ or the trace-cmd wrapper." />
        <TermDefinition term="blktrace" definition="A specialized Linux tool that records all block I/O events (queue, merge, issue, complete) for a specific device. Combined with blkparse, it shows the complete lifecycle of each I/O request through the block layer." />

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
          Linux kernel has tracepoints — pre-defined instrumentation hooks compiled into
          the source code. When you enable a tracepoint, the kernel writes a record to a
          ring buffer every time that code path executes. Reading the trace pipe gives you
          a stream of these records, timestamped to microsecond precision.
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
            <strong className="text-text-primary">Learning</strong> — watch NVMe
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
                the submission queue. Logs the opcode, queue ID, namespace, command ID,
                and all CDW fields (the command&apos;s raw parameters in hex).
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

        {/* ─── Block Layer Operation Flags ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Block Layer Operation Flags — What R, WS, DS Mean
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            <em className="text-text-primary">In block layer trace output, you&apos;ll
            see short letter codes for the operation type.</em> These are combinations
            of the base operation and modifier flags:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {[
              { flag: "R", meaning: "Read", desc: "A read request. The kernel is asking the device to return data from the given sector range." },
              { flag: "W", meaning: "Write", desc: "A write request. The kernel is sending data to the device to be stored at the given sector range." },
              { flag: "D", meaning: "Discard", desc: "A discard (TRIM) request. The kernel is telling the device that these sectors are no longer needed. Maps to the NVMe Dataset Management command." },
              { flag: "F", meaning: "Flush", desc: "A flush request. Forces the device to commit all cached data to persistent storage. Maps to the NVMe Flush command." },
              { flag: "N", meaning: "None", desc: "No operation. Usually a metadata-only or barrier request with no data transfer." },
            ].map((f) => (
              <div key={f.flag} className="bg-story-surface rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-nvme-green font-mono font-bold text-sm">{f.flag}</code>
                  <span className="text-text-primary text-xs font-semibold">{f.meaning}</span>
                </div>
                <p className="text-text-muted text-[10px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">But you&apos;ll often see two-letter codes
            like RS, WS, or DS. What does the S mean?</em> The second letter is a{" "}
            <strong className="text-text-primary">modifier flag</strong> that gets appended
            to the base operation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { flag: "S (Sync)", example: "RS, WS, DS", desc: "Synchronous — the request must be completed in order with other sync requests. Filesystem metadata writes are often sync to ensure consistency." },
              { flag: "M (Meta)", example: "RM, WM", desc: "Metadata — this I/O is for filesystem metadata (inodes, journal), not user data. Useful for distinguishing app I/O from filesystem overhead." },
              { flag: "A (Ahead)", example: "RA", desc: "Read-ahead — the kernel is speculatively reading data it thinks you'll need soon. Triggered by sequential access patterns." },
              { flag: "FUA (Force Unit Access)", example: "WFUA", desc: "Bypasses the drive's write cache. The data must be written to persistent NAND before the command completes. Maps to the FUA bit in the NVMe Write command." },
            ].map((f) => (
              <div key={f.flag} className="bg-story-surface rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-nvme-blue font-mono font-bold text-xs">{f.flag}</code>
                  <span className="text-text-muted text-[10px] font-mono">(e.g., {f.example})</span>
                </div>
                <p className="text-text-muted text-[10px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-[10px] mt-3 italic leading-relaxed">
            <em>So &ldquo;DS&rdquo; means a synchronous discard (TRIM) request, and
            &ldquo;RS&rdquo; means a synchronous read.</em> These flags tell you not
            just <em>what</em> the kernel is doing, but <em>how urgently</em> — sync
            requests can&apos;t be reordered, while async ones can be batched and
            optimized by the I/O scheduler.
          </p>
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

        {/* ─── NVMe Trace Output — Read ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            NVMe Trace Output
          </h4>
          <InfoCard variant="note" title="These are constructed examples">
            The trace output shown below is <em>not</em> captured from a live system.
            These examples are constructed based on the kernel&apos;s NVMe tracepoint
            format definition to illustrate what each field means. The structure and
            format are accurate — this is what you would see on a real system, but the
            specific timestamps, PIDs, and values are illustrative. You can paste them
            into the Trace Decoder tool below to decode the CDW fields.
          </InfoCard>

          <div className="mt-4" />

          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">Let&apos;s start with the most common
            command — a Read.</em> The NVMe tracepoint logs each command with its raw
            CDW (Command Dword) values in hex:
          </p>

          <TerminalBlock
            title="NVMe Read command (opcode 0x02)"
            lines={[
              "# tracer: nop",
              "#           TASK-PID     CPU#  |||||  TIMESTAMP  FUNCTION",
              "#              | |         |   |||||     |         |",
              "     fio-18234   [003] d..1.  2847.331205: nvme_setup_cmd: nvme0n1: qid=1, cmdid=0, nsid=1, cdw10=0x00000000, cdw11=0x00000000, cdw12=0x00000007, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x02",
              "     fio-18234   [003] d..1.  2847.331312: nvme_complete_rq: nvme0n1: qid=1, cmdid=0, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />

          <div className="bg-story-card rounded-2xl p-5 card-shadow mt-4 mb-6">
            <div className="text-text-primary font-semibold text-xs mb-3">
              Decoding the Read CDW fields — what do they mean?
            </div>
            <p className="text-text-secondary text-xs leading-relaxed mb-3">
              <em className="text-text-primary">For a Read command (opcode 0x02), the
              NVMe spec defines what each CDW field contains:</em>
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">opcode=0x02</code>
                <p className="text-text-muted mt-1">
                  This is an NVMe <strong>Read</strong> command.{" "}
                  <em>How do you know?</em> The NVMe spec assigns opcode 0x02 to Read.
                  Other I/O opcodes: 0x01 = Write, 0x00 = Flush, 0x09 = Dataset Management (TRIM).
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw10=0x00000000</code>
                <span className="text-text-muted ml-2">→ SLBA low 32 bits = 0</span>
                <p className="text-text-muted mt-1">
                  For Read/Write, CDW10 holds the <strong>lower 32 bits of the Starting
                  LBA (SLBA)</strong>. Here it&apos;s 0 — reading from the very beginning
                  of the namespace.{" "}
                  <em>Why split the LBA across two dwords?</em> Because an LBA can be
                  up to 64 bits (addressing up to 2^64 logical blocks), but each CDW is
                  only 32 bits. So the lower half goes in CDW10 and the upper half in CDW11.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw11=0x00000000</code>
                <span className="text-text-muted ml-2">→ SLBA high 32 bits = 0</span>
                <p className="text-text-muted mt-1">
                  Upper 32 bits of the SLBA. Combined with CDW10: full SLBA ={" "}
                  <code className="text-text-code">(CDW11 &lt;&lt; 32) | CDW10</code> = 0.{" "}
                  <em>For most consumer SSDs, LBAs fit in 32 bits</em> (up to ~2 billion
                  blocks = ~8 TB with 4K blocks), so CDW11 is usually 0.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw12=0x00000007</code>
                <span className="text-text-muted ml-2">→ NLB = 7 (means 8 blocks)</span>
                <p className="text-text-muted mt-1">
                  CDW12 bits [15:0] hold the <strong>Number of Logical Blocks (NLB)</strong>.
                  This is a <em>0-based value</em> — a value of 7 means &ldquo;read 8
                  blocks.&rdquo;{" "}
                  <em>Why 0-based?</em> So that 0 means &ldquo;1 block&rdquo; (the minimum),
                  and 0xFFFF means &ldquo;65,536 blocks&rdquo; (the maximum in a single command).
                  With 4K blocks, NLB=7 reads 8 × 4096 = 32,768 bytes (32 KB).
                </p>
                <p className="text-text-muted mt-2 text-[10px] italic">
                  CDW12 bits [31:16] contain flags: bit 30 = Force Unit Access (FUA), bit 31 =
                  Limited Retry (LR), bits [29:26] = Protection Info. Here they&apos;re
                  all 0 — no special flags.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw13, cdw14, cdw15 = 0</code>
                <p className="text-text-muted mt-1">
                  CDW13 = Dataset Management hints (e.g., sequential, random). CDW14 =
                  Expected Initial Logical Block Reference Tag (for protection info). CDW15 =
                  Expected Logical Block Application/Guard Tag. All zeros = no hints, no
                  protection info.{" "}
                  <em>Most basic reads leave CDW13-15 at zero.</em>
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">status=0x0</code>
                <span className="text-text-muted ml-2">(in the complete_rq line)</span>
                <p className="text-text-muted mt-1">
                  Status 0x0 = <strong>success</strong>. The drive read the data and
                  placed it in the host buffer. Common error statuses: 0x2 = Invalid
                  Field, 0x80 = LBA Out of Range, 0x81 = Capacity Exceeded.
                </p>
              </div>
            </div>
            <p className="text-text-muted text-[10px] italic mt-3 leading-relaxed">
              <em>Summary: this Read command reads 8 blocks (32 KB) starting at LBA 0
              from namespace 1, on I/O queue 1, with no special flags — and it
              succeeded.</em>
            </p>
          </div>

          {/* ─── Write Example ─── */}
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">Now a Write command.</em> The CDW layout
            for Write (opcode 0x01) is almost identical to Read:
          </p>

          <TerminalBlock
            title="NVMe Write command (opcode 0x01)"
            lines={[
              "     fio-18234   [005] d..1.  2847.331450: nvme_setup_cmd: nvme0n1: qid=2, cmdid=1, nsid=1, cdw10=0x00001000, cdw11=0x00000000, cdw12=0x400000ff, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x01",
              "     fio-18234   [005] d..1.  2847.331823: nvme_complete_rq: nvme0n1: qid=2, cmdid=1, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />

          <div className="bg-story-card rounded-2xl p-5 card-shadow mt-4 mb-6">
            <div className="text-text-primary font-semibold text-xs mb-3">
              Decoding the Write CDW fields
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">opcode=0x01</code>
                <span className="text-text-muted ml-2">→ Write</span>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw10=0x00001000</code>
                <span className="text-text-muted ml-2">→ SLBA low = 0x1000 = 4096</span>
                <p className="text-text-muted mt-1">
                  Writing starts at LBA 4096. With 4K logical blocks, that&apos;s byte
                  offset 4096 × 4096 = 16 MB into the namespace.{" "}
                  <em>Why LBA 4096 and not 0?</em> Perhaps the test is writing to the
                  middle of the device, or the filesystem placed this file&apos;s data
                  at that LBA.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw12=0x400000ff</code>
                <span className="text-text-muted ml-2">→ FUA + NLB=255 (256 blocks)</span>
                <p className="text-text-muted mt-1">
                  <em>This one&apos;s more interesting.</em> Let&apos;s break it down
                  bit by bit:
                </p>
                <ul className="text-text-muted mt-1 ml-3 space-y-1 list-disc">
                  <li>
                    Bits [15:0] = <code className="text-text-code">0x00FF</code> = 255 →
                    NLB = 256 blocks (0-based, remember). That&apos;s 256 × 4K = 1 MB.
                  </li>
                  <li>
                    Bit 30 = <code className="text-text-code">1</code> (the{" "}
                    <code className="text-text-code">0x40000000</code> part) → <strong>FUA
                    (Force Unit Access)</strong>. This means the drive must write the data
                    all the way to NAND before reporting completion — it cannot just cache it
                    in DRAM.
                  </li>
                </ul>
                <p className="text-text-muted mt-2 text-[10px] italic">
                  <em>When do you see FUA?</em> Filesystem journal writes, database
                  WAL (write-ahead log) entries, and any I/O where data durability
                  matters. If the power fails, FUA-written data is guaranteed to be on
                  NAND.
                </p>
              </div>
            </div>
            <p className="text-text-muted text-[10px] italic mt-3 leading-relaxed">
              <em>Summary: this Write command writes 256 blocks (1 MB) starting at LBA
              4096, with FUA forced, on I/O queue 2 — and succeeded. Notice it went to
              queue 2 while the Read was on queue 1 — the kernel spreads I/O across
              queues for parallelism.</em>
            </p>
          </div>

          {/* ─── Flush Example ─── */}
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">What about a Flush?</em> The Flush
            command (opcode 0x00) tells the drive to persist all cached data:
          </p>

          <TerminalBlock
            title="NVMe Flush command (opcode 0x00)"
            lines={[
              "  jbd2/nvme0-18421   [001] d..1.  2847.332100: nvme_setup_cmd: nvme0n1: qid=3, cmdid=5, nsid=1, cdw10=0x00000000, cdw11=0x00000000, cdw12=0x00000000, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x00",
              "  jbd2/nvme0-18421   [001] d..1.  2847.333540: nvme_complete_rq: nvme0n1: qid=3, cmdid=5, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />

          <div className="bg-story-card rounded-2xl p-5 card-shadow mt-4 mb-6">
            <div className="text-text-primary font-semibold text-xs mb-3">
              Decoding the Flush
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">opcode=0x00</code>
                <span className="text-text-muted ml-2">→ Flush</span>
                <p className="text-text-muted mt-1">
                  <em>All CDW fields are zero.</em> That&apos;s because Flush doesn&apos;t
                  need any parameters — it&apos;s a simple instruction: &ldquo;persist
                  everything in your write cache to NAND, now.&rdquo; There&apos;s no LBA
                  range, no block count, no flags.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <span className="text-nvme-amber font-mono font-bold text-xs">jbd2/nvme0-18421</span>
                <p className="text-text-muted mt-1">
                  <em>Who sent this?</em> Not fio — it&apos;s{" "}
                  <code className="text-text-code">jbd2</code>, the ext4 filesystem&apos;s
                  journal daemon. jbd2 periodically flushes the journal to ensure filesystem
                  consistency. <em>This is the kind of thing you&apos;d never see in application
                  logs</em> — the filesystem is sending NVMe commands behind your back.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <span className="text-text-muted font-mono font-bold text-xs">latency: 1.44 ms</span>
                <p className="text-text-muted mt-1">
                  setup at 2847.332100, complete at 2847.333540 → 1.44 ms.{" "}
                  <em>Why is Flush so much slower than Read?</em> Because the drive has
                  to physically write all cached data to NAND cells. A Read just fetches
                  data from NAND (or DRAM cache). A Flush forces a cache commit — potentially
                  writing megabytes of cached data.
                </p>
              </div>
            </div>
          </div>

          {/* ─── TRIM / DSM Example ─── */}
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">And TRIM?</em> TRIM is sent as a
            Dataset Management command (opcode 0x09):
          </p>

          <TerminalBlock
            title="NVMe Dataset Management / TRIM (opcode 0x09)"
            lines={[
              "  fstrim-5678   [000] d..1.  2847.502345: nvme_setup_cmd: nvme0n1: qid=1, cmdid=8, nsid=1, cdw10=0x00000000, cdw11=0x00000004, cdw12=0x00000000, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x09",
              "  fstrim-5678   [000] d..1.  2847.502890: nvme_complete_rq: nvme0n1: qid=1, cmdid=8, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />

          <div className="bg-story-card rounded-2xl p-5 card-shadow mt-4 mb-6">
            <div className="text-text-primary font-semibold text-xs mb-3">
              Decoding the Dataset Management (TRIM)
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">opcode=0x09</code>
                <span className="text-text-muted ml-2">→ Dataset Management</span>
                <p className="text-text-muted mt-1">
                  <em>Not called &ldquo;TRIM&rdquo; at the NVMe protocol level.</em> The
                  NVMe spec calls it &ldquo;Dataset Management&rdquo; because it can do
                  more than just trim — but in practice, it&apos;s almost always used
                  for TRIM (deallocate).
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw10=0x00000000</code>
                <span className="text-text-muted ml-2">→ NR = 0 (1 range)</span>
                <p className="text-text-muted mt-1">
                  CDW10 bits [7:0] = <strong>Number of Ranges (NR)</strong>, 0-based. A value
                  of 0 means 1 range. The actual LBA ranges are in the <em>data buffer</em>{" "}
                  (pointed to by DW6-DW9), not in the CDW fields.{" "}
                  <em>Why put ranges in a separate buffer instead of CDWs?</em> Because you
                  might TRIM thousands of ranges at once — they wouldn&apos;t fit in 6 dwords.
                  Each range entry is 16 bytes (context attributes + LBA + block count).
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw11=0x00000004</code>
                <span className="text-text-muted ml-2">→ AD (Attribute — Deallocate) bit set</span>
                <p className="text-text-muted mt-1">
                  CDW11 bit 2 = <strong>AD (Attribute — Deallocate)</strong>. This is what
                  makes it a TRIM: it tells the drive &ldquo;these blocks are no longer in
                  use, you can reclaim them.&rdquo;{" "}
                  <em>What if AD is 0?</em> Then it&apos;s just a hint about data
                  access patterns, not a trim — the drive doesn&apos;t reclaim anything.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <span className="text-nvme-amber font-mono font-bold text-xs">fstrim-5678</span>
                <p className="text-text-muted mt-1">
                  Sent by the <code className="text-text-code">fstrim</code> utility.{" "}
                  <em>This is the manual TRIM command</em> — run periodically (or via
                  cron/systemd timer) to tell the SSD about free space. Alternatively,
                  mounting with <code className="text-text-code">discard</code> option
                  sends TRIMs inline as files are deleted.
                </p>
              </div>
            </div>
          </div>

          {/* ─── Admin Command Example ─── */}
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">What about admin commands?</em> They go
            to queue 0 (the admin queue). Here&apos;s an Identify Controller command:
          </p>

          <TerminalBlock
            title="Admin Identify Controller (opcode 0x06)"
            lines={[
              "   nvme-cli-19000   [002] d..1.  2850.100200: nvme_setup_cmd: nvme0: qid=0, cmdid=12, nsid=0, cdw10=0x00000001, cdw11=0x00000000, cdw12=0x00000000, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x06",
              "   nvme-cli-19000   [002] d..1.  2850.100450: nvme_complete_rq: nvme0: qid=0, cmdid=12, res=0x0, retries=0, flags=0x0, status=0x0",
            ]}
          />

          <div className="bg-story-card rounded-2xl p-5 card-shadow mt-4 mb-6">
            <div className="text-text-primary font-semibold text-xs mb-3">
              Decoding the Identify Controller
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">opcode=0x06</code>
                <span className="text-text-muted ml-2">→ Identify (admin command)</span>
                <p className="text-text-muted mt-1">
                  <em>Notice the opcode is 0x06, same as Read is 0x02.</em> But this is on
                  the admin queue (qid=0), so opcodes are from the <em>admin</em> command
                  set, not the I/O set. Admin opcode 0x06 = Identify. I/O opcode 0x02 = Read.
                  They don&apos;t conflict because admin and I/O queues have separate
                  opcode spaces.
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">qid=0</code>
                <span className="text-text-muted ml-2">→ admin queue</span>
                <p className="text-text-muted mt-1">
                  Queue ID 0 is always the admin queue. All admin commands go here.{" "}
                  <em>I/O commands never use qid=0, and admin commands never use qid &ge; 1.</em>
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">cdw10=0x00000001</code>
                <span className="text-text-muted ml-2">→ CNS = 1 (Identify Controller)</span>
                <p className="text-text-muted mt-1">
                  CDW10 bits [7:0] = <strong>CNS (Controller or Namespace Structure)</strong>.
                  CNS=1 means &ldquo;return the controller identification structure&rdquo; —
                  a 4096-byte blob containing the drive&apos;s model name, serial number,
                  firmware version, capabilities, queue limits, and more.{" "}
                  <em>CNS=0 would be &ldquo;identify namespace&rdquo; instead.</em>
                </p>
              </div>
              <div className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono font-bold">nsid=0</code>
                <span className="text-text-muted ml-2">→ not namespace-specific</span>
                <p className="text-text-muted mt-1">
                  NSID is 0 because Identify Controller is about the <em>controller</em>,
                  not a specific namespace. For Identify Namespace (CNS=0), you&apos;d
                  see nsid=1 or whichever namespace is being queried.{" "}
                  <em>Also notice the device is <code className="text-text-code">nvme0</code>{" "}
                  (controller), not <code className="text-text-code">nvme0n1</code> (namespace).</em>
                </p>
              </div>
            </div>
          </div>

          <p className="text-text-muted text-xs mt-3 mb-4 leading-relaxed max-w-3xl">
            <em>Note:</em> Newer kernel versions may show a more decoded format (e.g.,{" "}
            <code className="text-text-code">io_cmd_read slba=0, len=7</code> instead of
            raw CDW hex). The trace decoder tool below works with the CDW format shown
            above. The sample traces you can load in the decoder also use this format.
          </p>
        </div>

        {/* ─── Block Layer Trace Output ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            Block Layer Trace Output
          </h4>
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            <em className="text-text-primary">Block layer events use a different
            format.</em> They show the device major:minor, operation flags, byte size,
            starting sector, and sector count:
          </p>

          <TerminalBlock
            title="block layer trace output — notice the operation flags"
            lines={[
              "     fio-18234   [003] d..1.  2847.331190: block_rq_issue: 259,0 R 4096 0 + 8 [fio]",
              "     fio-18234   [003] d..1.  2847.331312: block_rq_complete: 259,0 R () 0 + 8 [0]",
              "     fio-18234   [005] d..1.  2847.331440: block_rq_issue: 259,0 WS 131072 32768 + 256 [fio]",
              "     fio-18234   [005] d..1.  2847.331823: block_rq_complete: 259,0 WS () 32768 + 256 [0]",
              "  fstrim-5678   [000] ....  2847.502345: block_rq_issue: 259,0 DS 0 0 + 2097152 [fstrim]",
              "  fstrim-5678   [000] ....  2847.502567: block_rq_complete: 259,0 DS () 0 + 2097152 [0]",
            ]}
          />
          <p className="text-text-muted text-xs mt-3 mb-4 leading-relaxed max-w-3xl">
            <em>Notice the flags:</em>{" "}
            <code className="text-text-code">R</code> = async read,{" "}
            <code className="text-text-code">WS</code> = synchronous write,{" "}
            <code className="text-text-code">DS</code> = synchronous discard (TRIM).
            The sync flag (S) means the request must complete in order — it can&apos;t
            be reordered past other sync requests.
          </p>
        </div>

        {/* ─── Trace Line Anatomy — NVMe ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Trace Line Anatomy — NVMe Events
          </div>
          <div className="font-mono text-[10px] text-text-code overflow-x-auto mb-4">
            <span className="text-nvme-amber">fio-18234</span>{" "}
            <span className="text-text-muted">[003]</span>{" "}
            <span className="text-text-muted">d..1.</span>{" "}
            <span className="text-nvme-violet">2847.331205</span>:{" "}
            <span className="text-nvme-green">nvme_setup_cmd</span>:{" "}
            <span className="text-text-primary">nvme0n1</span>:{" "}
            <span className="text-nvme-blue">qid=1</span>,{" "}
            <span className="text-text-secondary">cdw10=0x00000000, ... opcode=0x02</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-amber font-mono font-bold">fio-18234</span>
              <p className="text-text-muted mt-1">
                The process name and PID that issued the command. Here, the{" "}
                <code className="text-text-code">fio</code> benchmarking tool, process
                ID 18234.{" "}
                <em>Why does this matter?</em> If you see unexpected processes sending I/O
                (like a backup daemon or filesystem journal), it explains &ldquo;mystery&rdquo;
                I/O you didn&apos;t expect.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-muted font-mono font-bold">[003]</span>
              <p className="text-text-muted mt-1">
                Which CPU core handled this. Useful for spotting unbalanced I/O
                across cores. <em>NVMe typically creates one I/O queue per CPU core</em>{" "}
                — if all I/O hits one core, you might have an affinity or interrupt
                routing issue.
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
              <span className="text-nvme-violet font-mono font-bold">2847.331205</span>
              <p className="text-text-muted mt-1">
                Timestamp in seconds since boot (with microsecond precision). The
                difference between setup and complete timestamps gives you the
                command latency.{" "}
                <em>Microsecond precision matters</em> — NVMe reads can complete in
                under 100 μs, so you need that resolution.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green font-mono font-bold">nvme_setup_cmd</span>
              <p className="text-text-muted mt-1">
                Event type: <code className="text-text-code">setup_cmd</code> = command
                submitted to the queue, <code className="text-text-code">complete_rq</code>{" "}
                = response received from the drive.{" "}
                <em>Every setup should have a matching complete.</em> If you see setups
                without completes, a command may have timed out or the drive is hung.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-secondary font-mono font-bold">opcode=0x02</span>
              <p className="text-text-muted mt-1">
                The NVMe opcode. 0x02 = Read, 0x01 = Write, 0x00 = Flush, 0x09 = Dataset
                Management (TRIM), 0x06 = Identify (admin). The CDW fields contain the
                command parameters — paste the line into the Trace Decoder to decode them.
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
            <span className="text-nvme-violet">2847.331190</span>:{" "}
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
              <span className="text-nvme-blue font-mono font-bold">R / WS / DS / ...</span>
              <p className="text-text-muted mt-1">
                Operation type + modifier flags. See the flag reference above. R = async
                read, WS = sync write, DS = sync discard, RA = read-ahead, WFUA = write
                with Force Unit Access.
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
                so 8 &times; 512 = 4096 bytes). <em>This maps to the NVMe trace&apos;s
                cdw10 (SLBA) and cdw12 (NLB) fields.</em>
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
              <span className="text-text-secondary">2847.331190</span>
              <span className="text-text-muted">Block layer sends to driver</span>
            </div>
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green">nvme_setup_cmd</span>
              <span className="text-text-secondary">2847.331205</span>
              <span className="text-text-muted">Driver submits to SQ</span>
            </div>
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue">nvme_complete_rq</span>
              <span className="text-text-secondary">2847.331312</span>
              <span className="text-text-muted">Drive completes, CQE posted</span>
            </div>
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-violet">block_rq_complete</span>
              <span className="text-text-secondary">2847.331312</span>
              <span className="text-text-muted">Block layer marks complete</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-nvme-violet/5 rounded-lg p-3 border border-nvme-violet/20">
              <span className="text-nvme-violet font-bold">Driver overhead</span>
              <div className="text-text-muted text-[10px] mt-1">
                rq_issue &rarr; setup_cmd = <strong>15&micro;s</strong>
              </div>
              <p className="text-text-muted text-[10px]">
                Time the NVMe driver spent preparing the SQE
              </p>
            </div>
            <div className="bg-nvme-green/5 rounded-lg p-3 border border-nvme-green/20">
              <span className="text-nvme-green font-bold">Device latency</span>
              <div className="text-text-muted text-[10px] mt-1">
                setup_cmd &rarr; complete_rq = <strong>107&micro;s</strong>
              </div>
              <p className="text-text-muted text-[10px]">
                Time the SSD took to execute the command
              </p>
            </div>
            <div className="bg-nvme-blue/5 rounded-lg p-3 border border-nvme-blue/20">
              <span className="text-nvme-blue font-bold">Total I/O time</span>
              <div className="text-text-muted text-[10px] mt-1">
                rq_issue &rarr; rq_complete = <strong>122&micro;s</strong>
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
                Save trace to file for analysis
              </div>
              <CodeBlock
                title=""
                language="bash"
                code={`# Capture 10 seconds of trace to a file
timeout 10 cat /sys/kernel/debug/tracing/trace_pipe > /tmp/nvme_trace.txt
# Then analyze: count commands by type, find slow completions, etc.
grep 'nvme_setup_cmd' /tmp/nvme_trace.txt | wc -l    # total commands
grep 'opcode=0x01' /tmp/nvme_trace.txt | wc -l        # write commands
grep -v 'status=0x0' /tmp/nvme_trace.txt | grep 'complete_rq'  # errors`}
              />
            </div>
            <div>
              <div className="text-text-primary text-xs font-semibold mb-1">
                Disable tracing when done (important!)
              </div>
              <CodeBlock
                title=""
                language="bash"
                code={`# Always disable when done — tracing adds overhead
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
              { q: "Is my filesystem sending TRIMs?", a: "Look for 'DS' (discard sync) in block_rq_issue events, or opcode=0x09 in NVMe events. If absent, TRIM might not be enabled (check mount options for 'discard' or run fstrim)." },
              { q: "Which queue is busiest?", a: "NVMe events include qid. Count events per queue ID — ideally balanced across all I/O queues (one per CPU core). Imbalance means some cores are doing more I/O." },
              { q: "Are there errors?", a: "Look for nvme_complete_rq lines where status ≠ 0x0. Status codes: 0x0=success, 0x2=invalid field, 0x4=data transfer error, 0x5=aborted." },
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

        <RevealCard
          id="act5-tracing-kc1"
          prompt="Your application reports 200 microsecond average I/O latency, but users complain about intermittent slowness. How would you use ftrace and blktrace together to pinpoint whether the bottleneck is in the kernel I/O stack or the SSD itself? What specific timestamps would you compare?"
          answer="Enable both NVMe and block layer trace events simultaneously. For each I/O, compare three key timestamps: (1) block_rq_issue — when the block layer hands the request to the NVMe driver, (2) nvme_setup_cmd — when the driver submits the command to the SSD's submission queue, and (3) nvme_complete_rq — when the SSD posts the completion. The gap between rq_issue and setup_cmd reveals driver/software overhead. The gap between setup_cmd and complete_rq is the actual SSD device latency. If device latency spikes to milliseconds during normal sub-100us operations, the SSD is likely doing foreground garbage collection or thermal throttling. If device latency is stable but total latency is high, the bottleneck is in the I/O scheduler, filesystem journaling, or queue contention. Look for patterns: spikes correlating with write bursts suggest GC, while steady high latency on one qid suggests CPU affinity issues."
          hint="Think about comparing timestamps at different layers of the I/O stack."
          options={["Use only application-level timestamps since kernel tracing adds too much overhead to be useful", "Compare block_rq_issue to nvme_setup_cmd for software overhead and nvme_setup_cmd to nvme_complete_rq for device latency to isolate the bottleneck", "Run hdparm -t to measure raw device throughput — if fast then the problem is in the application", "Check dmesg for NVMe error messages since intermittent slowness always indicates hardware errors"]}
          correctIndex={1}
        />
      </div>
    </SectionWrapper>
  );
}
