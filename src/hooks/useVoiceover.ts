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
  const activeSectionRef = useRef<string | null>(null);
  const lastSectionRef = useRef<string | null>(null);

  // Keep activeSectionRef in sync
  activeSectionRef.current = activeSection;

  // Create or get the shared audio element
  useEffect(() => {
    let el = document.getElementById("voiceover-audio") as HTMLAudioElement;
    if (!el) {
      el = document.createElement("audio");
      el.id = "voiceover-audio";
      el.preload = "auto";
      document.body.appendChild(el);
    }
    audioRef.current = el;
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

  // Handle audio ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      getState().setPlaying(false);
      getState().setCurrentTime(0);
      getState().setCurrentBlockIndex(0);
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  /** Load metadata for a section (lazy) */
  const loadSectionMetadata = useCallback(
    async (sectionId: string): Promise<SectionMetadata | null> => {
      const existing = getState().getMetadata(sectionId);
      if (existing) return existing;

      try {
        const res = await fetch(`/audio/metadata/${sectionId}.json`);
        if (!res.ok) {
          console.error(`[voiceover] Failed to load metadata for ${sectionId}: ${res.status}`);
          return null;
        }
        const meta: SectionMetadata = await res.json();
        getState().loadMetadata(sectionId, meta);
        return meta;
      } catch (err) {
        console.error(`[voiceover] Error loading metadata for ${sectionId}:`, err);
        return null;
      }
    },
    []
  );

  /** Wait for audio element to be ready to play */
  const waitForCanPlay = useCallback((audio: HTMLAudioElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (audio.readyState >= 3) {
        resolve();
        return;
      }
      const onCanPlay = () => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("error", onError);
        reject(new Error(`Audio load error: ${audio.error?.message || "unknown"}`));
      };
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("error", onError);
    });
  }, []);

  /** Switch audio to a new section */
  const switchToSection = useCallback(
    async (sectionId: string) => {
      const meta = await loadSectionMetadata(sectionId);
      if (!meta || !audioRef.current) return;

      const audio = audioRef.current;
      const s = getState();

      // Set new source and load
      audio.src = meta.audioFile;
      audio.playbackRate = s.playbackRate;
      audio.load();

      // Resume from saved position or start
      const resume = s.getResumePosition(sectionId);
      if (resume) {
        audio.currentTime = resume.timeMs / 1000;
        s.setCurrentBlockIndex(resume.blockIndex);
        s.setCurrentTime(resume.timeMs);
      } else {
        audio.currentTime = 0;
        s.setCurrentBlockIndex(0);
        s.setCurrentTime(0);
      }

      s.setCurrentSection(sectionId);

      // Wait for audio to be ready
      try {
        await waitForCanPlay(audio);
      } catch (err) {
        console.error(`[voiceover] Audio load failed for ${sectionId}:`, err);
      }
    },
    [loadSectionMetadata, waitForCanPlay]
  );

  // Auto-switch section when user scrolls to a new section
  useEffect(() => {
    if (!activeSection || activeSection === lastSectionRef.current) return;
    lastSectionRef.current = activeSection;

    const s = getState();
    if (s.isPlaying && s.currentSectionId !== activeSection) {
      // Save position for departing section
      if (s.currentSectionId) {
        s.saveResumePosition(s.currentSectionId);
      }

      // Switch to new section and resume playback
      (async () => {
        await switchToSection(activeSection);
        const audio = audioRef.current;
        if (audio) {
          try {
            await audio.play();
            getState().setPlaying(true);
          } catch (err) {
            console.error("[voiceover] Auto-switch play failed:", err);
          }
        }
      })();
    }
  }, [activeSection, switchToSection]);

  // Actions
  const play = useCallback(
    async (sectionId?: string) => {
      const s = getState();
      const targetSection =
        sectionId ||
        activeSectionRef.current ||
        s.currentSectionId ||
        SECTION_IDS[0]; // Fallback to first section

      if (!targetSection) return;

      const audio = audioRef.current;
      if (!audio) {
        console.error("[voiceover] Audio element not ready");
        return;
      }

      // Switch source if needed
      if (targetSection !== s.currentSectionId || !audio.src || !audio.src.includes(targetSection)) {
        await switchToSection(targetSection);
      }

      // Ensure metadata is loaded
      const meta = await loadSectionMetadata(targetSection);
      if (!meta) {
        console.error(`[voiceover] No metadata for ${targetSection}`);
        return;
      }

      try {
        await audio.play();
        getState().setPlaying(true);
      } catch (err) {
        console.error("[voiceover] Play failed:", err);
      }
    },
    [switchToSection, loadSectionMetadata]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
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
    if (block && audioRef.current) {
      audioRef.current.currentTime = block.beginMs / 1000;
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
    if (block && audioRef.current) {
      audioRef.current.currentTime = block.beginMs / 1000;
      s.setCurrentBlockIndex(prevIdx);
      s.setCurrentTime(block.beginMs);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    getState().setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const seekToTime = useCallback((timeMs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeMs / 1000;
      getState().setCurrentTime(timeMs);
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
