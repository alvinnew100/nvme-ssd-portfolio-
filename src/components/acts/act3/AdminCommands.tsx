"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import { getAdminCommands } from "@/lib/nvme/decoder";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

const CATEGORY_COLORS: Record<string, string> = {
  "Discovery": "#00d4aa",
  "Queue Setup": "#635bff",
  "Features & Logs": "#7c5cfc",
  "Firmware": "#f5a623",
  "Data Protection": "#ed5f74",
  "Namespace Mgmt": "#635bff",
  "Operational": "#94a3b8",
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
    note: "The kernel NVMe driver creates I/O queues during boot. You don't run this manually — it happens automatically when the driver sets up one queue pair per CPU core.",
  },
  "admin-create-cq": {
    cli: "",
    kernelOnly: true,
    note: "Same as Create SQ — the kernel handles this during initialization. CQs are always created before their paired SQs.",
  },
  "admin-delete-sq": {
    cli: "",
    kernelOnly: true,
    note: "The kernel deletes queues during driver teardown (e.g., nvme disconnect or rmmod nvme).",
  },
  "admin-delete-cq": {
    cli: "",
    kernelOnly: true,
    note: "Same — kernel deletes CQs after their paired SQs are removed.",
  },
  "admin-get-features": {
    cli: "nvme get-feature /dev/nvme0 -f 1",
    note: "Feature ID 1 = Arbitration. Use -f <id> for different features. Common: -f 7 (Number of Queues), -f 4 (Power Management)",
  },
  "admin-set-features": {
    cli: "nvme set-feature /dev/nvme0 -f 7 -v 0x00ff00ff",
    note: "Feature ID 7 = Number of Queues. -v sets the value. The drive responds with how many it actually supports.",
  },
  "admin-get-log-page": {
    cli: "nvme smart-log /dev/nvme0",
    note: "Shortcut for Get Log Page with Log ID=2 (SMART). For other logs: nvme get-log /dev/nvme0 --log-id=<id> --log-len=512",
  },
  "admin-fw-download": {
    cli: "nvme fw-download /dev/nvme0 -f firmware.bin",
    note: "Downloads firmware image to the controller. Does NOT activate it — that requires fw-commit (covered in the Firmware Update section).",
  },
  "admin-fw-commit": {
    cli: "nvme fw-commit /dev/nvme0 -s 1 -a 1",
    note: "-s = slot, -a = commit action (0-3). See the Firmware Update section for detailed CA comparison.",
  },
  "admin-format-nvm": {
    cli: "nvme format /dev/nvme0n1 -s 1",
    note: "-s = secure erase setting (0=none, 1=user data erase, 2=cryptographic erase). WARNING: destroys all data!",
  },
  "admin-sanitize": {
    cli: "nvme sanitize /dev/nvme0 -a 2",
    note: "-a = action (2=block erase, 3=overwrite, 4=crypto erase). Irreversible, affects entire drive.",
  },
  "admin-security-send": {
    cli: "nvme security-send /dev/nvme0 --secp=0x01 --spsp=0x0000 --nssf=0 -f payload.bin",
    note: "Used for TCG Opal encryption management. --secp = security protocol ID.",
  },
  "admin-security-recv": {
    cli: "nvme security-recv /dev/nvme0 --secp=0x01 --spsp=0x0000 --al=2048",
    note: "--al = allocation length for the response. Used to read back security protocol data.",
  },
  "admin-ns-mgmt": {
    cli: "nvme create-ns /dev/nvme0 --nsze=1000000 --ncap=1000000 --block-size=4096",
    note: "Creates a namespace. Use delete-ns to remove: nvme delete-ns /dev/nvme0 -n 1",
  },
  "admin-ns-attach": {
    cli: "nvme attach-ns /dev/nvme0 -n 1 -c 0",
    note: "-n = namespace ID, -c = controller ID. Use detach-ns to detach.",
  },
  "admin-abort": {
    cli: "",
    kernelOnly: true,
    note: "No dedicated nvme-cli command. The kernel uses this internally to cancel in-flight commands (e.g., during timeout recovery). You can issue it via generic passthrough: nvme admin-passthru /dev/nvme0 --opcode=0x08 — but there's rarely a reason to.",
  },
  "admin-async-event": {
    cli: "",
    kernelOnly: true,
    note: "No nvme-cli equivalent. The kernel's NVMe driver automatically submits Async Event Requests during initialization. When the controller detects an event (health warning, namespace change, firmware activation), it completes one of these pre-submitted commands to notify the host.",
  },
  "admin-self-test": {
    cli: "nvme device-self-test /dev/nvme0 -s 1",
    note: "-s 1 = short self-test, -s 2 = extended self-test, -s 0xf = abort running test. Results appear in the Device Self-test Log: nvme self-test-log /dev/nvme0",
  },
  "admin-keep-alive": {
    cli: "",
    kernelOnly: true,
    note: "No nvme-cli equivalent. The kernel sends Keep Alive commands periodically to prevent the controller from timing out the host connection. The interval is negotiated via the KATO (Keep Alive Timeout) feature. Only relevant for NVMe-oF (NVMe over Fabrics) connections.",
  },
  "admin-directive-send": {
    cli: "nvme dir-send /dev/nvme0n1 -D 1 -O 1 -S 0",
    note: "-D = directive type (1=Streams), -O = operation, -S = directive specific. Streams allow the host to hint which data belongs together, helping the SSD's garbage collector.",
  },
  "admin-directive-recv": {
    cli: "nvme dir-receive /dev/nvme0n1 -D 1 -O 1 -S 0",
    note: "-D = directive type, -O = operation. Used to query stream parameters from the controller.",
  },
  "admin-virt-mgmt": {
    cli: "nvme virt-mgmt /dev/nvme0 --cntlid=1 --rt=0 --nr=4 --act=1",
    note: "Manages SR-IOV virtual function resources. --act = action (1=primary flex, 7=secondary offline, 8=secondary online). Only on enterprise SSDs with SR-IOV support.",
  },
  "admin-doorbell-buf": {
    cli: "",
    kernelOnly: true,
    note: "No nvme-cli equivalent. The kernel configures shadow doorbell buffers to reduce costly MMIO writes. Instead of writing to a PCIe register for every doorbell ring, the host writes to a shared memory buffer — the controller polls it. This is a performance optimization handled entirely by the driver.",
  },
  "admin-get-lba-status": {
    cli: "nvme get-lba-status /dev/nvme0n1 --slba=0 --mndw=1024 --atype=0 --rl=100",
    note: "--slba = starting LBA, --rl = range length. Returns which LBAs in the range are potentially unrecoverable (e.g., due to NAND failures beyond ECC capability).",
  },
};

