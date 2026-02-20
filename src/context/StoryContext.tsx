"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface StoryState {
  activeAct: number;
  setActiveAct: (act: number) => void;
  scrollToPlayground: (commandId: string) => void;
  pendingCommand: string | null;
  clearPendingCommand: () => void;
}

const StoryContext = createContext<StoryState | null>(null);

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [activeAct, setActiveAct] = useState(1);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  const scrollToPlayground = useCallback((commandId: string) => {
    setPendingCommand(commandId);
    const el = document.getElementById("act-6");
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const clearPendingCommand = useCallback(() => {
    setPendingCommand(null);
  }, []);

  return (
    <StoryContext.Provider
      value={{
        activeAct,
        setActiveAct,
        scrollToPlayground,
        pendingCommand,
        clearPendingCommand,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory must be used within StoryProvider");
  return ctx;
}
