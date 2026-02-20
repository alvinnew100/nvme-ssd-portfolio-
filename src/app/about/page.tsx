import Link from "next/link";

const skills = [
  {
    category: "Storage & NVMe",
    items: [
      "NVMe Protocol (Admin & I/O commands)",
      "SSD Firmware Testing",
      "NAND Flash Technology",
      "PCIe/NVMe Host Interface",
      "FTL (Flash Translation Layer)",
      "Error Handling & Recovery",
    ],
  },
  {
    category: "Testing & Tools",
    items: [
      "Linux ftrace / blktrace",
      "nvme-cli",
      "FIO (Flexible I/O Tester)",
      "Custom Test Framework Development",
      "Automated Regression Testing",
      "Performance Benchmarking",
    ],
  },
  {
    category: "Programming",
    items: [
      "Python",
      "C/C++",
      "TypeScript/JavaScript",
      "Bash/Shell Scripting",
      "Perl",
      "SQL",
    ],
  },
  {
    category: "Systems",
    items: [
      "Linux Kernel (Block Layer)",
      "PCIe Architecture",
      "SCSI/ATA/NVMe Protocols",
      "Git / CI/CD",
      "Docker",
      "Hardware Debug Tools",
    ],
  },
];

const projects = [
  {
    title: "NVMe Explorer (This Site)",
    description:
      "Interactive NVMe command reference with ftrace decoder, command builder, and architecture visualizer. Demonstrates deep understanding of the NVMe specification at the register level.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "SVG"],
  },
  {
    title: "Ftrace Decoder Engine",
    description:
      "TypeScript port of the linux-nvme/nvme-trace Perl decoder. Data-driven architecture replaces 38 individual parse functions with a single declarative decoder using command field definitions.",
    tech: ["TypeScript", "NVMe", "ftrace", "Regex"],
  },
  {
    title: "NVMe Command Builder",
    description:
      "Interactive tool that encodes NVMe command fields into raw 64-byte SQ entries with hex dump output. Supports round-trip: build → generate trace → decode.",
    tech: ["React", "TypeScript", "Binary Encoding"],
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">About</h1>
        <p className="text-xl text-gray-300">
          SSD Test Engineer with deep expertise in NVMe protocol, SSD firmware
          testing, and storage systems.
        </p>
      </div>

      {/* Summary */}
      <section className="mb-12">
        <div className="bg-nvme-dark rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">Summary</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Passionate storage engineer focused on NVMe/SSD technology. I
            understand the full stack from NAND flash physics to the NVMe
            protocol to the Linux kernel block layer. This site demonstrates
            that knowledge through interactive tools that work with real NVMe
            commands at the register level.
          </p>
          <p className="text-gray-300 leading-relaxed">
            I built this entire site — including the ftrace decoder (a TypeScript
            port of the kernel&apos;s nvme-trace), the command builder that
            generates real 64-byte SQ entries, and comprehensive documentation
            of all 38 NVMe commands — to showcase practical SSD engineering
            skills.
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Technical Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skills.map((group) => (
            <div
              key={group.category}
              className="bg-nvme-dark rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-nvme-accent mb-3">
                {group.category}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-nvme-accent mt-1">&#x25B8;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Featured Projects
        </h2>
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="bg-nvme-dark rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {project.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 text-xs bg-nvme-gray rounded-md text-gray-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-nvme-dark rounded-xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">
          Explore the Tools
        </h2>
        <p className="text-gray-400 mb-6">
          See these skills in action through the interactive tools on this site.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/commands"
            className="px-6 py-3 bg-nvme-accent text-nvme-darker font-semibold rounded-lg hover:bg-nvme-accent/90 transition-colors"
            prefetch={false}
          >
            Command Reference
          </Link>
          <Link
            href="/trace-decoder"
            className="px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-nvme-gray transition-colors"
            prefetch={false}
          >
            Ftrace Decoder
          </Link>
        </div>
      </section>
    </div>
  );
}
