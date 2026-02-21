"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

export default function Security() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Security &mdash; Protecting Data at the Hardware Level
        </h3>

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

        <InfoCard variant="note" title="SED vs software encryption — a tradeoff">
          SED is faster (zero CPU overhead) and simpler, but you&apos;re trusting
          the drive&apos;s firmware implementation. Security researchers have found
          vulnerabilities in some SED implementations. Many security-conscious
          environments use <em>both</em> — software encryption (LUKS/BitLocker)
          layered on top of hardware encryption — so a flaw in either layer doesn&apos;t
          expose data.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
