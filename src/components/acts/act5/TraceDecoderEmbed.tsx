"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import SectionWrapper from "@/components/story/SectionWrapper";
import { useTraceDecoder } from "@/hooks/useTraceDecoder";

const TraceInput = dynamic(
  () => import("@/components/trace-decoder/TraceInput"),
  { ssr: false }
);
const TraceOutput = dynamic(
  () => import("@/components/trace-decoder/TraceOutput"),
  { ssr: false }
);

export default function TraceDecoderEmbed() {
  const { input, results, error, decode, clear } = useTraceDecoder();

  const loadSample = useCallback(
    async (name: string) => {
      try {
        const basePath = process.env.__NEXT_ROUTER_BASEPATH || "";
        const res = await fetch(`${basePath}/sample-traces/${name}.txt`);
        const text = await res.text();
        decode(text);
      } catch {
        // ignore fetch errors
      }
    },
    [decode]
  );

  return (
    <SectionWrapper className="py-12 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h4 className="text-xl font-bold text-text-primary mb-2">
          Try It &mdash; Trace Decoder
        </h4>
        <p className="text-text-secondary text-sm mb-4">
          Paste ftrace output below, or load a sample trace to see it decoded
          in real time.
        </p>

        <div className="bg-white rounded-2xl p-6 card-shadow space-y-4">
          <TraceInput
            value={input}
            onChange={(val: string) => decode(val)}
            onClear={clear}
            onLoadSample={loadSample}
          />

          {error && (
            <div className="text-nvme-red text-xs bg-nvme-red/10 rounded-lg p-3">
              {error}
            </div>
          )}

          {results.length > 0 && <TraceOutput results={results} />}
        </div>
      </div>
    </SectionWrapper>
  );
}
