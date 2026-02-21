"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import CodeBlock from "@/components/story/CodeBlock";
import InfoCard from "@/components/story/InfoCard";

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
                  { dw: "DW0 [7:0]", flag: "--opcode=0xNN", what: "The opcode — identifies which command this is" },
                  { dw: "DW1", flag: "--nsid=N", what: "Namespace ID (which namespace to target, 0 if admin-only)" },
                  { dw: "DW10", flag: "--cdw10=0x...", what: "Command-specific parameter (meaning depends on the opcode)" },
                  { dw: "DW11", flag: "--cdw11=0x...", what: "Command-specific parameter" },
                  { dw: "DW12", flag: "--cdw12=0x...", what: "Command-specific parameter" },
                  { dw: "DW13", flag: "--cdw13=0x...", what: "Command-specific parameter" },
                  { dw: "DW14", flag: "--cdw14=0x...", what: "Command-specific parameter" },
                  { dw: "DW15", flag: "--cdw15=0x...", what: "Command-specific parameter" },
                  { dw: "DW6-DW9", flag: "(auto: --data-len)", what: "PRP/SGL data pointer — nvme-cli fills this from --data-len" },
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
          <p className="text-text-muted text-[10px] italic leading-relaxed">
            <em>Why can&apos;t you set DW0-DW5 and DW6-DW9 directly?</em> DW0 contains
            the opcode (which you set via --opcode) plus flags and command ID that the
            kernel driver manages. DW6-DW9 are the PRP/SGL data pointers — memory
            addresses that the kernel sets up based on your --data-len. You don&apos;t
            need to touch these; the kernel handles the DMA mapping.
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

          <div className="space-y-3">
            <div>
              <div className="text-text-primary text-xs font-semibold mb-1">
                Example: Read vendor data and save to file
              </div>
              <NvmeCliBlock
                command="nvme admin-passthru /dev/nvme0 --opcode=0xC0 --cdw10=0x00000001 --data-len=4096 -r > /tmp/vendor_data.bin"
                note="Sends opcode 0xC0 with CDW10=1, reads 4096 bytes back, saves as binary file"
              />
            </div>
            <div>
              <div className="text-text-primary text-xs font-semibold mb-1">
                Example: Inspect the binary output with hexdump
              </div>
              <CodeBlock
                title="viewing the returned binary data"
                language="bash"
                code={`# hexdump shows the raw bytes in hex + ASCII
hexdump -C /tmp/vendor_data.bin | head -20

# Example output:
# 00000000  56 45 4e 44 01 00 02 00  00 10 00 00 a4 03 00 00  |VEND............|
# 00000010  e8 03 00 00 00 00 00 00  64 00 00 00 00 00 00 00  |........d.......|
# 00000020  25 04 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |%...............|
# ...
# The structure of this data is vendor-defined.
# Only the vendor's documentation tells you what each byte means.`}
              />
            </div>
            <div>
              <div className="text-text-primary text-xs font-semibold mb-1">
                Example: Send data from a file to the drive
              </div>
              <NvmeCliBlock
                command="nvme admin-passthru /dev/nvme0 --opcode=0xC1 --cdw10=0x00000002 --data-len=512 -w --input-file=/tmp/config.bin"
                note="Sends opcode 0xC1 with CDW10=2, writes 512 bytes from config.bin to the drive"
              />
            </div>
          </div>
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
                (sends to an I/O queue).
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-nvme-blue font-mono font-bold">/dev/nvme0</code>
              <p className="text-text-muted mt-1">
                <em>Which device?</em> For admin commands, use the controller device
                (<code className="text-text-code">/dev/nvme0</code>). For I/O passthru, use
                the namespace device (<code className="text-text-code">/dev/nvme0n1</code>).{" "}
                <em>Why the difference?</em> Admin commands go to the controller directly.
                I/O commands target a specific namespace.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-nvme-violet font-mono font-bold">--opcode=0xC0</code>
              <p className="text-text-muted mt-1">
                The vendor-specific opcode. This goes into DW0[7:0] of the SQE.{" "}
                <em>0xC0 is just the start of the vendor range</em> — the actual opcode
                and its meaning depend entirely on the vendor&apos;s spec.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-text-secondary font-mono font-bold">--cdw10=0x00000001</code>
              <p className="text-text-muted mt-1">
                This 32-bit value goes directly into DW10 of the SQE. What does
                &ldquo;1&rdquo; mean here? <em>Only the vendor knows.</em> It could
                mean &ldquo;sub-command 1&rdquo; or &ldquo;page 1&rdquo; or anything
                else. The meaning is defined in the vendor&apos;s internal documentation.
              </p>
            </div>
            <div className="bg-story-surface rounded-lg p-3">
              <code className="text-nvme-green font-mono font-bold">--data-len=4096 -r</code>
              <p className="text-text-muted mt-1">
                Allocate a 4096-byte buffer and tell the drive to fill it (read direction).
                nvme-cli sets up the PRP pointers in DW6-DW9 to point to this buffer.
                After the command completes, the buffer contents are printed to stdout.
              </p>
            </div>
          </div>
        </div>

        {/* ─── What the Binary Data Looks Like ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            What the Binary Data Actually Looks Like
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">When you run a passthru command with -r,
            what comes back?</em> Raw bytes. The drive fills the buffer with data
            in whatever format the vendor defined for that opcode. Here&apos;s what
            it might look like when you inspect it with <code className="text-text-code">hexdump -C</code>:
          </p>
          <pre className="text-[10px] bg-story-dark rounded-xl p-4 overflow-x-auto font-mono text-white/70 mb-4 leading-relaxed">
{`00000000  56 45 4e 44 01 00 02 00  00 10 00 00 a4 03 00 00  |VEND............|
00000010  e8 03 00 00 00 00 00 00  64 00 00 00 00 00 00 00  |........d.......|
00000020  25 04 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |%...............|
00000030  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|`}
          </pre>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">How do you make sense of this?</em> The
            left column is the byte offset, the middle is the hex values (16 bytes per
            row), and the right is the ASCII interpretation (dots for non-printable bytes).
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">But how do you know which bytes mean
            what?</em> You don&apos;t — unless you have the vendor&apos;s documentation.
            For example, the vendor spec might say:
          </p>
          <div className="space-y-1.5 text-text-secondary text-xs mb-3">
            <div className="flex items-start gap-2">
              <span className="text-text-muted flex-shrink-0 font-mono text-[10px]">Byte 0-3:</span>
              <span>Signature magic (<code className="text-text-code">0x444E4556</code> = &ldquo;VEND&rdquo; in ASCII, little-endian)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-muted flex-shrink-0 font-mono text-[10px]">Byte 4-5:</span>
              <span>Version (0x0001 = version 1)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-muted flex-shrink-0 font-mono text-[10px]">Byte 6-7:</span>
              <span>Structure type (0x0002 = health data)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-muted flex-shrink-0 font-mono text-[10px]">Byte 8-11:</span>
              <span>Total NAND writes in GB (0x00001000 = 4096 GB)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-muted flex-shrink-0 font-mono text-[10px]">Byte 12-15:</span>
              <span>Temperature in 0.1&deg;C (0x000003A4 = 932 = 93.2&deg;C)</span>
            </div>
          </div>
          <p className="text-text-muted text-[10px] italic leading-relaxed">
            This is a hypothetical example to show the concept. Every vendor defines
            their own structure layout. Without the spec, the bytes are opaque. This
            is why vendor passthru is typically used only by the vendor&apos;s own
            tools and test engineers who have access to the documentation.
          </p>
        </div>

        {/* ─── Admin vs I/O Passthru ─── */}
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
                Opcode range: 0xC0-0xFF. Device: /dev/nvme0 (controller).
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
                Opcode range: 0x80-0xFF. Device: /dev/nvme0n1 (namespace).
              </p>
            </div>
          </div>
        </div>

        {/* ─── Generic Example ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Generic Passthru Example
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
          and even firmware version. The example opcodes (0xC0, 0xC1) shown above are
          generic placeholders — the actual vendor commands you&apos;d use come from
          the vendor&apos;s internal engineering specs or SDK.{" "}
          <strong>Sending incorrect passthru commands can cause unexpected behavior or
          brick a drive.</strong> Only send commands when you know exactly what they do.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
