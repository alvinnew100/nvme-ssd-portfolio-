"use client";

import { useTraceDecoder } from "@/hooks/useTraceDecoder";
import TraceInput from "@/components/trace-decoder/TraceInput";
import TraceOutput from "@/components/trace-decoder/TraceOutput";

const basePath = "/nvme-ssd-portfolio";

export default function TraceDecoderPage() {
  const { input, results, error, decode, clear } = useTraceDecoder();

  const loadSample = async (name: string) => {
    try {
      const res = await fetch(`${basePath}/sample-traces/${name}.txt`);
      const text = await res.text();
      decode(text);
    } catch {
      decode("# Failed to load sample trace");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          NVMe Ftrace Decoder
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Paste Linux ftrace output containing NVMe trace events and instantly
          see decoded commands with field-level details. Based on the{" "}
          <a
            href="https://github.com/linux-nvme/nvme-trace"
            target="_blank"
            rel="noopener noreferrer"
            className="text-nvme-accent hover:underline"
          >
            linux-nvme/nvme-trace
          </a>{" "}
          decoder, ported to TypeScript with a data-driven architecture.
        </p>
      </div>

      {/* How to capture traces */}
      <details className="mb-6 bg-nvme-dark rounded-lg border border-gray-800">
        <summary className="px-4 py-3 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
          How to capture NVMe ftrace output
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-400 space-y-2">
          <pre className="bg-nvme-darker rounded p-3 text-xs overflow-x-auto">
{`# Enable NVMe trace events
echo 1 > /sys/kernel/debug/tracing/events/nvme/enable

# Run your workload
fio --name=test --rw=randread --bs=4k --numjobs=1 --runtime=5

# Read the trace
cat /sys/kernel/debug/tracing/trace

# Disable tracing
echo 0 > /sys/kernel/debug/tracing/events/nvme/enable`}
          </pre>
        </div>
      </details>

      <div className="space-y-6">
        <TraceInput
          value={input}
          onChange={decode}
          onClear={clear}
          onLoadSample={loadSample}
        />
        <TraceOutput results={results} error={error} />
      </div>
    </div>
  );
}
