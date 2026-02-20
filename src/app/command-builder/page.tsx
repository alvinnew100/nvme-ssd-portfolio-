"use client";

import { useCommandBuilder } from "@/hooks/useCommandBuilder";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { getFieldMaxValue } from "@/lib/nvme/encoder";

interface Preset {
  label: string;
  description: string;
  commandId: string;
  nsid: number;
  fields: Record<string, number>;
}

const presets: Preset[] = [
  {
    label: "Read 4KB from LBA 0",
    description: "Read a single 4KB block from the beginning of the namespace",
    commandId: "io-read",
    nsid: 1,
    fields: { SLBA_L: 0, SLBA_U: 0, NLB: 0 },
  },
  {
    label: "TRIM 1GB Range",
    description: "Deallocate a 1GB range starting at LBA 0",
    commandId: "io-dataset-mgmt",
    nsid: 1,
    fields: { NR: 0, AD: 1 },
  },
  {
    label: "Get SMART Log",
    description: "Retrieve SMART / Health Information log page",
    commandId: "admin-get-log-page",
    nsid: 0,
    fields: { LID: 2, NUMDL: 127 },
  },
  {
    label: "Identify Controller",
    description: "Query controller identity data (CNS=1)",
    commandId: "admin-identify",
    nsid: 0,
    fields: { CNS: 1 },
  },
];

