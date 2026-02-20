"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import TerminalBlock from "@/components/story/TerminalBlock";
import CodeBlock from "@/components/story/CodeBlock";

export default function Tracing() {
  return (
    <SectionWrapper className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          ftrace NVMe Tracing
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Linux&apos;s built-in <strong className="text-text-primary">ftrace</strong>{" "}
          framework can trace every NVMe command in real time. Two trace events
          are key: <code className="text-text-code">nvme_setup_cmd</code>{" "}
          (command submitted) and <code className="text-text-code">nvme_complete_rq</code>{" "}
          (command completed). This gives you complete visibility into the NVMe
          I/O path.
        </p>

        <div className="space-y-4 mb-6">
          <CodeBlock
            title="Enable NVMe tracing"
            language="bash"
            code={`# Enable trace events
echo 1 > /sys/kernel/debug/tracing/events/nvme/nvme_setup_cmd/enable
echo 1 > /sys/kernel/debug/tracing/events/nvme/nvme_complete_rq/enable

# Read the trace
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

        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Each trace line contains: the process name and PID, CPU core, flags,
          timestamp, event type, device name, queue ID, command ID, namespace
          ID, all six command dwords (CDW10-15), and the opcode. From these
          fields, you can decode the exact command and its parameters.
        </p>

        <div className="bg-story-panel rounded-xl border border-story-border p-5">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Trace line anatomy
          </div>
          <div className="font-mono text-[10px] text-text-code overflow-x-auto">
            <span className="text-nvme-amber">fio-18234</span>{" "}
            <span className="text-text-muted">[003]</span>{" "}
            <span className="text-text-muted">d..1.</span>{" "}
            <span className="text-nvme-violet">2847.331205</span>:{" "}
            <span className="text-nvme-green">nvme_setup_cmd</span>:{" "}
            <span className="text-text-primary">nvme0n1</span>:{" "}
            <span className="text-nvme-blue">qid=1</span>,{" "}
            <span className="text-text-secondary">cdw10=0x00000000, ... opcode=0x02</span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
            <div><span className="text-nvme-amber">process-PID</span> <span className="text-text-muted">= who issued it</span></div>
            <div><span className="text-nvme-violet">timestamp</span> <span className="text-text-muted">= seconds since boot</span></div>
            <div><span className="text-nvme-green">event</span> <span className="text-text-muted">= setup or complete</span></div>
            <div><span className="text-nvme-blue">qid</span> <span className="text-text-muted">= 0=admin, 1+=I/O</span></div>
            <div><span className="text-text-secondary">opcode</span> <span className="text-text-muted">= command type</span></div>
            <div><span className="text-text-secondary">cdw10-15</span> <span className="text-text-muted">= command params</span></div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
