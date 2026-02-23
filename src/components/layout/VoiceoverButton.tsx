"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceover } from "@/hooks/useVoiceover";
import { useActiveSection, SECTION_IDS } from "@/hooks/useActiveSection";
import type { ManifestEntry } from "@/types/voiceover";

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

/** Section labels from the manifest (fallback if manifest hasn't loaded) */
const SECTION_LABELS: Record<string, string> = {
  "sec-storage": "What Is Storage",
  "sec-bus": "What Is a Bus",
  "sec-data-flow": "How Data Flows",
  "sec-transistor": "Transistors",
  "sec-binary": "Binary",
  "sec-lba": "LBA",
  "sec-nand-basics": "NAND Basics",
  "sec-nand-types": "Cell Types",
  "sec-nand-endurance": "Endurance",
  "sec-nand-hierarchy": "NAND Hierarchy",
  "sec-ssd": "SSD Overview",
  "sec-ftl": "FTL",
  "sec-gc": "Garbage Collection",
  "sec-vpc": "Block Mgmt",
  "sec-qd": "Queue Depth",
  "sec-pcie": "PCIe",
  "sec-bar0": "BAR0 Registers",
  "sec-queues": "Queues",
  "sec-doorbells": "Doorbells",
  "sec-boot": "Boot Sequence",
  "sec-bus-trace": "Bus Trace",
  "sec-sqe": "SQE Structure",
  "sec-identify": "Identify",
  "sec-namespaces": "Namespaces",
  "sec-admin-cmds": "Admin Cmds",
  "sec-io-cmds": "I/O Cmds",
  "sec-errors": "Errors",
  "sec-io-path": "I/O Path",
  "sec-smart": "SMART",
  "sec-trim": "TRIM & GC",
  "sec-waf": "Write Amplification",
  "sec-format-sanitize": "Format & Sanitize",
  "sec-wear": "Wear Leveling",
  "sec-filesystems": "Filesystems",
  "sec-fio": "fio Guide",
  "sec-testing": "Testing",
  "sec-firmware": "Firmware",
  "sec-security": "Security",
  "sec-passthru": "Passthru",
  "sec-tracing": "Tracing",
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function VoiceoverButton() {
  const {
    isPlaying,
    currentSectionId,
    activeBlockIndex,
    totalBlocks,
    currentTimeMs,
    totalDurationMs,
    playbackRate,
    play,
    pause,
    togglePlay,
    skipForward,
    skipBackward,
    setPlaybackRate,
  } = useVoiceover();

  const activeSection = useActiveSection();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [manifest, setManifest] = useState<ManifestEntry[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load manifest for section picker
  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(`${basePath}/audio/metadata/manifest.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.sections) setManifest(data.sections);
      })
      .catch(() => {});
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!isExpanded) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isExpanded]);

  const progress = totalDurationMs > 0 ? currentTimeMs / totalDurationMs : 0;
  const circumference = 2 * Math.PI * 22; // r=22 for the ring
  const displaySection = currentSectionId || activeSection;
  const sectionLabel = displaySection ? SECTION_LABELS[displaySection] ?? displaySection : null;

  const handleSpeedCycle = useCallback(() => {
    const currentIdx = SPEED_OPTIONS.indexOf(playbackRate);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    setPlaybackRate(SPEED_OPTIONS[nextIdx]);
  }, [playbackRate, setPlaybackRate]);

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      setIsExpanded(false);
      // Scroll to the section on the page
      const el = document.getElementById(sectionId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      // Start playing (same pattern as click-to-play)
      play(sectionId);
    },
    [play]
  );

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded section picker */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-story-card rounded-2xl shadow-xl border border-story-border mb-1 min-w-[260px] max-h-[60vh] flex flex-col"
          >
            {/* Speed controls header */}
            <div className="p-3 border-b border-story-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted text-[10px] font-mono uppercase tracking-wider">
                  Audiobook
                </span>
                <button
                  onClick={handleSpeedCycle}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-nvme-blue/10 text-nvme-blue hover:bg-nvme-blue/20 transition-colors"
                >
                  {playbackRate}x
                </button>
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={skipBackward}
                  className="w-8 h-8 rounded-full hover:bg-story-surface flex items-center justify-center text-text-secondary transition-colors"
                  title="Previous block"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-nvme-blue text-white flex items-center justify-center hover:bg-nvme-blue/90 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={skipForward}
                  className="w-8 h-8 rounded-full hover:bg-story-surface flex items-center justify-center text-text-secondary transition-colors"
                  title="Next block"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>

              {/* Progress info */}
              {currentSectionId && (
                <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted font-mono">
                  <span>{formatTime(currentTimeMs)}</span>
                  <span>Block {activeBlockIndex + 1} / {totalBlocks}</span>
                  <span>{formatTime(totalDurationMs)}</span>
                </div>
              )}
            </div>

            {/* Section list */}
            <div className="overflow-y-auto p-2 space-y-0.5">
              <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider px-2 py-1">
                Sections
              </div>
              {SECTION_IDS.map((id) => {
                const label = SECTION_LABELS[id] ?? id;
                const manifestEntry = manifest.find((m) => m.sectionId === id);
                const isActive = id === displaySection;
                const isCurrent = id === currentSectionId;

                return (
                  <button
                    key={id}
                    onClick={() => handleSectionClick(id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-2 ${
                      isCurrent
                        ? "bg-nvme-blue/10 text-nvme-blue font-semibold"
                        : isActive
                        ? "bg-nvme-green/5 text-nvme-green"
                        : "text-text-secondary hover:bg-story-surface"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isCurrent
                          ? "bg-nvme-blue"
                          : isActive
                          ? "bg-nvme-green"
                          : "bg-story-border"
                      }`}
                    />
                    <span className="truncate flex-1">{label}</span>
                    {manifestEntry && (
                      <span className="text-[9px] text-text-muted font-mono flex-shrink-0">
                        {formatTime(manifestEntry.totalDurationMs)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main controls row */}
      <div className="flex items-center gap-2">
        {/* Status label */}
        <AnimatePresence>
          {(isPlaying || currentSectionId) && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-story-card rounded-full shadow-lg border border-story-border px-3 py-1.5 flex items-center gap-2 max-w-[200px]"
            >
              {isPlaying && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-nvme-blue animate-pulse flex-shrink-0" />
              )}
              <span className="text-[10px] font-mono text-text-muted truncate">
                {sectionLabel}
              </span>
              {isPlaying && totalBlocks > 0 && (
                <span className="text-[9px] font-mono text-text-muted/60 flex-shrink-0">
                  {activeBlockIndex + 1}/{totalBlocks}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip backward (visible when playing) */}
        <AnimatePresence>
          {isPlaying && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={skipBackward}
              className="w-8 h-8 rounded-full bg-story-card border border-story-border shadow-lg text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Previous block"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Sections list button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-full bg-story-card border border-story-border shadow-lg text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
          title="Browse sections"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>
        </button>

        {/* Main play/pause button with progress ring */}
        <button
          onClick={togglePlay}
          className="relative w-12 h-12 rounded-full bg-nvme-blue text-white shadow-lg shadow-nvme-blue/25 hover:shadow-xl hover:shadow-nvme-blue/30 transition-all active:scale-95 flex items-center justify-center"
          title={isPlaying ? "Pause voiceover" : "Play voiceover"}
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
            />
            {isPlaying && (
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray={`${progress * circumference} ${circumference}`}
                strokeLinecap="round"
                className="transition-[stroke-dasharray] duration-200"
              />
            )}
          </svg>

          {isPlaying ? (
            <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 relative z-10 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip forward (visible when playing) */}
        <AnimatePresence>
          {isPlaying && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={skipForward}
              className="w-8 h-8 rounded-full bg-story-card border border-story-border shadow-lg text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
              title="Next block"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Speed badge (visible when playing, not 1x) */}
        <AnimatePresence>
          {isPlaying && playbackRate !== 1 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSpeedCycle}
              className="h-6 px-2 rounded-full bg-story-card border border-story-border shadow-lg text-[9px] font-mono text-nvme-blue hover:bg-nvme-blue/5 transition-colors"
            >
              {playbackRate}x
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
