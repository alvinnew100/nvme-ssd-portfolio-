"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import TerminalBlock from "@/components/story/TerminalBlock";
import CodeBlock from "@/components/story/CodeBlock";

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

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Two Key Trace Events
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
                the submission queue. Shows the opcode, queue ID, namespace, and all
                CDW fields (the command&apos;s parameters).
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">
                nvme_complete_rq
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Fires when the drive&apos;s response arrives — the CQE is processed.
                Shows the status code (success or error), retries, and flags. The time
                between setup and complete is the command&apos;s latency.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <CodeBlock
            title="Enable NVMe tracing"
            language="bash"
            code={`# Enable trace events
echo 1 > /sys/kernel/debug/tracing/events/nvme/nvme_setup_cmd/enable
echo 1 > /sys/kernel/debug/tracing/events/nvme/nvme_complete_rq/enable

# Read the trace (streams in real time — Ctrl+C to stop)
cat /sys/kernel/debug/tracing/trace_pipe`}
          />

          <TerminalBlock
            title="trace output"
            lines={[
              "# process-PID  [CPU]  flags  timestamp: event: device: fields",
              "fio-18234   [003] d..1. 2847.331205: nvme_setup_cmd: nvme0n1: qid=1, cmdid=0, nsid=1, cdw10=0x00000000, cdw11=0x00000000, cdw12=0x00000007, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x02",
              "fio-18234   [003] d..1. 2847.331312: nvme_complete_rq: nvme0n1: qid=1, cmdid=0, res=0x0, retries=0, flags=0x0, status=0x0",
              "fio-18234   [003] d..1. 2847.331450: nvme_setup_cmd: nvme0n1: qid=2, cmdid=1, nsid=1, cdw10=0x00001000, cdw11=0x00000000, cdw12=0x400000ff, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x01",
            ]}
          />
        </div>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Let&apos;s decode that output.</em> Each
          line is packed with information. Here&apos;s how to read it:
        </p>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Trace Line Anatomy
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
                ID 18234.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-muted font-mono font-bold">[003]</span>
              <p className="text-text-muted mt-1">
                Which CPU core handled this. Useful for spotting unbalanced I/O
                across cores.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-violet font-mono font-bold">2847.331205</span>
              <p className="text-text-muted mt-1">
                Timestamp in seconds since boot. The difference between setup and
                complete timestamps gives you the command latency.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green font-mono font-bold">nvme_setup_cmd</span>
              <p className="text-text-muted mt-1">
                The event type: setup = command submitted, complete_rq = response received.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">qid=1</span>
              <p className="text-text-muted mt-1">
                Queue ID. Remember: 0 = admin queue, 1+ = I/O queues. Here it&apos;s
                I/O queue 1.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-text-secondary font-mono font-bold">opcode=0x02</span>
              <p className="text-text-muted mt-1">
                The NVMe opcode. 0x02 = Read, 0x01 = Write, 0x08 = Flush. This is
                how you know what operation the trace line represents.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Practical Example: Measuring Command Latency
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            Look at the timestamps from the trace output above:
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-green">nvme_setup_cmd</span>
              <span className="text-nvme-violet">2847.331205</span>
            </div>
            <div className="flex justify-between bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue">nvme_complete_rq</span>
              <span className="text-nvme-violet">2847.331312</span>
            </div>
            <div className="flex justify-between bg-nvme-green/5 rounded-lg p-3 border border-nvme-green/20">
              <span className="text-nvme-green font-bold">Latency</span>
              <span className="text-nvme-green font-bold">107 microseconds</span>
            </div>
          </div>
          <p className="text-text-muted text-xs mt-3 leading-relaxed">
            The difference (0.331312 - 0.331205 = 0.000107 seconds = 107&micro;s) is
            the total time from command submission to completion. For a 4KB NVMe read,
            this is typical. If you see latencies in the milliseconds, something is wrong —
            possibly queue congestion, thermal throttling, or a firmware issue.
          </p>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-3">
            What You Can Learn from Traces
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { q: "Why is my app slow?", a: "Check if specific commands have high latency. Are writes slower than reads? Is one queue overloaded while others are idle?" },
              { q: "Is my filesystem sending TRIMs?", a: "Filter for opcode=0x09 (Dataset Management). If you don't see any, your filesystem might not have TRIM enabled." },
              { q: "Which queue is busiest?", a: "Count events per qid. Ideally, I/O should be spread across all queues (one per CPU core)." },
              { q: "Are there errors?", a: "Look at nvme_complete_rq lines where status ≠ 0x0. The status code tells you exactly what went wrong." },
            ].map((item) => (
              <div key={item.q} className="bg-story-surface rounded-lg p-3">
                <div className="text-text-primary font-semibold mb-1">{item.q}</div>
                <p className="text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
