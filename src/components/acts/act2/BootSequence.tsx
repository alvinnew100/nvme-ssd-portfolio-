"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

const BOOT_STEPS = [
  {
    id: 0,
    phase: "PCIe Enumeration",
    color: "#635bff",
    commands: [
      { action: "BIOS/UEFI", detail: "Scans PCIe bus, discovers NVMe device at BDF address" },
      { action: "Config Space", detail: "Reads Vendor ID, Device ID, Class Code (01h:08h:02h = NVMe)" },
      { action: "BAR Setup", detail: "Assigns BAR0 MMIO region. Maps controller registers into memory." },
      { action: "MSI-X Setup", detail: "Allocates interrupt vectors for completion queue notifications." },
    ],
  },
  {
    id: 1,
    phase: "Controller Init",
    color: "#7c5cfc",
    commands: [
      { action: "Read CAP", detail: "Read Controller Capabilities: max queue entries, doorbell stride, timeouts." },
      { action: "Read VS", detail: "Read Version register to confirm NVMe spec revision." },
      { action: "Disable CC.EN", detail: "Clear CC.EN=0, wait for CSTS.RDY=0. Controller in disabled state." },
      { action: "Set AQA", detail: "Configure Admin Queue Attributes: set admin SQ and CQ sizes." },
      { action: "Set ASQ/ACQ", detail: "Write admin SQ and CQ base physical addresses to ASQ/ACQ registers." },
      { action: "Enable CC.EN", detail: "Set CC.EN=1, set page size, I/O command set, arbitration. Wait CSTS.RDY=1." },
    ],
  },
  {
    id: 2,
    phase: "Discovery",
    color: "#00b894",
    commands: [
      { action: "Identify Controller", detail: "Admin cmd 0x06 (CNS=1): Get model, serial, firmware, capabilities." },
      { action: "Identify NS List", detail: "Admin cmd 0x06 (CNS=2): Get list of active namespace IDs." },
      { action: "Identify Namespace", detail: "Admin cmd 0x06 (CNS=0): For each NSID, get size, LBA format, features." },
      { action: "Get Log (SMART)", detail: "Admin cmd 0x02 (LID=2): Read SMART health data." },
      { action: "Get Features", detail: "Admin cmd 0x0A: Query number of queues, power state, temp threshold." },
    ],
  },
  {
    id: 3,
    phase: "I/O Queue Setup",
    color: "#e8a317",
    commands: [
      { action: "Set Features", detail: "Admin cmd 0x09 (FID=7): Request N I/O completion queues + N submission queues." },
      { action: "Create I/O CQ", detail: "Admin cmd 0x05: For each CPU/core, allocate and create a completion queue." },
      { action: "Create I/O SQ", detail: "Admin cmd 0x01: For each CQ, create a paired submission queue." },
    ],
  },
  {
    id: 4,
    phase: "Ready for I/O",
    color: "#00b894",
    commands: [
      { action: "Block layer registers", detail: "Linux block device /dev/nvme0n1 is now available." },
      { action: "I/O Read/Write", detail: "Applications issue reads and writes. Commands flow through I/O queues." },
      { action: "Interrupts", detail: "Controller raises MSI-X interrupts on CQ completion." },
    ],
  },
];

export default function BootSequence() {
  const [activePhase, setActivePhase] = useState(0);
  const phase = BOOT_STEPS[activePhase];

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          NVMe Boot Sequence
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          From power-on to the first I/O, here&apos;s every step the host takes
          to bring an NVMe drive online. Click each phase to see the exact
          register writes and admin commands involved.
        </p>

        {/* Timeline */}
        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          {/* Phase selector - horizontal timeline */}
          <div className="flex items-center mb-8 overflow-x-auto pb-2">
            {BOOT_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setActivePhase(i)}
                  className={`relative flex flex-col items-center transition-all ${
                    i === activePhase ? "scale-110" : "opacity-60 hover:opacity-80"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[10px] font-mono mt-1.5 whitespace-nowrap" style={{ color: i === activePhase ? step.color : "#9e9789" }}>
                    {step.phase}
                  </span>
                </button>
                {i < BOOT_STEPS.length - 1 && (
                  <div
                    className="w-8 sm:w-12 h-0.5 mx-1 flex-shrink-0"
                    style={{
                      backgroundColor: i < activePhase ? BOOT_STEPS[i + 1].color : "#ddd6ca",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Phase detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
                <h4 className="text-lg font-bold text-text-primary">
                  Phase {phase.id + 1}: {phase.phase}
                </h4>
              </div>

              <div className="space-y-2">
                {phase.commands.map((cmd, i) => (
                  <motion.div
                    key={cmd.action}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 bg-story-surface rounded-xl p-3"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${phase.color}80` }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-text-primary text-sm font-semibold font-mono">
                        {cmd.action}
                      </div>
                      <div className="text-text-muted text-xs mt-0.5">
                        {cmd.detail}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
