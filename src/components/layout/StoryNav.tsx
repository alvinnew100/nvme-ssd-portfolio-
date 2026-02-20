"use client";

import { useState, useEffect } from "react";

const ACTS = [
  { num: 1, label: "Foundations", id: "act-1" },
  { num: 2, label: "Interface", id: "act-2" },
  { num: 3, label: "Protocol", id: "act-3" },
  { num: 4, label: "Maintenance", id: "act-4" },
  { num: 5, label: "Advanced", id: "act-5" },
  { num: 6, label: "Playground", id: "act-6" },
];

export default function StoryNav() {
  const [activeAct, setActiveAct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sections = ACTS.map((a) => document.getElementById(a.id));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveAct(idx);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop: Left rail */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-1">
        <div className="relative flex flex-col items-center">
          {ACTS.map((act, i) => (
            <div key={act.id} className="flex flex-col items-center">
              <button
                onClick={() => scrollTo(act.id)}
                className="group relative flex items-center"
                aria-label={`Scroll to Act ${act.num}: ${act.label}`}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    i <= activeAct
                      ? "bg-nvme-green border-nvme-green"
                      : "bg-transparent border-story-border"
                  }`}
                />
                <span
                  className={`absolute left-6 whitespace-nowrap text-xs font-mono transition-all duration-200 ${
                    i === activeAct
                      ? "opacity-100 text-nvme-green"
                      : "opacity-0 group-hover:opacity-100 text-text-muted"
                  }`}
                >
                  {act.label}
                </span>
              </button>
              {i < ACTS.length - 1 && (
                <div
                  className={`w-0.5 h-8 transition-colors duration-300 ${
                    i < activeAct ? "bg-nvme-green" : "bg-story-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile: Bottom progress bar + contents button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="h-1 bg-story-panel">
          <div
            className="h-full bg-nvme-green transition-all duration-300"
            style={{ width: `${((activeAct + 1) / ACTS.length) * 100}%` }}
          />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute bottom-4 right-4 bg-story-panel border border-story-border rounded-full px-4 py-2 text-xs text-text-secondary font-mono"
        >
          Act {activeAct + 1} / {ACTS.length}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-story-bg/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-16 right-4 bg-story-panel border border-story-border rounded-xl p-4 space-y-2">
            {ACTS.map((act, i) => (
              <button
                key={act.id}
                onClick={() => scrollTo(act.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
                  i === activeAct
                    ? "bg-nvme-green/10 text-nvme-green"
                    : "text-text-secondary hover:bg-story-border/50"
                }`}
              >
                {act.num}. {act.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
