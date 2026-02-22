"use client";

import type { ReactNode } from "react";

interface ChallengeDiagramAreaProps {
  diagram: ReactNode;
  caption?: string;
}

export default function ChallengeDiagramArea({ diagram, caption }: ChallengeDiagramAreaProps) {
  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-story-border">
      {diagram}
      {caption && (
        <div className="text-text-muted text-xs text-center py-2 bg-story-surface">
          {caption}
        </div>
      )}
    </div>
  );
}
