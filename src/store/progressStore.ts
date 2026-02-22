"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  completed: Record<string, boolean>; // challengeId → true
  attempts: Record<string, number>;   // challengeId → total attempts
  markComplete: (id: string) => void;
  recordAttempt: (id: string) => void;
  resetChallenge: (id: string) => void;
  isComplete: (id: string) => boolean;
  getCompletedCount: (prefix: string) => number;
  getTotalCount: (prefix: string, total: number) => { completed: number; total: number };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      attempts: {},

      markComplete: (id: string) =>
        set((state) => ({
          completed: { ...state.completed, [id]: true },
        })),

      recordAttempt: (id: string) =>
        set((state) => ({
          attempts: {
            ...state.attempts,
            [id]: (state.attempts[id] || 0) + 1,
          },
        })),

      resetChallenge: (id: string) =>
        set((state) => {
          const { [id]: _, ...rest } = state.completed;
          const { [id]: __, ...restAttempts } = state.attempts;
          return { completed: rest, attempts: restAttempts };
        }),

      isComplete: (id: string) => !!get().completed[id],

      getCompletedCount: (prefix: string) =>
        Object.keys(get().completed).filter((k) => k.startsWith(prefix)).length,

      getTotalCount: (prefix: string, total: number) => ({
        completed: Object.keys(get().completed).filter((k) => k.startsWith(prefix)).length,
        total,
      }),
    }),
    {
      name: "nvme-progress",
    }
  )
);
