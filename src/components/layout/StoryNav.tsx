"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  label: string;
  isAct?: boolean;
  actNum?: number;
  actIdx?: number; // which act this sub-section belongs to
}

const SECTIONS: Section[] = [
  // Act 1
  { id: "act-1", label: "Foundations", isAct: true, actNum: 1 },
  { id: "sec-binary", label: "Binary", actIdx: 0 },
  { id: "sec-nand", label: "NAND Cell", actIdx: 0 },
  { id: "sec-ssd", label: "SSD Overview", actIdx: 0 },
  { id: "sec-ftl", label: "FTL", actIdx: 0 },
  // Act 2
  { id: "act-2", label: "Interface", isAct: true, actNum: 2 },
  { id: "sec-pcie", label: "PCIe", actIdx: 1 },
  { id: "sec-bar0", label: "BAR0", actIdx: 1 },
  { id: "sec-queues", label: "Queues", actIdx: 1 },
  { id: "sec-doorbells", label: "Doorbells", actIdx: 1 },
  // Act 3
  { id: "act-3", label: "Protocol", isAct: true, actNum: 3 },
  { id: "sec-sqe", label: "SQE", actIdx: 2 },
  { id: "sec-admin-cmds", label: "Admin Cmds", actIdx: 2 },
  { id: "sec-io-cmds", label: "I/O Cmds", actIdx: 2 },
  { id: "sec-errors", label: "Errors", actIdx: 2 },
  // Act 4
  { id: "act-4", label: "Maintenance", isAct: true, actNum: 4 },
  { id: "sec-smart", label: "SMART", actIdx: 3 },
  { id: "sec-trim", label: "TRIM", actIdx: 3 },
  { id: "sec-wear", label: "Wear Leveling", actIdx: 3 },
  // Act 5
  { id: "act-5", label: "Storage & Testing", isAct: true, actNum: 5 },
  { id: "sec-filesystems", label: "Filesystems", actIdx: 4 },
  { id: "sec-fio", label: "fio", actIdx: 4 },
  { id: "sec-testing", label: "Testing", actIdx: 4 },
  // Act 6
  { id: "act-6", label: "Advanced", isAct: true, actNum: 6 },
  { id: "sec-firmware", label: "Firmware", actIdx: 5 },
  { id: "sec-security", label: "Security", actIdx: 5 },
  { id: "sec-passthru", label: "Passthru", actIdx: 5 },
  { id: "sec-tracing", label: "Tracing", actIdx: 5 },
  // Act 7
  { id: "act-7", label: "Playground", isAct: true, actNum: 7 },
];

const ACTS_ONLY = SECTIONS.filter((s) => s.isAct);

export default function StoryNav() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Which act index (0-6) is currently active
  const activeSection = SECTIONS[activeIdx];
  const activeActIdx = activeSection?.isAct
    ? ACTS_ONLY.indexOf(activeSection)
    : (activeSection?.actIdx ?? 0);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = elements.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIdx(idx);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop: Left rail */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-0">
        <div className="relative flex flex-col items-center bg-story-card/90 backdrop-blur-sm rounded-2xl py-3 px-1.5 shadow-lg shadow-black/5 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {SECTIONS.map((sec, i) => {
            const isCurrent = i === activeIdx;
            const isActHeader = sec.isAct;
            const belongsToActiveAct = sec.actIdx === activeActIdx;
            const isActiveActHeader = isActHeader && ACTS_ONLY.indexOf(sec) === activeActIdx;

            // Sub-sections: only show if they belong to the active act
            if (!isActHeader && !belongsToActiveAct) return null;

            return (
              <div key={sec.id} className="flex flex-col items-center">
                <button
                  onClick={() => scrollTo(sec.id)}
                  className="group relative flex items-center p-1"
                  aria-label={
                    isActHeader
                      ? `Scroll to Act ${sec.actNum}: ${sec.label}`
                      : `Scroll to ${sec.label}`
                  }
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      isActHeader
                        ? `w-2.5 h-2.5 ${
                            isCurrent || isActiveActHeader
                              ? "bg-nvme-blue scale-110"
                              : ACTS_ONLY.indexOf(sec) <= activeActIdx
                              ? "bg-nvme-blue/60"
                              : "bg-story-border"
                          }`
                        : `w-1.5 h-1.5 ${
                            isCurrent
                              ? "bg-nvme-green scale-125"
                              : "bg-story-border/60"
                          }`
                    }`}
                  />
                  <span
                    className={`absolute left-8 whitespace-nowrap font-medium transition-all duration-200 ${
                      isActHeader ? "text-xs" : "text-[10px]"
                    } ${
                      isCurrent
                        ? `opacity-100 ${isActHeader ? "text-nvme-blue" : "text-nvme-green"}`
                        : "opacity-0 group-hover:opacity-100 text-text-muted"
                    }`}
                  >
                    {sec.label}
                  </span>
                </button>
                {/* Connector line */}
                {i < SECTIONS.length - 1 && (() => {
                  const next = SECTIONS[i + 1];
                  const nextVisible = next.isAct || next.actIdx === activeActIdx;
                  if (!nextVisible) return null;
                  return (
                    <div
                      className={`transition-colors duration-300 ${
                        isActHeader ? "w-0.5 h-3" : "w-px h-2"
                      } ${
                        i < activeIdx ? "bg-nvme-blue/40" : "bg-story-border/40"
                      }`}
                    />
                  );
                })()}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile: Bottom progress bar + contents button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="h-0.5 bg-story-border">
          <div
            className="h-full bg-nvme-blue transition-all duration-300"
            style={{ width: `${((activeActIdx + 1) / ACTS_ONLY.length) * 100}%` }}
          />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute bottom-4 right-4 bg-story-card border border-story-border rounded-full px-4 py-2 text-xs text-text-secondary font-mono shadow-lg shadow-black/5"
        >
          Act {activeActIdx + 1} / {ACTS_ONLY.length}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-16 right-4 bg-story-card border border-story-border rounded-2xl p-3 space-y-0.5 shadow-xl max-h-[60vh] overflow-y-auto">
            {SECTIONS.map((sec, i) => (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={`block w-full text-left rounded-xl transition-colors ${
                  sec.isAct
                    ? `px-4 py-2.5 text-sm font-semibold ${
                        ACTS_ONLY.indexOf(sec) === activeActIdx
                          ? "bg-nvme-blue/5 text-nvme-blue"
                          : "text-text-secondary hover:bg-story-surface"
                      }`
                    : `pl-8 pr-4 py-1.5 text-xs ${
                        i === activeIdx
                          ? "text-nvme-green"
                          : "text-text-muted hover:text-text-secondary hover:bg-story-surface"
                      }`
                }`}
              >
                {sec.isAct ? `${sec.actNum}. ${sec.label}` : sec.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
