"use client";

import { useCallback, useEffect, useRef } from "react";
import { useVoiceoverStore } from "@/store/voiceoverStore";
import { useActiveSection } from "@/hooks/useActiveSection";
import type { SectionMetadata, TextBlock } from "@/types/voiceover";

/** Binary search for the active block at a given time. */
function findActiveBlock(blocks: TextBlock[], timeMs: number): number {
  if (blocks.length === 0) return -1;
  let lo = 0;
  let hi = blocks.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (blocks[mid].beginMs <= timeMs) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // Verify the found block actually contains the time
  if (result >= 0 && blocks[result].endMs >= timeMs) {
    return result;
  }
  // If between blocks, return the previous one
  return result;
}

/** Find the active word index within a block at a given time. */
function findActiveWord(block: TextBlock, timeMs: number): number {
  const ts = block.timestamps;
  if (!ts || ts.length === 0) return -1;
  let lo = 0;
  let hi = ts.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (ts[mid].begin <= timeMs) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result;
}

interface VoiceoverHook {
  isPlaying: boolean;
  currentSectionId: string | null;
  activeBlockIndex: number;
  activeWordIndex: number;
  activeBlock: TextBlock | null;
  totalBlocks: number;
  currentTimeMs: number;
  totalDurationMs: number;
  playbackRate: number;
  play: (sectionId?: string) => void;
  pause: () => void;
  togglePlay: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  setPlaybackRate: (rate: number) => void;
  seekToTime: (timeMs: number) => void;
}

