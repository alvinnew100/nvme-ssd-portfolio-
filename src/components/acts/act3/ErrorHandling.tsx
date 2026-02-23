"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import InfoCard from "@/components/story/InfoCard";
import RevealCard from "@/components/story/RevealCard";

const STATUS_CODES = [
  { code: "0x0000", meaning: "Successful Completion", type: "Generic", hint: "Everything worked as expected" },
  { code: "0x0002", meaning: "Invalid Field in Command", type: "Generic", hint: "A CDW value was wrong — wrong opcode, bad flags, etc." },
  { code: "0x0004", meaning: "Invalid Namespace or Format", type: "Generic", hint: "The NSID doesn't exist or the namespace isn't ready" },
  { code: "0x0080", meaning: "LBA Out of Range", type: "Generic", hint: "You tried to read/write beyond the namespace's size" },
  { code: "0x0081", meaning: "Capacity Exceeded", type: "Generic", hint: "Not enough space to complete the write" },
  { code: "0x0180", meaning: "Write Fault", type: "Media", hint: "The NAND couldn't program the data — possible hardware failure" },
  { code: "0x0181", meaning: "Unrecovered Read Error", type: "Media", hint: "ECC couldn't fix the data — the page is corrupted beyond repair" },
  { code: "0x0182", meaning: "End-to-End Guard Check Error", type: "Media", hint: "Data protection checksum mismatch — data was corrupted in transit" },
];

