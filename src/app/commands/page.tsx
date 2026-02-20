import { Metadata } from "next";
import Link from "next/link";
import { getAllCommands } from "@/lib/nvme/decoder";
import CommandList from "@/components/commands/CommandList";

export const metadata: Metadata = {
  title: "NVMe Command Reference — All 38 Commands",
  description:
    "Complete NVMe command reference with all 26 admin commands and 12 I/O commands. Searchable, filterable, with field-level details.",
};

const chapters = [
  {
    title: "Setting the Stage",
    story: "Before any data can flow, the host and controller need to establish communication channels. These queue management commands create the circular buffers that carry all subsequent commands and completions.",
    commandIds: ["admin-create-cq", "admin-create-sq", "admin-delete-cq", "admin-delete-sq"],
  },
  {
    title: "Meeting the Drive",
    story: "With queues in place, the host discovers what the drive can do. Identify reveals the hardware, while Get/Set Features configures behavior — how many queues, power states, cache policy, and more.",
    commandIds: ["admin-identify", "admin-get-features", "admin-set-features", "admin-get-log-page", "admin-abort", "admin-async-event"],
  },
  {
    title: "Reading & Writing",
    story: "The core of NVMe — moving data between host memory and NAND flash. Each command specifies an LBA range and goes through the SQ/CQ pipeline. Flush ensures durability; Compare verifies without transferring.",
    commandIds: ["io-read", "io-write", "io-flush", "io-compare", "io-write-zeroes", "io-write-uncorrectable"],
  },
  {
    title: "Housekeeping",
    story: "SSDs need maintenance. TRIM tells the controller which blocks are free. Format wipes a namespace. Sanitize cryptographically destroys all data. These keep the drive healthy and performant.",
    commandIds: ["io-dataset-mgmt", "admin-format-nvm", "admin-sanitize", "admin-ns-mgmt", "admin-ns-attach", "admin-get-lba-status"],
  },
  {
    title: "Health & Monitoring",
    story: "Keeping an eye on drive health. Self-test runs diagnostics, Keep Alive prevents timeout, and log pages expose SMART data, error counts, and firmware status.",
    commandIds: ["admin-self-test", "admin-keep-alive", "io-verify"],
  },
  {
    title: "Advanced Operations",
    story: "Power-user territory — firmware updates, security protocols, NVMe reservations for shared storage, directives for stream optimization, virtualization management, and shadow doorbells for performance.",
    commandIds: [
      "admin-fw-download", "admin-fw-commit",
      "admin-security-send", "admin-security-recv",
      "io-reservation-register", "io-reservation-report", "io-reservation-acquire", "io-reservation-release",
      "admin-directive-send", "admin-directive-recv",
      "admin-virt-mgmt", "admin-doorbell-buf",
    ],
  },
];

export default function CommandsPage() {
  const commands = getAllCommands();

  const commandMap = new Map(commands.map((c) => [c.id, c]));

  // Commands not in any chapter (fallback)
  const chapteredIds = new Set(chapters.flatMap((ch) => ch.commandIds));
  const unchapteredCommands = commands.filter((c) => !chapteredIds.has(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-warm-50 mb-4">
          NVMe Command Reference
        </h1>
        <p className="text-warm-400 max-w-3xl">
          All 38 NVMe commands, organized as a journey from first contact to advanced operations.
          Search for a specific command, or scroll through the story of how NVMe works.
        </p>
      </div>

      {/* Search/filter for power users */}
      <details className="mb-12 bg-nvme-dark rounded-xl border border-warm-800">
        <summary className="px-6 py-4 text-sm text-warm-300 cursor-pointer hover:text-warm-50 transition-colors font-medium">
          Search & Filter All Commands
        </summary>
        <div className="px-6 pb-6">
          <CommandList commands={commands} />
        </div>
      </details>

      {/* Timeline chapters */}
      <div className="space-y-16">
        {chapters.map((chapter, chapterIdx) => {
          const chapterCommands = chapter.commandIds
            .map((id) => commandMap.get(id))
            .filter(Boolean);

          return (
            <section key={chapter.title}>
              {/* Chapter header */}
              <div className="flex items-start gap-6 mb-8">
                <div className="hidden sm:flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-nvme-accent/20 text-nvme-accent flex items-center justify-center text-lg font-bold border border-nvme-accent/30">
                    {chapterIdx + 1}
                  </div>
                  {chapterIdx < chapters.length - 1 && (
                    <div className="w-px h-8 bg-warm-800 mt-2" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-warm-50 mb-2">
                    <span className="text-nvme-accent sm:hidden mr-2">{chapterIdx + 1}.</span>
                    {chapter.title}
                  </h2>
                  <p className="text-warm-400 max-w-2xl">{chapter.story}</p>
                </div>
              </div>

              {/* Command cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:ml-16">
                {chapterCommands.map((cmd) => {
                  if (!cmd) return null;
                  return (
                    <Link
                      key={cmd.id}
                      href={`/commands/${cmd.id}`}
                      className="group block p-4 rounded-lg border border-warm-800 hover:border-warm-600 bg-nvme-dark/50 hover:bg-nvme-dark transition-all"
                      prefetch={false}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-mono text-sm text-nvme-accent">
                          0x{cmd.opcode.toString(16).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            cmd.type === "admin"
                              ? "bg-nvme-blue/20 text-nvme-accent"
                              : "bg-nvme-green/20 text-nvme-green"
                          }`}
                        >
                          {cmd.type === "admin" ? "Admin" : "I/O"}
                        </span>
                      </div>
                      <h3 className="text-warm-50 font-semibold group-hover:text-nvme-accent transition-colors mb-1">
                        {cmd.name}
                      </h3>
                      <p className="text-warm-500 text-xs line-clamp-2">
                        {cmd.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Any uncategorized commands */}
        {unchapteredCommands.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-warm-50 mb-2">Other Commands</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unchapteredCommands.map((cmd) => (
                <Link
                  key={cmd.id}
                  href={`/commands/${cmd.id}`}
                  className="group block p-4 rounded-lg border border-warm-800 hover:border-warm-600 bg-nvme-dark/50 hover:bg-nvme-dark transition-all"
                  prefetch={false}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-sm text-nvme-accent">
                      0x{cmd.opcode.toString(16).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        cmd.type === "admin"
                          ? "bg-nvme-blue/20 text-nvme-accent"
                          : "bg-nvme-green/20 text-nvme-green"
                      }`}
                    >
                      {cmd.type === "admin" ? "Admin" : "I/O"}
                    </span>
                  </div>
                  <h3 className="text-warm-50 font-semibold group-hover:text-nvme-accent transition-colors mb-1">
                    {cmd.name}
                  </h3>
                  <p className="text-warm-500 text-xs line-clamp-2">
                    {cmd.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
