"use client";

import { useCallback, useEffect, useRef } from "react";
import { useVoiceoverStore } from "@/store/voiceoverStore";
import { useActiveSection, SECTION_IDS } from "@/hooks/useActiveSection";
import type { SectionMetadata, TextBlock } from "@/types/voiceover";

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
  if (result >= 0 && blocks[result].endMs >= timeMs) return result;
  return result;
}

function getState() {
  return useVoiceoverStore.getState();
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
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
    if (!res.ok) return null;
    const meta: SectionMetadata = await res.json();
    metadataCache[sectionId] = meta;
    getState().loadMetadata(sectionId, meta);
    return meta;
  } catch {
    return null;
  }
}

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

/**
 * Core play function — used by everything.
 * Loads metadata, sets source, plays, and seeks to the given time.
 */
async function startPlayback(sectionId: string, seekMs: number, blockIndex: number) {
  const meta = await fetchMetadata(sectionId);
  if (!meta) return;

  const audio = getAudio();
  const s = getState();

  // Always set source (ensures correct file)
  const currentSrc = audio.src || "";
  if (!currentSrc.includes(sectionId)) {
    audio.src = `${BASE_PATH}${meta.audioFile}`;
  }
  audio.playbackRate = s.playbackRate;

  s.setCurrentSection(sectionId);
  s.setCurrentBlockIndex(blockIndex);
  s.setCurrentTime(seekMs);
  s.setPlaying(true);

  try {
    const p = audio.play();
    if (p) await p;
    // Seek after play starts (avoids seeking before load)
    if (seekMs > 0) {
      audio.currentTime = seekMs / 1000;
    }
  } catch (err) {
    console.error("[voiceover] Play failed:", err);
    getState().setPlaying(false);
  }
}

/** Text matching for click-to-play */
function findBlockByText(blocks: TextBlock[], clickedText: string): TextBlock | null {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const clicked = normalize(clickedText);
  if (clicked.length < 5) return null;

  for (const block of blocks) {
    if (normalize(block.text) === clicked) return block;
  }
  const prefix = clicked.slice(0, 60);
  for (const block of blocks) {
    if (normalize(block.text).startsWith(prefix)) return block;
  }
  for (const block of blocks) {
    if (normalize(block.text).includes(prefix)) return block;
  }
  for (const block of blocks) {
    const bn = normalize(block.text);
    if (bn.length > 10 && clicked.includes(bn.slice(0, 60))) return block;
  }
  return null;
}

interface VoiceoverHook {
  isPlaying: boolean;
  currentSectionId: string | null;
  activeBlockIndex: number;
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
  playFromText: (sectionId: string, clickedText: string) => void;
}

export function useVoiceover(): VoiceoverHook {
  const store = useVoiceoverStore();
  const activeSection = useActiveSection();
  const animFrameRef = useRef<number>(0);
  const activeSectionRef = useRef<string | null>(null);

  activeSectionRef.current = activeSection;

  // Ended listener
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

  // Time update loop
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
        const meta = s.currentSectionId ? s.getMetadata(s.currentSectionId) : undefined;
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

  // No auto-switch on scroll — user controls section manually

  const play = useCallback((sectionId?: string) => {
    const s = getState();
    const target = sectionId || activeSectionRef.current || s.currentSectionId || SECTION_IDS[0];
    if (!target) return;
    startPlayback(target, 0, 0);
  }, []);

  const pause = useCallback(() => {
    getAudio().pause();
    getState().setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    const s = getState();
    if (s.isPlaying) {
      getAudio().pause();
      s.setPlaying(false);
    } else {
      // If already have a section loaded and paused, resume from current position
      const audio = getAudio();
      if (s.currentSectionId && audio.src && audio.src.includes(s.currentSectionId)) {
        s.setPlaying(true);
        audio.play().catch(() => getState().setPlaying(false));
      } else {
        const target = activeSectionRef.current || s.currentSectionId || SECTION_IDS[0];
        if (target) startPlayback(target, 0, 0);
      }
    }
  }, []);

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

  const playFromText = useCallback((sectionId: string, clickedText: string) => {
    (async () => {
      const meta = await fetchMetadata(sectionId);
      if (!meta) return;

      const block = findBlockByText(meta.blocks, clickedText);
      if (!block) {
        startPlayback(sectionId, 0, 0);
        return;
      }

      const blockIndex = meta.blocks.indexOf(block);
      startPlayback(sectionId, block.beginMs, blockIndex);
    })();
  }, []);

  // Derived state
  const meta = store.currentSectionId
    ? store.getMetadata(store.currentSectionId)
    : undefined;

  return {
    isPlaying: store.isPlaying,
    currentSectionId: store.currentSectionId,
    activeBlockIndex: store.currentBlockIndex,
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
    playFromText,
  };
}