function CommandBuilderInner() {
  const searchParams = useSearchParams();
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
    encodedDwords,
    loadPreset,
  } = useCommandBuilder();

  // Auto-select from URL param
  useEffect(() => {
    const cmd = searchParams.get("cmd");
    if (cmd && commands.some((c) => c.id === cmd)) {
      selectCommand(cmd);
    }
  }, [searchParams, commands, selectCommand]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-warm-50 mb-4">
          NVMe Command Builder
        </h1>
        <p className="text-warm-400 max-w-3xl">
          Select any NVMe command, fill in the fields, and see the raw 64-byte
          SQ entry, hex dump, and synthetic ftrace output in real time. The
          generated trace is decoded back to verify round-trip correctness.
        </p>
      </div>

      {/* Presets */}
      <div className="mb-8 bg-nvme-dark rounded-xl p-4 border border-warm-800">
        <h3 className="text-sm font-medium text-warm-300 mb-3">
          Try These Examples
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => loadPreset(preset.commandId, preset.nsid, preset.fields)}
              className="text-left p-3 rounded-lg border border-warm-700 hover:border-nvme-accent bg-nvme-darker hover:bg-nvme-gray/30 transition-all group"
            >
              <div className="text-sm font-semibold text-warm-100 group-hover:text-nvme-accent transition-colors">
                {preset.label}
              </div>
              <div className="text-xs text-warm-500 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Command selection + fields */}
        <div className="space-y-6">
          {/* Command selector */}
          <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
            <label className="block text-sm font-medium text-warm-300 mb-2">
              Select Command
            </label>
            <select
              value={selectedId}
              onChange={(e) => selectCommand(e.target.value)}
              className="w-full px-3 py-2 bg-nvme-darker border border-warm-700 rounded-lg text-warm-50 focus:outline-none focus:border-nvme-accent"
            >
              <optgroup label="Admin Commands (qid=0)">
                {commands
                  .filter((c) => c.type === "admin")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      0x{c.opcode.toString(16).padStart(2, "0")} — {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="I/O Commands (qid!=0)">
                {commands
                  .filter((c) => c.type === "io")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      0x{c.opcode.toString(16).padStart(2, "0")} — {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>

            {selectedCommand && (
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCommand.type === "admin"
                      ? "bg-nvme-blue/20 text-nvme-accent"
                      : "bg-nvme-green/20 text-nvme-green"
                  }`}
                >
                  {selectedCommand.type === "admin" ? "Admin" : "I/O"}
                </span>
                <Link
                  href={`/commands/${selectedCommand.id}`}
                  className="text-xs text-nvme-accent hover:underline"
                  prefetch={false}
                >
                  View reference
                </Link>
              </div>
            )}
          </div>

          {/* NSID */}
          <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
            <label className="block text-sm font-medium text-warm-300 mb-2">
              Namespace ID (NSID)
            </label>
            <input
              type="number"
              min={0}
              max={0xffffffff}
              value={nsid}
              onChange={(e) => setNsid(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-nvme-darker border border-warm-700 rounded-lg text-warm-50 font-mono focus:outline-none focus:border-nvme-accent"
            />
          </div>

          {/* Field inputs */}
          {selectedCommand && selectedCommand.fields.length > 0 && (
            <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
              <h3 className="text-sm font-medium text-warm-300 mb-4">
                Command Fields
              </h3>
              <div className="space-y-4">
                {selectedCommand.fields.map((field) => {
                  const maxVal = getFieldMaxValue(field);
                  return (
                    <div key={field.name}>
                      <label className="flex items-center gap-2 text-sm text-warm-400 mb-1">
                        <span className="font-mono text-warm-50">
                          {field.name}
                        </span>
                        <span className="text-xs text-warm-600">
                          CDW{field.dword}[{field.bitEnd}:{field.bitStart}]
                        </span>
                      </label>
                      <p className="text-xs text-warm-500 mb-1">
                        {field.description}
                      </p>
                      {field.values ? (
                        <select
                          value={fieldValues[field.name] ?? 0}
                          onChange={(e) =>
                            setFieldValue(field.name, parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-nvme-darker border border-warm-700 rounded-lg text-warm-50 text-sm focus:outline-none focus:border-nvme-accent"
                        >
                          {Object.entries(field.values).map(([val, label]) => (
                            <option key={val} value={val}>
                              {val} — {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          max={maxVal}
                          value={fieldValues[field.name] ?? 0}
                          onChange={(e) =>
                            setFieldValue(
                              field.name,
                              Math.min(parseInt(e.target.value) || 0, maxVal)
                            )
                          }
                          className="w-full px-3 py-2 bg-nvme-darker border border-warm-700 rounded-lg text-warm-50 font-mono text-sm focus:outline-none focus:border-nvme-accent"
                          placeholder={`0 - ${maxVal} (0x${maxVal.toString(16)})`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="space-y-6">
          {/* Encoded dwords */}
          <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
            <h3 className="text-sm font-medium text-warm-300 mb-3">
              Encoded Dwords
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {[10, 11, 12, 13, 14, 15].map((dw) => (
                <div key={dw} className="flex justify-between bg-nvme-darker rounded px-3 py-2">
                  <span className="text-warm-500">CDW{dw}:</span>
                  <span className="text-nvme-accent">
                    0x{(encodedDwords[dw] ?? 0).toString(16).padStart(8, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hex dump */}
          <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
            <h3 className="text-sm font-medium text-warm-300 mb-3">
              64-Byte SQ Entry (Hex Dump)
            </h3>
            <pre className="bg-nvme-darker rounded p-3 text-xs text-nvme-green overflow-x-auto">
              {hexDump || "Select a command to see the hex dump"}
            </pre>
          </div>

          {/* Ftrace output */}
          <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
            <h3 className="text-sm font-medium text-warm-300 mb-3">
              Synthetic Ftrace Output
            </h3>
            <pre className="bg-nvme-darker rounded p-3 text-xs text-nvme-orange overflow-x-auto whitespace-pre-wrap">
              {ftraceLine || "Select a command to see ftrace output"}
            </pre>
          </div>

          {/* Round-trip decode */}
          {roundTripDecode && (
            <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
              <h3 className="text-sm font-medium text-warm-300 mb-3">
                Round-Trip Decode Verification
              </h3>
              <div className="bg-nvme-darker rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-nvme-green">&#x2713; Decoded back as:</span>
                  <span className="text-warm-50 font-semibold text-sm">
                    {roundTripDecode.commandName}
                  </span>
                </div>
                {roundTripDecode.fields.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {roundTripDecode.fields.map((f) => (
                      <div key={f.name} className="text-xs">
                        <span className="text-warm-500">{f.name}: </span>
                        <span className="text-warm-50 font-mono">{f.hex}</span>
                        {f.valueMeaning && (
                          <span className="text-nvme-accent ml-1">
                            ({f.valueMeaning})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Queue flow visualization */}
          <div className="bg-nvme-dark rounded-xl p-4 border border-warm-800">
            <h3 className="text-sm font-medium text-warm-300 mb-3">
              Queue Flow
            </h3>
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 border-2 border-nvme-blue bg-nvme-blue/10 rounded flex items-center justify-center text-xs text-nvme-accent text-center">
                  Host Driver
                </div>
              </div>
              <svg className="w-12 h-8" viewBox="0 0 48 32">
                <path
                  d="M4 16 H36 M30 8 L38 16 L30 24"
                  fill="none"
                  stroke="#d4a853"
                  strokeWidth="2"
                />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-28 h-16 border-2 border-nvme-accent bg-nvme-accent/10 rounded flex flex-col items-center justify-center text-xs text-nvme-accent">
                  <div>Submission Queue</div>
                  <div className="text-[10px] text-warm-500">
                    qid={selectedCommand?.type === "admin" ? "0" : "1"}
                  </div>
                </div>
              </div>
              <svg className="w-12 h-8" viewBox="0 0 48 32">
                <path
                  d="M4 16 H36 M30 8 L38 16 L30 24"
                  fill="none"
                  stroke="#d4a853"
                  strokeWidth="2"
                />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 border-2 border-nvme-green bg-nvme-green/10 rounded flex items-center justify-center text-xs text-nvme-green text-center">
                  NVMe Controller
                </div>
              </div>
              <svg className="w-12 h-8" viewBox="0 0 48 32">
                <path
                  d="M4 16 H36 M30 8 L38 16 L30 24"
                  fill="none"
                  stroke="#7a9b57"
                  strokeWidth="2"
                />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-24 h-16 border-2 border-nvme-orange bg-nvme-orange/10 rounded flex items-center justify-center text-xs text-nvme-orange text-center">
                  Completion Queue
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommandBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12 text-warm-400">
          Loading command builder...
        </div>
      }
    >
      <CommandBuilderInner />
    </Suspense>
  );
}
