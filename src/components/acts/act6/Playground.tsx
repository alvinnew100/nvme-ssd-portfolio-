"use client";

import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCommandBuilder } from "@/hooks/useCommandBuilder";
import { useTraceDecoder } from "@/hooks/useTraceDecoder";
import { generateCliCommand } from "@/lib/nvme/cli-generator";
import { useStory } from "@/context/StoryContext";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";

const DwordFieldTable = dynamic(
  () => import("@/components/commands/DwordFieldTable"),
  { ssr: false }
);
const SQEntryVisualizer = dynamic(
  () => import("@/components/commands/SQEntryVisualizer"),
  { ssr: false }
);
const TraceInput = dynamic(
  () => import("@/components/trace-decoder/TraceInput"),
  { ssr: false }
);
const TraceOutput = dynamic(
  () => import("@/components/trace-decoder/TraceOutput"),
  { ssr: false }
);

const PRESETS: { label: string; commandId: string; nsid: number; fields: Record<string, number> }[] = [
  {
    label: "Read 4KB",
    commandId: "io-read",
    nsid: 1,
    fields: { SLBA_L: 0, NLB: 7 },
  },
  {
    label: "Get SMART",
    commandId: "admin-get-log-page",
    nsid: 0,
    fields: { LID: 2, NUMDL: 127 },
  },
  {
    label: "Identify Controller",
    commandId: "admin-identify",
    nsid: 0,
    fields: { CNS: 1 },
  },
  {
    label: "TRIM 256 blocks",
    commandId: "io-dataset-mgmt",
    nsid: 1,
    fields: { NR: 0, AD: 1 },
  },
];

