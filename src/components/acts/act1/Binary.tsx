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
          Everything Starts with a Bit
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think of a light switch. It&apos;s either <strong className="text-text-primary">
          off</strong> or <strong className="text-text-primary">on</strong>. That&apos;s
          a <strong className="text-text-primary">bit</strong> &mdash; the smallest
          piece of data a computer can work with. Off is <code className="text-text-code">0</code>,
          on is <code className="text-text-code">1</code>. Every photo, video, document,
          and app on your computer is made of billions of these tiny switches.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          A single bit isn&apos;t very useful &mdash; it can only represent two things
          (yes/no, true/false). But when you group <strong className="text-text-primary">8
          bits together</strong>, you get a <strong className="text-text-primary">byte</strong>.
          A byte can represent 256 different values (2&times;2&times;2&times;2&times;2&times;2&times;2&times;2
          = 256), which is enough for a single letter, a small number, or a single
          color channel in an image.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Storage drives hold billions of bytes. A 1 TB (terabyte) SSD holds about
          1 trillion bytes &mdash; or 8 trillion individual bits. Every one of those
          bits is physically stored as an electrical charge inside a tiny cell on a
          silicon chip. We&apos;ll explore how that works soon.
        </p>

        {/* Interactive bit widget */}
        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
            Try it &mdash; Click any bit to flip it between 0 and 1
          </div>
          <p className="text-text-muted text-xs mb-6">
            Each bit position has a different &ldquo;weight&rdquo; &mdash; the leftmost
            bit is worth 128, the next 64, then 32, 16, 8, 4, 2, 1. Add up the weights
            of all the &ldquo;on&rdquo; bits to get the decimal value.
          </p>
          <div className="flex flex-col items-center">
            {/* Bit weights */}
            <div className="flex items-center justify-center gap-2 mb-1">
              {[128, 64, 32, 16, 8, 4, 2, 1].map((w, i) => (
                <div key={i} className="w-14 text-center text-[10px] text-text-muted font-mono">
                  {w}
                </div>
              ))}
            </div>
            {/* Bit buttons */}
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
            {/* Results */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-text-muted text-[10px] mb-1">DECIMAL (base-10)</div>
                <span className="text-text-primary font-mono font-bold text-lg">
                  {decimal}
                </span>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-[10px] mb-1">HEXADECIMAL (base-16)</div>
                <span className="text-text-code font-mono font-bold text-lg">
                  0x{hex}
                </span>
              </div>
              <div className="text-center">
                <div className="text-text-muted text-[10px] mb-1">BINARY (base-2)</div>
                <span className="text-nvme-green font-mono font-bold text-lg">
                  {bits.join("")}b
                </span>
              </div>
            </div>
          </div>
        </div>

        <InfoCard variant="tip" title="What is hexadecimal?">
          Counting in decimal (base-10) uses digits 0-9. <strong>Hexadecimal</strong> (base-16)
          extends this with letters: 0-9 then A=10, B=11, C=12, D=13, E=14, F=15. We use hex
          in storage because each hex digit perfectly represents 4 bits.
          So <code className="text-text-code">0xFF</code> means all 8 bits are on = 255 in decimal.
          Two hex digits always equal one byte. You&apos;ll see hex everywhere in NVMe.
        </InfoCard>
      </div>
    </SectionWrapper>
  );
}
