"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import QuizCard from "@/components/story/QuizCard";

const SEDUTIL_COMMANDS = [
  {
    name: "Scan for drives",
    cmd: "sedutil-cli --scan",
    desc: "Lists all drives and shows whether they support TCG Opal. Look for \"Opal 2.0\" in the output.",
    why: "Not all SSDs support hardware encryption. Before doing anything, you need to know if your drive supports TCG Opal. If it says \"No\" for Opal support, the drive either doesn't have SED capability or uses a different security protocol.",
    output: `/dev/nvme0n1  2  Samsung SSD 990 PRO 1TB     Opal 2.0  Locked = N`,
  },
  {
    name: "Query drive details",
    cmd: "sedutil-cli --query /dev/nvme0n1",
    desc: "Shows the drive's security capabilities: Opal version, encryption status, locking features, number of locking ranges, and whether a password is set.",
    why: "This tells you the drive's full security state. Is a password already set? How many locking ranges does it support? Is it currently locked or unlocked? You need this information before configuring anything.",
    output: null,
  },
  {
    name: "Set up initial password",
    cmd: "sedutil-cli --initialSetup <password> /dev/nvme0n1",
    desc: "Performs first-time setup: takes ownership of the drive by setting the SID (Security ID) password and enabling locking on the global range. This is irreversible without a PSID revert.",
    why: "A factory-fresh SED has no password — anyone can read the data. This command enables the locking mechanism and sets your password. Think of it as activating the lock on a new front door and keeping the only key. Without this step, the SED encryption is meaningless because the drive auto-unlocks for everyone.",
    output: null,
  },
  {
    name: "Enable locking on global range",
    cmd: "sedutil-cli --enableLockingRange 0 <password> /dev/nvme0n1",
    desc: "Enables the locking feature on Range 0 (the global range — the entire drive). After this, the drive will lock when powered off and require the password to unlock on next boot.",
    why: "Setting a password alone isn't enough. You also need to enable the locking mechanism on the range you want to protect. Range 0 covers the entire drive. Once enabled, the drive encrypts all data with a key that's only accessible after authentication. Power off → locked. Power on → need password.",
    output: null,
  },
  {
    name: "Lock the drive",
    cmd: "sedutil-cli --setLockingRange 0 LK <password> /dev/nvme0n1",
    desc: "Immediately locks Range 0. Any reads or writes to the drive will fail until it's unlocked. The data is not erased — it's still there, just inaccessible.",
    why: "You might lock the drive manually before shipping it, decommissioning it, or when you detect a security threat. The 'LK' means set it to Locked state. The drive's data is encrypted at rest — without the key (derived from your password), the data is just random noise.",
    output: null,
  },
  {
    name: "Unlock the drive",
    cmd: "sedutil-cli --setLockingRange 0 RW <password> /dev/nvme0n1",
    desc: "Unlocks Range 0 for read-write access. The SSD decrypts data on-the-fly using the key derived from your password. Performance is unchanged — decryption happens in dedicated hardware.",
    why: "'RW' means set it to Read-Write state (unlocked). You can also use 'RO' for read-only access. After unlocking, the drive behaves like a normal unencrypted SSD — all the encryption and decryption happens transparently in the controller's AES engine at wire speed.",
    output: null,
  },
  {
    name: "PSID Revert (factory reset)",
    cmd: "sedutil-cli --PSIDrevert <PSID> /dev/nvme0n1",
    desc: "Factory resets the drive's security state using the PSID (Physical Security ID) printed on the drive's label. Destroys the encryption key, making ALL data permanently unrecoverable. Resets all passwords and locking ranges.",
    why: "This is the emergency escape hatch. If you forget your password, the PSID revert is the only way to regain access to the drive — but at the cost of all data. The PSID is physically printed on the drive's label, so you need physical access. This is by design: it prevents remote attackers from wiping the drive while allowing the physical owner to recover the hardware.",
    output: null,
  },
];

