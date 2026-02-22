"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

const DOORBELLS = [
  { offset: "0x1000", label: "Admin SQ Tail Doorbell", type: "sq" as const, qid: 0 },
  { offset: "0x1004", label: "Admin CQ Head Doorbell", type: "cq" as const, qid: 0 },
  { offset: "0x1008", label: "I/O SQ 1 Tail Doorbell", type: "sq" as const, qid: 1 },
  { offset: "0x100C", label: "I/O CQ 1 Head Doorbell", type: "cq" as const, qid: 1 },
];

export default function Doorbells() {
  const [ringing, setRinging] = useState<string | null>(null);

  const ringDoorbell = (offset: string) => {
    setRinging(offset);
    setTimeout(() => setRinging(null), 600);
  };

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Ringing the Doorbell &mdash; How the SSD Knows There&apos;s Work
        </h3>
        <AnalogyCard concept="Doorbells Are Notification Buzzers" analogy="After the host writes a command to the SQ, it 'rings the doorbell' — a simple register write that tells the SSD 'hey, there's new work.' Without the doorbell, the SSD would have to constantly poll the queue to check for new commands." />
        <TermDefinition term="Doorbell Register" definition="A 32-bit register in BAR0 that the host writes to notify the SSD of new SQ entries or consumed CQ entries. Each queue pair has two doorbell registers — one for submissions, one for completions." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We&apos;ve seen that the host places commands in the Submission Queue (SQ)
          in RAM. But the SSD doesn&apos;t constantly watch RAM looking for new
          commands — <em className="text-text-primary">that would waste power and
          bandwidth</em>. So how does the SSD know when there&apos;s a new command
          waiting?
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think about a hotel front desk. You don&apos;t stand at the desk shouting
          for service — you ring the bell. One quick &ldquo;ding&rdquo; tells the
          staff &ldquo;someone needs attention.&rdquo; NVMe works the same way.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          After writing one or more commands to the SQ, the host writes the new
          tail position to a special register called a{" "}
          <strong className="text-text-primary">doorbell register</strong>. This
          is a single write to a BAR0 address — remember, BAR0 writes travel over
          PCIe to the SSD hardware. The SSD sees this write, reads the new tail
          value, and knows exactly how many new commands are waiting.
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why is this efficient?</em> Because the
          host can queue up many commands and ring the doorbell just once. The SSD
          then processes the entire batch. One PCIe write triggers the processing of
          dozens of commands — this batching is a key reason NVMe can achieve
          millions of operations per second.
        </p>

        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Each queue pair has <strong className="text-text-primary">two doorbells</strong>:
          one for the SQ tail (host tells SSD &ldquo;I added commands&rdquo;) and one
          for the CQ head (host tells SSD &ldquo;I read your results, you can reuse
          those slots&rdquo;). Click each doorbell below to see it ring:
        </p>

        {/* Doorbell flow animation */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Doorbell Notification Flow
          </div>
          <div className="flex items-center justify-between gap-3 mb-4">
            {[
              { label: "Host writes\ncommands to SQ", color: "#38bdf8" },
              { label: "Host writes\nnew tail to doorbell", color: "#a78bfa" },
              { label: "SSD reads\ndoorbell value", color: "#f5a623" },
              { label: "SSD fetches\ncommands via DMA", color: "#00d4aa" },
            ].map((step, i) => (
              <div key={i} className="flex items-center flex-shrink-0">
                <motion.div
                  className="flex flex-col items-center max-w-[80px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15, type: "spring" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </div>
                  <div className="text-text-muted text-[8px] text-center mt-1.5 whitespace-pre-line leading-tight">
                    {step.label}
                  </div>
                </motion.div>
                {i < 3 && (
                  <motion.div
                    className="mx-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 + 0.1 }}
                  >
                    <svg width="20" height="10" viewBox="0 0 20 10">
                      <path d="M0 5 L15 5 L11 1 M15 5 L11 9" stroke="#475569" strokeWidth="1.5" fill="none" />
                    </svg>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            Doorbell Registers — starting at BAR0 + 0x1000
          </div>
          <div className="space-y-2 font-mono text-xs">
            {DOORBELLS.map((db) => (
              <motion.button
                key={db.offset}
                onClick={() => ringDoorbell(db.offset)}
                animate={ringing === db.offset ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="w-full flex items-center gap-4 cursor-pointer"
              >
                <span className="text-nvme-blue w-16 text-right font-bold">{db.offset}</span>
                <div
                  className={`flex-1 h-10 rounded-lg flex items-center justify-between px-4 transition-all ${
                    db.type === "sq"
                      ? "bg-nvme-blue/5 border border-nvme-blue/20"
                      : "bg-nvme-green/5 border border-nvme-green/20"
                  }`}
                  style={ringing === db.offset ? {
                    boxShadow: `0 0 12px ${db.type === "sq" ? "#635bff40" : "#00b89440"}`,
                  } : undefined}
                >
                  <span className={db.type === "sq" ? "text-nvme-blue" : "text-nvme-green"}>
                    {db.label}
                  </span>
                  {ringing === db.offset && (
                    <span className="text-nvme-amber text-[10px] animate-pulse">
                      DING!
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
            <div className="text-text-muted text-center py-1">
              ... one SQ + CQ doorbell pair per queue ...
            </div>
          </div>
        </div>

        {/* Address formula */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-2">
            How the address is calculated
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            The doorbell for queue <em>Q</em> lives at:
          </p>
          <div className="bg-story-surface rounded-xl p-4 font-mono text-sm text-text-code text-center mb-3">
            BAR0 + 0x1000 + (2 &times; Q + type) &times; stride
          </div>
          <p className="text-text-muted text-xs leading-relaxed">
            Where <em>type</em> is 0 for SQ (submission) or 1 for CQ (completion),
            and <em>stride</em> is read from the CAP register (usually 4 bytes).
            So the Admin SQ doorbell is at 0x1000, Admin CQ at 0x1004, I/O queue
            1 SQ at 0x1008, I/O queue 1 CQ at 0x100C, and so on.
          </p>
        </div>

        <InfoCard variant="tip" title="Shadow Doorbells — even faster in virtual machines">
          Writing to a BAR0 register is a PCIe MMIO write. In a virtual machine,
          each MMIO write traps to the hypervisor — an expensive operation. To avoid
          this, some controllers support <strong>Shadow Doorbells</strong>: the host
          writes the new pointer to regular RAM instead, and the controller
          periodically polls the RAM location. This eliminates the costly MMIO trap
          and improves VM performance significantly.
        </InfoCard>

        <KnowledgeCheck
          id="act2-doorbells-kc1"
          question="Who rings the doorbell \u2014 the host CPU or the SSD controller?"
          options={["Host CPU", "SSD Controller"]}
          correctIndex={0}
          explanation="The host CPU writes to the doorbell register (via MMIO) to notify the SSD controller that new commands have been placed in the submission queue. The controller then processes them."
          hint="Think about how the host CPU notifies the SSD that new commands are waiting."
        />
      </div>
    </SectionWrapper>
  );
}
