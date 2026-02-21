"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import CodeBlock from "@/components/story/CodeBlock";
import InfoCard from "@/components/story/InfoCard";

/* ─── Little-Endian Animator ─── */
const LE_PRESETS = [
  { label: "4096", hex: "0x00001000", bytes: ["00", "10", "00", "00"] },
  { label: "932", hex: "0x000003A4", bytes: ["A4", "03", "00", "00"] },
  { label: "1000", hex: "0x000003E8", bytes: ["E8", "03", "00", "00"] },
  { label: "500", hex: "0x000001F4", bytes: ["F4", "01", "00", "00"] },
  { label: "65535", hex: "0x0000FFFF", bytes: ["FF", "FF", "00", "00"] },
];

function LittleEndianAnimator() {
  const [selected, setSelected] = useState(0);
  const [showLE, setShowLE] = useState(false);
  const preset = LE_PRESETS[selected];

  // Big-endian bytes = hex string split into pairs (left to right)
  const hexClean = preset.hex.replace("0x", "").padStart(8, "0");
  const beBytePairs = [
    hexClean.slice(0, 2),
    hexClean.slice(2, 4),
    hexClean.slice(4, 6),
    hexClean.slice(6, 8),
  ];

  const handleSwap = () => setShowLE((p) => !p);
  const displayBytes = showLE ? preset.bytes : beBytePairs;

  return (
    <div className="bg-story-surface rounded-xl p-5 mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-text-muted text-xs">Try a value:</span>
        {LE_PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => { setSelected(i); setShowLE(false); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
              selected === i
                ? "bg-nvme-green/20 text-nvme-green"
                : "bg-story-card text-text-muted hover:text-text-secondary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="text-center mb-3">
        <span className="text-text-muted text-xs">Value: </span>
        <code className="text-text-code font-mono text-sm font-bold">{preset.hex}</code>
        <span className="text-text-muted text-xs"> (decimal {preset.label})</span>
      </div>

      <div className="flex items-center justify-center gap-1 mb-3">
        <AnimatePresence mode="popLayout">
          {displayBytes.map((byte, i) => (
            <motion.div
              key={`${showLE ? "le" : "be"}-${i}-${byte}`}
              layout
              initial={{ opacity: 0, y: showLE ? -20 : 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: showLE ? 20 : -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.08 }}
              className="bg-story-card rounded-lg p-3 min-w-[4rem] text-center"
            >
              <div className={`font-mono text-lg font-bold ${
                byte !== "00" ? "text-nvme-green" : "text-text-secondary"
              }`}>
                {byte}
              </div>
              <div className="text-text-muted text-[9px] mt-1">
                {showLE
                  ? `Byte ${i} in memory`
                  : i === 0 ? "Most significant" : i === 3 ? "Least significant" : `Byte ${i}`}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center mb-2">
        <span className={`text-xs font-semibold ${showLE ? "text-nvme-green" : "text-nvme-blue"}`}>
          {showLE ? "Little-Endian (how it's stored in memory)" : "Big-Endian (how we read hex values)"}
        </span>
      </div>

      <div className="text-center">
        <button
          onClick={handleSwap}
          className="px-4 py-2 rounded-lg bg-nvme-green/10 text-nvme-green text-xs font-semibold hover:bg-nvme-green/20 transition-colors"
        >
          {showLE ? "Show Big-Endian (human-readable)" : "Convert to Little-Endian →"}
        </button>
      </div>

      <p className="text-text-muted text-[10px] italic text-center mt-3 leading-relaxed">
        {showLE
          ? "This is the byte order you'd see in a hexdump or binary file. Least significant byte at the lowest address."
          : "This is how we write the hex value — most significant byte first. But memory stores it reversed."}
      </p>
    </div>
  );
}

/* ─── Hexdump Explorer ─── */
const HEX_DATA = [
  "56","45","4e","44","01","00","02","00","00","10","00","00","a4","03","00","00",
  "e8","03","00","00","00","00","00","00","64","00","00","00","00","00","00","00",
  "25","04","00","00","c8","00","00","00","00","00","00","00","00","00","00","00",
  "00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00",
];

const HEX_FIELDS: { start: number; end: number; name: string; raw: string; decoded: string }[] = [
  { start: 0x00, end: 0x03, name: "Magic signature", raw: "56 45 4e 44", decoded: "ASCII: \"VEND\"" },
  { start: 0x04, end: 0x05, name: "Version", raw: "01 00", decoded: "0x0001 → 1" },
  { start: 0x06, end: 0x07, name: "Structure type", raw: "02 00", decoded: "0x0002 → 2 (health)" },
  { start: 0x08, end: 0x0B, name: "NAND writes (GB)", raw: "00 10 00 00", decoded: "0x00001000 → 4096 GB" },
  { start: 0x0C, end: 0x0F, name: "Temperature", raw: "a4 03 00 00", decoded: "0x000003A4 → 932 (93.2°C)" },
  { start: 0x10, end: 0x13, name: "Power-on hours", raw: "e8 03 00 00", decoded: "0x000003E8 → 1000 hrs" },
  { start: 0x14, end: 0x17, name: "Reserved", raw: "00 00 00 00", decoded: "—" },
  { start: 0x18, end: 0x1B, name: "Percentage used", raw: "64 00 00 00", decoded: "0x00000064 → 100%" },
  { start: 0x20, end: 0x23, name: "Error count", raw: "25 04 00 00", decoded: "0x00000425 → 1061" },
  { start: 0x24, end: 0x27, name: "Available spare", raw: "c8 00 00 00", decoded: "0x000000C8 → 200 (100%)" },
];

const HEX_PRESETS = [
  { offset: 0x0C, label: "Temperature (0x0C)" },
  { offset: 0x18, label: "% Used (0x18)" },
  { offset: 0x00, label: "Magic (0x00)" },
  { offset: 0x20, label: "Errors (0x20)" },
];

function HexdumpExplorer() {
  const [selected, setSelected] = useState<number | null>(null);

  const asciiChar = (hex: string) => {
    const c = parseInt(hex, 16);
    return c >= 0x20 && c <= 0x7e ? String.fromCharCode(c) : ".";
  };

  // Find which field a byte belongs to
  const fieldFor = (offset: number) =>
    HEX_FIELDS.find((f) => offset >= f.start && offset <= f.end) ?? null;

  const activeField = selected !== null ? fieldFor(selected) : null;

  const isHighlighted = (offset: number) => {
    if (activeField) return offset >= activeField.start && offset <= activeField.end;
    return offset === selected;
  };

  return (
    <div className="bg-story-surface rounded-xl p-4">
      {/* Preset buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-text-muted text-[10px]">Jump to field:</span>
        {HEX_PRESETS.map((p) => (
          <button
            key={p.offset}
            onClick={() => setSelected(p.offset)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors ${
              activeField && p.offset >= activeField.start && p.offset <= activeField.end
                ? "bg-nvme-green/20 text-nvme-green"
                : "bg-story-card text-text-muted hover:text-text-secondary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Hexdump rows */}
      <div className="overflow-x-auto mb-4">
        <div className="font-mono text-[11px] leading-loose min-w-[540px]">
          {[0, 1, 2, 3].map((row) => {
            const rowOffset = row * 16;
            const rowBytes = HEX_DATA.slice(rowOffset, rowOffset + 16);
            return (
              <div key={row} className="flex items-center">
                {/* Offset column */}
                <span className="text-nvme-violet w-[72px] flex-shrink-0 select-none">
                  {rowOffset.toString(16).padStart(8, "0")}
                </span>
                {/* Hex bytes */}
                <span className="flex-shrink-0">
                  {rowBytes.map((byte, col) => {
                    const offset = rowOffset + col;
                    const lit = isHighlighted(offset);
                    return (
                      <span key={offset}>
                        <motion.span
                          onClick={() => setSelected(offset)}
                          className={`cursor-pointer px-[1px] rounded transition-colors ${
                            lit
                              ? "bg-nvme-green/20 text-nvme-green font-bold"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                          animate={lit ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          {byte}
                        </motion.span>
                        {col === 7 ? (
                          <span className="text-white/20">{" "} </span>
                        ) : col < 15 ? (
                          <span className="text-white/10"> </span>
                        ) : null}
                      </span>
                    );
                  })}
                </span>
                {/* ASCII column */}
                <span className="text-nvme-blue/40 ml-2 flex-shrink-0 select-none">
                  |{rowBytes.map((b, col) => {
                    const offset = rowOffset + col;
                    const lit = isHighlighted(offset);
                    return (
                      <span
                        key={offset}
                        className={lit ? "text-nvme-blue font-bold" : ""}
                      >
                        {asciiChar(b)}
                      </span>
                    );
                  })}|
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info panel */}
      <AnimatePresence mode="wait">
        {selected !== null && (
          <motion.div
            key={activeField?.name ?? selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-story-card rounded-xl p-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div>
                <div className="text-text-muted text-[10px]">Offset</div>
                <div className="text-text-code font-mono font-bold">
                  0x{selected.toString(16).padStart(2, "0").toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Row</div>
                <div className="text-nvme-violet font-mono">
                  0x{(Math.floor(selected / 16) * 16).toString(16).padStart(8, "0")}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Position in row</div>
                <div className="text-text-primary font-mono">
                  {(selected % 16).toString(16).toUpperCase()} ({selected % 16})
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Byte value</div>
                <div className="text-nvme-green font-mono font-bold">
                  0x{HEX_DATA[selected].toUpperCase()} ({parseInt(HEX_DATA[selected], 16)})
                </div>
              </div>
            </div>

            {activeField && (
              <div className="border-t border-story-border pt-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <div>
                    <span className="text-text-muted">Field: </span>
                    <span className="text-text-primary font-semibold">{activeField.name}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Raw bytes: </span>
                    <span className="text-nvme-green font-mono">{activeField.raw}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Decoded: </span>
                    <span className="text-text-primary font-mono">{activeField.decoded}</span>
                  </div>
                </div>
                {activeField.end - activeField.start >= 1 && activeField.name !== "Magic signature" && (
                  <p className="text-text-muted text-[10px] mt-2 italic">
                    Little-endian: reverse the bytes → then read as hex value
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {selected === null && (
        <div className="text-center text-text-muted text-[10px] italic py-2">
          Click any byte above to see its offset, position, and decoded value
        </div>
      )}
    </div>
  );
}

export default function Passthru() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Vendor Passthrough &mdash; The Secret Menu
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We&apos;ve covered NVMe&apos;s <em>standard</em> commands — the ones defined
          in the NVMe specification that every drive must support. But here&apos;s
          something interesting: <em className="text-text-primary">every SSD manufacturer
          also has their own secret commands.</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why would vendors need custom commands?</em>{" "}
          Because the NVMe spec defines <em>what</em> the drive does (read, write, erase)
          but not <em>how</em> the internal firmware works. Samsung&apos;s garbage
          collection is different from Intel&apos;s. WD&apos;s wear leveling algorithm
          is different from Micron&apos;s. Each vendor has internal diagnostics, debug
          logs, and tuning parameters that are specific to their firmware.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">What kinds of things do vendor commands
          do?</em> Things that the standard NVMe spec doesn&apos;t cover:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            <strong className="text-text-primary">Internal health telemetry</strong>{" "}
            — detailed statistics beyond what SMART provides (per-channel error rates,
            FTL table health, NAND die-level wear)
          </li>
          <li>
            <strong className="text-text-primary">Debug logs</strong> — firmware crash
            dumps, internal event logs, thermal throttling history
          </li>
          <li>
            <strong className="text-text-primary">Tuning parameters</strong> — adjust GC
            aggressiveness, SLC cache behavior, power management thresholds
          </li>
          <li>
            <strong className="text-text-primary">Manufacturing commands</strong> — used
            during production testing (usually locked out in consumer firmware)
          </li>
        </ul>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          The NVMe spec accounts for this by <strong className="text-text-primary">
          reserving opcode ranges</strong> for vendor use:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            Admin opcodes <code className="text-text-code">0xC0-0xFF</code> — for
            vendor-specific admin commands
          </li>
          <li>
            I/O opcodes <code className="text-text-code">0x80-0xFF</code> — for
            vendor-specific I/O commands
          </li>
        </ul>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">How do you send these?</em> With the
          {" "}<code className="text-text-code">nvme admin-passthru</code> and
          {" "}<code className="text-text-code">nvme io-passthru</code> commands.
          &ldquo;Passthru&rdquo; means &ldquo;pass this raw command through to the
          drive without the driver trying to interpret it.&rdquo; You specify the
          opcode and CDW values directly — the same dword fields we learned about
          in the SQE structure from Act 3.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But where do you get the opcodes and CDW
          values?</em> That&apos;s the catch — they&apos;re proprietary. Each vendor
          documents their passthru commands in internal engineering specs that are not
          public. If you work at a drive vendor or as an SSD test engineer, you&apos;ll
          have access to these specs. Otherwise, you typically only use passthru when
          instructed by the vendor&apos;s support team or SDK documentation.
        </p>

        {/* ─── How Passthru Maps to the SQE ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            How Passthru Maps to the 64-Byte SQE
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            <em className="text-text-primary">Remember the 64-byte Submission Queue Entry
            from Act 3?</em> Every NVMe command is a 64-byte structure with 16 dwords
            (DW0-DW15). When you use <code className="text-text-code">nvme admin-passthru</code>,
            you&apos;re manually filling in those dwords. Here&apos;s how each passthru
            flag maps to the SQE:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-story-border">
                  <th className="text-left py-2 px-3 text-text-muted font-mono">SQE Dword</th>
                  <th className="text-left py-2 px-3 text-text-muted font-mono">Passthru Flag</th>
                  <th className="text-left py-2 px-3 text-text-muted font-mono">What It Is</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { dw: "DW0 [7:0]", flag: "--opcode=0xNN", what: "The opcode — identifies which command this is. Bits 7:0 of DW0." },
                  { dw: "DW0 [15:8]", flag: "(set by kernel)", what: "FUSE — fused operation flags. The kernel manages this, not you." },
                  { dw: "DW0 [31:16]", flag: "(set by kernel)", what: "Command ID (CID) — the kernel assigns this so it can match completions to submissions." },
                  { dw: "DW1", flag: "--nsid=N", what: "Namespace ID — which namespace to target. Use 0 or omit for controller-level commands." },
                  { dw: "DW2-DW3", flag: "(reserved)", what: "Reserved in most commands. The kernel zeroes these." },
                  { dw: "DW4-DW5", flag: "(set by kernel)", what: "Metadata pointer — for commands that use separate metadata buffer. Kernel manages this." },
                  { dw: "DW6-DW9", flag: "(auto: --data-len)", what: "PRP1/PRP2 or SGL — data pointers. nvme-cli fills these based on --data-len. They point to the host memory buffer the drive reads from or writes to." },
                  { dw: "DW10", flag: "--cdw10=0x...", what: "Command Dword 10 — command-specific. What this means depends entirely on the opcode." },
                  { dw: "DW11", flag: "--cdw11=0x...", what: "Command Dword 11 — command-specific." },
                  { dw: "DW12", flag: "--cdw12=0x...", what: "Command Dword 12 — command-specific." },
                  { dw: "DW13", flag: "--cdw13=0x...", what: "Command Dword 13 — command-specific." },
                  { dw: "DW14", flag: "--cdw14=0x...", what: "Command Dword 14 — command-specific." },
                  { dw: "DW15", flag: "--cdw15=0x...", what: "Command Dword 15 — command-specific." },
                ].map((row) => (
                  <tr key={row.dw} className="border-b border-story-border/50">
                    <td className="py-2 px-3 font-mono text-text-primary">{row.dw}</td>
                    <td className="py-2 px-3 font-mono text-text-code">{row.flag}</td>
                    <td className="py-2 px-3 text-text-muted">{row.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-2">
            <em className="text-text-primary">So when you type{" "}
            <code className="text-text-code">--opcode=0xC0 --cdw10=0x00000001</code>,
            what&apos;s actually happening?</em> nvme-cli builds a 64-byte SQE in memory.
            It puts <code className="text-text-code">0xC0</code> into byte 0 (the opcode
            field of DW0), puts <code className="text-text-code">0x00000001</code> into
            bytes 40-43 (DW10), fills in DW6-DW9 with a pointer to your data buffer,
            and the kernel fills in the command ID and submits it to the admin queue.
          </p>
          <p className="text-text-muted text-[10px] italic leading-relaxed">
            <em>Why can&apos;t you set DW0 fully, or DW2-DW5, or DW6-DW9?</em>{" "}
            DW0 contains the CID and flags managed by the kernel.
            DW6-DW9 are PRP/SGL pointers — memory addresses the kernel sets up for DMA.
            You don&apos;t need to touch these; the kernel handles the DMA mapping. You
            only control the &ldquo;what to do&rdquo; parts: the opcode, namespace, and
            CDW10-CDW15 parameters.
          </p>
        </div>

        {/* ─── Passthru Flags ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Passthru Flags Reference
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            Since vendor commands aren&apos;t in the spec, <code className="text-text-code">nvme-cli</code> can&apos;t
            know what fields they need. Instead, you provide everything manually:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { flag: "--opcode=0xNN", desc: "The vendor-specific opcode (0xC0-0xFF for admin, 0x80-0xFF for I/O)" },
              { flag: "--nsid=N", desc: "Namespace ID. Some vendor commands target a namespace, others don't (use 0)" },
              { flag: "--cdw10=0x...", desc: "Command Dword 10 — vendor-defined parameter" },
              { flag: "--cdw11=0x...", desc: "Command Dword 11 — vendor-defined parameter" },
              { flag: "--cdw12=0x...", desc: "Command Dword 12 — vendor-defined parameter" },
              { flag: "--cdw13=0x...", desc: "Command Dword 13 — vendor-defined parameter" },
              { flag: "--cdw14=0x...", desc: "Command Dword 14 — vendor-defined parameter" },
              { flag: "--cdw15=0x...", desc: "Command Dword 15 — vendor-defined parameter" },
              { flag: "--data-len=N", desc: "Size of the data buffer to allocate (bytes)" },
              { flag: "-r / --read", desc: "Read data FROM the drive into the buffer (drive → host)" },
              { flag: "-w / --write", desc: "Write data TO the drive from the buffer (host → drive)" },
              { flag: "--input-file=FILE", desc: "For -w: load data to send from this binary file" },
            ].map((f) => (
              <div key={f.flag} className="bg-story-surface rounded-lg p-3">
                <code className="text-text-code font-mono text-xs">{f.flag}</code>
                <span className="text-text-muted"> — {f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Little-Endian ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Little-Endian — How Bytes Are Actually Stored
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            NVMe stores numbers with the <strong className="text-text-primary">smallest
            byte first</strong>. So the value <code className="text-text-code">0x00001000</code>{" "}
            (4096) isn&apos;t stored as <code className="text-text-code">00 00 10 00</code>{" "}
            — it&apos;s stored <em>reversed</em>:{" "}
            <code className="text-text-code">00 10 00 00</code>. This is called{" "}
            <strong className="text-text-primary">little-endian</strong>. Try it:
          </p>
          <LittleEndianAnimator />
          <p className="text-text-muted text-[10px] italic leading-relaxed">
            NVMe uses little-endian because it runs over PCIe on x86 CPUs, which are
            little-endian. Binary data from the drive is also little-endian — if you
            don&apos;t reverse the bytes when reading, you&apos;ll misread every value.
          </p>
        </div>

        {/* ─── Hexdump Explorer ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Reading a Hexdump
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            An <strong className="text-text-primary">offset</strong> is just a position
            — how many bytes from the start of the data. Byte 0 is at offset 0, byte 16
            is at offset <code className="text-text-code">0x10</code>, byte 32 is at{" "}
            <code className="text-text-code">0x20</code>, and so on.{" "}
            <code className="text-text-code">hexdump -C</code> shows your binary data
            in rows of 16 bytes. <strong className="text-text-primary">Click any byte
            below</strong> to see how it works:
          </p>
          <HexdumpExplorer />
        </div>

        {/* ─── Data Transfer Deep Dive ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Data Transfer &mdash; How Binary Data Flows
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Many vendor commands transfer data between
            the host and drive.</em> But what does this data actually look like? And how
            does it relate to the passthru flags?
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Let&apos;s think about it:</em> the NVMe
            command itself is just 64 bytes — the SQE. But some commands need to send or
            receive much more data. A vendor diagnostic dump might return 4 KB of health
            telemetry. A firmware patch might require sending a 1 MB binary blob. That
            data doesn&apos;t fit in the SQE.
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">So where does the data go?</em> Remember
            DW6-DW9 in the SQE — the PRP (Physical Region Page) pointers? They point to
            a buffer in host memory. The drive reads from or writes to that buffer via
            DMA (Direct Memory Access) over PCIe. When you specify{" "}
            <code className="text-text-code">--data-len=4096</code>, nvme-cli allocates
            a 4096-byte buffer, puts its address in DW6-DW9, and the drive fills it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-2">
                -r (read from drive)
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                nvme-cli allocates an empty buffer. The command tells the drive
                &ldquo;fill this buffer with data.&rdquo; After completion, nvme-cli
                prints the buffer content to stdout as raw binary.
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>Why raw binary and not human-readable text?</em> Because the format
                is vendor-defined. nvme-cli doesn&apos;t know how to parse it — only the
                vendor&apos;s tools know the structure. You typically redirect it to a file
                and analyze it separately.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-2">
                -w (write to drive)
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                nvme-cli fills the buffer from{" "}
                <code className="text-text-code">--input-file</code> (or stdin if no
                file is specified). The command tells the drive &ldquo;here is data for
                you to process.&rdquo;
              </p>
              <p className="text-text-muted text-[10px] italic">
                <em>What if the file is smaller than --data-len?</em> The remaining
                bytes are zero-padded. <em>What if it&apos;s larger?</em> Only the
                first --data-len bytes are sent.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Read Example with Binary ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Example: Reading Vendor Data (Drive → Host)
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Let&apos;s walk through a complete
            read example.</em> Suppose the vendor spec says: &ldquo;Opcode 0xC0
            with CDW10=0x00000001 returns a 64-byte health structure.&rdquo;
          </p>

          <div className="mb-4">
            <div className="text-text-primary text-xs font-semibold mb-1">
              Step 1: Send the command
            </div>
            <NvmeCliBlock
              command="nvme admin-passthru /dev/nvme0 --opcode=0xC0 --cdw10=0x00000001 --data-len=64 -r > /tmp/health.bin"
              note="Opcode 0xC0 (hypothetical vendor command), sub-command 1 via CDW10, read 64 bytes back, save to file"
            />
          </div>

          <div className="mb-4">
            <div className="text-text-primary text-xs font-semibold mb-1">
              Step 2: Inspect with hexdump -C
            </div>
            <CodeBlock
              title="hexdump -C /tmp/health.bin"
              language="bash"
              code={`00000000  56 45 4e 44 01 00 02 00  00 10 00 00 a4 03 00 00  |VEND............|
00000010  e8 03 00 00 00 00 00 00  64 00 00 00 00 00 00 00  |........d.......|
00000020  25 04 00 00 c8 00 00 00  00 00 00 00 00 00 00 00  |%...............|
00000030  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|`}
            />
            <p className="text-text-muted text-[10px] italic mt-2 leading-relaxed">
              4 rows × 16 bytes = 64 bytes total — matches our --data-len=64.
              Now let&apos;s decode it field by field.
            </p>
          </div>

          <p className="text-text-secondary text-xs leading-relaxed">
            <em className="text-text-primary">Step 3: Decode it.</em> This is the same
            data shown in the interactive hexdump explorer above — scroll up and click
            any byte to see the field name, raw bytes, and little-endian decoded value.
          </p>
        </div>

        {/* ─── Write Example with Binary ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Example: Sending Binary Data to the Drive (Host → Drive)
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Now let&apos;s go the other direction.</em>{" "}
            Suppose the vendor spec says: &ldquo;Opcode 0xC1 with CDW10=0x00000002
            accepts a 16-byte configuration structure.&rdquo; The structure has:
          </p>
          <ul className="text-text-secondary text-xs mb-3 leading-relaxed list-disc ml-5 space-y-1">
            <li>Byte 0-3: Mode selector (uint32, little-endian)</li>
            <li>Byte 4-7: Threshold value (uint32, little-endian)</li>
            <li>Byte 8-11: Timeout in ms (uint32, little-endian)</li>
            <li>Byte 12-15: Reserved (must be zero)</li>
          </ul>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">You want mode=3, threshold=500, timeout=5000.
            How do you create the binary file?</em> First, convert each value to
            little-endian bytes:
          </p>

          <div className="bg-story-surface rounded-xl p-4 mb-4">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-start gap-3">
                <span className="text-text-muted w-28 flex-shrink-0">mode = 3</span>
                <span className="text-text-secondary">→ 0x00000003 →</span>
                <span className="text-nvme-green font-bold">03 00 00 00</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-text-muted w-28 flex-shrink-0">threshold = 500</span>
                <span className="text-text-secondary">→ 0x000001F4 →</span>
                <span className="text-nvme-green font-bold">f4 01 00 00</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-text-muted w-28 flex-shrink-0">timeout = 5000</span>
                <span className="text-text-secondary">→ 0x00001388 →</span>
                <span className="text-nvme-green font-bold">88 13 00 00</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-text-muted w-28 flex-shrink-0">reserved</span>
                <span className="text-text-secondary">→ 0x00000000 →</span>
                <span className="text-nvme-green font-bold">00 00 00 00</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-text-primary text-xs font-semibold mb-1">
              Create the binary file using printf
            </div>
            <CodeBlock
              title="creating a 16-byte binary configuration file"
              language="bash"
              code={`# printf with \\x writes raw bytes — this creates exactly 16 bytes
printf '\\x03\\x00\\x00\\x00' > /tmp/config.bin    # mode = 3
printf '\\xf4\\x01\\x00\\x00' >> /tmp/config.bin   # threshold = 500
printf '\\x88\\x13\\x00\\x00' >> /tmp/config.bin   # timeout = 5000
printf '\\x00\\x00\\x00\\x00' >> /tmp/config.bin   # reserved

# Verify: should be exactly 16 bytes
ls -la /tmp/config.bin
# -rw-r--r-- 1 user user 16 ...

# Verify contents with hexdump
hexdump -C /tmp/config.bin
# 00000000  03 00 00 00 f4 01 00 00  88 13 00 00 00 00 00 00  |................|`}
            />
          </div>

          <div className="mb-4">
            <div className="text-text-primary text-xs font-semibold mb-1">
              Send it to the drive
            </div>
            <NvmeCliBlock
              command="nvme admin-passthru /dev/nvme0 --opcode=0xC1 --cdw10=0x00000002 --data-len=16 -w --input-file=/tmp/config.bin"
              note="Opcode 0xC1 (hypothetical vendor command), CDW10 sub-command 2, write 16 bytes from config.bin"
            />
          </div>

          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">What happens under the hood?</em>{" "}
            nvme-cli reads the 16 bytes from <code className="text-text-code">config.bin</code>{" "}
            into a buffer, puts the buffer&apos;s memory address into DW6-DW9 (the PRP
            pointers), and submits the SQE with opcode=0xC1 and CDW10=0x00000002.
            The drive DMAs the 16 bytes from host memory and processes them according to
            its firmware&apos;s definition of opcode 0xC1.
          </p>

          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">What if you got the endianness wrong?</em>{" "}
            Say you wrote threshold=500 as <code className="text-text-code">00 00 01 f4</code>{" "}
            (big-endian) instead of <code className="text-text-code">f4 01 00 00</code>{" "}
            (little-endian). The drive would interpret those bytes as{" "}
            <code className="text-text-code">0xF4010000</code> = 4,093,706,240 — a completely
            wrong value. <em>This is one of the most common mistakes when working with binary
            passthru commands.</em>
          </p>

          <p className="text-text-muted text-[10px] italic leading-relaxed">
            <em>Can you use python instead of printf?</em> Absolutely.{" "}
            <code className="text-text-code">
            python3 -c &quot;import struct; open(&apos;/tmp/config.bin&apos;,&apos;wb&apos;).write(struct.pack(&apos;&lt;III4x&apos;, 3, 500, 5000))&quot;
            </code>{" "}
            — the <code className="text-text-code">&lt;</code> in the format string means
            little-endian, <code className="text-text-code">I</code> means unsigned 32-bit
            int, and <code className="text-text-code">4x</code> means 4 padding bytes.
          </p>
        </div>

        {/* ─── Anatomy of a Passthru Command ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Anatomy of a Passthru Command — What Each Piece Does
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            Let&apos;s break down a passthru command piece by piece to understand
            exactly what&apos;s happening:
          </p>
          <pre className="text-xs bg-story-dark rounded-xl p-4 overflow-x-auto font-mono text-white/80 mb-4">
            <span className="text-nvme-green">nvme admin-passthru</span>{" "}
            <span className="text-nvme-blue">/dev/nvme0</span>{" "}
            <span className="text-nvme-amber">\{"\n"}</span>
            {"  "}<span className="text-nvme-violet">--opcode=0xC0</span>{" "}
            <span className="text-nvme-amber">\{"\n"}</span>
            {"  "}<span className="text-text-secondary">--cdw10=0x00000001</span>{" "}
            <span className="text-nvme-amber">\{"\n"}</span>
            {"  "}<span className="text-text-secondary">--cdw12=0x00001000</span>{" "}
            <span className="text-nvme-amber">\{"\n"}</span>
            {"  "}<span className="text-nvme-green">--data-len=4096</span>{" "}
            <span className="text-nvme-amber">\{"\n"}</span>
            {"  "}<span className="text-nvme-green">-r</span>
          </pre>
          <div className="space-y-2 text-xs">
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-nvme-green font-mono font-bold">nvme admin-passthru</code>
              <p className="text-text-muted mt-1">
                Use the admin passthru path (sends to queue 0 — the admin queue). For
                I/O vendor commands, use <code className="text-text-code">nvme io-passthru</code> instead
                (sends to an I/O queue).{" "}
                <em>Why two different paths?</em> Because admin and I/O queues are separate
                in NVMe — admin commands go to the single admin queue (QID 0), while I/O
                commands go to one of potentially hundreds of I/O queues (QID 1+).
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-nvme-blue font-mono font-bold">/dev/nvme0</code>
              <p className="text-text-muted mt-1">
                <em>Which device?</em> For admin commands, use the controller device
                (<code className="text-text-code">/dev/nvme0</code>). For I/O passthru, use
                the namespace device (<code className="text-text-code">/dev/nvme0n1</code>).{" "}
                <em>Why the difference?</em> Admin commands go to the controller directly —
                there&apos;s only one controller, so <code className="text-text-code">/dev/nvme0</code>.
                I/O commands target a specific namespace, and a controller can have multiple
                namespaces — so you specify which one.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-nvme-violet font-mono font-bold">--opcode=0xC0</code>
              <p className="text-text-muted mt-1">
                The vendor-specific opcode. This goes into DW0[7:0] of the SQE — the
                lowest byte of the first dword.{" "}
                <em>0xC0 is just a placeholder</em> — it&apos;s the first value in the
                vendor admin range (0xC0-0xFF). It has no universal meaning. The vendor
                decides what each opcode in this range does.{" "}
                <em>What happens if you use a standard opcode like 0x02 (Read)?</em>{" "}
                It would work — passthru just sends raw SQEs. But there&apos;s no reason
                to use passthru for standard commands since nvme-cli already has dedicated
                subcommands for them (like <code className="text-text-code">nvme read</code>).
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-text-secondary font-mono font-bold">--cdw10=0x00000001</code>
              <p className="text-text-muted mt-1">
                This 32-bit value goes directly into DW10 of the SQE. What does
                &ldquo;1&rdquo; mean here? <em>Only the vendor knows.</em> It could
                mean &ldquo;sub-command 1&rdquo; or &ldquo;page 1&rdquo; or anything
                else. The meaning is defined in the vendor&apos;s internal documentation.{" "}
                <em>And since it&apos;s a 32-bit field, the vendor can pack multiple
                sub-fields into it</em> — for example, bits 7:0 might be a sub-opcode
                and bits 15:8 might be a page number. You&apos;d need the vendor spec to
                know.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-text-secondary font-mono font-bold">--cdw12=0x00001000</code>
              <p className="text-text-muted mt-1">
                Another command-specific parameter in DW12. In this hypothetical example,
                maybe it&apos;s a data offset or a feature selector — again,
                vendor-defined.{" "}
                <em>Notice we skipped CDW11.</em> That&apos;s fine — you only need to
                set the dwords that the specific vendor command uses. Omitted dwords
                default to 0.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-nvme-green font-mono font-bold">--data-len=4096 -r</code>
              <p className="text-text-muted mt-1">
                Allocate a 4096-byte buffer and tell the drive to fill it (read direction).
                nvme-cli sets up the PRP pointers in DW6-DW9 to point to this buffer.
                After the command completes, the buffer contents are printed to stdout.{" "}
                <em>The <code className="text-text-code">-r</code> is what makes this a
                &ldquo;read from drive&rdquo; command</em> — not the opcode. The opcode
                tells the drive what to do; <code className="text-text-code">-r</code> tells
                nvme-cli which direction data flows.
              </p>
            </div>
          </div>
        </div>

        {/* ─── admin vs io passthru ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            admin-passthru vs io-passthru
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            <em className="text-text-primary">When do you use admin-passthru vs
            io-passthru?</em> It depends on which queue the command targets:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-1">
                nvme admin-passthru
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                Sends to the <strong>admin queue (qid=0)</strong>. Used for controller-level
                operations: diagnostics, configuration, manufacturing commands.
              </p>
              <p className="text-text-muted text-[10px] italic">
                Opcode range: 0xC0-0xFF. Device: /dev/nvme0 (controller).{" "}
                <em>Why the admin queue?</em> Because these commands affect the entire
                controller, not a specific namespace&apos;s data.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">
                nvme io-passthru
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">
                Sends to an <strong>I/O queue (qid &ge; 1)</strong>. Used for namespace-level
                operations: vendor-specific read/write modes, data transformation commands.
              </p>
              <p className="text-text-muted text-[10px] italic">
                Opcode range: 0x80-0xFF. Device: /dev/nvme0n1 (namespace).{" "}
                <em>Why a different opcode range?</em> The NVMe spec reserves different
                ranges for admin (0xC0-0xFF) and I/O (0x80-0xFF) to prevent confusion —
                an opcode that&apos;s valid on the admin queue might not exist on I/O
                queues and vice versa.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Generic Workflow ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Generic Passthru Workflow
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            Here&apos;s a generic example showing the full workflow — send a vendor
            command, capture the output, and inspect it:
          </p>
          <CodeBlock
            title="full passthru workflow"
            language="bash"
            code={`# Step 1: Send the vendor command and save the binary output
nvme admin-passthru /dev/nvme0 \\
  --opcode=0xC0 \\
  --cdw10=0x00000001 \\
  --data-len=4096 \\
  -r > /tmp/vendor_data.bin

# Step 2: Check the command succeeded (exit code 0 = success)
echo "Exit code: $?"

# Step 3: Check the file size matches --data-len
ls -la /tmp/vendor_data.bin

# Step 4: Inspect the raw bytes
hexdump -C /tmp/vendor_data.bin | head -20

# Step 5: For write direction — send data TO the drive
nvme admin-passthru /dev/nvme0 \\
  --opcode=0xC1 \\
  --cdw10=0x00000002 \\
  --data-len=512 \\
  -w --input-file=/tmp/config.bin`}
          />
        </div>

        <InfoCard variant="warning" title="Vendor opcodes are proprietary — proceed with caution">
          <em className="text-text-primary">The opcodes, CDW values, and data formats
          for vendor commands are proprietary</em> — they are not part of the NVMe
          specification and are not publicly documented. They vary by vendor, model,
          and even firmware version. The opcodes 0xC0 and 0xC1 used in these examples
          are arbitrary placeholders — <strong>they are NOT a standard read/write
          pair</strong>. We chose them simply because they&apos;re the first two values
          in the vendor-specific range. The actual vendor commands, their opcodes, and
          what direction they transfer data all come from the vendor&apos;s internal specs.
          All data structures and field layouts shown above are hypothetical.{" "}
          <strong>Sending incorrect passthru commands can cause unexpected behavior or
          brick a drive.</strong> Only send commands when you know exactly what they do.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
