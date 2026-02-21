"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

interface TraceEvent {
  id: number;
  time: string;
  direction: "host-to-ctrl" | "ctrl-to-host";
  type: string;
  label: string;
  detail: string;
  why: string;
  color: string;
}

const TRACE_SCENARIO: TraceEvent[] = [
  { id: 1, time: "0.000", direction: "host-to-ctrl", type: "mmio-write", label: "SQ Doorbell Write", detail: "Host writes SQ tail=1 to doorbell register 0x1008", why: "This is the \"ding\" — the host tells the SSD \"I placed a command for you.\"", color: "#635bff" },
  { id: 2, time: "0.001", direction: "ctrl-to-host", type: "dma-read", label: "DMA: Fetch Command", detail: "SSD reads the 64-byte command from the Submission Queue in host RAM", why: "The command lives in host memory. The SSD fetches it over PCIe using DMA (Direct Memory Access) — it reads RAM without bothering the CPU.", color: "#7c5cfc" },
  { id: 3, time: "0.002", direction: "ctrl-to-host", type: "dma-read", label: "DMA: Fetch Buffer Addresses", detail: "SSD reads the PRP list to find where the host wants data delivered", why: "The command says \"read 4KB\" but the SSD needs to know WHERE in RAM to put the data. The PRP (Physical Region Page) list contains those addresses.", color: "#7c5cfc" },
  { id: 4, time: "0.050", direction: "ctrl-to-host", type: "dma-write", label: "DMA: Write Data to Host", detail: "SSD writes 4KB of read data directly to host memory via DMA", why: "The SSD read the data from NAND (~50μs), and now delivers it to the host buffer. This happens without CPU involvement — DMA writes straight to RAM.", color: "#00b894" },
  { id: 5, time: "0.051", direction: "ctrl-to-host", type: "dma-write", label: "DMA: Post Completion", detail: "SSD writes a 16-byte completion entry to the Completion Queue in host RAM", why: "The result goes into the CQ — \"I finished command C1 with status Success.\" This 16-byte entry includes the status code and command ID.", color: "#00b894" },
  { id: 6, time: "0.052", direction: "ctrl-to-host", type: "msi-x", label: "MSI-X Interrupt", detail: "SSD sends an MSI-X interrupt to wake the host CPU", why: "The host CPU might be doing other work. The interrupt says \"check your Completion Queue — there's a new result.\" MSI-X is itself a memory write over PCIe.", color: "#e05d6f" },
  { id: 7, time: "0.053", direction: "host-to-ctrl", type: "mmio-write", label: "CQ Doorbell Write", detail: "Host writes CQ head=1 to doorbell register 0x100C", why: "The host tells the SSD \"I've read your completion entry, you can reuse that CQ slot.\" This closes the loop.", color: "#635bff" },
];

export default function BusTrace() {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const play = () => {
    setEvents([]);
    setCurrentIdx(0);
    setIsPlaying(true);
  };

  const stopAndReset = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setEvents([]);
    setCurrentIdx(0);
    setHoveredId(null);
  };

  useEffect(() => {
    if (isPlaying && currentIdx < TRACE_SCENARIO.length) {
      intervalRef.current = setTimeout(() => {
        setEvents((prev) => [...prev, TRACE_SCENARIO[currentIdx]]);
        setCurrentIdx((i) => i + 1);
      }, 700);
      return () => {
        if (intervalRef.current) clearTimeout(intervalRef.current);
      };
    } else if (currentIdx >= TRACE_SCENARIO.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIdx]);

  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Seeing It All in Action &mdash; A PCIe Bus Trace
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          We&apos;ve learned all the concepts separately — PCIe, BAR0, queues, and
          doorbells. Now let&apos;s see how they work <em>together</em> during a
          single NVMe Read command. Every step below is a real PCIe packet (called
          a <strong className="text-text-primary">Transaction Layer Packet</strong>,
          or TLP) traveling between the host and SSD.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          <em className="text-text-primary">Why does this matter?</em> When you
          debug NVMe performance or trace issues, you&apos;ll see these exact
          packet types. Understanding this flow helps you pinpoint where time
          is being spent — is it the doorbell write? The DMA data transfer? The
          NAND read time?
        </p>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          Click &ldquo;Play&rdquo; and hover over each event to see <em>why</em> it
          happens:
        </p>

        <div className="bg-story-card rounded-2xl p-8 card-shadow mb-6">
          {/* Bus lanes header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <div className="text-nvme-blue font-mono font-bold text-sm">HOST</div>
              <div className="text-text-muted text-[10px]">CPU / Memory</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-text-muted text-[10px] font-mono">PCIe x4 Bus</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-nvme-green font-mono font-bold text-sm">SSD</div>
              <div className="text-text-muted text-[10px]">NVMe Controller</div>
            </div>
          </div>

          {/* Bus trace area */}
          <div className="relative min-h-[320px] border-l-2 border-r-2 border-dashed border-story-border mx-[15%]">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-story-border" />

            <AnimatePresence>
              {events.map((evt) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative py-1.5"
                  onMouseEnter={() => setHoveredId(evt.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex items-center gap-2 px-2">
                    <div className="text-[9px] font-mono text-text-muted w-12 text-right flex-shrink-0">
                      +{evt.time}ms
                    </div>

                    <div className="flex-1 flex items-center gap-1">
                      {evt.direction === "host-to-ctrl" ? (
                        <div className="flex-1 flex items-center">
                          <div className="h-0.5 flex-1 rounded" style={{ backgroundColor: evt.color }} />
                          <div
                            className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px]"
                            style={{ borderLeftColor: evt.color }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center">
                          <div
                            className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px]"
                            style={{ borderRightColor: evt.color }}
                          />
                          <div className="h-0.5 flex-1 rounded" style={{ backgroundColor: evt.color }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2 mt-0.5">
                    <div className="w-12 flex-shrink-0" />
                    <div className="flex-1 text-center">
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: evt.color,
                          backgroundColor: `${evt.color}10`,
                        }}
                      >
                        {evt.label}
                      </span>
                      <div className="text-[9px] text-text-muted mt-0.5">{evt.detail}</div>
                      {hoveredId === evt.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-[10px] text-text-secondary mt-1 leading-relaxed italic"
                          style={{ color: evt.color }}
                        >
                          {evt.why}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {events.length === 0 && (
              <div className="flex items-center justify-center h-[320px] text-text-muted text-xs italic">
                Click &ldquo;Play Read Command&rdquo; to see the 7-step bus trace
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={play}
              disabled={isPlaying}
              className="px-5 py-2.5 bg-nvme-blue text-white rounded-full text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              {events.length > 0 && !isPlaying ? "Replay" : "Play Read Command"}
            </button>
            <button
              onClick={stopAndReset}
              className="px-5 py-2.5 bg-story-surface text-text-muted rounded-full text-xs font-semibold hover:bg-story-border transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary of packet types */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-blue mb-1">MMIO Write</div>
            <p className="text-text-muted">
              Host writes to a BAR0 register (doorbell). This is how the host
              signals the SSD. Just a single PCIe write — very fast.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-violet mb-1">DMA Read/Write</div>
            <p className="text-text-muted">
              The SSD reads or writes host RAM directly, without CPU involvement.
              This is how commands are fetched and data is delivered — the SSD
              is the bus master.
            </p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-red mb-1">MSI-X Interrupt</div>
            <p className="text-text-muted">
              The SSD notifies the CPU that work is done. It&apos;s actually a
              memory write to a special address — the CPU&apos;s interrupt
              controller picks it up and signals the right core.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
