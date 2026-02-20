import { NvmeCommand, DecodedCommand, DecodedField, CommandType } from "./types";
import { ParsedTraceLine, parsedToTraceLine } from "./parser";
import { adminCommands } from "./admin-commands";
import { ioCommands } from "./io-commands";
import { FEATURE_IDS, LOG_PAGE_IDS } from "./constants";

const allCommands: NvmeCommand[] = [...adminCommands, ...ioCommands];

export function findCommand(
  opcode: number,
  qid: number
): NvmeCommand | undefined {
  const type: CommandType = qid === 0 ? "admin" : "io";
  return allCommands.find((c) => c.opcode === opcode && c.type === type);
}

export function findCommandById(id: string): NvmeCommand | undefined {
  return allCommands.find((c) => c.id === id);
}

export function getAllCommands(): NvmeCommand[] {
  return allCommands;
}

export function getAdminCommands(): NvmeCommand[] {
  return adminCommands;
}

export function getIOCommands(): NvmeCommand[] {
  return ioCommands;
}

function extractFieldValue(
  cdwords: Record<number, number>,
  bitStart: number,
  bitEnd: number,
  dword: number
): number {
  const cdw = cdwords[dword] ?? 0;
  const mask = ((1 << (bitEnd - bitStart + 1)) - 1) << bitStart;
  return (cdw & mask) >>> bitStart;
}

function getSpecialMeaning(
  commandId: string,
  fieldName: string,
  value: number
): string | undefined {
  // Special lookups for well-known fields
  if (
    (commandId === "admin-get-features" ||
      commandId === "admin-set-features") &&
    fieldName === "FID"
  ) {
    return FEATURE_IDS[value];
  }
  if (commandId === "admin-get-log-page" && fieldName === "LID") {
    return LOG_PAGE_IDS[value];
  }
  return undefined;
}

export function decodeTraceLine(parsed: ParsedTraceLine): DecodedCommand | null {
  const tl = parsedToTraceLine(parsed);
  const cmd = findCommand(tl.opcode, tl.qid);

  if (!cmd) {
    return {
      raw: parsed.raw,
      commandName: `Unknown (opcode=0x${tl.opcode.toString(16).padStart(2, "0")})`,
      commandId: "",
      opcode: tl.opcode,
      type: tl.qid === 0 ? "admin" : "io",
      qid: tl.qid,
      nsid: tl.nsid,
      cdw10: tl.cdw10,
      cdw11: tl.cdw11,
      cdw12: tl.cdw12,
      cdw13: tl.cdw13,
      cdw14: tl.cdw14,
      cdw15: tl.cdw15,
      fields: [],
    };
  }

  const cdwords: Record<number, number> = {
    10: tl.cdw10,
    11: tl.cdw11,
    12: tl.cdw12,
    13: tl.cdw13,
    14: tl.cdw14,
    15: tl.cdw15,
  };

  const fields: DecodedField[] = cmd.fields.map((f) => {
    const value = extractFieldValue(cdwords, f.bitStart, f.bitEnd, f.dword);
    const hex = `0x${value.toString(16)}`;
    const valueMeaning =
      f.values?.[value] ?? getSpecialMeaning(cmd.id, f.name, value);

    return {
      name: f.name,
      value,
      hex,
      description: f.description,
      valueMeaning,
    };
  });

  return {
    raw: parsed.raw,
    commandName: cmd.name,
    commandId: cmd.id,
    opcode: cmd.opcode,
    type: cmd.type,
    qid: tl.qid,
    nsid: tl.nsid,
    cdw10: tl.cdw10,
    cdw11: tl.cdw11,
    cdw12: tl.cdw12,
    cdw13: tl.cdw13,
    cdw14: tl.cdw14,
    cdw15: tl.cdw15,
    fields,
  };
}

export function decodeTraceLines(
  lines: ParsedTraceLine[]
): DecodedCommand[] {
  return lines.map(decodeTraceLine).filter((d): d is DecodedCommand => d !== null);
}
