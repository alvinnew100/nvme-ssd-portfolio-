"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import { getAdminCommands } from "@/lib/nvme/decoder";

export default function AdminCommands() {
  const commands = getAdminCommands();

  const categories = [
    {
      label: "Discovery",
      ids: ["admin-identify"],
      color: "nvme-green",
    },
    {
      label: "Queue Setup",
      ids: ["admin-create-sq", "admin-create-cq", "admin-delete-sq", "admin-delete-cq"],
      color: "nvme-blue",
    },
    {
      label: "Features & Logs",
      ids: ["admin-get-features", "admin-set-features", "admin-get-log-page"],
      color: "nvme-violet",
    },
    {
      label: "Firmware",
      ids: ["admin-fw-download", "admin-fw-commit"],
      color: "nvme-amber",
    },
    {
      label: "Data Protection",
      ids: ["admin-format-nvm", "admin-sanitize", "admin-security-send", "admin-security-recv"],
      color: "nvme-red",
    },
    {
      label: "Namespace Mgmt",
      ids: ["admin-ns-mgmt", "admin-ns-attach"],
      color: "nvme-blue",
    },
  ];

  return (
    <SectionWrapper className="py-20 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Admin Commands
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Admin commands are sent on queue ID 0 (the Admin queue). They manage
          the controller itself &mdash; discovery, configuration, firmware
          updates, health monitoring, and security. There are{" "}
          <strong className="text-text-primary">26 admin commands</strong> in
          the NVMe spec.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="bg-story-panel rounded-xl border border-story-border p-4"
            >
              <div className={`text-${cat.color} font-semibold text-sm mb-3`}>
                {cat.label}
              </div>
              <div className="space-y-1.5">
                {cat.ids.map((id) => {
                  const cmd = commands.find((c) => c.id === id);
                  if (!cmd) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 text-xs">
                      <code className="text-text-code">
                        0x{cmd.opcode.toString(16).padStart(2, "0")}
                      </code>
                      <span className="text-text-secondary">{cmd.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
