"use client";

import { NvmeCommand } from "@/lib/nvme/types";
import { DWORD_COLORS, SQ_DWORD_LABELS } from "@/lib/nvme/constants";

interface SQEntryVisualizerProps {
  command: NvmeCommand;
}

export default function SQEntryVisualizer({ command }: SQEntryVisualizerProps) {
  const cellW = 80;
  const cellH = 36;
  const cols = 4; // 4 bytes per row
  const rows = 16; // 16 dwords
  const labelW = 180;
  const padX = 10;
  const padY = 30;
  const width = labelW + cols * cellW + padX * 2;
  const height = rows * cellH + padY * 2;

  // Build a map of which dwords have fields
  const fieldDwords = new Set<number>();
  for (const f of command.fields) {
    fieldDwords.add(f.dword);
  }

  // Always highlight CDW0 (opcode) and CDW1 (NSID)
  fieldDwords.add(0);
  fieldDwords.add(1);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl">
        {/* Title */}
        <text
          x={width / 2}
          y={18}
          textAnchor="middle"
          className="fill-text-secondary text-[11px] font-semibold"
        >
          64-Byte Submission Queue Entry — {command.name}
        </text>

        {/* Column headers */}
        {Array.from({ length: cols }).map((_, c) => (
          <text
            key={c}
            x={labelW + padX + c * cellW + cellW / 2}
            y={padY - 4}
            textAnchor="middle"
            className="fill-text-muted text-[9px]"
          >
            Byte {c}
          </text>
        ))}

        {/* Dword rows */}
        {Array.from({ length: rows }).map((_, dw) => {
          const y = padY + dw * cellH;
          const hasField = fieldDwords.has(dw);
          const color = DWORD_COLORS[dw];

          return (
            <g key={dw}>
              {/* Label */}
              <text
                x={padX}
                y={y + cellH / 2 + 4}
                className="fill-text-muted text-[9px]"
              >
                CDW{dw}: {SQ_DWORD_LABELS[dw]}
              </text>

              {/* Cells */}
              {Array.from({ length: cols }).map((_, c) => {
                const byteOffset = dw * 4 + c;
                const x = labelW + padX + c * cellW;
                return (
                  <g key={c}>
                    <rect
                      x={x}
                      y={y}
                      width={cellW}
                      height={cellH}
                      fill={hasField ? color + "15" : "#f5f2ed"}
                      stroke={hasField ? color : "#ddd6ca"}
                      strokeWidth={hasField ? 1.5 : 0.5}
                      rx={3}
                    />
                    <text
                      x={x + cellW / 2}
                      y={y + cellH / 2 + 4}
                      textAnchor="middle"
                      className="fill-text-secondary text-[9px] font-mono"
                    >
                      [{byteOffset}]
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend for fields */}
        {command.fields.length > 0 && (
          <g>
            {command.fields.slice(0, 8).map((f, i) => {
              const color = DWORD_COLORS[f.dword];
              const lx = padX;
              const ly = padY + rows * cellH + 14 + i * 14;
              return (
                <g key={f.name}>
                  <rect
                    x={lx}
                    y={ly - 8}
                    width={10}
                    height={10}
                    fill={color + "40"}
                    stroke={color}
                    strokeWidth={1}
                    rx={2}
                  />
                  <text x={lx + 14} y={ly} className="fill-text-muted text-[8px]">
                    CDW{f.dword}[{f.bitEnd}:{f.bitStart}] — {f.name}: {f.description}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
