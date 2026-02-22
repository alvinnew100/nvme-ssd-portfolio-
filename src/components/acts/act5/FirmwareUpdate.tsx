"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

const COMMIT_ACTIONS = [
  {
    ca: 0,
    name: "CA0 — Download, Replace in Slot",
    short: "Replace image in slot",
    desc: "Downloads the firmware image to the specified slot, replacing whatever was there. Does NOT activate it. The controller continues running the currently active firmware. Use this when you want to stage a new image without disrupting anything.",
    why: "Think of it like downloading an app update but choosing \"Install Later.\" The update sits ready, but you keep using the current version until you decide to switch.",
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
    why: "Like updating your phone and seeing \"Restart to complete update.\" The update is ready, but you choose when the restart happens — giving you control over downtime.",
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
    why: "This is the rollback button. If a new firmware has a bug, you can switch back to the previous version that's still sitting in another slot — without needing the original firmware file.",
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
    why: "Zero downtime. The drive swaps firmware while still running — like changing a car's engine without pulling over. Impressive, but not every drive can do it. The I/O briefly pauses during the switch.",
    cli: "nvme fw-commit /dev/nvme0 -s 1 -a 3",
    note: "Immediate activation — no reset needed. Drive may briefly pause I/O during switch.",
    useCase: "Zero-downtime updates when the drive supports it",
    color: "#e05d6f",
    active: true,
    needsReset: false,
    needsDownload: true,
  },
];

interface SlotState {
  slot: number;
  firmware: string;
  readonly: boolean;
}

const INITIAL_SLOTS: SlotState[] = [
  { slot: 1, firmware: "v2.1.0", readonly: true },
  { slot: 2, firmware: "v2.0.3", readonly: false },
  { slot: 3, firmware: "v1.9.7", readonly: false },
  { slot: 4, firmware: "(empty)", readonly: false },
];

