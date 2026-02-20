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
        <div className="relative flex flex-col items-center bg-story-card/90 backdrop-blur-sm rounded-full py-3 px-1.5 shadow-lg shadow-black/5">
          {ACTS.map((act, i) => (
            <div key={act.id} className="flex flex-col items-center">
              <button
                onClick={() => scrollTo(act.id)}
                className="group relative flex items-center p-1"
                aria-label={`Scroll to Act ${act.num}: ${act.label}`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i <= activeAct
                      ? "bg-nvme-blue scale-110"
                      : "bg-story-border"
                  }`}
                />
                <span
                  className={`absolute left-8 whitespace-nowrap text-xs font-medium transition-all duration-200 ${
                    i === activeAct
                      ? "opacity-100 text-nvme-blue"
                      : "opacity-0 group-hover:opacity-100 text-text-muted"
                  }`}
                >
                  {act.label}
                </span>
              </button>
              {i < ACTS.length - 1 && (
                <div
                  className={`w-0.5 h-6 transition-colors duration-300 ${
                    i < activeAct ? "bg-nvme-blue" : "bg-story-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile: Bottom progress bar + contents button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="h-0.5 bg-story-border">
          <div
            className="h-full bg-nvme-blue transition-all duration-300"
            style={{ width: `${((activeAct + 1) / ACTS.length) * 100}%` }}
          />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute bottom-4 right-4 bg-story-card border border-story-border rounded-full px-4 py-2 text-xs text-text-secondary font-mono shadow-lg shadow-black/5"
        >
          Act {activeAct + 1} / {ACTS.length}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-16 right-4 bg-story-card border border-story-border rounded-2xl p-3 space-y-1 shadow-xl">
            {ACTS.map((act, i) => (
              <button
                key={act.id}
                onClick={() => scrollTo(act.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  i === activeAct
                    ? "bg-nvme-blue/5 text-nvme-blue"
                    : "text-text-secondary hover:bg-story-surface"
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
