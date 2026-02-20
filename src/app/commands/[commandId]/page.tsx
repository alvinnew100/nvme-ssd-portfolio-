import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCommands, findCommandById } from "@/lib/nvme/decoder";
import SQEntryVisualizer from "@/components/commands/SQEntryVisualizer";
import DwordFieldTable from "@/components/commands/DwordFieldTable";

interface Props {
  params: Promise<{ commandId: string }>;
}

export async function generateStaticParams() {
  return getAllCommands().map((cmd) => ({ commandId: cmd.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { commandId } = await params;
  const command = findCommandById(commandId);
  if (!command) return { title: "Command Not Found" };
  return {
    title: `${command.name} (0x${command.opcode.toString(16).padStart(2, "0")}) — NVMe ${command.type === "admin" ? "Admin" : "I/O"} Command`,
    description: command.description,
  };
}

export default async function CommandDetailPage({ params }: Props) {
  const { commandId } = await params;
  const command = findCommandById(commandId);
  if (!command) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link
          href="/commands"
          className="text-gray-500 hover:text-nvme-accent transition-colors"
          prefetch={false}
        >
          Commands
        </Link>
        <span className="text-gray-600 mx-2">/</span>
        <span className="text-gray-300">{command.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-2xl text-nvme-accent">
            0x{command.opcode.toString(16).padStart(2, "0")}
          </span>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              command.type === "admin"
                ? "bg-blue-900/50 text-blue-300"
                : "bg-emerald-900/50 text-emerald-300"
            }`}
          >
            {command.type === "admin" ? "Admin Command (qid=0)" : "I/O Command (qid!=0)"}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{command.name}</h1>
        <p className="text-gray-300 text-lg">{command.description}</p>
      </div>

      {/* Field Table */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">
          Command-Specific Fields
        </h2>
        <div className="bg-nvme-dark rounded-xl p-4 border border-gray-800">
          <DwordFieldTable fields={command.fields} />
        </div>
      </section>

      {/* SQ Entry Visualizer */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">
          SQ Entry Layout (64 Bytes)
        </h2>
        <div className="bg-nvme-dark rounded-xl p-4 border border-gray-800">
          <SQEntryVisualizer command={command} />
        </div>
      </section>

      {/* Command quick facts */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Quick Facts</h2>
        <div className="bg-nvme-dark rounded-xl p-4 border border-gray-800">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Opcode</dt>
              <dd className="text-white font-mono">
                0x{command.opcode.toString(16).padStart(2, "0")} ({command.opcode})
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="text-white">
                {command.type === "admin" ? "Admin" : "I/O"} Command
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Queue</dt>
              <dd className="text-white">
                {command.type === "admin"
                  ? "Admin SQ (qid=0)"
                  : "I/O SQ (qid >= 1)"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Fields</dt>
              <dd className="text-white">{command.fields.length} command-specific fields</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Related commands */}
      {command.relatedCommands && command.relatedCommands.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">
            Related Commands
          </h2>
          <div className="flex flex-wrap gap-3">
            {command.relatedCommands.map((relId) => {
              const rel = findCommandById(relId);
              if (!rel) return null;
              return (
                <Link
                  key={relId}
                  href={`/commands/${relId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-nvme-dark rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
                  prefetch={false}
                >
                  <span className="font-mono text-xs text-nvme-accent">
                    0x{rel.opcode.toString(16).padStart(2, "0")}
                  </span>
                  <span className="text-gray-300 text-sm">{rel.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Try in builder */}
      <section className="bg-nvme-dark rounded-xl p-6 border border-gray-800 text-center">
        <h2 className="text-lg font-bold text-white mb-2">
          Try This Command
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Build this command interactively and see the raw bytes.
        </p>
        <Link
          href={`/command-builder?cmd=${command.id}`}
          className="inline-flex items-center px-4 py-2 bg-nvme-accent text-nvme-darker font-semibold rounded-lg hover:bg-nvme-accent/90 transition-colors text-sm"
          prefetch={false}
        >
          Open in Command Builder
        </Link>
      </section>
    </div>
  );
}