function ErrorDecisionFlow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const nodes = [
    { label: "Command\nCompletes", color: "#38bdf8", x: 0 },
    { label: "SC = 0?", color: "#a78bfa", x: 1 },
    { label: "Success!", color: "#00d4aa", x: 2, branch: "yes" },
    { label: "DNR = 1?", color: "#f5a623", x: 2, branch: "no" },
    { label: "Permanent\nError", color: "#f87171", x: 3, branch: "yes" },
    { label: "Retry", color: "#38bdf8", x: 3, branch: "no" },
  ];

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Error Decision Flow — What Happens After a Command
      </div>
      <div className="flex items-center gap-2 overflow-x-auto py-2">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.12, type: "spring" }}
            >
              {node.branch && (
                <div className={`text-[8px] font-mono mb-1 ${node.branch === "yes" ? "text-nvme-green" : "text-nvme-amber"}`}>
                  {node.branch}
                </div>
              )}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-[9px] font-bold text-center shadow-md whitespace-pre-line leading-tight"
                style={{
                  backgroundColor: `${node.color}15`,
                  border: `2px solid ${node.color}`,
                  color: node.color,
                }}
              >
                {node.label}
              </div>
            </motion.div>
            {i < nodes.length - 1 && i !== 2 && (
              <motion.div
                className="mx-1"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.12 + 0.06 }}
              >
                <svg width="16" height="8" viewBox="0 0 16 8">
                  <path d="M0 4 L12 4 L9 1 M12 4 L9 7" stroke="#475569" strokeWidth="1.5" fill="none" />
                </svg>
              </motion.div>
            )}
            {i === 2 && (
              <motion.div
                className="mx-2 flex flex-col items-center gap-1"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
              >
                <div className="w-px h-6 bg-text-muted" />
                <div className="text-[7px] text-text-muted font-mono">or</div>
                <div className="w-px h-6 bg-text-muted" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ErrorHandling() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          When Things Go Wrong &mdash; Error Handling
        </h3>

        <AnalogyCard
          concept="CQ Status Codes Are Error Reports"
          analogy="When the SSD finishes a command, it writes a 16-byte completion entry to the CQ. The status field is like a report card — 0x0 means success, anything else is an error code telling you exactly what went wrong and whether the command can be retried."
        />

        <p className="text-text-secondary mb-2 leading-relaxed max-w-3xl">
          <TermDefinition term="CQE (Completion Queue Entry)" definition="A 16-byte structure the SSD writes to the CQ after processing a command. Contains the command ID (to match the original request), a status code, and the phase bit." />{" "}
          <TermDefinition term="SCT (Status Code Type)" definition="A 3-bit field in the CQE that categorizes the error: 0 = Generic, 1 = Command Specific, 2 = Media Error, 3 = Path Related. Combined with SC (Status Code) for the full error identification." />
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We&apos;ve seen how commands are sent (via SQ) and results come back (via
          CQ). But <em className="text-text-primary">what if a command fails?</em>{" "}
          Maybe you tried to read an LBA that doesn&apos;t exist, or a NAND page
          has gone bad. The SSD needs a way to tell you exactly what went wrong.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Every command gets a 16-byte <strong className="text-text-primary">
          Completion Queue Entry (CQE)</strong> — the result slip. Inside this
          result, there&apos;s a <strong className="text-text-primary">status
          field</strong> that contains:
        </p>

        {/* Error decision flow */}
        <ErrorDecisionFlow />

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
            CQE Status Field — the SSD&apos;s answer to &ldquo;did it work?&rdquo;
          </div>
          <div className="flex items-center gap-2 font-mono text-xs mb-4">
            <div className="h-10 flex-1 bg-nvme-red/10 border border-nvme-red/30 rounded-lg flex flex-col items-center justify-center text-nvme-red">
              <span className="font-bold">DNR</span>
              <span className="text-[8px]">1 bit</span>
            </div>
            <div className="h-10 flex-1 bg-nvme-amber/10 border border-nvme-amber/30 rounded-lg flex flex-col items-center justify-center text-nvme-amber">
              <span className="font-bold">More</span>
              <span className="text-[8px]">1 bit</span>
            </div>
            <div className="h-10 flex-[2] bg-nvme-violet/10 border border-nvme-violet/30 rounded-lg flex flex-col items-center justify-center text-nvme-violet">
              <span className="font-bold">SCT</span>
              <span className="text-[8px]">3 bits</span>
            </div>
            <div className="h-10 flex-[4] bg-nvme-blue/10 border border-nvme-blue/30 rounded-lg flex flex-col items-center justify-center text-nvme-blue">
              <span className="font-bold">SC</span>
              <span className="text-[8px]">8 bits</span>
            </div>
            <div className="h-10 flex-1 bg-story-surface border border-story-border rounded-lg flex flex-col items-center justify-center text-text-muted">
              <span className="font-bold">P</span>
              <span className="text-[8px]">phase</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-text-secondary mb-4">
            <p>
              <strong className="text-nvme-blue">SC (Status Code)</strong> — the specific error code. Like an HTTP status code: 0x0000 = success, 0x0080 = LBA out of range, 0x0181 = unrecoverable read error.
            </p>
            <p>
              <strong className="text-nvme-violet">SCT (Status Code Type)</strong> — the category: Generic (bad command), Command Specific (wrong parameters for this command), or Media (NAND hardware problem).
            </p>
            <p>
              <strong className="text-nvme-red">DNR (Do Not Retry)</strong> — the critical bit. <em>If DNR=1, the error is permanent — retrying won&apos;t fix it.</em> If DNR=0, a retry might succeed (e.g., the drive was temporarily busy).
            </p>
          </div>
        </div>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why is DNR so important?</em> When a
          driver gets an error, it needs to decide: should I retry? DNR answers
          this instantly. A media error (dead NAND page) with DNR=1 means
          &ldquo;stop trying, this data is gone.&rdquo; A busy error with DNR=0
          means &ldquo;try again in a moment.&rdquo;
        </p>

        <div className="bg-story-card rounded-2xl card-shadow overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-story-border bg-story-surface">
            <span className="text-text-muted text-xs font-mono">Common Status Codes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-story-border">
                  <th className="text-left p-2.5 text-text-code font-mono">Code</th>
                  <th className="text-left p-2.5 text-text-muted">Type</th>
                  <th className="text-left p-2.5 text-text-muted">Meaning</th>
                  <th className="text-left p-2.5 text-text-muted">In plain English</th>
                </tr>
              </thead>
              <tbody>
                {STATUS_CODES.map((s) => (
                  <tr key={s.code} className="border-b border-story-border/30 hover:bg-story-surface/50 transition-colors">
                    <td className="p-2.5 text-text-code font-mono">{s.code}</td>
                    <td className="p-2.5 text-text-muted">{s.type}</td>
                    <td className="p-2.5 text-text-secondary">{s.meaning}</td>
                    <td className="p-2.5 text-text-muted italic">{s.hint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <InfoCard variant="warning" title="Async Event Requests (AER) — the drive calling YOU">
          So far, communication has been one-way: the host sends commands, the SSD
          responds. But what if something urgent happens <em>on the SSD</em> — a
          temperature spike, a namespace change, or a firmware activation? The
          host pre-posts &ldquo;Async Event Request&rdquo; commands. The SSD holds
          them and only completes one when something important happens — like a
          fire alarm that sits silent until there&apos;s smoke.
        </InfoCard>

        <RevealCard
          id="act3-errors-quiz1"
          prompt="An NVMe driver receives a completion entry with DNR=0 (Do Not Retry = false) and a media error status code. A colleague says 'just retry it forever until it works.' Under what conditions is this a terrible strategy, and how should a production driver actually handle retryable errors?"
          answer="Retrying forever is dangerous for several reasons: (1) If the NAND page has a marginal ECC issue, repeated reads can actually worsen bit errors through read disturb — each read attempt stresses neighboring cells. (2) Infinite retries block the queue slot, preventing other commands from completing. With thousands of pending I/Os, one stuck retry loop can cascade into a system-wide hang. (3) Some 'retryable' errors are actually transient-then-permanent — the SSD may return DNR=0 initially because it's still attempting internal recovery, but the data may ultimately be unrecoverable. A production driver should: set a maximum retry count (Linux NVMe uses ~3-5 retries), implement exponential backoff between retries, escalate to the upper layer (filesystem/application) after exhausting retries so it can take corrective action (like reading from a RAID mirror or reporting the error to the user), and log every retry for diagnostic purposes. The DNR bit is a hint, not a guarantee — DNR=0 means 'a retry might help,' not 'a retry will definitely work.'"
          options={["Retrying forever is correct since DNR=0 guarantees eventual success", "Limit retries to 3-5 with backoff; infinite retries can worsen errors via read disturb, block queue slots, and mask permanent failures", "Do not retry at all — DNR=0 means the SSD will internally retry and the host should just wait", "Retry exactly once — if it fails twice the NAND page is guaranteed to be permanently damaged"]}
          correctIndex={1}
        />
      </div>
    </SectionWrapper>
  );
}