export function useVoiceover(): VoiceoverHook {
  const store = useVoiceoverStore();
  const activeSection = useActiveSection();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const userScrollingRef = useRef(false);
  const lastSectionRef = useRef<string | null>(null);

  // Create or get the shared audio element
  useEffect(() => {
    if (!audioRef.current) {
      let el = document.getElementById("voiceover-audio") as HTMLAudioElement;
      if (!el) {
        el = document.createElement("audio");
        el.id = "voiceover-audio";
        el.preload = "none";
        document.body.appendChild(el);
      }
      audioRef.current = el;
    }
  }, []);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = store.playbackRate;
    }
  }, [store.playbackRate]);

  // Time update loop at ~60fps
  useEffect(() => {
    if (!store.isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        const timeMs = audio.currentTime * 1000;
        store.setCurrentTime(timeMs);

        // Find active block
        const meta = store.currentSectionId
          ? store.getMetadata(store.currentSectionId)
          : undefined;
        if (meta) {
          const blockIdx = findActiveBlock(meta.blocks, timeMs);
          if (blockIdx !== store.currentBlockIndex && blockIdx >= 0) {
            store.setCurrentBlockIndex(blockIdx);
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [store.isPlaying, store.currentSectionId]);

  // Handle audio ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      store.setPlaying(false);
      store.setCurrentTime(0);
      store.setCurrentBlockIndex(0);
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  // Auto-switch section when user scrolls to a new section
  useEffect(() => {
    if (!activeSection || activeSection === lastSectionRef.current) return;
    lastSectionRef.current = activeSection;

    if (store.isPlaying && store.currentSectionId !== activeSection) {
      // Save position for departing section
      if (store.currentSectionId) {
        store.saveResumePosition(store.currentSectionId);
      }

      // Switch to new section
      switchToSection(activeSection);
    }
  }, [activeSection, store.isPlaying]);

  /** Load metadata for a section (lazy) */
  const loadSectionMetadata = useCallback(
    async (sectionId: string): Promise<SectionMetadata | null> => {
      const existing = store.getMetadata(sectionId);
      if (existing) return existing;

      try {
        const res = await fetch(`/audio/metadata/${sectionId}.json`);
        if (!res.ok) return null;
        const meta: SectionMetadata = await res.json();
        store.loadMetadata(sectionId, meta);
        return meta;
      } catch {
        return null;
      }
    },
    []
  );

  /** Switch audio to a new section */
  const switchToSection = useCallback(
    async (sectionId: string) => {
      const meta = await loadSectionMetadata(sectionId);
      if (!meta || !audioRef.current) return;

      const audio = audioRef.current;
      const wasPlaying = store.isPlaying;

      // Set new source
      audio.src = meta.audioFile;
      audio.playbackRate = store.playbackRate;

      // Resume from saved position or start
      const resume = store.getResumePosition(sectionId);
      if (resume) {
        audio.currentTime = resume.timeMs / 1000;
        store.setCurrentBlockIndex(resume.blockIndex);
        store.setCurrentTime(resume.timeMs);
      } else {
        audio.currentTime = 0;
        store.setCurrentBlockIndex(0);
        store.setCurrentTime(0);
      }

      store.setCurrentSection(sectionId);

      if (wasPlaying) {
        try {
          await audio.play();
          store.setPlaying(true);
        } catch {}
      }
    },
    [store.playbackRate]
  );

  // Actions
  const play = useCallback(
    async (sectionId?: string) => {
      const targetSection = sectionId || activeSection || store.currentSectionId;
      if (!targetSection) return;

      if (targetSection !== store.currentSectionId) {
        await switchToSection(targetSection);
      }

      const meta = await loadSectionMetadata(targetSection);
      if (!meta || !audioRef.current) return;

      const audio = audioRef.current;

      // If no source set yet, set it
      if (!audio.src || !audio.src.includes(targetSection)) {
        audio.src = meta.audioFile;
        audio.playbackRate = store.playbackRate;

        const resume = store.getResumePosition(targetSection);
        if (resume) {
          audio.currentTime = resume.timeMs / 1000;
        }
      }

      store.setCurrentSection(targetSection);

      try {
        await audio.play();
        store.setPlaying(true);
      } catch {}
    },
    [activeSection, store.currentSectionId, store.playbackRate]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (store.currentSectionId) {
      store.saveResumePosition(store.currentSectionId);
    }
    store.setPlaying(false);
  }, [store.currentSectionId]);

  const togglePlay = useCallback(() => {
    if (store.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [store.isPlaying, play, pause]);

  const skipForward = useCallback(() => {
    const meta = store.currentSectionId
      ? store.getMetadata(store.currentSectionId)
      : undefined;
    if (!meta) return;
    const nextIdx = Math.min(store.currentBlockIndex + 1, meta.blocks.length - 1);
    const block = meta.blocks[nextIdx];
    if (block && audioRef.current) {
      audioRef.current.currentTime = block.beginMs / 1000;
      store.setCurrentBlockIndex(nextIdx);
      store.setCurrentTime(block.beginMs);
    }
  }, [store.currentSectionId, store.currentBlockIndex]);

  const skipBackward = useCallback(() => {
    const meta = store.currentSectionId
      ? store.getMetadata(store.currentSectionId)
      : undefined;
    if (!meta) return;
    const prevIdx = Math.max(store.currentBlockIndex - 1, 0);
    const block = meta.blocks[prevIdx];
    if (block && audioRef.current) {
      audioRef.current.currentTime = block.beginMs / 1000;
      store.setCurrentBlockIndex(prevIdx);
      store.setCurrentTime(block.beginMs);
    }
  }, [store.currentSectionId, store.currentBlockIndex]);

  const setPlaybackRate = useCallback((rate: number) => {
    store.setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const seekToTime = useCallback((timeMs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeMs / 1000;
      store.setCurrentTime(timeMs);
    }
  }, []);

  // Derive active word
  const meta = store.currentSectionId
    ? store.getMetadata(store.currentSectionId)
    : undefined;
  const activeBlock = meta?.blocks[store.currentBlockIndex] ?? null;
  const activeWordIndex = activeBlock
    ? findActiveWord(activeBlock, store.currentTimeMs)
    : -1;

  return {
    isPlaying: store.isPlaying,
    currentSectionId: store.currentSectionId,
    activeBlockIndex: store.currentBlockIndex,
    activeWordIndex,
    activeBlock,
    totalBlocks: meta?.blocks.length ?? 0,
    currentTimeMs: store.currentTimeMs,
    totalDurationMs: meta?.totalDurationMs ?? 0,
    playbackRate: store.playbackRate,
    play,
    pause,
    togglePlay,
    skipForward,
    skipBackward,
    setPlaybackRate,
    seekToTime,
  };
}
