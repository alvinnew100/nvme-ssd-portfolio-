"use client";

import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

export default function Security() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Security &mdash; Encryption &amp; TCG Opal
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          NVMe supports <strong className="text-text-primary">Security Send</strong>{" "}
          (opcode <code className="text-text-code">0x81</code>) and{" "}
          <strong className="text-text-primary">Security Receive</strong>{" "}
          (opcode <code className="text-text-code">0x82</code>) for communicating
          with security protocols like <strong className="text-text-primary">TCG Opal</strong>.
          These commands transport opaque protocol data between host and the
          drive&apos;s security subsystem.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <div className="text-nvme-green font-mono font-bold text-sm mb-2">
              Self-Encrypting Drives (SED)
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              The drive encrypts all data with AES-256 transparently. The key
              never leaves the controller. On crypto-erase, only the key is
              destroyed &mdash; instant, secure wipe.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <div className="text-nvme-violet font-mono font-bold text-sm mb-2">
              TCG Opal 2.0
            </div>
            <p className="text-text-muted text-xs leading-relaxed">
              Industry standard for SED management. Allows per-range locking,
              pre-boot authentication, and enterprise key management. Uses
              Security Send/Recv to exchange ComPackets.
            </p>
          </div>
        </div>

        <InfoCard variant="info" title="Security Protocol (SECP)">
          The SECP field in Security Send/Recv specifies which protocol to use:
          0x00 = Security Protocol Information, 0x01 = TCG Opal, 0x02 = TCG
          Enterprise, 0xEF = IEEE 1667. The drive advertises supported protocols
          via Identify Controller.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