export default function AdminCommands() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const commands = getAdminCommands();

  const categories = [
    { label: "Discovery", ids: ["admin-identify", "admin-get-lba-status"] },
    { label: "Queue Setup", ids: ["admin-create-sq", "admin-create-cq", "admin-delete-sq", "admin-delete-cq", "admin-doorbell-buf"] },
    { label: "Features & Logs", ids: ["admin-get-features", "admin-set-features", "admin-get-log-page", "admin-async-event"] },
    { label: "Firmware", ids: ["admin-fw-download", "admin-fw-commit", "admin-self-test"] },
    { label: "Data Protection", ids: ["admin-format-nvm", "admin-sanitize", "admin-security-send", "admin-security-recv"] },
    { label: "Namespace Mgmt", ids: ["admin-ns-mgmt", "admin-ns-attach"] },
    { label: "Operational", ids: ["admin-abort", "admin-keep-alive", "admin-directive-send", "admin-directive-recv", "admin-virt-mgmt"] },
  ];

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Admin Commands &mdash; Managing the Drive
        </h3>

        <AnalogyCard
          concept="Admin Commands Are Management Controls"
          analogy="Admin commands are like the control room operations of a building — creating queues, reading logs, updating firmware, checking health. They manage the SSD itself rather than reading/writing user data. Admin commands go through the Admin Submission Queue (ASQ), which is always queue pair 0."
        />

        <p className="text-text-secondary mb-2 leading-relaxed max-w-3xl">
          <TermDefinition term="Admin Queue" definition="Queue pair 0 — the first and mandatory queue created during NVMe initialization. Used exclusively for management commands (Identify, Create I/O Queue, Get Log Page, etc.), not for data transfer." />
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          So far we&apos;ve seen the Identify command — the first question the driver
          asks. But there are many more management commands. <em className="text-text-primary">
          Think of admin commands as the building manager&apos;s toolkit:</em> they
          handle configuration, health checks, firmware updates, security, and
          creating/destroying queues.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Admin commands always go on <strong className="text-text-primary">Queue
          ID 0</strong> — the special admin queue that was created during boot.
          They manage the drive <em>itself</em>, not your data. (Data commands use
          I/O queues with QID &ge; 1, which we&apos;ll cover next.)
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why separate admin from I/O queues?</em>{" "}
          Because you always need a way to manage the drive, even when I/O queues
          are congested. The admin queue is like a &ldquo;priority line&rdquo; that
          can&apos;t be blocked by data traffic.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Click any command below to see its{" "}
          <strong className="text-text-primary">nvme-cli equivalent</strong> — the
          actual terminal command you&apos;d type to issue it:
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
                          {mapping?.kernelOnly && (
                            <span className="text-[8px] font-mono text-text-muted bg-story-surface px-1.5 py-0.5 rounded">
                              no CLI
                            </span>
                          )}
                          {mapping && (
                            <span className="text-text-muted text-[9px]">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          )}
                        </button>
                        {isExpanded && mapping && (
                          <div className="mt-2 mb-2">
                            {mapping.kernelOnly ? (
                              <div className="bg-story-surface rounded-lg px-3 py-2">
                                <div className="text-[10px] font-mono text-nvme-amber font-bold mb-1">
                                  No nvme-cli equivalent &mdash; kernel/driver only
                                </div>
                                <div className="text-[11px] text-text-muted italic">
                                  {mapping.note}
                                </div>
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

        <KnowledgeCheck
          id="act3-admin-kc1"
          question="Can Admin commands transfer user data (file contents)?"
          options={["Yes", "No"]}
          correctIndex={1}
          explanation="Admin commands handle device management — identifying the controller, creating queues, getting logs, etc. User data transfer (reads/writes) is handled exclusively by I/O commands submitted to I/O queues."
        />
      </div>
    </SectionWrapper>
  );
}
