"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

const COMMIT_ACTIONS = [
  {
    ca: 0,
    name: "CA0 — Download, Replace in Slot",
    short: "Replace image in slot",
    desc: "Downloads the firmware image to the specified slot, replacing whatever was there. Does NOT activate it. The controller continues running the currently active firmware. Use this when you want to stage a new image without disrupting anything.",
    cli: "nvme fw-commit /dev/nvme0 -s 2 -a 0",
    note: "Downloads to slot 2, no activation. The drive keeps running slot 1 firmware.",
    useCase: "Pre-staging firmware before a maintenance window",
    color: "#9e9789",
    active: false,
    needsReset: false,
    needsDownload: true,
  },
  {
    ca: 1,
    name: "CA1 — Download, Activate on Next Reset",
    short: "Download + activate on reset",
    desc: "Downloads the image to the specified slot AND marks it as the firmware to activate on the next controller reset. The currently running firmware is NOT interrupted — the new firmware only takes effect after an explicit nvme reset or a power cycle.",
    cli: "nvme fw-commit /dev/nvme0 -s 1 -a 1",
    note: "Downloads to slot 1, will activate on next nvme reset or power cycle.",
    useCase: "Most common for production updates — safe, controlled activation",
    color: "#635bff",
    active: false,
    needsReset: true,
    needsDownload: true,
  },
  {
    ca: 2,
    name: "CA2 — Activate Existing Slot on Next Reset",
    short: "Activate existing image",
    desc: "Activates firmware that's ALREADY in a slot (from a previous CA0 download). No new image is downloaded — this just changes which slot will be active after reset. Useful for rolling back to a previous firmware version that's still stored in another slot.",
    cli: "nvme fw-commit /dev/nvme0 -s 3 -a 2",
    note: "No download needed. Activates whatever is in slot 3 on next reset.",
    useCase: "Rollback — switch back to a known-good firmware version",
    color: "#00b894",
    active: false,
    needsReset: true,
    needsDownload: false,
  },
  {
    ca: 3,
    name: "CA3 — Download, Activate Immediately",
    short: "Download + activate NOW",
    desc: "Downloads the image to the specified slot AND activates it immediately without requiring a reset. The controller switches firmware on the fly. Not all drives support this — check the FWUG (Firmware Update Granularity) and OACS bits in Identify Controller. If unsupported, the command will fail with Invalid Field in Command.",
    cli: "nvme fw-commit /dev/nvme0 -s 1 -a 3",
    note: "Immediate activation — no reset needed. Drive may briefly pause I/O during switch.",
    useCase: "Zero-downtime updates when the drive supports it",
    color: "#e05d6f",
    active: true,
    needsReset: false,
    needsDownload: true,
  },
];

const FW_SLOTS = [
  { slot: 1, label: "Slot 1", firmware: "v2.1.0", active: true, readonly: true },
  { slot: 2, label: "Slot 2", firmware: "v2.0.3", active: false, readonly: false },
  { slot: 3, label: "Slot 3", firmware: "v1.9.7", active: false, readonly: false },
  { slot: 4, label: "Slot 4", firmware: "(empty)", active: false, readonly: false },
];

