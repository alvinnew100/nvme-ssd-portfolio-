export type CommandType = "admin" | "io";

export interface FieldDefinition {
  name: string;
  dword: number;
  bitStart: number;
  bitEnd: number;
  description: string;
  values?: Record<number, string>;
}

export interface NvmeCommand {
  id: string;
  name: string;
  opcode: number;
  type: CommandType;
  description: string;
  fields: FieldDefinition[];
  relatedCommands?: string[];
}

export interface DecodedField {
  name: string;
  value: number;
  hex: string;
  description: string;
  valueMeaning?: string;
}

export interface DecodedCommand {
  raw: string;
  commandName: string;
  commandId: string;
  opcode: number;
  type: CommandType;
  qid: number;
  nsid: number;
  cdw10: number;
  cdw11: number;
  cdw12: number;
  cdw13: number;
  cdw14: number;
  cdw15: number;
  fields: DecodedField[];
  slba?: bigint;
  metadata?: number;
}

export interface TraceLine {
  timestamp: string;
  process: string;
  cpu: number;
  flags: string;
  event: string;
  qid: number;
  cmdid: number;
  opcode: number;
  nsid: number;
  cdw10: number;
  cdw11: number;
  cdw12: number;
  cdw13: number;
  cdw14: number;
  cdw15: number;
  slba?: bigint;
  metadata?: number;
}

export interface SQEntry {
  bytes: Uint8Array; // 64 bytes
}

export interface Article {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  youtubeId: string;
  description: string;
  content: string;
}