export default function FirmwareUpdate() {
  const [activeCa, setActiveCa] = useState(1);
  const [targetSlot, setTargetSlot] = useState(2);
  const [activeSlotNum, setActiveSlotNum] = useState(1);
  const [pendingSlotNum, setPendingSlotNum] = useState<number | null>(null);
  const [slots, setSlots] = useState<SlotState[]>(INITIAL_SLOTS);
  const [workflowMsg, setWorkflowMsg] = useState<string | null>(null);

  const applyCommit = () => {
    const ca = COMMIT_ACTIONS[activeCa];
    const slot = slots.find((s) => s.slot === targetSlot);
    if (!slot) return;

    if (slot.readonly && ca.needsDownload) {
      setWorkflowMsg(`Slot ${targetSlot} is read-only — cannot download firmware here.`);
      return;
    }

    const newSlots = [...slots];
    const idx = newSlots.findIndex((s) => s.slot === targetSlot);

    if (ca.needsDownload) {
      newSlots[idx] = { ...newSlots[idx], firmware: "v2.2.0" };
      setSlots(newSlots);
    }

    if (ca.active) {
      // CA3 — immediate activation
      setActiveSlotNum(targetSlot);
      setPendingSlotNum(null);
      setWorkflowMsg(`CA${ca.ca}: Downloaded v2.2.0 to Slot ${targetSlot} and activated immediately. Drive is now running v2.2.0.`);
    } else if (ca.needsReset) {
      // CA1 or CA2 — pending activation
      setPendingSlotNum(targetSlot);
      setWorkflowMsg(`CA${ca.ca}: ${ca.needsDownload ? `Downloaded v2.2.0 to Slot ${targetSlot}. ` : ""}Slot ${targetSlot} is marked for activation on next reset. Click "Reset Controller" to activate.`);
    } else {
      // CA0 — download only
      setWorkflowMsg(`CA${ca.ca}: Downloaded v2.2.0 to Slot ${targetSlot}. No activation — drive continues running Slot ${activeSlotNum} firmware.`);
      setPendingSlotNum(null);
    }
  };

  const resetController = () => {
    if (pendingSlotNum !== null) {
      setActiveSlotNum(pendingSlotNum);
      setWorkflowMsg(`Controller reset complete. Now running Slot ${pendingSlotNum} (${slots.find((s) => s.slot === pendingSlotNum)?.firmware}).`);
      setPendingSlotNum(null);
    } else {
      setWorkflowMsg("Reset complete — no pending activation. Active slot unchanged.");
    }
  };

  const resetDemo = () => {
    setSlots(INITIAL_SLOTS);
    setActiveSlotNum(1);
    setPendingSlotNum(null);
    setTargetSlot(2);
    setActiveCa(1);
    setWorkflowMsg(null);
  };

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Firmware Updates &mdash; Upgrading the SSD&apos;s Brain
        </h3>

        <AnalogyCard concept="Firmware Updates Are Brain Surgery" analogy="Updating SSD firmware is like updating the operating system on a computer — the SSD's controller has its own software (firmware) that manages all operations. Firmware updates can fix bugs, improve performance, or add features. But a failed update can brick the drive, so most SSDs support dual-bank firmware (two copies) for safe rollback." />
        <TermDefinition term="Firmware" definition="The software that runs on the SSD controller's embedded processor. Manages the FTL, error correction, wear leveling, command processing, and all other SSD operations. Stored in a dedicated NAND region and loaded into controller SRAM at boot." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Remember the <strong className="text-text-primary">SSD controller</strong> from
          Lesson 3? It&apos;s the processor that runs the FTL, manages wear leveling, handles
          garbage collection, and processes every NVMe command. All of that behavior is
          controlled by <em className="text-text-primary">firmware</em> — software that runs
          on the controller chip.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But why would firmware need updating?</em> Because
          bugs exist. A firmware bug might cause rare data corruption, poor garbage collection
          under specific workloads, or incorrect SMART reporting. Manufacturers continuously
          improve firmware — fixing bugs, optimizing performance, and adding new features.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Here&apos;s what makes SSD firmware updates
          interesting:</em> the drive has <strong className="text-text-primary">multiple
          firmware slots</strong> — like having multiple versions of an app installed
          simultaneously. You can download a new version into one slot while the old version
          keeps running in another. If the update goes wrong, you can switch back. This is
          done through two NVMe admin commands:
        </p>
        <ul className="text-text-secondary mb-8 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            <strong className="text-text-primary">Firmware Image Download</strong> —
            transfers the new firmware binary from the host to the controller
          </li>
          <li>
            <strong className="text-text-primary">Firmware Commit</strong> — tells the
            controller what to do with it: store it, activate it, or both
          </li>
        </ul>

        {/* Interactive firmware slot workflow */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Interactive Firmware Slot Simulator
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            Think of firmware slots like save slots in a video game. Each slot holds a
            different firmware version, and the drive can only <em>run</em> one at a time.
            Try it: select a target slot, choose a commit action, and click &ldquo;Apply&rdquo;
            to see what happens.
          </p>

          {/* Slot visualization */}
          <div className="flex flex-wrap gap-3 justify-center mb-5">
            {slots.map((slot) => {
              const isActive = slot.slot === activeSlotNum;
              const isPending = slot.slot === pendingSlotNum;
              const isTarget = slot.slot === targetSlot;
              return (
                <button
                  key={slot.slot}
                  onClick={() => setTargetSlot(slot.slot)}
                  className={`rounded-xl p-4 text-center transition-all border-2 min-w-[120px] ${
                    isTarget
                      ? "border-nvme-blue bg-nvme-blue/5 shadow-md shadow-nvme-blue/10"
                      : isActive
                      ? "border-nvme-green bg-nvme-green/5"
                      : "border-story-border bg-story-surface"
                  }`}
                >
                  <div className="font-mono font-bold text-sm text-text-primary">
                    Slot {slot.slot}
                  </div>
                  <div className="text-xs text-text-code font-mono mt-1">
                    {slot.firmware}
                  </div>
                  <div className="flex flex-col items-center gap-0.5 mt-1.5">
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-nvme-green/10 text-nvme-green">
                        ACTIVE
                      </span>
                    )}
                    {isPending && (
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-nvme-amber/10 text-nvme-amber"
                      >
                        PENDING
                      </motion.span>
                    )}
                    {slot.readonly && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-story-surface text-text-muted">
                        READ-ONLY
                      </span>
                    )}
                    {isTarget && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-nvme-blue/10 text-nvme-blue">
                        TARGET
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <button
              onClick={applyCommit}
              className="px-5 py-2.5 bg-nvme-blue text-white rounded-full text-xs font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Apply CA{activeCa} to Slot {targetSlot}
            </button>
            {pendingSlotNum !== null && (
              <button
                onClick={resetController}
                className="px-5 py-2.5 bg-nvme-amber text-white rounded-full text-xs font-semibold hover:shadow-lg transition-all active:scale-95"
              >
                Reset Controller
              </button>
            )}
            <button
              onClick={resetDemo}
              className="px-4 py-2.5 bg-story-surface text-text-muted rounded-full text-xs font-semibold hover:bg-story-border transition-all"
            >
              Reset Demo
            </button>
          </div>

          {/* Workflow message */}
          <AnimatePresence mode="wait">
            {workflowMsg && (
              <motion.div
                key={workflowMsg}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono text-text-secondary bg-story-surface rounded-xl p-3 text-center"
              >
                {workflowMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-text-muted text-[10px] text-center mt-3">
            Slot 1 is often read-only (factory firmware — your safety net). Slots 2-7 are writable.
          </p>
        </div>

        {/* Firmware Download explanation */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-8">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            Step 1: Firmware Image Download
          </h4>
          <p className="text-text-secondary text-sm mb-3 leading-relaxed">
            <em className="text-text-primary">Why not just send the entire file in one
            command?</em> Because firmware images can be several megabytes, but a single
            NVMe command can only carry a limited amount of data. So the download command
            transfers the firmware binary in <strong className="text-text-primary">
            chunks</strong> — multiple smaller pieces that the controller reassembles.
          </p>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed">
            The good news: <code className="text-text-code">nvme-cli</code> handles the
            chunking automatically. You just point it at the firmware file:
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
              <span className="text-text-muted"> — Transfer chunk size (default: 4KB). Larger = fewer round-trips</span>
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
          <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-3xl">
            After the image is downloaded, you need to <em className="text-text-primary">
            commit</em> it — telling the controller what to do with it. <em className="text-text-primary">
            But why are there 4 different commit actions?</em> Because different situations
            need different levels of urgency and risk:
          </p>
          <ul className="text-text-secondary text-sm mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
            <li>Sometimes you want to stage an update for <em>later</em> (maintenance window)</li>
            <li>Sometimes you want it to activate on the next reboot (controlled transition)</li>
            <li>Sometimes you want to <em>roll back</em> to a previous version</li>
            <li>Sometimes you need zero-downtime (activate <em>immediately</em>)</li>
          </ul>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed max-w-3xl">
            The commit command takes a <strong className="text-text-primary">slot number
            (-s)</strong> and a <strong className="text-text-primary">commit action
            (-a)</strong>. Click each CA below to see how it works:
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

            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              {COMMIT_ACTIONS[activeCa].desc}
            </p>

            <p className="text-nvme-blue text-xs leading-relaxed mb-4 italic">
              {COMMIT_ACTIONS[activeCa].why}
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
          <div className="text-text-primary font-semibold mb-2">
            Typical Firmware Update Workflow
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            Here&apos;s what a real firmware update looks like from start to finish.
            Notice how each step has a verification — you never blindly trust that
            it worked:
          </p>
          <div className="space-y-4">
            {[
              { step: 1, title: "Check current firmware", cmd: "nvme fw-log /dev/nvme0", note: "Shows all slots, active slot, and firmware revisions", why: "Always know your starting point before changing anything" },
              { step: 2, title: "Identify capabilities", cmd: "nvme id-ctrl /dev/nvme0 | grep -i fw", note: "Check FRMW field: number of slots, slot 1 read-only, activation without reset", why: "Not all drives have the same number of slots or support CA3" },
              { step: 3, title: "Download the image", cmd: "nvme fw-download /dev/nvme0 --fw=firmware_v2.2.0.bin", note: "Transfers image to controller staging buffer", why: "The image is staged, not yet written to a slot" },
              { step: 4, title: "Commit to slot & activate", cmd: "nvme fw-commit /dev/nvme0 -s 2 -a 1", note: "-s 2 = slot 2, -a 1 = CA1 (activate on next reset)", why: "CA1 is safest — you control when the switch happens" },
              { step: 5, title: "Reset controller", cmd: "nvme reset /dev/nvme0", note: "Triggers activation. I/O briefly paused during reset.", why: "The new firmware takes effect after this" },
              { step: 6, title: "Verify", cmd: "nvme fw-log /dev/nvme0", note: "Confirm new firmware is active in the expected slot", why: "Trust, but verify — always confirm the update succeeded" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-nvme-blue/10 text-nvme-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="text-text-primary text-sm font-semibold">{item.title}</div>
                  <div className="text-text-muted text-[10px] mb-2 italic">{item.why}</div>
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

        <InfoCard variant="warning" title="Firmware update risks — why slots matter">
          A power loss during firmware commit can brick the drive if it has no
          backup boot firmware. <em>This is exactly why multiple slots exist</em> —
          slot 1 (read-only factory firmware) acts as a safety net. Enterprise drives
          often have dual-boot firmware so they can always fall back. Always ensure
          stable power during updates, and never overwrite your only working firmware slot.
        </InfoCard>

        <KnowledgeCheck
          id="act5-fw-kc1"
          question="Do firmware updates typically preserve user data?"
          options={["Yes", "No"]}
          correctIndex={0}
          explanation="Most firmware updates preserve user data — they only update the controller's firmware code, not the NAND contents. However, it's always recommended to back up data before firmware updates as a precaution, since a failed update could brick the drive."
        />
      </div>
    </SectionWrapper>
  );
}
