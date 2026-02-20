"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import { getAdminCommands } from "@/lib/nvme/decoder";

const CATEGORY_COLORS: Record<string, string> = {
  "Discovery": "#00d4aa",
  "Queue Setup": "#635bff",
  "Features & Logs": "#7c5cfc",
  "Firmware": "#f5a623",
  "Data Protection": "#ed5f74",
  "Namespace Mgmt": "#635bff",
};

interface CliMapping {
  cli: string;
  note?: string;
  kernelOnly?: boolean;
}

const CLI_MAP: Record<string, CliMapping> = {
  "admin-identify": {
    cli: "nvme id-ctrl /dev/nvme0",
    note: "Use id-ns for namespace: nvme id-ns /dev/nvme0n1",
  },
  "admin-create-sq": {
    cli: "",
    kernelOnly: true,
    note: "Issued by the kernel NVMe driver during initialization, not directly via nvme-cli",
  },
  "admin-create-cq": {
    cli: "",
    kernelOnly: true,
    note: "Issued by the kernel NVMe driver during initialization, not directly via nvme-cli",
  },
  "admin-delete-sq": {
    cli: "",
    kernelOnly: true,
    note: "Issued by the kernel NVMe driver during teardown",
  },
  "admin-delete-cq": {
    cli: "",
    kernelOnly: true,
    note: "Issued by the kernel NVMe driver during teardown",
  },
  "admin-get-features": {
    cli: "nvme get-feature /dev/nvme0 -f 1",
    note: "Feature ID 1 = Arbitration. Use -f <id> for different features",
  },
  "admin-set-features": {
    cli: "nvme set-feature /dev/nvme0 -f 7 -v 0x00ff00ff",
    note: "Feature ID 7 = Number of Queues. -v sets the value",
  },
  "admin-get-log-page": {
    cli: "nvme smart-log /dev/nvme0",
    note: "Shortcut for Get Log Page (LID=2). For other logs: nvme get-log /dev/nvme0 --log-id=<id> --log-len=512",
  },
  "admin-fw-download": {
    cli: "nvme fw-download /dev/nvme0 -f firmware.bin",
    note: "Downloads firmware image to the controller. Does NOT activate it",
  },
  "admin-fw-commit": {
    cli: "nvme fw-commit /dev/nvme0 -s 1 -a 1",
    note: "-s = slot, -a = action (1=download+activate on next reset)",
  },
  "admin-format-nvm": {
    cli: "nvme format /dev/nvme0n1 -s 1",
    note: "-s = secure erase setting (0=none, 1=user data erase, 2=cryptographic erase)",
  },
  "admin-sanitize": {
    cli: "nvme sanitize /dev/nvme0 -a 2",
    note: "-a = action (1=exit failure, 2=block erase, 3=overwrite, 4=crypto erase)",
  },
  "admin-security-send": {
    cli: "nvme security-send /dev/nvme0 --secp=0x01 --spsp=0x0000 --nssf=0 -f payload.bin",
    note: "TCG Opal security protocol. --secp = security protocol ID",
  },
  "admin-security-recv": {
    cli: "nvme security-recv /dev/nvme0 --secp=0x01 --spsp=0x0000 --al=2048",
    note: "--al = allocation length for the response buffer",
  },
  "admin-ns-mgmt": {
    cli: "nvme create-ns /dev/nvme0 --nsze=1000000 --ncap=1000000 --block-size=4096",
    note: "Creates a namespace. Use delete-ns to remove: nvme delete-ns /dev/nvme0 -n 1",
  },
  "admin-ns-attach": {
    cli: "nvme attach-ns /dev/nvme0 -n 1 -c 0",
    note: "-n = namespace ID, -c = controller ID. Use detach-ns to detach",
  },
};

export default function AdminCommands() {
  const [expanded, setExpanded] = useState<string | null>(null);
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
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Admin commands are sent on queue ID 0 (the Admin queue). They manage
          the controller itself &mdash; discovery, configuration, firmware
          updates, health monitoring, and security. There are{" "}
          <strong className="text-text-primary">26 admin commands</strong> in
          the NVMe spec.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Click any command below to see its{" "}
          <strong className="text-text-primary">nvme-cli equivalent</strong> &mdash; the
          actual terminal command you&apos;d type to issue it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.label] || "#635bff";
            return (
              <div
                key={cat.label}
                className="bg-story-card rounded-2xl p-5 card-shadow"
              >
                <div className="font-semibold text-sm mb-3" style={{ color }}>
                  {cat.label}
                </div>
                <div className="space-y-1.5">
                  {cat.ids.map((id) => {
                    const cmd = commands.find((c) => c.id === id);
                    if (!cmd) return null;
                    const mapping = CLI_MAP[id];
                    const isExpanded = expanded === id;
                    return (
                      <div key={id}>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : id)}
                          className="flex items-center gap-2 text-xs w-full text-left group"
                        >
                          <code className="text-text-code">
                            0x{cmd.opcode.toString(16).padStart(2, "0")}
                          </code>
                          <span className="text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                            {cmd.name}
                          </span>
                          {mapping && (
                            <span className="text-text-muted text-[9px]">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          )}
                        </button>
                        {isExpanded && mapping && (
                          <div className="mt-2 mb-2">
                            {mapping.kernelOnly ? (
                              <div className="text-[11px] text-text-muted italic bg-story-surface rounded-lg px-3 py-2">
                                {mapping.note}
                              </div>
                            ) : (
                              <div className="text-[11px]">
                                <NvmeCliBlock command={mapping.cli} note={mapping.note} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick reference: most common admin commands */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold mb-4">
            Most Common Admin Commands — Quick Reference
          </div>
          <div className="space-y-3">
            <NvmeCliBlock command="nvme id-ctrl /dev/nvme0" note="Identify Controller — model, serial, firmware revision, capabilities" />
            <NvmeCliBlock command="nvme id-ns /dev/nvme0n1 -n 1" note="Identify Namespace — size, LBA format, features" />
            <NvmeCliBlock command="nvme smart-log /dev/nvme0" note="SMART health — temperature, wear, errors, power-on hours" />
            <NvmeCliBlock command="nvme get-log /dev/nvme0 --log-id=1 --log-len=64" note="Error Information Log — recent errors" />
            <NvmeCliBlock command="nvme fw-log /dev/nvme0" note="Firmware Slot Log — active/pending firmware versions" />
            <NvmeCliBlock command="nvme list" note="List all NVMe devices in the system" />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
