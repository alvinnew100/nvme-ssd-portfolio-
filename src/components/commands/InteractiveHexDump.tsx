"use client";

import { useState } from "react";
import { NvmeCommand, SQEntry } from "@/lib/nvme/types";
import { DWORD_COLORS, SQ_DWORD_LABELS } from "@/lib/nvme/constants";

interface InteractiveHexDumpProps {
  entry: SQEntry;
  command: NvmeCommand;
}

export default function InteractiveHexDump({ entry, command }: InteractiveHexDumpProps) {
  const [activeDword, setActiveDword] = useState<number | null>(null);

  // Build field map: dword index → fields in that dword
  const fieldMap = new Map<number, typeof command.fields>();
  for (const f of command.fields) {
    if (!fieldMap.has(f.dword)) fieldMap.set(f.dword, []);
    fieldMap.get(f.dword)!.push(f);
  }

  // CDW0 (opcode/CID) and CDW1 (NSID) are always "used"
  const usedDwords = new Set<number>([0, 1]);
  for (const f of command.fields) usedDwords.add(f.dword);

  // Read a 32-bit LE value from 4 bytes
  const readDword = (dw: number) => {
    const off = dw * 4;
    return (
      entry.bytes[off] |
      (entry.bytes[off + 1] << 8) |
      (entry.bytes[off + 2] << 16) |
      ((entry.bytes[off + 3] << 24) >>> 0)
    ) >>> 0;
  };

  return (
    <div>
      {/* DWord explainer */}
      <div className="text-text-muted text-[10px] mb-3 leading-relaxed">
        <strong className="text-text-secondary">DWord</strong> = Double Word = <strong className="text-text-secondary">4 bytes</strong>, always.
        CDW10 = the 10th dword (bytes 40–43), not &ldquo;10 bytes.&rdquo;
        16 DWords &times; 4 bytes = 64-byte SQ entry. Hover any byte to inspect its dword.
      </div>

      {/* Byte grid: 4 rows × 16 bytes (4 dwords per row) */}
      <div className="space-y-1">
        {[0, 1, 2, 3].map((row) => {
          const startDw = row * 4;
          const startByte = row * 16;

          return (
            <div key={row} className="flex items-center gap-1.5">
              {/* Byte offset */}
              <div className="text-text-muted font-mono text-[10px] w-10 text-right flex-shrink-0">
                {startByte.toString(16).padStart(4, "0")}
              </div>

              {/* 4 dword groups */}
              {[0, 1, 2, 3].map((dwOff) => {
                const dw = startDw + dwOff;
                const isActive = activeDword === dw;
                const isUsed = usedDwords.has(dw);
                const color = DWORD_COLORS[dw];

                return (
                  <div
                    key={dw}
                    className="flex gap-[2px] cursor-pointer rounded-md px-0.5 py-0.5 transition-all"
                    style={{
                      backgroundColor: isActive
                        ? color + "20"
                        : isUsed
                        ? color + "08"
                        : undefined,
                      outline: isActive
                        ? `2px solid ${color}`
                        : "2px solid transparent",
                    }}
                    onMouseEnter={() => setActiveDword(dw)}
                    onMouseLeave={() => setActiveDword(null)}
                    onClick={() =>
                      setActiveDword((prev) => (prev === dw ? null : dw))
                    }
                  >
                    {[0, 1, 2, 3].map((b) => {
                      const byteIdx = dw * 4 + b;
                      const val = entry.bytes[byteIdx];
                      const isNonZero = val !== 0;

                      return (
                        <div
                          key={b}
                          className="font-mono text-[11px] w-[22px] text-center rounded-sm transition-colors"
                          style={{
                            color: isActive || isUsed
                              ? isNonZero
                                ? color
                                : color + "80"
                              : isNonZero
                              ? "var(--color-text-primary)"
                              : "var(--color-text-muted)",
                            fontWeight: isNonZero ? 600 : 400,
                          }}
                        >
                          {val.toString(16).padStart(2, "0")}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Row dword labels */}
              <div className="text-text-muted font-mono text-[9px] flex-shrink-0 ml-1">
                CDW{startDw}–{startDw + 3}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dword detail panel */}
      {activeDword !== null && (
        <div
          className="mt-3 rounded-xl p-4 border transition-all"
          style={{
            backgroundColor: DWORD_COLORS[activeDword] + "08",
            borderColor: DWORD_COLORS[activeDword] + "30",
          }}
        >
          <div className="flex items-baseline gap-3 mb-1">
            <span
              className="font-mono font-bold text-sm"
              style={{ color: DWORD_COLORS[activeDword] }}
            >
              CDW{activeDword}
            </span>
            <span className="text-text-secondary text-xs">
              {SQ_DWORD_LABELS[activeDword]}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-text-muted font-mono mb-2">
            <span>
              Bytes {activeDword * 4}–{activeDword * 4 + 3}
            </span>
            <span>
              Offset 0x{(activeDword * 4).toString(16).padStart(2, "0")}
            </span>
            <span>
              Value: 0x{readDword(activeDword).toString(16).padStart(8, "0")}
            </span>
          </div>

          {fieldMap.has(activeDword) ? (
            <div className="space-y-1.5">
              {fieldMap.get(activeDword)!.map((f) => {
                const dwVal = readDword(f.dword);
                const mask =
                  ((1 << (f.bitEnd - f.bitStart + 1)) - 1) << f.bitStart;
                const fieldVal = (dwVal & mask) >>> f.bitStart;

                return (
                  <div key={f.name} className="text-xs">
                    <span
                      className="font-mono font-semibold"
                      style={{ color: DWORD_COLORS[activeDword] }}
                    >
                      {f.name}
                    </span>
                    <span className="text-text-muted font-mono">
                      {" "}
                      [{f.bitEnd}:{f.bitStart}]
                    </span>
                    <span className="text-text-muted"> = </span>
                    <span className="text-text-primary font-mono font-semibold">
                      {fieldVal}
                    </span>
                    <span className="text-text-secondary">
                      {" "}
                      — {f.description}
                    </span>
                    {f.values && f.values[fieldVal] && (
                      <span className="text-nvme-amber font-semibold">
                        {" "}
                        ({f.values[fieldVal]})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : activeDword === 0 ? (
            <div className="text-xs text-text-secondary">
              <span className="font-mono font-semibold" style={{ color: DWORD_COLORS[0] }}>
                OPC
              </span>
              <span className="text-text-muted font-mono"> [7:0]</span>
              <span className="text-text-muted"> = </span>
              <span className="text-text-primary font-mono font-semibold">
                0x{entry.bytes[0].toString(16).padStart(2, "0")}
              </span>
              <span className="text-text-secondary"> — Opcode ({command.name})</span>
              <br />
              <span className="font-mono font-semibold" style={{ color: DWORD_COLORS[0] }}>
                CID
              </span>
              <span className="text-text-muted font-mono"> [31:16]</span>
              <span className="text-text-muted"> = </span>
              <span className="text-text-primary font-mono font-semibold">
                {(entry.bytes[2] | (entry.bytes[3] << 8))}
              </span>
              <span className="text-text-secondary"> — Command Identifier</span>
            </div>
          ) : activeDword === 1 ? (
            <div className="text-xs text-text-secondary">
              <span className="font-mono font-semibold" style={{ color: DWORD_COLORS[1] }}>
                NSID
              </span>
              <span className="text-text-muted font-mono"> [31:0]</span>
              <span className="text-text-muted"> = </span>
              <span className="text-text-primary font-mono font-semibold">
                {readDword(1)}
              </span>
              <span className="text-text-secondary"> — Namespace Identifier</span>
            </div>
          ) : (
            <div className="text-xs text-text-muted italic">
              Reserved / unused by this command
            </div>
          )}
        </div>
      )}
    </div>
  );
}
