"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

const BOOT_STEPS = [
  {
    id: 0,
    phase: "Discovery",
    color: "#635bff",
    why: "The computer just turned on. It needs to find out what devices are connected. Think of it like doing a roll call — the BIOS walks through every PCIe slot asking \"Who's here?\"",
    commands: [
      { action: "Scan PCIe bus", detail: "BIOS scans every PCIe slot looking for devices. It finds an NVMe SSD at a specific address." },
      { action: "Read identity", detail: "BIOS reads the device's Vendor ID and Class Code. Class Code 01:08:02 means \"this is an NVMe storage controller.\"" },
      { action: "Assign control panel", detail: "BIOS assigns BAR0 — the memory address where the SSD's registers will live. Now the CPU can talk to the SSD's control panel." },
      { action: "Set up interrupts", detail: "BIOS assigns MSI-X interrupt vectors so the SSD can notify the CPU when commands finish." },
    ],
  },
  {
    id: 1,
    phase: "Power Up Controller",
    color: "#7c5cfc",
    why: "We found the SSD and know where its control panel is. Now we need to turn it on. This is like finding the thermostat and setting it up — you read what it supports, configure it, then flip the switch.",
    commands: [
      { action: "Read capabilities (CAP)", detail: "Read what the drive supports: max queue size, timing limits, doorbell spacing. Like reading the instruction manual before using a new appliance." },
      { action: "Disable controller", detail: "Set CC.EN=0 and wait for CSTS.RDY=0. Ensure the drive is in a clean, known state before configuring it." },
      { action: "Configure admin queues", detail: "Tell the drive how big the admin queues are (AQA) and where they live in RAM (ASQ/ACQ). This creates the initial communication channel." },
      { action: "Enable controller", detail: "Set CC.EN=1 — the ON switch. Also configure page size and command set. Then wait for CSTS.RDY=1 — the drive signals it's ready." },
    ],
  },
  {
    id: 2,
    phase: "Ask \"Who are you?\"",
    color: "#00b894",
    why: "The drive is on, and we have admin queues for sending commands. The first thing we do? Send an Identify command — like asking someone their name, what they can do, and what they're carrying.",
    commands: [
      { action: "Identify Controller", detail: "\"What's your name?\" — returns model name, serial number, firmware version, and what features you support." },
      { action: "Identify Namespace List", detail: "\"What storage partitions do you have?\" — returns a list of active namespace IDs." },
      { action: "Identify each Namespace", detail: "For each namespace: \"How big are you? What LBA format? What features?\" — returns size, capacity, and format." },
      { action: "Read health data", detail: "\"How are you feeling?\" — reads SMART health log for temperature, wear, and error counts." },
    ],
  },
  {
    id: 3,
    phase: "Create I/O Queues",
    color: "#e8a317",
    why: "Admin queues handle management commands, but they're too slow for actual data I/O. We need dedicated high-speed I/O queues — one pair per CPU core for maximum parallelism.",
    commands: [
      { action: "Request queue count", detail: "Ask the drive: \"I want N submission + N completion queues.\" The drive responds with how many it can actually support." },
      { action: "Create Completion Queues", detail: "For each CPU core, create a Completion Queue first. CQs must exist before their paired SQs can be created." },
      { action: "Create Submission Queues", detail: "For each CQ, create a paired Submission Queue. Now each CPU core has its own private command channel." },
    ],
  },
  {
    id: 4,
    phase: "Ready for Data",
    color: "#00b894",
    why: "Everything is set up. The drive has queues, the driver knows its capabilities, and the OS can register it as a block device. Applications can now read and write data.",
    commands: [
      { action: "Register block device", detail: "Linux creates /dev/nvme0n1 (and partitions like /dev/nvme0n1p1). Applications can now open and use the drive." },
      { action: "I/O begins", detail: "Read/write commands flow through I/O queues. The filesystem, block layer, and NVMe driver work together to serve application requests." },
      { action: "Interrupts active", detail: "When the SSD completes a command, it fires an MSI-X interrupt to the specific CPU core that submitted it." },
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
          From Power-On to First I/O &mdash; The Boot Sequence
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Now we know all the building blocks: PCIe is the highway, BAR0 is the
          control panel, and queues carry commands. <em className="text-text-primary">
          But how do these pieces come together when you press the power button?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The boot process follows a strict order — each step depends on the
          previous one. You can&apos;t send commands without queues. You can&apos;t
          create queues without first enabling the controller. You can&apos;t enable
          the controller without knowing where its registers are. And you can&apos;t
          find registers without scanning the PCIe bus first.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Click each phase below to see the exact steps. Notice how each phase
          builds on the previous one:
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
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
                <h4 className="text-lg font-bold text-text-primary">
                  Phase {phase.id + 1}: {phase.phase}
                </h4>
              </div>

              {/* Why this phase exists */}
              <p className="text-text-secondary text-sm leading-relaxed mb-4 italic bg-story-surface rounded-xl p-3"
                style={{ borderLeft: `3px solid ${phase.color}` }}
              >
                {phase.why}
              </p>

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
                      <div className="text-text-primary text-sm font-semibold">
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

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-2">
            The key insight
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            This entire boot sequence uses concepts we&apos;ve already learned: PCIe
            enumeration discovers the drive, BAR0 gives access to registers, the
            Submission Queue lets us send commands, and the Completion Queue receives
            results. The boot process is just these pieces assembled in the right
            order. Every NVMe drive in the world follows this same sequence — it&apos;s
            defined by the NVMe spec, which is why one Linux NVMe driver works with
            drives from Samsung, WD, Intel, or any other manufacturer.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
