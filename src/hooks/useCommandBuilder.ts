"use client";

import { useState, useCallback, useMemo } from "react";
import { NvmeCommand, SQEntry, DecodedCommand } from "@/lib/nvme/types";
import {
  FieldValues,
  buildSQEntry,
  formatHexDump,
  generateFtraceLine,
  encodeFields,
} from "@/lib/nvme/encoder";
import { parseTraceText } from "@/lib/nvme/parser";
import { decodeTraceLines } from "@/lib/nvme/decoder";
import { getAllCommands } from "@/lib/nvme/decoder";

export function useCommandBuilder() {
  const commands = useMemo(() => getAllCommands(), []);
  const [selectedId, setSelectedId] = useState<string>(commands[0]?.id ?? "");
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [nsid, setNsid] = useState(1);

  const selectedCommand = useMemo(
    () => commands.find((c) => c.id === selectedId) ?? null,
    [commands, selectedId]
  );

  const selectCommand = useCallback(
    (id: string) => {
      setSelectedId(id);
      setFieldValues({});
    },
    []
  );

  const setFieldValue = useCallback((name: string, value: number) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const sqEntry: SQEntry | null = useMemo(() => {
    if (!selectedCommand) return null;
    return buildSQEntry(selectedCommand, fieldValues, nsid);
  }, [selectedCommand, fieldValues, nsid]);

  const hexDump: string = useMemo(() => {
    if (!sqEntry) return "";
    return formatHexDump(sqEntry);
  }, [sqEntry]);

  const ftraceLine: string = useMemo(() => {
    if (!selectedCommand) return "";
    return generateFtraceLine(selectedCommand, fieldValues, nsid);
  }, [selectedCommand, fieldValues, nsid]);

  const roundTripDecode: DecodedCommand | null = useMemo(() => {
    if (!ftraceLine) return null;
    const parsed = parseTraceText(ftraceLine);
    const decoded = decodeTraceLines(parsed);
    return decoded[0] ?? null;
  }, [ftraceLine]);

  const encodedDwords: Record<number, number> = useMemo(() => {
    if (!selectedCommand) return {};
    return encodeFields(selectedCommand, fieldValues);
  }, [selectedCommand, fieldValues]);

  return {
    commands,
    selectedCommand,
    selectedId,
    selectCommand,
    fieldValues,
    setFieldValue,
    nsid,
    setNsid,
    sqEntry,
    hexDump,
    ftraceLine,
    roundTripDecode,
    encodedDwords,
  };
}
