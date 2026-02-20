import { Metadata } from "next";
import CommandList from "@/components/commands/CommandList";
import { getAllCommands } from "@/lib/nvme/decoder";

export const metadata: Metadata = {
  title: "NVMe Command Reference — All 38 Commands",
  description:
    "Complete NVMe command reference with all 26 admin commands and 12 I/O commands. Searchable, filterable, with field-level details.",
};

export default function CommandsPage() {
  const commands = getAllCommands();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          NVMe Command Reference
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Complete reference for all 38 NVMe commands defined in the NVMe Base
          Specification. Each command page shows the opcode, dword fields with
          bit ranges, and an interactive 64-byte SQ entry visualizer.
        </p>
      </div>

      <CommandList commands={commands} />
    </div>
  );
}
