"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

export default function Reservations() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Reservations &amp; Multi-Host Access
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          In shared storage environments (NVMe-oF, multi-path), multiple hosts
          may access the same namespace. NVMe{" "}
          <strong className="text-text-primary">Reservations</strong> provide
          fencing &mdash; preventing data corruption from concurrent writes.
        </p>

        <div className="bg-white rounded-2xl p-6 card-shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              {
                cmd: "Reservation Register",
                opcode: "0x0D",
                desc: "Register, unregister, or replace reservation keys.",
              },
              {
                cmd: "Reservation Acquire",
                opcode: "0x11",
                desc: "Acquire, preempt, or preempt-and-abort a reservation.",
              },
              {
                cmd: "Reservation Release",
                opcode: "0x15",
                desc: "Release or clear a reservation held by this host.",
              },
              {
                cmd: "Reservation Report",
                opcode: "0x0E",
                desc: "Report registered controllers and reservation status.",
              },
            ].map((r) => (
              <div key={r.cmd} className="bg-story-surface rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-nvme-blue font-mono font-bold">
                    {r.cmd}
                  </span>
                </div>
                <code className="text-text-code text-[10px]">
                  opcode={r.opcode}
                </code>
                <p className="text-text-muted mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed max-w-3xl">
          Reservation types include: Write Exclusive, Exclusive Access, Write
          Exclusive &mdash; Registrants Only, and more. In NVMe-oF (NVMe over
          Fabrics), reservations are critical for clustered file systems and
          shared-nothing databases.
        </p>
      </div>
    </SectionWrapper>
  );
}
