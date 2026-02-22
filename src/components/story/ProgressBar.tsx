"use client";

import { motion } from "framer-motion";
import { useProgressStore } from "@/store/progressStore";

interface ProgressBarProps {
  actPrefix: string;
  total: number;
  label?: string;
}

export default function ProgressBar({ actPrefix, total, label }: ProgressBarProps) {
  const completedCount = useProgressStore((s) => s.getCompletedCount(actPrefix));
  const pct = total > 0 ? Math.min((completedCount / total) * 100, 100) : 0;
  const allDone = completedCount >= total;

  return (
    <div className="max-w-4xl mx-auto px-4 mb-6">
      <div className="flex items-center gap-3">
        {label && <span className="text-text-muted text-xs font-mono flex-shrink-0">{label}</span>}
        <div className="flex-1 h-2 bg-story-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-nvme-green"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-text-muted text-xs font-mono flex-shrink-0">
          {allDone ? (
            <span className="flex items-center gap-1 text-nvme-green">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              All completed!
            </span>
          ) : (
            `${completedCount}/${total} challenges`
          )}
        </span>
      </div>
    </div>
  );
}
