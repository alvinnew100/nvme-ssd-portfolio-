"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

export default function FormatSanitize() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Erasing the Drive &mdash; Format NVM vs Sanitize
        </h3>

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

        <InfoCard variant="warning" title="Sanitize is irreversible">
          Once started, Sanitize cannot be aborted and affects all namespaces on the
          entire NVM subsystem. Check progress with{" "}
          <code className="text-text-code">nvme sanitize-log /dev/nvme0</code>.
          Enterprise drives may take hours for overwrite sanitize on large
          capacities.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
