import Link from "next/link";

const features = [
  {
    title: "Command Reference",
    description:
      "Complete reference for all 38 NVMe commands — 26 admin and 12 I/O — with field-level details and interactive SQ entry visualizer.",
    href: "/commands",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
      </svg>
    ),
    color: "text-blue-400",
    bg: "bg-blue-900/20",
  },
  {
    title: "Ftrace Decoder",
    description:
      "Paste Linux ftrace output and instantly decode NVMe commands. See opcode, fields, and values with syntax highlighting.",
    href: "/trace-decoder",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
      </svg>
    ),
    color: "text-emerald-400",
    bg: "bg-emerald-900/20",
  },
  {
    title: "Command Builder",
    description:
      "Select any NVMe command, fill in fields, and see the raw 64-byte SQ entry, hex dump, and synthetic ftrace output in real time.",
    href: "/command-builder",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M22 9V7h-2V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2zM18 19H4V5h14v14zM6 13h5v4H6v-4zm6-6h4v3h-4V7zM6 7h5v5H6V7zm6 4h4v6h-4v-6z" />
      </svg>
    ),
    color: "text-purple-400",
    bg: "bg-purple-900/20",
  },
  {
    title: "Architecture",
    description:
      "Interactive diagrams of the NVMe architecture — host-controller-NAND stack, SQ/CQ mechanics, PCIe BAR layout, and FTL concepts.",
    href: "/architecture",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM12 22.08L5 17.9V8.73L12 4l7 4.73v9.17l-7 4.18z" />
      </svg>
    ),
    color: "text-amber-400",
    bg: "bg-amber-900/20",
  },
  {
    title: "Articles",
    description:
      "In-depth articles covering SSD fundamentals, NVMe internals, firmware concepts, and flash memory technology.",
    href: "/articles",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M19 5v14H5V5h14m0-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
    color: "text-cyan-400",
    bg: "bg-cyan-900/20",
  },
];

const stats = [
  { label: "Admin Commands", value: "26" },
  { label: "I/O Commands", value: "12" },
  { label: "Total Commands", value: "38" },
  { label: "Dword Fields", value: "150+" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-nvme-blue/20 via-nvme-darker to-nvme-darker" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              NVMe{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nvme-accent to-blue-400">
                Explorer
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Interactive NVMe command reference, ftrace decoder, and
              architecture visualizer
            </p>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
              A comprehensive tool for understanding NVMe at the register level.
              Decode ftrace output, build commands byte-by-byte, and explore the
              NVMe specification interactively.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/commands"
                className="inline-flex items-center justify-center px-6 py-3 bg-nvme-accent text-nvme-darker font-semibold rounded-lg hover:bg-nvme-accent/90 transition-colors"
                prefetch={false}
              >
                Explore Commands
              </Link>
              <Link
                href="/trace-decoder"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-nvme-gray transition-colors"
                prefetch={false}
              >
                Try Ftrace Decoder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-nvme-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-nvme-accent">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Tools &amp; Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group block p-6 rounded-xl border border-gray-800 hover:border-gray-600 bg-nvme-dark/50 hover:bg-nvme-dark transition-all"
              prefetch={false}
            >
              <div
                className={`inline-flex p-3 rounded-lg ${feature.bg} ${feature.color} mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-nvme-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-nvme-dark/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How NVMe Commands Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-nvme-accent/20 text-nvme-accent flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-white font-semibold mb-2">
                Host Builds Command
              </h3>
              <p className="text-gray-400 text-sm">
                The host driver constructs a 64-byte Submission Queue Entry
                (SQE) containing the opcode, namespace ID, and command-specific
                fields in CDW10-CDW15.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-nvme-accent/20 text-nvme-accent flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-white font-semibold mb-2">
                Controller Processes
              </h3>
              <p className="text-gray-400 text-sm">
                The NVMe controller fetches the SQE from the Submission Queue,
                decodes the command, and executes the operation (read, write,
                admin, etc.).
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-nvme-accent/20 text-nvme-accent flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-white font-semibold mb-2">
                Completion Posted
              </h3>
              <p className="text-gray-400 text-sm">
                The controller writes a 16-byte Completion Queue Entry (CQE)
                with status, and raises an interrupt to notify the host.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
