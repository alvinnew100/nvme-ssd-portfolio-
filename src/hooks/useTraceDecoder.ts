"use client";

import { useState, useCallback } from "react";
import { parseTraceText } from "@/lib/nvme/parser";
import { decodeTraceLines } from "@/lib/nvme/decoder";
import { DecodedCommand } from "@/lib/nvme/types";

export function useTraceDecoder() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<DecodedCommand[]>([]);
  const [error, setError] = useState<string | null>(null);

  const decode = useCallback((text: string) => {
    setInput(text);
    setError(null);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    try {
      const parsed = parseTraceText(text);
      if (parsed.length === 0) {
        setError(
          "No valid NVMe ftrace lines found. Expected format: nvme_setup_cmd or nvme_complete_cmd events."
        );
        setResults([]);
        return;
      }
      const decoded = decodeTraceLines(parsed);
      setResults(decoded);
    } catch (e) {
      setError(`Decode error: ${e instanceof Error ? e.message : String(e)}`);
      setResults([]);
    }
  }, []);

  const clear = useCallback(() => {
    setInput("");
    setResults([]);
    setError(null);
  }, []);

  return { input, results, error, decode, clear };
}
