"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import SectionWrapper from "@/components/story/SectionWrapper";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import { getAdminCommands } from "@/lib/nvme/decoder";
import RevealCard from "@/components/story/RevealCard";

const SQEntryVisualizer = dynamic(
  () => import("@/components/commands/SQEntryVisualizer"),
  { ssr: false }
);

const DWORD_SECTIONS = [
  { dw: "CDW0", bytes: "0-3", color: "#00d4aa", label: "Opcode + CID" },
  { dw: "CDW1", bytes: "4-7", color: "#a78bfa", label: "NSID" },
  { dw: "CDW2-3", bytes: "8-15", color: "#475569", label: "Reserved" },
  { dw: "CDW4-5", bytes: "16-23", color: "#475569", label: "Metadata" },
  { dw: "CDW6-9", bytes: "24-39", color: "#38bdf8", label: "PRP Pointers" },
  { dw: "CDW10-15", bytes: "40-63", color: "#f5a623", label: "Command-Specific" },
];

function ByteRuler() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
        64-Byte SQ Entry — Visual Map
      </div>
      <div className="flex items-stretch gap-0 rounded-xl overflow-hidden mb-3">
        {DWORD_SECTIONS.map((sec, i) => {
          const widths: Record<string, string> = {
            "CDW0": "6.25%", "CDW1": "6.25%", "CDW2-3": "12.5%",
            "CDW4-5": "12.5%", "CDW6-9": "25%", "CDW10-15": "37.5%",
          };
          return (
            <motion.div
              key={sec.dw}
              className="py-3 text-center border-r border-black/10 last:border-r-0"
              style={{
                width: widths[sec.dw],
                backgroundColor: `${sec.color}15`,
                borderBottom: `3px solid ${sec.color}`,
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={inView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <div className="font-mono font-bold text-[9px]" style={{ color: sec.color }}>
                {sec.dw}
              </div>
              <div className="text-text-muted text-[7px] font-mono">{sec.label}</div>
              <div className="text-text-muted text-[7px]">bytes {sec.bytes}</div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-text-muted font-mono">
        <span>Byte 0</span>
        <span>Byte 63</span>
      </div>
    </div>
  );
}

export default function SQEStructure() {
  const identifyCmd = getAdminCommands().find((c) => c.id === "admin-identify");

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          What&apos;s Inside a Command? &mdash; The 64-Byte SQ Entry
        </h3>

        <AnalogyCard
          concept="An SQE Is a Structured Order Form"
          analogy="Every NVMe command is a 64-byte form with specific fields in specific positions. DWord 0 always contains the opcode (what to do) and command ID (tracking number). DWords 6-9 contain data buffer addresses. DWords 10-15 are command-specific parameters. It's like a standardized order form where every field has a fixed position."
        />

        <p className="text-text-secondary mb-2 leading-relaxed max-w-3xl">
          <TermDefinition term="SQE (Submission Queue Entry)" definition="A 64-byte data structure that represents one NVMe command. Contains 16 DWords (32-bit fields) specifying the opcode, namespace, data pointers, and command-specific parameters." />{" "}
          <TermDefinition term="DWord" definition="A 32-bit (4-byte) field in an NVMe command structure. DWord 0 = bytes 0-3, DWord 1 = bytes 4-7, etc. The 64-byte SQE contains DWords 0 through 15." />{" "}
          <TermDefinition term="Opcode" definition="A number in DWord 0 that tells the SSD what operation to perform. For example: 0x01 = Write, 0x02 = Read, 0x06 = Identify." />
        </p>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          In Lesson 6, we learned that commands go into the Submission Queue. But what
          does a command actually <em>look like</em>? It&apos;s not text — it&apos;s a
          precisely structured block of 64 bytes (that&apos;s 512 bits, or 16 groups
          of 4 bytes each).
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why exactly 64 bytes?</em> Think of it
          like a standardized form. Every NVMe command — whether it&apos;s
          &ldquo;read this data&rdquo; or &ldquo;tell me your serial number&rdquo; —
          uses the same 64-byte form. The first part of the form is always the same
          (who you are, what you want, where to put the result). The second part
          changes depending on the specific command.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Each 4-byte group is called a <strong className="text-text-primary">
          Command Dword</strong> (CDW), numbered 0 through 15. Here&apos;s how
          they&apos;re organized:
        </p>

        {/* Byte ruler visual */}
        <ByteRuler />

        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          {/* Fixed portion */}
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            64-Byte Command Structure
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-nvme-green/5 border border-nvme-green/20 rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                CDW0 — The &ldquo;envelope&rdquo; (bytes 0-3)
              </div>
              <div className="text-text-secondary text-sm">
                Contains the <strong className="text-text-primary">opcode</strong> (what
                kind of command this is — read, write, identify, etc.) and a unique{" "}
                <strong className="text-text-primary">Command ID</strong> (so the SSD can
                tell which response goes with which command when multiple commands are
                in-flight).
              </div>
            </div>

            <div className="bg-nvme-violet/5 border border-nvme-violet/20 rounded-xl p-4">
              <div className="text-nvme-violet font-mono font-bold text-xs mb-2">
                CDW1 — Who it&apos;s for (bytes 4-7)
              </div>
              <div className="text-text-secondary text-sm">
                The <strong className="text-text-primary">Namespace ID</strong> —
                which storage partition this command targets. Most consumer SSDs have
                just one namespace (ID=1), but enterprise drives can have many.
              </div>
            </div>

            <div className="bg-story-surface border border-story-border rounded-xl p-4">
              <div className="text-text-muted font-mono font-bold text-xs mb-2">
                CDW2-5 — Reserved &amp; metadata (bytes 8-23)
              </div>
              <div className="text-text-secondary text-sm">
                Reserved fields and a metadata pointer. Often zeros for basic commands.
              </div>
            </div>

            <div className="bg-nvme-blue/5 border border-nvme-blue/20 rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-2">
                CDW6-9 — Where to put the data (bytes 24-39)
              </div>
              <div className="text-text-secondary text-sm">
                <strong className="text-text-primary">PRP</strong> (Physical Region
                Page) pointers — RAM addresses where the SSD should read data from or
                write data to. <em>This is how the SSD knows where in host memory to
                DMA the data.</em>
              </div>
            </div>

            <div className="bg-nvme-amber/5 border border-nvme-amber/20 rounded-xl p-4">
              <div className="text-nvme-amber font-mono font-bold text-xs mb-2">
                CDW10-15 — The specifics (bytes 40-63)
              </div>
              <div className="text-text-secondary text-sm">
                <strong className="text-text-primary">Command-specific fields</strong>.
                For a Read command, this includes: which LBA to start reading from and
                how many blocks to read. For an Identify command, this says whether you
                want controller info or namespace info. Each command type uses these
                6 dwords differently.
              </div>
            </div>
          </div>

          {identifyCmd && (
            <div>
              <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
                Example: Identify Command — see how the fields map to actual bytes
              </div>
              <SQEntryVisualizer command={identifyCmd} />
            </div>
          )}
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Why is this structure important?
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            Understanding the 64-byte command format is key to everything that
            follows. When we build commands with the Command Builder tool later,
            you&apos;ll see how each field maps to specific bytes and bits. When
            we decode ftrace traces, we&apos;ll read CDW10-CDW15 to figure out
            exactly what command was sent. The 64-byte SQ entry is the fundamental
            unit of communication between your computer and the SSD.
          </p>
        </div>

        <RevealCard
          id="act3-sqe-fill1"
          prompt="Why does the NVMe specification mandate that every Submission Queue Entry be exactly the same fixed size, rather than allowing variable-length commands that could be more space-efficient for simple operations?"
          answer="Every NVMe command is exactly 64 bytes (16 DWords x 4 bytes each). A fixed-size format is essential for a circular queue to work efficiently: the controller can calculate the address of any entry instantly using simple pointer arithmetic (base + index x 64). With variable-length entries, the controller would need to parse each entry to find the next one, destroying the O(1) random access that makes NVMe queues fast. Fixed size also means the DMA engine can fetch commands in predictable chunks, and the host driver can calculate queue fullness by simple pointer comparison. The tradeoff is that simple commands (like Flush, which needs almost no parameters) waste space — but at 64 bytes per entry, the waste is negligible compared to the performance gained from predictable memory layout. This is the same reason CPU cache lines and memory pages are fixed-size."
          hint="Each submission queue entry has a fixed size defined by the NVMe specification."
          options={["Fixed 64-byte entries allow O(1) address calculation via pointer arithmetic, enabling efficient circular queue operation and predictable DMA fetches", "Variable-length commands would be more efficient but the NVMe spec committee chose fixed-size for simplicity", "The 64-byte size matches the CPU cache line size, which is the real reason for the constraint", "Fixed size prevents buffer overflow attacks that variable-length commands would enable"]}
          correctIndex={0}
        />
      </div>
    </SectionWrapper>
  );
}
