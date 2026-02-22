"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/story/SectionWrapper";
import InfoCard from "@/components/story/InfoCard";
import AnalogyCard from "@/components/story/AnalogyCard";
import TermDefinition from "@/components/story/TermDefinition";
import QuizCard from "@/components/story/QuizCard";
import FillInBlank from "@/components/story/FillInBlank";

const DATA_SCALE = [
  { name: "1 bit", detail: "0 or 1", w: 1.5 },
  { name: "1 byte", detail: "8 bits", w: 4 },
  { name: "1 KB", detail: "1,024 bytes", w: 10 },
  { name: "1 MB", detail: "1,024 KB", w: 20 },
  { name: "1 GB", detail: "1,024 MB", w: 40 },
  { name: "1 TB", detail: "1,024 GB", w: 70 },
];

function DataScaleLadder() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="bg-story-card rounded-2xl p-6 card-shadow">
      <div className="text-text-muted text-xs font-mono mb-4 uppercase tracking-wider">
        Data Size Scale
      </div>
      <div className="space-y-2">
        {DATA_SCALE.map((d, i) => (
          <motion.div
            key={d.name}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <motion.div
              className="h-6 rounded bg-nvme-green/20 border border-nvme-green/30 flex-shrink-0"
              style={{ width: `${d.w}%`, minWidth: 4 }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.5, ease: "easeOut" }}
            />
            <span className="text-text-primary font-mono text-xs font-bold w-12 flex-shrink-0">{d.name}</span>
            <span className="text-text-muted text-[10px]">= {d.detail}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-text-muted text-[10px] italic mt-3">
        A 1 TB SSD holds about 8 trillion individual bits.
      </p>
    </div>
  );
}

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
        <AnalogyCard
          concept="A Bit Is a Light Switch"
          analogy="Every piece of data — photos, videos, documents, apps — is made of billions of tiny on/off switches called bits. Off is 0, on is 1. That's it. Everything your computer does comes down to billions of these simple yes/no decisions."
        />

        <TermDefinition term="Bit" definition="The smallest unit of data in computing — a single 0 or 1. Short for 'binary digit.' Every other unit of data (bytes, kilobytes, etc.) is built from groups of bits." />

        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          Think of a light switch. It&apos;s either <strong className="text-text-primary">
          off</strong> or <strong className="text-text-primary">on</strong>. That&apos;s
          a <strong className="text-text-primary">bit</strong> &mdash; the smallest
          piece of data a computer can work with. Off is <code className="text-text-code">0</code>,
          on is <code className="text-text-code">1</code>. Every photo, video, document,
          and app on your computer is made of billions of these tiny switches.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">But why only 0 and 1? Why not 0 through
          9 like normal numbers?</em> Because electronic circuits are most reliable
          when they only need to distinguish between two states — voltage above a
          threshold (1) or below it (0). More states would mean smaller margins and
          more errors. (We&apos;ll see this exact tradeoff later when we look at how
          NAND cells store multiple bits.)
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          A single bit isn&apos;t very useful &mdash; it can only represent two things
          (yes/no, true/false). <em className="text-text-primary">So how do we represent
          something more complex, like a letter or a number?</em> By grouping{" "}
          <strong className="text-text-primary">8 bits together</strong> into a{" "}
          <strong className="text-text-primary">byte</strong>.
        </p>
        <TermDefinition term="Byte" definition="A group of 8 bits. Can represent 256 different values (2^8). One byte is enough for a single letter, a small number, or one color channel in an image." />
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          A byte can represent 256 different values (2&times;2&times;2&times;2&times;2&times;2&times;2&times;2
          = 256), which is enough for a single letter, a small number, or a single
          color channel in an image.
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Storage drives hold billions of bytes. A 1 TB (terabyte) SSD holds about
          1 trillion bytes &mdash; or 8 trillion individual bits. <em className="text-text-primary">
          But how does the SSD physically store each of those bits?</em> That&apos;s
          exactly what we&apos;ll explore after we understand how these bits are
          addressed.
        </p>

        {/* Interactive bit widget */}
        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">
            Try it &mdash; Click any bit to flip it between 0 and 1
          </div>
          <p className="text-text-muted text-xs mb-6">
            Each bit position has a different &ldquo;weight&rdquo; &mdash; the leftmost
            bit is worth 128, the next 64, then 32, 16, 8, 4, 2, 1. Add up the weights
            of all the &ldquo;on&rdquo; bits to get the decimal value. <em>Why these
            specific numbers?</em> They&apos;re powers of 2 — each position doubles
            the previous one.
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

        {/* Hex reference visual */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow mb-6">
          <div className="text-text-muted text-xs font-mono mb-3 uppercase tracking-wider">
            Hexadecimal — the language of hardware
          </div>
          <p className="text-text-secondary text-xs mb-4 leading-relaxed">
            <em className="text-text-primary">Why do engineers use hex instead of decimal?</em>{" "}
            Each hex digit = exactly 4 bits. Two hex digits = 1 byte. It&apos;s compact and maps perfectly to binary.
          </p>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 mb-2">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="bg-story-surface rounded-lg p-1.5 text-center">
                <div className="text-text-code font-mono font-bold text-xs">
                  {i.toString(16).toUpperCase()}
                </div>
                <div className="text-text-muted text-[8px] font-mono">{i}</div>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-[10px] italic">
            0-9 are the same. Then A=10, B=11, C=12, D=13, E=14, F=15. So <code className="text-text-code">0xFF</code> = 255.
          </p>
        </div>

        {/* Data scale ladder */}
        <DataScaleLadder />

        <QuizCard
          id="act1-binary-quiz1"
          question="What is the decimal value of binary 10110010?"
          options={[
            { text: "162", explanation: "Check your bit weights again: 128+32+16+2 = 178." },
            { text: "178", correct: true, explanation: "Correct! 10110010 = 128+32+16+2 = 178. Each '1' bit adds its positional weight (128, 64, 32, 16, 8, 4, 2, 1)." },
            { text: "194", explanation: "That's not right. Try adding the weights: bit 7 (128) + bit 5 (32) + bit 4 (16) + bit 1 (2)." },
            { text: "210", explanation: "Too high. Remember the bits from left to right are: 128, 64, 32, 16, 8, 4, 2, 1." },
          ]}
          hint="The bit positions from left to right have weights: 128, 64, 32, 16, 8, 4, 2, 1. Add up the weights where the bit is 1."
        />

        <FillInBlank
          id="act1-binary-fill1"
          prompt="1 KB equals {blank} bytes."
          blanks={[{ answer: "1024", placeholder: "?" }]}
          explanation="1 KB = 2^10 = 1,024 bytes. Computer memory uses powers of 2, not powers of 10."
          hint="Remember: each bit position doubles in value from right to left (1, 2, 4, 8...)."
        />
      </div>
    </SectionWrapper>
  );
}
