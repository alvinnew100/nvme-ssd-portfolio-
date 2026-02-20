"use client";

import { useState, useMemo } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { getAllCommands } from "@/lib/nvme/decoder";
import { generateCliCommand } from "@/lib/nvme/cli-generator";
import { useStory } from "@/context/StoryContext";
import dynamic from "next/dynamic";

const DwordFieldTable = dynamic(
  () => import("@/components/commands/DwordFieldTable"),
  { ssr: false }
);
const SQEntryVisualizer = dynamic(
  () => import("@/components/commands/SQEntryVisualizer"),
  { ssr: false }
);

export default function CommandAccordion() {
  const commands = useMemo(() => getAllCommands(), []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "io">("all");
  const { scrollToPlayground } = useStory();

  const filtered = useMemo(() => {
    return commands.filter((cmd) => {
      if (filter !== "all" && cmd.type !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          cmd.name.toLowerCase().includes(q) ||
          cmd.id.toLowerCase().includes(q) ||
          `0x${cmd.opcode.toString(16)}`.includes(q)
        );
      }
      return true;
    });
  }, [commands, search, filter]);

  return (
    <div className="py-20 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          All 38 NVMe Commands
        </h3>
        <p className="text-text-secondary mb-6 text-sm">
          Searchable reference for every admin and I/O command in the NVMe
          specification. Expand any command to see its fields, SQ entry layout,
          and nvme-cli equivalent.
        </p>

        {/* Search and filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, ID, or opcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-story-bg border border-story-border rounded-lg px-4 py-2 text-text-primary text-sm font-mono placeholder:text-text-muted"
          />
          <div className="flex gap-1">
            {(["all", "admin", "io"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
                  filter === f
                    ? "bg-nvme-green/20 text-nvme-green border border-nvme-green/40"
                    : "bg-story-panel border border-story-border text-text-muted hover:text-text-secondary"
                }`}
              >
                {f === "all" ? "All" : f === "admin" ? "Admin (26)" : "I/O (12)"}
              </button>
            ))}
          </div>
        </div>

        <div className="text-text-muted text-xs mb-4 font-mono">
          {filtered.length} command{filtered.length !== 1 ? "s" : ""}
        </div>

        <Accordion.Root type="multiple" className="space-y-2">
          {filtered.map((cmd) => {
            const cliResult = generateCliCommand(cmd, {});
            return (
              <Accordion.Item
                key={cmd.id}
                value={cmd.id}
                className="bg-story-panel rounded-xl border border-story-border overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-story-surface/50 transition-colors group">
                    <code className="text-text-code text-xs font-mono flex-shrink-0">
                      0x{cmd.opcode.toString(16).padStart(2, "0")}
                    </code>
                    <span className="text-text-primary font-semibold text-sm flex-1">
                      {cmd.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        cmd.type === "admin"
                          ? "bg-nvme-violet/10 text-nvme-violet"
                          : "bg-nvme-blue/10 text-nvme-blue"
                      }`}
                    >
                      {cmd.type}
                    </span>
                    <svg
                      className="w-4 h-4 text-text-muted transition-transform group-data-[state=open]:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="accordion-content overflow-hidden">
                  <div className="px-5 pb-5 space-y-4 border-t border-story-border pt-4">
                    <p className="text-text-secondary text-sm">
                      {cmd.description}
                    </p>

                    {/* nvme-cli equivalent */}
                    {cliResult.isKernelOnly ? (
                      <div className="text-text-muted text-xs italic bg-story-bg rounded p-3 font-mono">
                        {cliResult.note}
                      </div>
                    ) : cliResult.command ? (
                      <div className="bg-story-bg rounded-lg p-3 font-mono text-xs">
                        <span className="text-nvme-green select-none">$ </span>
                        <span className="text-text-code">{cliResult.command}</span>
                      </div>
                    ) : null}

                    {cmd.fields.length > 0 && (
                      <>
                        <DwordFieldTable fields={cmd.fields} />
                        <SQEntryVisualizer command={cmd} />
                      </>
                    )}

                    <button
                      onClick={() => scrollToPlayground(cmd.id)}
                      className="text-xs text-nvme-green hover:underline font-mono"
                    >
                      Try it in Playground &rarr;
                    </button>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion.Root>
      </div>
    </div>
  );
}
