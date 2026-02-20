"use client";

import dynamic from "next/dynamic";
import { useCommandBuilder } from "@/hooks/useCommandBuilder";
import { generateCliCommand } from "@/lib/nvme/cli-generator";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import SectionWrapper from "@/components/story/SectionWrapper";

const DwordFieldTable = dynamic(
  () => import("@/components/commands/DwordFieldTable"),
  { ssr: false }
);

interface CommandBuilderEmbedProps {
  presetId: string;
  presetNsid?: number;
  presetFields?: Record<string, number>;
  title?: string;
  description?: string;
}

export default function CommandBuilderEmbed({
  presetId,
  presetNsid = 1,
  presetFields = {},
  title,
  description,
}: CommandBuilderEmbedProps) {
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
    loadPreset,
  } = useCommandBuilder();

  const isLoaded = selectedId === presetId;

  const handleLoad = () => {
    loadPreset(presetId, presetNsid, presetFields);
  };

  const cliResult = selectedCommand
    ? generateCliCommand(selectedCommand, fieldValues, nsid)
    : null;

  return (
    <SectionWrapper className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h4 className="text-xl font-bold text-text-primary mb-2">
            {title}
          </h4>
        )}
        {description && (
          <p className="text-text-secondary mb-4 text-sm">{description}</p>
        )}

        {!isLoaded ? (
          <button
            onClick={handleLoad}
            className="px-6 py-3 bg-nvme-green/10 border border-nvme-green/40 rounded-xl text-nvme-green font-mono text-sm hover:bg-nvme-green/20 transition-colors"
          >
            Load {commands.find((c) => c.id === presetId)?.name ?? presetId} preset
          </button>
        ) : selectedCommand ? (
          <div className="bg-story-panel rounded-xl border border-story-border p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-nvme-green font-mono font-bold">
                  {selectedCommand.name}
                </span>
                <code className="text-text-code text-xs">
                  opcode=0x{selectedCommand.opcode.toString(16).padStart(2, "0")}
                </code>
              </div>
              <p className="text-text-muted text-xs">
                {selectedCommand.description}
              </p>
            </div>

            {/* Field editor */}
            {selectedCommand.fields.length > 0 && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  Fields — edit values below
                </div>
                <div className="space-y-2">
                  {selectedCommand.fields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center gap-3 text-xs"
                    >
                      <label className="text-nvme-green font-mono w-20 flex-shrink-0">
                        {field.name}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={(1 << (field.bitEnd - field.bitStart + 1)) - 1}
                        value={fieldValues[field.name] ?? 0}
                        onChange={(e) =>
                          setFieldValue(field.name, parseInt(e.target.value) || 0)
                        }
                        className="w-24 bg-story-bg border border-story-border rounded px-2 py-1 text-text-primary font-mono text-xs"
                      />
                      <span className="text-text-muted">
                        CDW{field.dword} [{field.bitEnd}:{field.bitStart}]
                      </span>
                      <span className="text-text-secondary hidden sm:inline">
                        {field.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLI command */}
            {cliResult && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  Terminal Command
                </div>
                {cliResult.isKernelOnly ? (
                  <div className="text-text-muted text-xs italic bg-story-bg rounded p-3">
                    {cliResult.note}
                  </div>
                ) : cliResult.command ? (
                  <NvmeCliBlock command={cliResult.command} />
                ) : null}
              </div>
            )}

            {/* Hex dump */}
            {hexDump && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  64-Byte SQ Entry (Hex)
                </div>
                <pre className="text-text-code text-[11px] bg-story-bg rounded-lg p-4 overflow-x-auto">
                  {hexDump}
                </pre>
              </div>
            )}

            {/* ftrace */}
            {ftraceLine && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  ftrace Output
                </div>
                <pre className="text-nvme-green text-[10px] bg-story-bg rounded-lg p-4 overflow-x-auto">
                  {ftraceLine}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </SectionWrapper>
  );
}
