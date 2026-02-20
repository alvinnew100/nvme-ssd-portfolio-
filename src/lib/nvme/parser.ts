import { TraceLine } from "./types";

// Regex patterns for ftrace NVMe lines
// Format: <process>-<pid> [<cpu>] <flags> <timestamp>: nvme_setup_cmd: nvme0n1: qid=<qid>, cmdid=<cmdid>, nsid=<nsid>, ...
const FTRACE_LINE_REGEX =
  /^\s*(.+?)-(\d+)\s+\[(\d+)\]\s+([^\s]+)\s+([\d.]+):\s+nvme_(setup|complete)_cmd:\s+\w+:\s+(.*)/;

const KV_REGEX = /(\w+)=(0x[0-9a-fA-F]+|\d+)/g;

export interface ParsedTraceLine {
  process: string;
  pid: number;
  cpu: number;
  flags: string;
  timestamp: string;
  event: "setup" | "complete";
  device: string;
  params: Record<string, number>;
  raw: string;
}

export function parseTraceLine(line: string): ParsedTraceLine | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const match = trimmed.match(FTRACE_LINE_REGEX);
  if (!match) return null;

  const [, process, , cpu, flags, timestamp, event, rest] = match;

  const params: Record<string, number> = {};
  let kvMatch;
  KV_REGEX.lastIndex = 0;
  while ((kvMatch = KV_REGEX.exec(rest)) !== null) {
    const key = kvMatch[1];
    const val = kvMatch[2];
    params[key] = val.startsWith("0x") ? parseInt(val, 16) : parseInt(val, 10);
  }

  return {
    process,
    pid: parseInt(match[2], 10),
    cpu: parseInt(cpu, 10),
    flags,
    timestamp,
    event: event as "setup" | "complete",
    device: "",
    params,
    raw: trimmed,
  };
}

export function parsedToTraceLine(parsed: ParsedTraceLine): TraceLine {
  return {
    timestamp: parsed.timestamp,
    process: parsed.process,
    cpu: parsed.cpu,
    flags: parsed.flags,
    event: `nvme_${parsed.event}_cmd`,
    qid: parsed.params.qid ?? 0,
    cmdid: parsed.params.cmdid ?? 0,
    opcode: parsed.params.opcode ?? 0,
    nsid: parsed.params.nsid ?? 0,
    cdw10: parsed.params.cdw10 ?? 0,
    cdw11: parsed.params.cdw11 ?? 0,
    cdw12: parsed.params.cdw12 ?? 0,
    cdw13: parsed.params.cdw13 ?? 0,
    cdw14: parsed.params.cdw14 ?? 0,
    cdw15: parsed.params.cdw15 ?? 0,
  };
}

export function parseTraceText(text: string): ParsedTraceLine[] {
  return text
    .split("\n")
    .map(parseTraceLine)
    .filter((l): l is ParsedTraceLine => l !== null);
}
