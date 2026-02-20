"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import { getAdminCommands } from "@/lib/nvme/decoder";

const CATEGORY_COLORS: Record<string, string> = {
  "Discovery": "#00d4aa",
  "Queue Setup": "#635bff",
  "Features & Logs": "#7c5cfc",
  "Firmware": "#f5a623",
  "Data Protection": "#ed5f74",
  "Namespace Mgmt": "#635bff",
};

export default function AdminCommands() {
  const commands = getAdminCommands();

  const categories = [
    { label: "Discovery", ids: ["admin-identify"] },
    { label: "Queue Setup", ids: ["admin-create-sq", "admin-create-cq", "admin-delete-sq", "admin-delete-cq"] },
    { label: "Features & Logs", ids: ["admin-get-features", "admin-set-features", "admin-get-log-page"] },
    { label: "Firmware", ids: ["admin-fw-download", "admin-fw-commit"] },
    { label: "Data Protection", ids: ["admin-format-nvm", "admin-sanitize", "admin-security-send", "admin-security-recv"] },
    { label: "Namespace Mgmt", ids: ["admin-ns-mgmt", "admin-ns-attach"] },
  ];

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
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
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.label] || "#635bff";
            return (
              <div
                key={cat.label}
                className="bg-white rounded-2xl p-5 card-shadow"
              >
                <div className="font-semibold text-sm mb-3" style={{ color }}>
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
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
