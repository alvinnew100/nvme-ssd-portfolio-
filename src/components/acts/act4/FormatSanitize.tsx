"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import KnowledgeCheck from "@/components/story/KnowledgeCheck";

function EraseComparisonVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Scope of Erasure — Format vs Sanitize
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Format */}
        <div className="text-center">
          <div className="text-nvme-blue text-xs font-bold mb-2">Format NVM</div>
          <div className="flex gap-1 justify-center">
            {["NS1", "NS2", "NS3"].map((ns, i) => (
              <motion.div
                key={ns}
                className={`w-16 h-16 rounded-lg flex items-center justify-center text-[9px] font-mono font-bold border-2 ${
                  i === 0
                    ? "bg-nvme-blue/20 border-nvme-blue text-nvme-blue"
                    : "bg-story-surface border-story-border text-text-muted"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, type: "spring" }}
              >
                {ns}
                {i === 0 && <span className="block text-[7px]">ERASED</span>}
              </motion.div>
            ))}
          </div>
          <div className="text-text-muted text-[9px] mt-2">One namespace only</div>
        </div>

        {/* Sanitize */}
        <div className="text-center">
          <div className="text-nvme-red text-xs font-bold mb-2">Sanitize</div>
          <div className="flex gap-1 justify-center">
            {["NS1", "NS2", "NS3"].map((ns, i) => (
              <motion.div
                key={ns}
                className="w-16 h-16 rounded-lg flex items-center justify-center text-[9px] font-mono font-bold border-2 bg-nvme-red/20 border-nvme-red text-nvme-red"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
              >
                {ns}
                <span className="block text-[7px]">ERASED</span>
              </motion.div>
            ))}
          </div>
          <div className="text-text-muted text-[9px] mt-2">ALL namespaces — entire drive</div>
        </div>
      </div>
    </div>
  );
}

export default function FormatSanitize() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Erasing the Drive &mdash; Format NVM vs Sanitize
        </h3>
        <AnalogyCard
          concept="Format vs Sanitize: Quick Clean vs Deep Clean"
          analogy="Format NVM is like reformatting a USB drive — it resets the namespace's LBA mapping and optionally erases user data. It's fast but may leave data recoverable in NAND. Sanitize is a deep clean that cryptographically or physically destroys all data — including unmapped pages and overprovisioned space. Use Format for routine resets, Sanitize when data must be irrecoverable."
        />

        <TermDefinition term="Format NVM" definition="An admin command that resets a namespace — changes block size, metadata format, or protection settings. Can optionally erase user data, but doesn't guarantee all physical NAND is wiped." />

        <TermDefinition term="Sanitize" definition="An admin command that irreversibly destroys ALL data on the entire SSD — including unmapped areas, spare blocks, and controller caches. Three methods: Block Erase (NAND erase all blocks), Crypto Erase (destroy encryption key), Overwrite (write pattern to all locations)." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Sometimes you need to erase an SSD — maybe you&apos;re repurposing it,
          returning it, or decommissioning it from a secure environment. NVMe
          provides two commands for this, and they&apos;re very different:
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why two commands?</em> Because
          &ldquo;erase&rdquo; means different things in different contexts. Reformatting
          a namespace is like wiping a whiteboard — quick and convenient, but
          forensic experts might still recover the data. Sanitize is like shredding
          the whiteboard — the data is cryptographically or physically destroyed.
        </p>

        {/* Scope comparison visual */}
        <EraseComparisonVisual />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="text-nvme-blue font-mono font-bold mb-2">
              Format NVM (opcode 0x80)
            </div>
            <p className="text-text-secondary text-xs mb-3 leading-relaxed">
              Reformats a single namespace (or all). Can change the LBA size (e.g.,
              switch from 512-byte to 4KB sectors). Optionally performs a secure
              erase — but only at the namespace level.
            </p>
            <ul className="text-text-secondary text-xs space-y-1 mb-4">
              <li>&#8226; <strong>SES=0:</strong> No secure erase — just reformat</li>
              <li>&#8226; <strong>SES=1:</strong> User Data Erase — erase all user data</li>
              <li>&#8226; <strong>SES=2:</strong> Cryptographic Erase — destroy the encryption key (instant)</li>
            </ul>
            <NvmeCliBlock command="nvme format /dev/nvme0n1 --ses=1" />
          </div>

          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="text-nvme-red font-mono font-bold mb-2">
              Sanitize (opcode 0x84)
            </div>
            <p className="text-text-secondary text-xs mb-3 leading-relaxed">
              A <strong>controller-level</strong> operation that guarantees all user
              data across <strong>all namespaces</strong> is irrecoverable. Cannot
              be aborted once started. Required for government/military
              decommissioning (NIST 800-88).
            </p>
            <ul className="text-text-secondary text-xs space-y-1 mb-4">
              <li>&#8226; <strong>SANACT=2:</strong> Block Erase — erase all NAND blocks</li>
              <li>&#8226; <strong>SANACT=3:</strong> Overwrite — write a pattern over all data</li>
              <li>&#8226; <strong>SANACT=4:</strong> Crypto Erase — destroy all encryption keys</li>
            </ul>
            <NvmeCliBlock command="nvme sanitize /dev/nvme0 --sanact=2" />
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-2">
            When to use which?
          </div>
          <div className="space-y-2 text-text-secondary text-sm leading-relaxed">
            <p>
              <strong className="text-nvme-blue">Format</strong> — when you want to
              change the sector size, reset a single namespace, or do a quick erase
              during development. It&apos;s fast and targets one namespace.
            </p>
            <p>
              <strong className="text-nvme-red">Sanitize</strong> — when you need
              to guarantee data destruction for the <em>entire drive</em>. Use this
              before returning, selling, or decommissioning an SSD. Crypto erase
              is instant; block erase and overwrite can take minutes to hours.
            </p>
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-2">
            Cryptographic Erase — why it&apos;s instant
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            Self-encrypting drives (SED) encrypt all data with an internal AES key
            before writing it to NAND. Crypto Erase doesn&apos;t touch the NAND at
            all — it destroys the encryption key, making all stored data
            permanently unreadable gibberish. This is why it completes in under a
            second regardless of drive capacity. The physical NAND still contains
            encrypted ciphertext, but without the key it&apos;s indistinguishable
            from random data. Crypto Erase is sufficient for most commercial
            decommissioning; block erase or overwrite is required when regulations
            demand physical media sanitization.
          </p>
        </div>

        <InfoCard variant="warning" title="Sanitize is irreversible">
          Once started, Sanitize cannot be aborted and affects all namespaces on the
          entire NVM subsystem. Check progress with{" "}
          <code className="text-text-code">nvme sanitize-log /dev/nvme0</code>.
          Enterprise drives may take hours for overwrite sanitize on large
          capacities.
        </InfoCard>

        <KnowledgeCheck
          id="act4-format-kc1"
          question="Which operation is cryptographically secure for data erasure?"
          options={["Format NVM", "Sanitize"]}
          correctIndex={1}
          explanation="Sanitize provides cryptographic erase guarantees — it ensures all user data (including unmapped/over-provisioned areas) is permanently irrecoverable. Format NVM only affects the visible namespace and may leave data in over-provisioned areas."
        />
      </div>
    </SectionWrapper>
  );
}