export default function FirmwareUpdate() {
  const [activeCa, setActiveCa] = useState(1);
  const [activeSlot, setActiveSlot] = useState(1);

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Firmware Updates &mdash; Download, Commit, Activate
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          SSD firmware can be updated in the field using two admin commands:
          <strong className="text-text-primary"> Firmware Image Download</strong>{" "}
          (opcode <code className="text-text-code">0x11</code>) transfers the image
          in chunks, and <strong className="text-text-primary">Firmware Commit</strong>{" "}
          (opcode <code className="text-text-code">0x10</code>) activates it. The
          key complexity is in the <strong className="text-text-primary">Commit Action
          (CA)</strong> field — there are 4 different commit actions, each with different
          behavior.
        </p>

        {/* Firmware slots diagram */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Firmware Slot Layout — NVMe supports up to 7 slots
          </div>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {FW_SLOTS.map((slot) => (
              <button
                key={slot.slot}
                onClick={() => setActiveSlot(slot.slot)}
                className={`rounded-xl p-4 text-center transition-all border-2 min-w-[120px] ${
                  activeSlot === slot.slot
                    ? "border-nvme-blue bg-nvme-blue/5"
                    : slot.active
                    ? "border-nvme-green bg-nvme-green/5"
                    : "border-story-border bg-story-surface"
                }`}
              >
                <div className="font-mono font-bold text-sm text-text-primary">
                  {slot.label}
                </div>
                <div className="text-xs text-text-code font-mono mt-1">
                  {slot.firmware}
                </div>
                {slot.active && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-nvme-green/10 text-nvme-green">
                    ACTIVE
                  </span>
                )}
                {slot.readonly && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-nvme-amber/10 text-nvme-amber">
                    READ-ONLY
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-text-muted text-xs text-center">
            Slot 1 is often read-only (factory firmware). Slots 2-7 are writable. Click to select a target slot.
          </p>
        </div>

        {/* Firmware Download explanation */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            Step 1: Firmware Image Download
          </h4>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed">
            The download command transfers the firmware binary to the controller in
            chunks. The controller stores it in an internal staging buffer (not yet
            in a slot). NVMe allows chunked transfers because firmware images can be
            several MB.
          </p>
          <NvmeCliBlock
            command="nvme fw-download /dev/nvme0 --fw=firmware_v2.2.0.bin"
            note="Downloads the entire image. nvme-cli handles chunking automatically."
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">--fw=&lt;file&gt;</span>
              <span className="text-text-muted"> — Path to the firmware binary file to upload</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">--xfer=&lt;size&gt;</span>
              <span className="text-text-muted"> — Transfer chunk size (default: 4KB). Larger = fewer commands</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">--offset=&lt;n&gt;</span>
              <span className="text-text-muted"> — Byte offset for partial downloads (usually handled automatically)</span>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <span className="text-nvme-blue font-mono font-bold">FWUG</span>
              <span className="text-text-muted"> — Firmware Update Granularity: minimum chunk size the drive accepts</span>
            </div>
          </div>
        </div>

        {/* Commit Actions */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            Step 2: Firmware Commit &mdash; The 4 Commit Actions
          </h4>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed max-w-3xl">
            The commit command takes a <strong className="text-text-primary">slot number (-s)
            </strong> and a <strong className="text-text-primary">commit action (-a)</strong>.
            The commit action determines whether to download, activate, require a reset, or
            do it all immediately.
          </p>

          {/* CA selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COMMIT_ACTIONS.map((ca) => (
              <button
                key={ca.ca}
                onClick={() => setActiveCa(ca.ca)}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  activeCa === ca.ca
                    ? "text-white shadow-md"
                    : "bg-story-card border border-story-border text-text-secondary hover:text-text-primary card-shadow"
                }`}
                style={activeCa === ca.ca ? { backgroundColor: ca.color } : undefined}
              >
                CA{ca.ca}
              </button>
            ))}
          </div>

          {/* Active CA detail */}
          <div className="bg-story-card rounded-2xl p-6 card-shadow mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm"
                style={{ backgroundColor: COMMIT_ACTIONS[activeCa].color }}
              >
                {activeCa}
              </div>
              <div>
                <div className="text-text-primary font-semibold">
                  {COMMIT_ACTIONS[activeCa].name}
                </div>
                <div className="text-text-muted text-xs">
                  {COMMIT_ACTIONS[activeCa].useCase}
                </div>
              </div>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              {COMMIT_ACTIONS[activeCa].desc}
            </p>

            {/* Visual indicators */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono ${
                COMMIT_ACTIONS[activeCa].needsDownload
                  ? "bg-nvme-blue/10 text-nvme-blue"
                  : "bg-story-surface text-text-muted line-through"
              }`}>
                Download Image
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono ${
                COMMIT_ACTIONS[activeCa].active
                  ? "bg-nvme-green/10 text-nvme-green"
                  : "bg-story-surface text-text-muted line-through"
              }`}>
                Immediate Activation
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono ${
                COMMIT_ACTIONS[activeCa].needsReset
                  ? "bg-nvme-amber/10 text-nvme-amber"
                  : "bg-story-surface text-text-muted line-through"
              }`}>
                Needs Reset
              </span>
            </div>

            <NvmeCliBlock
              command={COMMIT_ACTIONS[activeCa].cli}
              note={COMMIT_ACTIONS[activeCa].note}
            />
          </div>

          {/* CA comparison table */}
          <div className="bg-story-card rounded-2xl card-shadow overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-story-border">
                    <th className="text-left py-3 px-4 text-text-muted font-mono">Action</th>
                    <th className="text-center py-3 px-3 text-text-muted font-mono">Downloads?</th>
                    <th className="text-center py-3 px-3 text-text-muted font-mono">Activates?</th>
                    <th className="text-center py-3 px-3 text-text-muted font-mono">Reset Needed?</th>
                    <th className="text-left py-3 px-3 text-text-muted font-mono">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMIT_ACTIONS.map((ca) => (
                    <tr
                      key={ca.ca}
                      className={`border-b border-story-border/50 ${
                        activeCa === ca.ca ? "bg-nvme-blue/5" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold" style={{ color: ca.color }}>
                        CA{ca.ca}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {ca.needsDownload ? (
                          <span className="text-nvme-green font-bold">Yes</span>
                        ) : (
                          <span className="text-text-muted">No</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {ca.active ? (
                          <span className="text-nvme-green font-bold">Immediate</span>
                        ) : ca.needsReset ? (
                          <span className="text-nvme-amber">On Reset</span>
                        ) : (
                          <span className="text-text-muted">No</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {ca.needsReset ? (
                          <span className="text-nvme-amber font-bold">Yes</span>
                        ) : (
                          <span className="text-text-muted">No</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary text-[11px]">
                        {ca.useCase}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Typical update workflow */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold mb-4">
            Typical Firmware Update Workflow
          </div>
          <div className="space-y-4">
            {[
              { step: 1, title: "Check current firmware", cmd: "nvme fw-log /dev/nvme0", note: "Shows all slots, active slot, and firmware revisions" },
              { step: 2, title: "Identify capabilities", cmd: "nvme id-ctrl /dev/nvme0 | grep -i fw", note: "Check FRMW field: number of slots, slot 1 read-only, activation without reset" },
              { step: 3, title: "Download the image", cmd: "nvme fw-download /dev/nvme0 --fw=firmware_v2.2.0.bin", note: "Transfers image to controller staging buffer" },
              { step: 4, title: "Commit to slot & activate", cmd: "nvme fw-commit /dev/nvme0 -s 2 -a 1", note: "-s 2 = slot 2, -a 1 = CA1 (activate on next reset)" },
              { step: 5, title: "Reset controller", cmd: "nvme reset /dev/nvme0", note: "Triggers activation. I/O briefly paused during reset." },
              { step: 6, title: "Verify", cmd: "nvme fw-log /dev/nvme0", note: "Confirm new firmware is active in the expected slot" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-nvme-blue/10 text-nvme-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="text-text-primary text-sm font-semibold mb-2">{item.title}</div>
                  <NvmeCliBlock command={item.cmd} note={item.note} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-blue text-sm mb-2">
              -s / --slot
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Target firmware slot (1-7). Slot 1 is often read-only (factory image).
              The number of available slots varies by drive — check the FRMW field
              in Identify Controller. Most consumer drives have 2-4 slots.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-green text-sm mb-2">
              -a / --action
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Commit Action (0-3). Determines download, activation, and reset behavior.
              CA1 is the safest for production. CA3 avoids downtime but isn&apos;t
              universally supported.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-violet text-sm mb-2">
              --fw / -f
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Path to the firmware binary file for fw-download. The file is
              transferred in chunks (default 4KB, configurable with --xfer). The
              drive may impose a minimum granularity (FWUG).
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-amber text-sm mb-2">
              FRMW (Identify Controller)
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Byte 260 of Identify Controller. Bits [4:1] = number of FW slots.
              Bit 0 = slot 1 is read-only. Bit 5 = activation without reset supported
              (required for CA3).
            </p>
          </div>
        </div>

        <InfoCard variant="warning" title="Firmware update risks">
          A power loss during firmware commit can brick the drive if it has no
          backup boot firmware. Always ensure stable power during updates. Some
          enterprise drives have dual-boot firmware (a recovery slot that can&apos;t
          be overwritten) to mitigate this risk.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
