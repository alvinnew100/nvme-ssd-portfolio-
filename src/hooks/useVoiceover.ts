"use client";

import { useCallback, useEffect, useRef } from "react";
import { useVoiceoverStore } from "@/store/voiceoverStore";
import { useActiveSection, SECTION_IDS } from "@/hooks/useActiveSection";
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

  if (result >= 0 && blocks[result].endMs >= timeMs) {
    return result;
  }
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

/** Helper to get fresh store state (avoids stale closures) */
function getState() {
  return useVoiceoverStore.getState();
}

/** Base path from Next.js config (for static file URLs) */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Metadata cache (module-level to survive re-renders) */
const metadataCache: Record<string, SectionMetadata> = {};

async function fetchMetadata(sectionId: string): Promise<SectionMetadata | null> {
  if (metadataCache[sectionId]) return metadataCache[sectionId];

  const existing = getState().getMetadata(sectionId);
  if (existing) {
    metadataCache[sectionId] = existing;
    return existing;
  }

  try {
    const res = await fetch(`${BASE_PATH}/audio/metadata/${sectionId}.json`);
    if (!res.ok) {
      console.error(`[voiceover] Metadata fetch failed for ${sectionId}: ${res.status}`);
      return null;
    }
    const meta: SectionMetadata = await res.json();
    metadataCache[sectionId] = meta;
    getState().loadMetadata(sectionId, meta);
    return meta;
  } catch (err) {
    console.error(`[voiceover] Metadata error for ${sectionId}:`, err);
    return null;
  }
}

/** Get or create the shared audio element */
function getAudio(): HTMLAudioElement {
  let el = document.getElementById("voiceover-audio") as HTMLAudioElement;
  if (!el) {
    el = document.createElement("audio");
    el.id = "voiceover-audio";
    el.preload = "auto";
    document.body.appendChild(el);
  }
  return el;
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
  const animFrameRef = useRef<number>(0);
  const activeSectionRef = useRef<string | null>(null);
  const lastSectionRef = useRef<string | null>(null);

  // Keep activeSectionRef in sync
  activeSectionRef.current = activeSection;

  // Attach ended listener once
  useEffect(() => {
    const audio = getAudio();
    const onEnded = () => {
      getState().setPlaying(false);
      getState().setCurrentTime(0);
      getState().setCurrentBlockIndex(0);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  // Sync playback rate
  useEffect(() => {
    getAudio().playbackRate = store.playbackRate;
  }, [store.playbackRate]);

  // Time update loop at ~60fps
  useEffect(() => {
    if (!store.isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const tick = () => {
      const audio = getAudio();
      if (!audio.paused) {
        const timeMs = audio.currentTime * 1000;
        const s = getState();
        s.setCurrentTime(timeMs);

        const meta = s.currentSectionId
          ? s.getMetadata(s.currentSectionId)
          : undefined;
        if (meta) {
          const blockIdx = findActiveBlock(meta.blocks, timeMs);
          if (blockIdx !== s.currentBlockIndex && blockIdx >= 0) {
            s.setCurrentBlockIndex(blockIdx);
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [store.isPlaying, store.currentSectionId]);

  // Auto-switch section when user scrolls to a new section
  useEffect(() => {
    if (!activeSection || activeSection === lastSectionRef.current) return;
    lastSectionRef.current = activeSection;

    const s = getState();
    if (s.isPlaying && s.currentSectionId !== activeSection) {
      if (s.currentSectionId) {
        s.saveResumePosition(s.currentSectionId);
      }
      playSection(activeSection);
    }
  }, [activeSection]);

  /** Core: load metadata, set audio source, and play */
  async function playSection(sectionId: string) {
    const meta = await fetchMetadata(sectionId);
    if (!meta) return;

    const audio = getAudio();
    const s = getState();

    // Only change source if needed
    const currentSrc = audio.src || "";
    if (!currentSrc.includes(sectionId)) {
      audio.src = `${BASE_PATH}${meta.audioFile}`;
      audio.playbackRate = s.playbackRate;
    }

    s.setCurrentSection(sectionId);

    // Resume from saved position
    const resume = s.getResumePosition(sectionId);
    if (resume && resume.timeMs > 0) {
      s.setCurrentBlockIndex(resume.blockIndex);
      s.setCurrentTime(resume.timeMs);
    } else {
      s.setCurrentBlockIndex(0);
      s.setCurrentTime(0);
    }

    try {
      // Set playing state immediately so UI updates
      s.setPlaying(true);

      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
      }

      // Seek to resume position after playback starts (avoids seeking before load)
      if (resume && resume.timeMs > 0) {
        audio.currentTime = resume.timeMs / 1000;
      }
    } catch (err) {
      console.error("[voiceover] Play failed:", err);
      getState().setPlaying(false);
    }
  }

  const play = useCallback(
    (sectionId?: string) => {
      const s = getState();
      const targetSection =
        sectionId ||
        activeSectionRef.current ||
        s.currentSectionId ||
        SECTION_IDS[0];

      if (!targetSection) return;
      playSection(targetSection);
    },
    []
  );

  const pause = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    const s = getState();
    if (s.currentSectionId) {
      s.saveResumePosition(s.currentSectionId);
    }
    s.setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (getState().isPlaying) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const skipForward = useCallback(() => {
    const s = getState();
    const meta = s.currentSectionId ? s.getMetadata(s.currentSectionId) : undefined;
    if (!meta) return;
    const nextIdx = Math.min(s.currentBlockIndex + 1, meta.blocks.length - 1);
    const block = meta.blocks[nextIdx];
    if (block) {
      getAudio().currentTime = block.beginMs / 1000;
      s.setCurrentBlockIndex(nextIdx);
      s.setCurrentTime(block.beginMs);
    }
  }, []);

  const skipBackward = useCallback(() => {
    const s = getState();
    const meta = s.currentSectionId ? s.getMetadata(s.currentSectionId) : undefined;
    if (!meta) return;
    const prevIdx = Math.max(s.currentBlockIndex - 1, 0);
    const block = meta.blocks[prevIdx];
    if (block) {
      getAudio().currentTime = block.beginMs / 1000;
      s.setCurrentBlockIndex(prevIdx);
      s.setCurrentTime(block.beginMs);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    getState().setPlaybackRate(rate);
    getAudio().playbackRate = rate;
  }, []);

  const seekToTime = useCallback((timeMs: number) => {
    getAudio().currentTime = timeMs / 1000;
    getState().setCurrentTime(timeMs);
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
