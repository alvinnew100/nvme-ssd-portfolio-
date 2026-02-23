"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTION_AUDIO: { lessons: number[]; file: string; label: string }[] = [
  { lessons: [0], file: "/nvme-ssd-portfolio-/audio/act0.mp3", label: "Storage Foundations" },
  { lessons: [1, 2, 3, 4], file: "/nvme-ssd-portfolio-/audio/act1.mp3", label: "NAND Flash & SSDs" },
  { lessons: [5, 6, 7], file: "/nvme-ssd-portfolio-/audio/act2.mp3", label: "PCIe, BAR0 & Queues" },
  { lessons: [8, 9, 10], file: "/nvme-ssd-portfolio-/audio/act3.mp3", label: "NVMe Commands" },
  { lessons: [11], file: "/nvme-ssd-portfolio-/audio/act4.mp3", label: "Drive Health" },
  { lessons: [12, 13], file: "/nvme-ssd-portfolio-/audio/act5.mp3", label: "Stack & Tools" },
];

function getLessonAudio(lesson: number) {
  return SECTION_AUDIO.find((s) => s.lessons.includes(lesson)) ?? SECTION_AUDIO[0];
}

export default function VoiceoverButton() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeSection = getLessonAudio(currentLesson);

  // Detect current lesson via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const ids = Array.from({ length: 14 }, (_, i) => `lesson-${i}`);

    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setCurrentLesson(i);
        },
        { rootMargin: "-20% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Track audio progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // If source changed, update it
    if (audio.src !== window.location.origin + activeSection.file &&
        !audio.src.endsWith(activeSection.file)) {
      audio.src = activeSection.file;
      audio.load();
      setProgress(0);
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, activeSection.file]);

  const playSection = useCallback((sectionIdx: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const section = SECTION_AUDIO[sectionIdx];
    audio.src = section.file;
    audio.load();
    setProgress(0);
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
    setIsExpanded(false);
  }, []);

  return (
    <>
      <audio ref={audioRef} preload="none" />
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Expanded section picker */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-story-card rounded-2xl shadow-xl border border-story-border p-3 mb-1 min-w-[220px]"
            >
              <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-2 px-1">
                Listen to section
              </div>
              <div className="space-y-1">
                {SECTION_AUDIO.map((section, i) => (
                  <button
                    key={i}
                    onClick={() => playSection(i)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 ${
                      activeSection === section
                        ? "bg-nvme-blue/10 text-nvme-blue font-semibold"
                        : "text-text-secondary hover:bg-story-surface"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-nvme-blue/10 text-nvme-blue flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {section.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <div className="flex items-center gap-2">
          {/* Current section label */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-story-card rounded-full shadow-lg border border-story-border px-3 py-1.5 text-[10px] font-mono text-text-muted flex items-center gap-2"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-nvme-blue animate-pulse" />
                {activeSection.label}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={(e) => {
              if (e.shiftKey || e.metaKey) {
                setIsExpanded(!isExpanded);
              } else {
                togglePlay();
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="relative w-12 h-12 rounded-full bg-nvme-blue text-white shadow-lg shadow-nvme-blue/25 hover:shadow-xl hover:shadow-nvme-blue/30 transition-all active:scale-95 flex items-center justify-center group"
            title={isPlaying ? "Pause voiceover" : "Play voiceover (right-click for sections)"}
          >
            {/* Progress ring */}
            {isPlaying && (
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray={`${progress * 138.2} 138.2`}
                  strokeLinecap="round"
                />
              </svg>
            )}

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

            {/* Expand indicator dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-nvme-amber border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </>
  );
}
