"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "@/components/story/SectionWrapper";

interface TraceEvent {
  id: number;
  time: string;
  direction: "host-to-ctrl" | "ctrl-to-host";
  type: "mmio-write" | "mmio-read" | "dma-read" | "dma-write" | "msi-x";
  label: string;
  detail: string;
  color: string;
}

const TRACE_SCENARIO: TraceEvent[] = [
  { id: 1, time: "0.000", direction: "host-to-ctrl", type: "mmio-write", label: "SQ Doorbell Write", detail: "Host writes SQ tail=1 to doorbell register 0x1008", color: "#635bff" },
  { id: 2, time: "0.001", direction: "ctrl-to-host", type: "dma-read", label: "DMA: Fetch SQE", detail: "Controller DMA reads 64-byte SQ entry from host memory", color: "#7c5cfc" },
  { id: 3, time: "0.002", direction: "ctrl-to-host", type: "dma-read", label: "DMA: Fetch PRP List", detail: "Controller reads PRP list to locate data buffers", color: "#7c5cfc" },
  { id: 4, time: "0.050", direction: "ctrl-to-host", type: "dma-write", label: "DMA: Write Data", detail: "Controller writes 4KB read data to host memory via DMA", color: "#00b894" },
  { id: 5, time: "0.051", direction: "ctrl-to-host", type: "dma-write", label: "DMA: Post CQE", detail: "Controller writes 16-byte CQ entry to host memory", color: "#00b894" },
  { id: 6, time: "0.052", direction: "ctrl-to-host", type: "msi-x", label: "MSI-X Interrupt", detail: "Controller sends MSI-X interrupt to notify host", color: "#e05d6f" },
  { id: 7, time: "0.053", direction: "host-to-ctrl", type: "mmio-write", label: "CQ Doorbell Write", detail: "Host writes CQ head=1 to doorbell register 0x100C", color: "#635bff" },
];

export default function BusTrace() {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
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
  };

  useEffect(() => {
    if (isPlaying && currentIdx < TRACE_SCENARIO.length) {
      intervalRef.current = setTimeout(() => {
        setEvents((prev) => [...prev, TRACE_SCENARIO[currentIdx]]);
        setCurrentIdx((i) => i + 1);
      }, 600);
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
          PCIe Bus Trace Simulation
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          This simulates what happens on the PCIe bus during a single NVMe Read
          command. Each row is a Transaction Layer Packet (TLP) on the bus.
          Watch the sequence: doorbell write &rarr; DMA fetch &rarr; data transfer
          &rarr; completion &rarr; interrupt &rarr; doorbell update.
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
              <div className="text-nvme-green font-mono font-bold text-sm">CONTROLLER</div>
              <div className="text-text-muted text-[10px]">NVMe SSD</div>
            </div>
          </div>

          {/* Bus trace area */}
          <div className="relative min-h-[320px] border-l-2 border-r-2 border-dashed border-story-border mx-[15%]">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-story-border" />

            <AnimatePresence>
              {events.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative py-1.5"
                >
                  <div className="flex items-center gap-2 px-2">
                    {/* Timestamp */}
                    <div className="text-[9px] font-mono text-text-muted w-12 text-right flex-shrink-0">
                      +{evt.time}ms
                    </div>

                    {/* Arrow and label */}
                    <div className="flex-1 flex items-center gap-1">
                      {evt.direction === "host-to-ctrl" ? (
                        <>
                          <div className="flex-1 flex items-center">
                            <div className="h-0.5 flex-1 rounded" style={{ backgroundColor: evt.color }} />
                            <div
                              className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px]"
                              style={{ borderLeftColor: evt.color }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 flex items-center">
                            <div
                              className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px]"
                              style={{ borderRightColor: evt.color }}
                            />
                            <div className="h-0.5 flex-1 rounded" style={{ backgroundColor: evt.color }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Event label */}
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {events.length === 0 && (
              <div className="flex items-center justify-center h-[320px] text-text-muted text-xs italic">
                Click &ldquo;Play Read Command&rdquo; to see the bus trace
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-blue mb-1">MMIO Write</div>
            <p className="text-text-muted">Host writes to controller&apos;s BAR0 registers (doorbells). Single PCIe write TLP.</p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-violet mb-1">DMA Read/Write</div>
            <p className="text-text-muted">Controller accesses host memory directly. Fetches SQ entries, writes data and CQ entries.</p>
          </div>
          <div className="bg-story-card rounded-xl p-4 card-shadow">
            <div className="font-mono font-bold text-nvme-red mb-1">MSI-X Interrupt</div>
            <p className="text-text-muted">Controller sends a memory write to trigger the host&apos;s interrupt handler.</p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
