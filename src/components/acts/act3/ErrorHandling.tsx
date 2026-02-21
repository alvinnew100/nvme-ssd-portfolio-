"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

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

export default function ErrorHandling() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          When Things Go Wrong &mdash; Error Handling
        </h3>

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
      </div>
    </SectionWrapper>
  );
}
