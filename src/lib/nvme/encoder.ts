import { NvmeCommand, SQEntry, FieldDefinition } from "./types";

export interface FieldValues {
  [fieldName: string]: number;
}

/**
 * Encode field values into the CDW dwords for a given command.
 * Returns a map of dword index -> 32-bit value.
 */
export function encodeFields(
  command: NvmeCommand,
  values: FieldValues
): Record<number, number> {
  const dwords: Record<number, number> = {};

  for (const field of command.fields) {
    const val = values[field.name] ?? 0;
    const mask = ((1 << (field.bitEnd - field.bitStart + 1)) - 1) << field.bitStart;
    const shifted = (val << field.bitStart) & mask;
    dwords[field.dword] = (dwords[field.dword] ?? 0) | shifted;
  }

  return dwords;
}

/**
 * Build a full 64-byte Submission Queue Entry from command + field values.
 */
export function buildSQEntry(
  command: NvmeCommand,
  values: FieldValues,
  nsid: number = 1,
  cid: number = 0
): SQEntry {
  const bytes = new Uint8Array(64);
  const view = new DataView(bytes.buffer);

  // CDW0: opcode (byte 0), flags (byte 1), CID (bytes 2-3)
  bytes[0] = command.opcode;
  bytes[1] = 0; // flags/fuse
  view.setUint16(2, cid, true); // little-endian

  // CDW1: NSID (bytes 4-7)
  view.setUint32(4, nsid, true);

  // CDW2-CDW3: Reserved (bytes 8-15)
  // CDW4-CDW5: Reserved (bytes 16-23)
  // CDW6-CDW7: MPTR (bytes 24-31)
  // CDW8-CDW9: PRP1 (bytes 32-39)

  // CDW10-CDW15: Command-specific (bytes 40-63)
  const encoded = encodeFields(command, values);
  for (let i = 10; i <= 15; i++) {
    const val = encoded[i] ?? 0;
    const offset = i * 4; // each dword is 4 bytes
    view.setUint32(offset, val, true);
  }

  return { bytes };
}

/**
 * Format SQ entry bytes as a hex dump string.
 */
export function formatHexDump(entry: SQEntry): string {
  const lines: string[] = [];
  for (let offset = 0; offset < 64; offset += 16) {
    const hex: string[] = [];
    const ascii: string[] = [];
    for (let i = 0; i < 16; i++) {
      const b = entry.bytes[offset + i];
      hex.push(b.toString(16).padStart(2, "0"));
      ascii.push(b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : ".");
    }
    const addr = offset.toString(16).padStart(4, "0");
    lines.push(`${addr}: ${hex.join(" ")}  |${ascii.join("")}|`);
  }
  return lines.join("\n");
}

/**
 * Generate a synthetic ftrace line from the built command.
 */
export function generateFtraceLine(
  command: NvmeCommand,
  values: FieldValues,
  nsid: number = 1,
  qid?: number
): string {
  const encoded = encodeFields(command, values);
  const effectiveQid = qid ?? (command.type === "admin" ? 0 : 1);

  const parts = [
    `qid=${effectiveQid}`,
    `cmdid=0`,
    `nsid=${nsid}`,
    `cdw10=0x${(encoded[10] ?? 0).toString(16).padStart(8, "0")}`,
    `cdw11=0x${(encoded[11] ?? 0).toString(16).padStart(8, "0")}`,
    `cdw12=0x${(encoded[12] ?? 0).toString(16).padStart(8, "0")}`,
    `cdw13=0x${(encoded[13] ?? 0).toString(16).padStart(8, "0")}`,
    `cdw14=0x${(encoded[14] ?? 0).toString(16).padStart(8, "0")}`,
    `cdw15=0x${(encoded[15] ?? 0).toString(16).padStart(8, "0")}`,
  ];

  return `   nvme-test-0     [000] ....  0.000000: nvme_setup_cmd: nvme0n1: ${parts.join(", ")}, opcode=0x${command.opcode.toString(16).padStart(2, "0")}`;
}

/**
 * Get the maximum valid value for a field.
 */
export function getFieldMaxValue(field: FieldDefinition): number {
  return (1 << (field.bitEnd - field.bitStart + 1)) - 1;
}
