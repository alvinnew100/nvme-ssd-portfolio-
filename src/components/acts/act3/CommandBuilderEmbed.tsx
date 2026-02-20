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

  const handleReset = () => {
    selectCommand("");
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
            className="px-6 py-3 bg-nvme-blue/5 border border-nvme-blue/30 rounded-xl text-nvme-blue font-mono text-sm hover:bg-nvme-blue/10 hover:border-nvme-blue/50 transition-all"
          >
            Load {commands.find((c) => c.id === presetId)?.name ?? presetId} preset
          </button>
        ) : selectedCommand ? (
          <div className="bg-white rounded-2xl p-6 card-shadow space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-nvme-blue font-mono font-bold">
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
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-text-muted bg-story-surface rounded-lg hover:bg-story-border transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Field editor */}
            {selectedCommand.fields.length > 0 && (
              <div>
                <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
                  Fields &mdash; edit values below
                </div>
                <div className="space-y-2">
                  {selectedCommand.fields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center gap-3 text-xs"
                    >
                      <label className="text-nvme-blue font-mono w-20 flex-shrink-0">
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
                        className="w-24 bg-story-surface border border-story-border rounded-lg px-2 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-nvme-blue"
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
                  <div className="text-text-muted text-xs italic bg-story-surface rounded-lg p-3">
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
                <pre className="text-text-code text-[11px] bg-story-surface rounded-lg p-4 overflow-x-auto font-mono">
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
                <pre className="text-nvme-green text-[10px] bg-story-surface rounded-lg p-4 overflow-x-auto font-mono">
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
