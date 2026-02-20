"use client";

import { useState } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";

export default function Binary() {
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  const toggleBit = (i: number) => {
    setBits((prev) => {
      const next = [...prev];
      next[i] = next[i] ? 0 : 1;
      return next;
    });
  };

  const decimal = bits.reduce((acc, b, i) => acc + b * Math.pow(2, 7 - i), 0);
  const hex = decimal.toString(16).padStart(2, "0").toUpperCase();

  return (
    <SectionWrapper className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Binary &amp; Bits
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed max-w-3xl">
          Everything in storage starts with bits. A bit is the smallest unit of
          data &mdash; it&apos;s either 0 or 1, off or on, no charge or charge.
          Eight bits make a <strong className="text-text-primary">byte</strong>,
          the fundamental building block of all data. Every NVMe command, every
          sector of data, every register value is just a sequence of bytes.
        </p>

        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-6 uppercase tracking-wider">
            Interactive &mdash; Click bits to flip them
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            {bits.map((b, i) => (
              <button
                key={i}
                onClick={() => toggleBit(i)}
                className={`w-14 h-16 rounded-xl border-2 font-mono text-xl font-bold transition-all duration-200 ${
                  b
                    ? "bg-nvme-green/10 border-nvme-green text-nvme-green shadow-md shadow-nvme-green/10"
                    : "bg-story-surface border-story-border text-text-muted hover:border-text-muted"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <span className="text-text-muted">Decimal: </span>
              <span className="text-text-primary font-mono font-bold text-lg">
                {decimal}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Hex: </span>
              <span className="text-text-code font-mono font-bold text-lg">
                0x{hex}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Binary: </span>
              <span className="text-nvme-green font-mono font-bold text-lg">
                {bits.join("")}b
              </span>
            </div>
          </div>
        </div>

        <InfoCard variant="tip" title="Why hex?">
          NVMe registers, opcodes, and data are usually shown in hexadecimal
          (base-16) because each hex digit maps perfectly to 4 bits (a nibble).
          Two hex digits = one byte. So <code className="text-text-code">0xFF</code> = 11111111 = 255.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