const LOCKING_RANGES = [
  {
    range: "Range 0 (Global)",
    lbaStart: "0",
    lbaEnd: "Entire drive",
    desc: "Covers the entire drive. Most common — protects everything with one password. When you run --initialSetup, this is the range that gets configured.",
    useCase: "Single-user laptop, full-disk encryption",
  },
  {
    range: "Range 1",
    lbaStart: "0",
    lbaEnd: "Custom",
    desc: "A custom LBA range with its own independent password. Can overlap or partition the drive. Useful for separating OS and data partitions with different access controls.",
    useCase: "OS partition — boots with one password",
  },
  {
    range: "Range 2",
    lbaStart: "Custom",
    lbaEnd: "Custom",
    desc: "Another independent range with its own password. Up to 8+ ranges supported depending on the drive. Each range can be locked/unlocked independently.",
    useCase: "Data partition — separate access control",
  },
];

export default function Security() {
  const [activeCmd, setActiveCmd] = useState(0);

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Security &mdash; Protecting Data at the Hardware Level
        </h3>

        <AnalogyCard concept="SSD Security Has Three Layers" analogy="SSD security is like securing a vault: encryption (scrambles data so stolen NAND chips are unreadable), authentication (only authorized users can unlock the drive), and sanitization (irreversibly destroy data when decommissioning). TCG Opal provides hardware-based encryption with user/admin passwords." />
        <TermDefinition term="TCG Opal" definition="A standard for hardware-based full-disk encryption built into the SSD controller. Uses a Data Encryption Key (DEK) to encrypt all data written to NAND, and an Authentication Key (AK) to lock/unlock the drive." />
        <TermDefinition term="DEK (Data Encryption Key)" definition="The symmetric key (typically AES-256) used to encrypt/decrypt all data on the SSD. Stored securely in the controller. Crypto-erasing the DEK instantly makes all data on the drive unrecoverable." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          So far, we&apos;ve talked about reading, writing, erasing, and updating
          SSDs. But what about <em className="text-text-primary">protecting</em> the
          data on them? If someone steals your laptop — or a decommissioned server
          drive ends up on eBay — can they read your data?
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Here&apos;s the key insight:</em> software
          encryption (like BitLocker or LUKS) encrypts data before it reaches the SSD.
          But there&apos;s another approach — the SSD itself can encrypt everything
          internally, <em>transparently</em>, without any software overhead. This is
          called a <strong className="text-text-primary">Self-Encrypting Drive (SED)</strong>.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But why encrypt at the hardware level?</em>{" "}
          Three reasons:
        </p>
        <ul className="text-text-secondary mb-8 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            <strong className="text-text-primary">Zero performance cost</strong> — the
            controller has a dedicated AES engine. Encryption happens at wire speed, no
            CPU involved
          </li>
          <li>
            <strong className="text-text-primary">Instant secure erase</strong> — remember
            the Crypto Erase from the Format/Sanitize section? It works by destroying the
            encryption key, making all data unreadable in microseconds
          </li>
          <li>
            <strong className="text-text-primary">Always-on</strong> — every bit written
            to NAND is encrypted, even if the OS doesn&apos;t know about it. There&apos;s
            no &ldquo;forgot to enable encryption&rdquo; scenario
          </li>
        </ul>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="text-nvme-green font-mono font-bold text-sm mb-2">
              Self-Encrypting Drives (SED)
            </div>
            <p className="text-text-secondary text-xs leading-relaxed mb-3">
              The drive encrypts <em>all</em> data with AES-256 transparently.
              The encryption key is generated inside the controller and{" "}
              <strong className="text-text-primary">never leaves the chip</strong>.
              Even the host OS never sees the raw key.
            </p>
            <p className="text-text-muted text-xs leading-relaxed">
              <em>But wait</em> — if it&apos;s always encrypted, how does the host
              read data? The controller decrypts on-the-fly as data leaves the drive.
              From the host&apos;s perspective, it looks like an unencrypted drive.
              The protection kicks in when the drive is powered off or removed.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="text-nvme-violet font-mono font-bold text-sm mb-2">
              TCG Opal 2.0
            </div>
            <p className="text-text-secondary text-xs leading-relaxed mb-3">
              <em className="text-text-primary">If the drive always decrypts for the
              host, what stops a thief?</em> TCG Opal. It&apos;s an industry standard
              that adds <strong className="text-text-primary">authentication</strong> —
              a password that must be provided before the drive will unlock.
            </p>
            <p className="text-text-muted text-xs leading-relaxed">
              Features: pre-boot authentication (password required before OS loads),
              per-range locking (different passwords for different LBA ranges),
              and enterprise key management. TCG Opal communicates with the drive
              through NVMe Security Send/Receive commands.
            </p>
          </div>
        </div>

        {/* How SED Actually Works */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            How SED Encryption Actually Works — The Key Hierarchy
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            <em className="text-text-primary">If the encryption key never leaves the
            chip, how does your password unlock the data?</em> The answer is a
            two-level key hierarchy:
          </p>
          <div className="space-y-3 mb-4">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-green font-mono font-bold text-xs mb-1">
                Data Encryption Key (DEK)
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                The actual key that encrypts/decrypts your data. Generated randomly
                by the controller&apos;s hardware random number generator during
                manufacturing. <em>This key never changes</em> — it&apos;s the same
                for the life of the drive (unless you do a crypto erase, which
                generates a new one).
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">
                Key Encryption Key (KEK)
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Derived from <em>your password</em>. The KEK encrypts the DEK.
                When you type your password, the drive derives the KEK, uses it to
                decrypt the DEK, and then uses the DEK to decrypt your data.{" "}
                <em className="text-text-primary">Why this indirection?</em> So you
                can change your password without re-encrypting the entire drive — only
                the wrapped DEK needs to be re-encrypted with the new KEK.
              </p>
            </div>
          </div>
          <p className="text-text-muted text-xs leading-relaxed italic">
            <em>And what is &ldquo;crypto erase&rdquo; really?</em> The drive generates
            a new random DEK. The old DEK is gone. Since all data was encrypted with the
            old DEK, it&apos;s now unreadable — even though the NAND cells still physically
            hold the encrypted bits. No need to erase billions of cells — just destroy
            one 256-bit key.
          </p>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            How Security Send/Receive Works
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            NVMe doesn&apos;t handle encryption directly — it provides two
            &ldquo;tunnel&rdquo; commands that carry security protocol messages
            between the host and the drive&apos;s security subsystem:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">
                Security Send (opcode 0x81)
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Host sends a command or data <em>to</em> the drive&apos;s security
                subsystem. Example: &ldquo;Here is my password, please unlock.&rdquo;
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-4">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">
                Security Receive (opcode 0x82)
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Host reads a response <em>from</em> the drive&apos;s security
                subsystem. Example: &ldquo;Password accepted, drive unlocked.&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Security Protocols (SECP)
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            The SECP field in Security Send/Receive specifies <em>which</em> security
            protocol to use. Think of it as selecting a language for the conversation:
          </p>
          <div className="space-y-2">
            {[
              { secp: "0x00", name: "Security Protocol Information", desc: "Ask the drive \"What security protocols do you support?\"" },
              { secp: "0x01", name: "TCG Opal", desc: "The most common SED standard — authentication, locking, key management" },
              { secp: "0x02", name: "TCG Enterprise", desc: "Enterprise variant with per-band encryption for server workloads" },
              { secp: "0xEF", name: "IEEE 1667", desc: "Microsoft's standard for Windows hardware encryption integration" },
            ].map((p) => (
              <div key={p.secp} className="flex items-start gap-3 bg-story-surface rounded-lg p-3">
                <code className="text-text-code text-xs font-mono flex-shrink-0">{p.secp}</code>
                <div>
                  <span className="text-text-primary text-xs font-semibold">{p.name}</span>
                  <span className="text-text-muted text-xs"> — {p.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── sedutil Section ─── */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-text-primary mb-3">
            sedutil &mdash; Managing SED from the Command Line
          </h4>
          <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
            <em className="text-text-primary">So how do you actually set a password
            and lock the drive?</em> TCG Opal uses the Security Send/Receive commands
            under the hood, but you don&apos;t construct those raw NVMe commands
            yourself. Instead, you use{" "}
            <strong className="text-text-primary">sedutil-cli</strong> — an open-source
            tool that speaks the TCG Opal protocol.
          </p>
          <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
            <em className="text-text-primary">Why not just use nvme-cli?</em> Because
            nvme-cli doesn&apos;t understand TCG Opal&apos;s protocol messages. It can
            send raw Security Send/Receive commands, but the payload format is defined
            by the TCG Opal specification — a complex binary protocol with sessions,
            tokens, and method calls. sedutil handles all of that for you.
          </p>

          <NvmeCliBlock
            command="sudo apt install sedutil"
            note="Install sedutil on Debian/Ubuntu. Also available for Fedora (dnf), Arch (AUR), and from source at github.com/Drive-Trust-Alliance/sedutil"
          />
        </div>

        {/* ─── MBR Shadowing — explained before it's used ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            MBR Shadowing &mdash; The Boot Trick That Makes SED Work
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Here&apos;s a chicken-and-egg problem:</em>{" "}
            if the drive is locked, the OS can&apos;t boot (the drive won&apos;t return
            any data). But if the OS can&apos;t boot, how do you type in your password
            to unlock the drive?
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            TCG Opal solves this with <strong className="text-text-primary">MBR
            shadowing</strong>. The idea: the drive has a small hidden storage area
            called the <strong className="text-text-primary">Shadow MBR</strong>. You
            load a tiny bootable image into it — the <strong className="text-text-primary">
            PBA (Pre-Boot Authentication)</strong> image. This is a minimal Linux
            system whose only job is to ask for your password.
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">How does &ldquo;shadowing&rdquo; work
            exactly?</em> When MBR shadowing is enabled and the drive is locked, reads
            to the beginning of the drive (where the MBR/boot sector normally lives)
            return the Shadow MBR content instead of the actual disk content. The BIOS
            or UEFI sees what looks like a normal bootable drive and loads the PBA image.
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            The PBA boots, prompts you for your password, and sends it to the drive via
            TCG Opal commands. Once authenticated, the drive unlocks and{" "}
            <strong className="text-text-primary">disables the shadow</strong> — now reads
            to the beginning of the drive return the actual boot sector. The PBA then
            triggers a warm reboot, and this time the BIOS sees your real OS and boots
            normally.
          </p>
          <p className="text-text-muted text-[10px] italic leading-relaxed">
            <em>Why not just use BIOS/UEFI password instead?</em> Because a BIOS password
            only prevents booting — it doesn&apos;t encrypt the data. Someone could remove
            the drive and read it in another machine. SED with MBR shadowing encrypts the
            data AND prevents unauthorized boot. Even if the drive is moved to another
            machine, the data stays locked.
          </p>
        </div>

        {/* ─── TCG Opal Authorities ─── */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            TCG Opal Authorities &mdash; Who Has Which Keys?
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">If there are multiple locking ranges with
            different passwords, who manages all of this?</em> TCG Opal has a concept
            of <strong className="text-text-primary">authorities</strong> — different
            identities with different permissions:
          </p>
          <div className="space-y-2 mb-3">
            <div className="bg-story-surface rounded-xl p-3">
              <div className="text-nvme-green font-mono font-bold text-xs mb-1">SID (Security ID)</div>
              <p className="text-text-muted text-xs leading-relaxed">
                The <em>owner</em> of the drive. Can change all settings, create/delete
                locking ranges, and manage other authorities. <em className="text-text-primary">
                Think of SID as the building owner</em> — they can change any lock, give out
                any key, or reset the entire system.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-3">
              <div className="text-nvme-blue font-mono font-bold text-xs mb-1">Admin1</div>
              <p className="text-text-muted text-xs leading-relaxed">
                The primary administrator. Can lock/unlock ranges and manage day-to-day
                security operations. <em className="text-text-primary">The building
                manager</em> — can lock/unlock doors but can&apos;t change the master plan.
              </p>
            </div>
            <div className="bg-story-surface rounded-xl p-3">
              <div className="text-nvme-violet font-mono font-bold text-xs mb-1">User1, User2, ...</div>
              <p className="text-text-muted text-xs leading-relaxed">
                Optional user authorities. Each can be assigned to a specific locking range.{" "}
                <em className="text-text-primary">Tenants</em> — each has a key to their
                own apartment but can&apos;t access others.
              </p>
            </div>
          </div>
          <p className="text-text-muted text-[10px] italic leading-relaxed">
            <em>What happens if you set the SID password but forget it?</em> You can
            still PSID revert (physical label) to factory reset. But if you set the Admin1
            password and forget it, only the SID or PSID can recover. This layered authority
            system prevents a single compromised password from giving access to everything.
          </p>
        </div>

        {/* sedutil command explorer */}
        <div className="mb-6">
          <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
            sedutil Command Reference — click to explore
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {SEDUTIL_COMMANDS.map((cmd, i) => (
              <button
                key={cmd.name}
                onClick={() => setActiveCmd(i)}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                  i === activeCmd
                    ? "bg-nvme-violet text-white shadow-md"
                    : "bg-story-card border border-story-border text-text-secondary hover:text-nvme-violet hover:border-nvme-violet/40 card-shadow"
                }`}
              >
                {cmd.name}
              </button>
            ))}
          </div>

          <div className="bg-story-card rounded-2xl p-6 card-shadow mb-4">
            <div className="text-text-primary font-semibold mb-1">
              {SEDUTIL_COMMANDS[activeCmd].name}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              {SEDUTIL_COMMANDS[activeCmd].desc}
            </p>
            <p className="text-nvme-violet text-xs leading-relaxed mb-4 italic">
              {SEDUTIL_COMMANDS[activeCmd].why}
            </p>
            <NvmeCliBlock
              command={SEDUTIL_COMMANDS[activeCmd].cmd}
              note={SEDUTIL_COMMANDS[activeCmd].desc}
            />
            {SEDUTIL_COMMANDS[activeCmd].output && (
              <pre className="mt-3 text-xs bg-story-dark rounded-xl p-4 overflow-x-auto font-mono text-white/80">
                <span className="text-text-muted select-none">$ {SEDUTIL_COMMANDS[activeCmd].cmd}{"\n"}</span>
                {SEDUTIL_COMMANDS[activeCmd].output}
              </pre>
            )}
          </div>
        </div>

        {/* Locking Ranges */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Locking Ranges &mdash; Partition-Level Security
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            <em className="text-text-primary">Why would you need multiple passwords
            for one drive?</em> Imagine a shared server where the OS partition and
            the data partition need different access controls. Or a laptop where
            the recovery partition should stay accessible even when the main partition
            is locked. TCG Opal supports <strong className="text-text-primary">
            locking ranges</strong> — independent LBA regions, each with its own
            password and lock state.
          </p>
          <div className="space-y-3 mb-4">
            {LOCKING_RANGES.map((lr) => (
              <div key={lr.range} className="bg-story-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-text-primary text-xs font-mono font-bold">{lr.range}</span>
                  <span className="text-text-muted text-[10px] font-mono">LBA {lr.lbaStart} → {lr.lbaEnd}</span>
                </div>
                <p className="text-text-muted text-xs leading-relaxed mb-1">{lr.desc}</p>
                <p className="text-nvme-blue text-[10px] italic">Use case: {lr.useCase}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <NvmeCliBlock
              command="sedutil-cli --setLockingRange 1 LK <password> /dev/nvme0n1"
              note="Lock only Range 1 — other ranges remain accessible"
            />
            <NvmeCliBlock
              command="sedutil-cli --setLockingRange 1 RW <password> /dev/nvme0n1"
              note="Unlock Range 1 for read-write access"
            />
            <NvmeCliBlock
              command="sedutil-cli --setLockingRange 2 RO <password> /dev/nvme0n1"
              note="Set Range 2 to read-only — data visible but can't be modified"
            />
          </div>
        </div>

        {/* Typical sedutil workflow */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Typical SED Setup Workflow
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            Setting up SED encryption from scratch, step by step. <em className="text-text-primary">
            Why so many steps?</em> Because security requires explicit intent at every
            stage — you don&apos;t want encryption activating accidentally and locking
            you out of your own drive.
          </p>
          <div className="space-y-4">
            {[
              { step: 1, title: "Verify support", cmd: "sedutil-cli --scan", why: "Confirm your drive supports TCG Opal 2.0. Not all SSDs have SED capability — check before doing anything else." },
              { step: 2, title: "Check current state", cmd: "sedutil-cli --query /dev/nvme0n1", why: "See if a password is already set or if locking is enabled. A drive that was previously configured needs different handling." },
              { step: 3, title: "Initial setup (take ownership)", cmd: "sedutil-cli --initialSetup <password> /dev/nvme0n1", why: "Sets both SID and Admin1 passwords at once. Also enables MBR shadowing support (the Shadow MBR feature we explained above — so PBA can work later)." },
              { step: 4, title: "Enable locking on global range", cmd: "sedutil-cli --enableLockingRange 0 <password> /dev/nvme0n1", why: "Activates the lock mechanism on Range 0 (entire drive). After this, the drive will lock itself when power is removed." },
              { step: 5, title: "Load PBA image into Shadow MBR", cmd: "sedutil-cli --loadPBAimage <password> /path/to/UEFI64-n.nn.img /dev/nvme0n1", why: "Writes the pre-boot authentication image to the Shadow MBR area. This is the tiny OS that prompts for your password before your real OS boots." },
              { step: 6, title: "Enable MBR shadowing", cmd: "sedutil-cli --setMBREnable on <password> /dev/nvme0n1", why: "Turns on the shadow. Now when the locked drive is read at boot, it returns the PBA image instead of the encrypted disk content. The BIOS boots the PBA, you type your password, drive unlocks, PBA reboots into your real OS." },
              { step: 7, title: "Test with a power cycle", cmd: "# Power cycle the machine and verify the PBA prompts for your password", why: "Always test before relying on it. If the PBA doesn't appear, PSID revert is still available as an escape hatch. Better to find out now than after you've been using it for months." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-nvme-violet/10 text-nvme-violet flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="text-text-primary text-sm font-semibold">{item.title}</div>
                  <div className="text-text-muted text-[10px] mb-2 italic">{item.why}</div>
                  <NvmeCliBlock command={item.cmd} note={item.why} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MBRDone — the unlock flow */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            The Unlock Flow &mdash; What Happens at Every Boot
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Once SED is set up, what happens every
            time you turn on the machine?</em> Here&apos;s the boot sequence:
          </p>
          <div className="space-y-1.5 text-text-secondary text-xs mb-4">
            <div className="flex items-start gap-2">
              <span className="text-nvme-violet flex-shrink-0 font-bold">1.</span>
              <span>Machine powers on. Drive is <strong className="text-text-primary">locked</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-violet flex-shrink-0 font-bold">2.</span>
              <span>BIOS/UEFI reads the boot sector. MBR shadowing is on, so the drive returns the <strong className="text-text-primary">Shadow MBR</strong> (PBA image) instead of the encrypted content.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-violet flex-shrink-0 font-bold">3.</span>
              <span>BIOS boots the PBA. It shows a password prompt.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-violet flex-shrink-0 font-bold">4.</span>
              <span>You type your password. PBA sends it to the drive via TCG Opal (Security Send command).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-violet flex-shrink-0 font-bold">5.</span>
              <span>Drive authenticates, derives KEK from password, decrypts DEK. Drive is now <strong className="text-nvme-green">unlocked</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-violet flex-shrink-0 font-bold">6.</span>
              <span>PBA sets <strong className="text-text-primary">MBRDone = true</strong> — this tells the drive to <em>stop shadowing</em>. Now reads to the boot sector return the real disk content.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-nvme-violet flex-shrink-0 font-bold">7.</span>
              <span>PBA triggers a warm reboot. BIOS reads the boot sector again — this time it sees your real OS. Normal boot continues.</span>
            </div>
          </div>
          <p className="text-text-muted text-[10px] italic leading-relaxed">
            <em>Why the reboot?</em> Because the BIOS already cached the PBA boot
            sector in memory. A warm reboot forces it to re-read the drive, and now
            it gets the real OS boot sector because MBRDone disabled the shadow.
          </p>
        </div>

        {/* PSID Revert deep dive */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            PSID Revert &mdash; The Nuclear Option
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">What if you forget your password?</em>{" "}
            Every TCG Opal drive has a <strong className="text-text-primary">PSID
            (Physical Security ID)</strong> — a long alphanumeric string printed on
            the drive&apos;s physical label. It&apos;s like the master key that the
            building owner keeps in a safe.
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Why is it on a physical label?</em>{" "}
            Because it&apos;s meant to require physical access. A remote attacker
            who compromised your OS can&apos;t read the PSID — they&apos;d need to
            physically look at the drive. This is a deliberate security design: the
            person with physical possession of the hardware has the ultimate override.
          </p>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            <em className="text-text-primary">What exactly happens during PSID
            revert?</em> The drive generates a new DEK (data encryption key). Since
            all data was encrypted with the old DEK, it&apos;s now permanently
            unreadable. All passwords are cleared. All locking ranges are reset. The
            drive returns to factory state — ready for a new --initialSetup.
          </p>
          <NvmeCliBlock
            command="sedutil-cli --PSIDrevert <PSID-from-label> /dev/nvme0n1"
            note="WARNING: All data is permanently destroyed. The PSID is printed on the drive's physical label."
          />
        </div>

        <InfoCard variant="warning" title="SED vs software encryption — a tradeoff">
          SED is faster (zero CPU overhead) and simpler, but you&apos;re trusting
          the drive&apos;s firmware implementation. Security researchers have found
          vulnerabilities in some SED implementations (notably Samsung and Crucial
          drives in 2018 where the DEK wasn&apos;t actually protected by the password).{" "}
          <em>Many security-conscious environments use both</em> — software encryption
          (LUKS/BitLocker) layered on top of hardware encryption — so a flaw in either
          layer doesn&apos;t expose data. <em className="text-text-primary">Why not
          just use software encryption alone?</em> Because SED gives you instant crypto
          erase capability that software alone can&apos;t match — and for drive
          decommissioning, that&apos;s invaluable.
        </InfoCard>

        <QuizCard
          id="act5-security-quiz1"
          question="How do TCG Opal self-encrypting drives (SEDs) provide instant secure erase?"
          options={[
            { text: "They overwrite every cell with zeros", explanation: "Physical overwrite of all cells would take minutes to hours. SEDs use a much faster approach." },
            { text: "They destroy the encryption key, making all data unreadable", correct: true, explanation: "Correct! SEDs encrypt all data with an internal key. To 'erase' the drive, the controller simply destroys the encryption key. Without the key, all data on NAND is cryptographically unreadable — instant and complete." },
            { text: "They physically damage the NAND cells", explanation: "Physical damage isn't how secure erase works. The data remains on NAND but becomes cryptographically inaccessible." },
            { text: "They format the drive's partition table", explanation: "Formatting only removes filesystem metadata. The actual data could still be recovered without encryption." },
          ]}
        />
      </div>
    </SectionWrapper>
  );
}
