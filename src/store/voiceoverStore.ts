"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SectionMetadata } from "@/types/voiceover";

interface ResumePosition {
  blockIndex: number;
  timeMs: number;
}

interface VoiceoverState {
  // Playback state
  isPlaying: boolean;
  currentSectionId: string | null;
  currentBlockIndex: number;
  currentTimeMs: number;
  playbackRate: number;

  // Persisted resume positions per section
  resumePositions: Record<string, ResumePosition>;

  // Lazy-loaded metadata (not persisted)
  loadedMetadata: Record<string, SectionMetadata>;

  // Actions
  play: () => void;
  pause: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentSection: (sectionId: string) => void;
  setCurrentTime: (timeMs: number) => void;
  setCurrentBlockIndex: (index: number) => void;
  setPlaybackRate: (rate: number) => void;
  seekToBlock: (blockIndex: number) => void;
  saveResumePosition: (sectionId: string) => void;
  getResumePosition: (sectionId: string) => ResumePosition | null;
  loadMetadata: (sectionId: string, metadata: SectionMetadata) => void;
  getMetadata: (sectionId: string) => SectionMetadata | undefined;
  reset: () => void;
}

export const useVoiceoverStore = create<VoiceoverState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentSectionId: null,
      currentBlockIndex: 0,
      currentTimeMs: 0,
      playbackRate: 1,
      resumePositions: {},
      loadedMetadata: {},

      play: () => set({ isPlaying: true }),
      pause: () => {
        const { currentSectionId } = get();
        if (currentSectionId) {
          get().saveResumePosition(currentSectionId);
        }
        set({ isPlaying: false });
      },
      setPlaying: (playing) => set({ isPlaying: playing }),

      setCurrentSection: (sectionId) =>
        set({ currentSectionId: sectionId, currentBlockIndex: 0 }),

      setCurrentTime: (timeMs) => set({ currentTimeMs: timeMs }),

      setCurrentBlockIndex: (index) => set({ currentBlockIndex: index }),

      setPlaybackRate: (rate) => set({ playbackRate: rate }),

      seekToBlock: (blockIndex) => {
        const { currentSectionId, loadedMetadata } = get();
        if (!currentSectionId) return;
        const meta = loadedMetadata[currentSectionId];
        if (!meta || blockIndex < 0 || blockIndex >= meta.blocks.length) return;
        const block = meta.blocks[blockIndex];
        set({ currentBlockIndex: blockIndex, currentTimeMs: block.beginMs });
      },

      saveResumePosition: (sectionId) => {
        const { currentBlockIndex, currentTimeMs } = get();
        set((state) => ({
          resumePositions: {
            ...state.resumePositions,
            [sectionId]: { blockIndex: currentBlockIndex, timeMs: currentTimeMs },
          },
        }));
      },

      getResumePosition: (sectionId) => {
        return get().resumePositions[sectionId] ?? null;
      },

      loadMetadata: (sectionId, metadata) => {
        set((state) => ({
          loadedMetadata: { ...state.loadedMetadata, [sectionId]: metadata },
        }));
      },

      getMetadata: (sectionId) => {
        return get().loadedMetadata[sectionId];
      },

      reset: () =>
        set({
          isPlaying: false,
          currentSectionId: null,
          currentBlockIndex: 0,
          currentTimeMs: 0,
        }),
    }),
    {
      name: "nvme-voiceover",
      partialize: (state) => ({
        resumePositions: state.resumePositions,
        playbackRate: state.playbackRate,
      }),
    }
  )
);
