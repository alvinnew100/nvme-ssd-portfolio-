"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import NvmeCliBlock from "@/components/story/NvmeCliBlock";
import InfoCard from "@/components/story/InfoCard";

export default function FormatSanitize() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Format NVM &amp; Sanitize
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          <strong className="text-text-primary">Format NVM</strong> (opcode{" "}
          <code className="text-text-code">0x80</code>) reformats one or all
          namespaces. It can change the LBA size and optionally perform a secure
          erase. <strong className="text-text-primary">Sanitize</strong> (opcode{" "}
          <code className="text-text-code">0x84</code>) goes further &mdash;
          it&apos;s a controller-level operation that guarantees all user data
          is irrecoverable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="text-nvme-blue font-mono font-bold mb-2">
              Format NVM
            </div>
            <ul className="text-text-secondary text-xs space-y-1 mb-4">
              <li>&bull; Changes LBA format (512B, 4KB sectors)</li>
              <li>&bull; SES=0: No secure erase</li>
              <li>&bull; SES=1: User Data Erase</li>
              <li>&bull; SES=2: Cryptographic Erase</li>
            </ul>
            <NvmeCliBlock command="nvme format /dev/nvme0n1 --ses=1" />
          </div>

          <div className="bg-story-card rounded-2xl p-6 card-shadow">
            <div className="text-nvme-red font-mono font-bold mb-2">
              Sanitize
            </div>
            <ul className="text-text-secondary text-xs space-y-1 mb-4">
              <li>&bull; Block Erase (SANACT=2)</li>
              <li>&bull; Crypto Erase (SANACT=4)</li>
              <li>&bull; Overwrite (SANACT=3)</li>
              <li>&bull; Cannot be aborted once started</li>
            </ul>
            <NvmeCliBlock command="nvme sanitize /dev/nvme0 --sanact=2" />
          </div>
        </div>

        <InfoCard variant="warning" title="Irreversible">
          Sanitize is irreversible and applies to the entire NVM subsystem. All
          namespaces are affected. Check{" "}
          <code className="text-text-code">nvme sanitize-log /dev/nvme0</code> for
          progress. Some enterprise drives take minutes to hours for overwrite
          sanitize.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