export default function Playground() {
  const {
    commands,
    selectedCommand,
    selectedId,
    selectCommand,
    fieldValues,
    setFieldValue,
    nsid,
    setNsid,
    hexDump,
    ftraceLine,
    roundTripDecode,
    loadPreset,
  } = useCommandBuilder();

  const traceDecoder = useTraceDecoder();
  const { pendingCommand, clearPendingCommand } = useStory();

  const loadSample = useCallback(
    async (name: string) => {
      try {
        const basePath = process.env.__NEXT_ROUTER_BASEPATH || "";
        const res = await fetch(`${basePath}/sample-traces/${name}.txt`);
        const text = await res.text();
        traceDecoder.decode(text);
      } catch {
        // ignore fetch errors
      }
    },
    [traceDecoder]
  );

  // Handle incoming command from accordion "Try it" button
  useEffect(() => {
    if (pendingCommand) {
      selectCommand(pendingCommand);
      clearPendingCommand();
    }
  }, [pendingCommand, selectCommand, clearPendingCommand]);

  const cliResult = selectedCommand
    ? generateCliCommand(selectedCommand, fieldValues, nsid)
    : null;

  return (
    <div className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-2">
          Command Builder
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          Build any NVMe command, see the raw SQ entry, hex dump, nvme-cli
          command, and ftrace output.
        </p>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => loadPreset(p.commandId, p.nsid, p.fields)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                selectedId === p.commandId
                  ? "bg-nvme-blue text-white shadow-md"
                  : "bg-white border border-story-border text-text-secondary hover:text-nvme-blue hover:border-nvme-blue/40 card-shadow"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Command selector */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={selectedId}
            onChange={(e) => selectCommand(e.target.value)}
            className="flex-1 min-w-[200px] bg-white border border-story-border rounded-xl px-4 py-2.5 text-text-primary text-sm font-mono card-shadow focus:outline-none focus:border-nvme-blue"
          >
            <optgroup label="Admin Commands">
              {commands
                .filter((c) => c.type === "admin")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    0x{c.opcode.toString(16).padStart(2, "0")} — {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="I/O Commands">
              {commands
                .filter((c) => c.type === "io")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    0x{c.opcode.toString(16).padStart(2, "0")} — {c.name}
                  </option>
                ))}
            </optgroup>
          </select>

          <div className="flex items-center gap-2">
            <label className="text-text-muted text-xs font-mono">NSID:</label>
            <input
              type="number"
              min={0}
              max={0xffffffff}
              value={nsid}
              onChange={(e) => setNsid(parseInt(e.target.value) || 0)}
              className="w-20 bg-white border border-story-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-mono card-shadow focus:outline-none focus:border-nvme-blue"
            />
          </div>
        </div>

        {selectedCommand && (
          <div className="space-y-6">
            {/* Description */}
            <div className="text-text-muted text-sm">
              {selectedCommand.description}
            </div>

            {/* Field editor */}
            {selectedCommand.fields.length > 0 && (
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
                  Fields
                </div>
                <div className="space-y-2">
                  {selectedCommand.fields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center gap-3 text-xs"
                    >
                      <label className="text-nvme-blue font-mono w-20 flex-shrink-0">
                        {field.name}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={(1 << (field.bitEnd - field.bitStart + 1)) - 1}
                        value={fieldValues[field.name] ?? 0}
                        onChange={(e) =>
                          setFieldValue(
                            field.name,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24 bg-story-surface border border-story-border rounded-lg px-2 py-1.5 text-text-primary font-mono focus:outline-none focus:border-nvme-blue"
                      />
                      <span className="text-text-muted">
                        CDW{field.dword} [{field.bitEnd}:{field.bitStart}]
                      </span>
                      <span className="text-text-secondary hidden sm:inline flex-1 truncate">
                        {field.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal command */}
            {cliResult && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  Terminal Command
                </div>
                {cliResult.isKernelOnly ? (
                  <div className="text-text-muted text-xs italic bg-white rounded-2xl card-shadow p-4 font-mono">
                    {cliResult.note}
                  </div>
                ) : cliResult.command ? (
                  <NvmeCliBlock command={cliResult.command} />
                ) : null}
              </div>
            )}

            {/* Dword table and SQ visualizer */}
            {selectedCommand.fields.length > 0 && (
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <DwordFieldTable fields={selectedCommand.fields} />
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 card-shadow">
              <SQEntryVisualizer command={selectedCommand} />
            </div>

            {/* Hex dump */}
            {hexDump && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  64-Byte SQ Entry (Hex Dump)
                </div>
                <pre className="text-text-code text-[11px] bg-white rounded-2xl card-shadow p-6 overflow-x-auto font-mono">
                  {hexDump}
                </pre>
              </div>
            )}

            {/* ftrace output */}
            {ftraceLine && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  Synthetic ftrace Line
                </div>
                <pre className="text-nvme-green text-[10px] bg-story-dark rounded-2xl p-6 overflow-x-auto font-mono">
                  {ftraceLine}
                </pre>
              </div>
            )}

            {/* Round-trip decode */}
            {roundTripDecode && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  Round-Trip Decode (ftrace &rarr; decode)
                </div>
                <div className="bg-white rounded-2xl card-shadow p-6 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <span className="text-text-muted">Command:</span>
                    <span className="text-text-primary font-semibold">
                      {roundTripDecode.commandName}
                    </span>
                  </div>
                  {roundTripDecode.fields.map((f) => (
                    <div key={f.name} className="flex gap-2">
                      <span className="text-nvme-blue font-mono w-20">
                        {f.name}
                      </span>
                      <span className="text-text-code font-mono">{f.hex}</span>
                      <span className="text-text-muted">{f.description}</span>
                      {f.valueMeaning && (
                        <span className="text-nvme-amber">
                          ({f.valueMeaning})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trace Decoder Section */}
        <div className="mt-16 pt-16 border-t border-story-border">
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            Trace Decoder
          </h3>
          <p className="text-text-secondary text-sm mb-6">
            Paste real ftrace output and decode every NVMe command.
          </p>

          <TraceInput
            value={traceDecoder.input}
            onChange={(val: string) => traceDecoder.decode(val)}
            onClear={traceDecoder.clear}
            onLoadSample={loadSample}
          />

          {traceDecoder.error && (
            <div className="mt-4 text-nvme-red text-xs bg-nvme-red/10 rounded-xl p-3">
              {traceDecoder.error}
            </div>
          )}

          {traceDecoder.results.length > 0 && (
            <div className="mt-4">
              <TraceOutput results={traceDecoder.results} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
