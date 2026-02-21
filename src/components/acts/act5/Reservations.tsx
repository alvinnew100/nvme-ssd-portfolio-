"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

function MultiHostVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Multiple Hosts Accessing One Drive — Why Reservations Are Needed
      </div>
      <div className="flex items-center justify-center gap-4">
        {/* Hosts */}
        <div className="flex flex-col gap-2">
          {["Host A", "Host B", "Host C"].map((host, i) => (
            <motion.div
              key={host}
              className="bg-nvme-blue/10 border border-nvme-blue/30 rounded-lg px-4 py-2 text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1, type: "spring" }}
            >
              <div className="text-nvme-blue font-mono font-bold text-[10px]">{host}</div>
              <div className="text-text-muted text-[8px]">
                {i === 0 ? "✓ Holder" : i === 1 ? "✓ Registered" : "✗ Blocked"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Arrows */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="text-nvme-green text-[10px] font-mono">R/W →</div>
          <div className="text-nvme-amber text-[10px] font-mono">R →</div>
          <div className="text-nvme-red text-[10px] font-mono">✗ →</div>
        </motion.div>

        {/* Namespace */}
        <motion.div
          className="bg-nvme-green/10 border-2 border-nvme-green rounded-xl px-6 py-6 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <div className="text-nvme-green font-mono font-bold text-xs">Namespace 1</div>
          <div className="text-text-muted text-[9px] mt-1">Write Exclusive</div>
          <div className="text-text-muted text-[8px]">reservation</div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Reservations() {
  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Reservations &mdash; Sharing a Drive Between Hosts
        </h3>

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Everything we&apos;ve discussed so far assumes one computer talking to one
          SSD. But what happens when <em className="text-text-primary">multiple servers
          need to access the same drive?</em>
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why would multiple hosts share a drive?</em>{" "}
          In data centers, technologies like <strong className="text-text-primary">NVMe
          over Fabrics (NVMe-oF)</strong> allow remote servers to access NVMe drives
          over a network — as if the drive were locally attached. This enables shared
          storage pools, high-availability clusters, and failover systems where a
          backup server takes over if the primary fails.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But here&apos;s the problem:</em> if two
          servers write to the same LBA range at the same time without coordination,
          you get data corruption. It&apos;s like two people editing the same document
          simultaneously without Google Docs&apos; real-time sync — their changes
          would overwrite each other.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          NVMe <strong className="text-text-primary">Reservations</strong> solve this.
          They&apos;re a locking mechanism built into the NVMe protocol that lets hosts
          claim exclusive (or shared) access to a namespace, preventing unsafe concurrent
          writes.
        </p>

        {/* Multi-host access visual */}
        <MultiHostVisual />

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            How Reservations Work — A Hotel Room Analogy
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-4">
            Think of a namespace as a hotel room, and hosts as guests. Reservations work
            like the hotel&apos;s booking system:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-nvme-green/10 text-nvme-green flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <div className="text-text-primary text-sm font-semibold">Register</div>
                <p className="text-text-muted text-xs leading-relaxed">
                  Each host registers with the namespace using a unique <strong className="text-text-secondary">reservation key</strong> — like checking in at the front desk and getting a key card. This doesn&apos;t lock anything yet; it just announces your presence.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-nvme-blue/10 text-nvme-blue flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <div className="text-text-primary text-sm font-semibold">Acquire</div>
                <p className="text-text-muted text-xs leading-relaxed">
                  A registered host acquires the reservation — like booking the room for your exclusive use. Now other hosts are restricted based on the reservation type (see below).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-nvme-violet/10 text-nvme-violet flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="text-text-primary text-sm font-semibold">Release</div>
                <p className="text-text-muted text-xs leading-relaxed">
                  When done, the host releases the reservation — checking out of the room so others can use it.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            The Four Reservation Commands
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              {
                cmd: "Reservation Register",
                opcode: "0x0D",
                desc: "Register, unregister, or replace reservation keys. This is the \"check in\" step — you must register before you can acquire.",
                color: "#00d4aa",
              },
              {
                cmd: "Reservation Acquire",
                opcode: "0x11",
                desc: "Acquire, preempt, or preempt-and-abort a reservation. Preempt means forcibly taking a reservation from another host (used in failover scenarios).",
                color: "#38bdf8",
              },
              {
                cmd: "Reservation Release",
                opcode: "0x15",
                desc: "Release or clear a reservation. Release gives up your reservation; clear removes all registrations from all hosts.",
                color: "#a78bfa",
              },
              {
                cmd: "Reservation Report",
                opcode: "0x0E",
                desc: "Report registered controllers and reservation status. Like asking the front desk \"Who's currently checked in and who has the room?\"",
                color: "#f59e0b",
              },
            ].map((r) => (
              <div key={r.cmd} className="bg-story-surface rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold" style={{ color: r.color }}>
                    {r.cmd}
                  </span>
                </div>
                <code className="text-text-code text-[10px]">
                  opcode={r.opcode}
                </code>
                <p className="text-text-muted mt-1 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-primary font-semibold text-sm mb-3">
            Reservation Types — What Gets Locked?
          </div>
          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            <em className="text-text-primary">Not all reservations are the same.</em>{" "}
            Different situations need different levels of access control:
          </p>
          <div className="space-y-2">
            {[
              { type: "Write Exclusive", desc: "Only the holder can write. Everyone can read. Good for a single writer, multiple readers.", color: "#635bff" },
              { type: "Exclusive Access", desc: "Only the holder can read OR write. Everyone else is completely blocked. Maximum protection.", color: "#e05d6f" },
              { type: "Write Exclusive — Registrants Only", desc: "Any registered host can write; unregistered hosts are blocked. Good for a cluster where all members are trusted.", color: "#00b894" },
              { type: "Exclusive Access — Registrants Only", desc: "Any registered host can read and write; unregistered hosts are completely blocked.", color: "#f5a623" },
            ].map((t) => (
              <div key={t.type} className="flex items-start gap-3 bg-story-surface rounded-lg p-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: t.color }} />
                <div>
                  <span className="text-text-primary text-xs font-semibold">{t.type}</span>
                  <span className="text-text-muted text-xs"> — {t.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <InfoCard variant="info" title="Why reservations matter for NVMe-oF">
          In NVMe over Fabrics (NVMe-oF), drives are accessed over a network fabric
          (RDMA, TCP, or Fibre Channel). Without reservations, a failover event — where
          a backup server takes over from a failed primary — could lead to both servers
          writing simultaneously during the handoff. Reservations ensure only one host
          has write access at any time, preventing split-brain corruption.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
