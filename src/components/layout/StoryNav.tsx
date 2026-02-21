"use client";

import { useState, useEffect, useCallback } from "react";

interface NavItem {
  id: string;
  label: string;
  isAct?: boolean;
  actNum?: number;
  actIndex?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "act-1", label: "Foundations", isAct: true, actNum: 1, actIndex: 0 },
  { id: "sec-binary", label: "Binary", actIndex: 0 },
  { id: "sec-nand", label: "NAND Cell", actIndex: 0 },
  { id: "sec-ssd", label: "SSD Overview", actIndex: 0 },
  { id: "sec-ftl", label: "FTL", actIndex: 0 },

  { id: "act-2", label: "Interface", isAct: true, actNum: 2, actIndex: 1 },
  { id: "sec-pcie", label: "PCIe", actIndex: 1 },
  { id: "sec-bar0", label: "BAR0", actIndex: 1 },
  { id: "sec-queues", label: "Queues", actIndex: 1 },
  { id: "sec-doorbells", label: "Doorbells", actIndex: 1 },

  { id: "act-3", label: "Protocol", isAct: true, actNum: 3, actIndex: 2 },
  { id: "sec-sqe", label: "SQE Structure", actIndex: 2 },
  { id: "sec-admin-cmds", label: "Admin Cmds", actIndex: 2 },
  { id: "sec-io-cmds", label: "I/O Cmds", actIndex: 2 },
  { id: "sec-errors", label: "Errors", actIndex: 2 },

  { id: "act-4", label: "Maintenance", isAct: true, actNum: 4, actIndex: 3 },
  { id: "sec-smart", label: "SMART", actIndex: 3 },
  { id: "sec-trim", label: "TRIM & GC", actIndex: 3 },
  { id: "sec-wear", label: "Wear Leveling", actIndex: 3 },

  { id: "act-5", label: "Storage & Testing", isAct: true, actNum: 5, actIndex: 4 },
  { id: "sec-filesystems", label: "Filesystems", actIndex: 4 },
  { id: "sec-fio", label: "fio Guide", actIndex: 4 },
  { id: "sec-testing", label: "Testing", actIndex: 4 },

  { id: "act-6", label: "Advanced", isAct: true, actNum: 6, actIndex: 5 },
  { id: "sec-firmware", label: "Firmware", actIndex: 5 },
  { id: "sec-security", label: "Security", actIndex: 5 },
  { id: "sec-passthru", label: "Passthru", actIndex: 5 },
  { id: "sec-tracing", label: "Tracing", actIndex: 5 },

  { id: "act-7", label: "Playground", isAct: true, actNum: 7, actIndex: 6 },
];

export default function StoryNav() {
  const [activeId, setActiveId] = useState("act-1");
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((n) => n.id === activeId);
  const activeActIndex = activeItem?.actIndex ?? 0;
  const totalActs = NAV_ITEMS.filter((n) => n.isAct).length;

  useEffect(() => {
    const elements: (HTMLElement | null)[] = NAV_ITEMS.map((n) =>
      document.getElementById(n.id)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = elements.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveId(NAV_ITEMS[idx].id);
          }
        }
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );

    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }, []);

  // Filter: show all acts + sub-sections of the active act
  const visibleItems = NAV_ITEMS.filter(
    (n) => n.isAct || n.actIndex === activeActIndex
  );

  return (
    <>
      {/* ─── Desktop: Left sidebar ─── */}
      <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-story-card/95 backdrop-blur-md border border-story-border/50 rounded-xl py-3 px-2 shadow-xl shadow-black/10 w-40">
          {visibleItems.map((item) => {
            const isActive = item.id === activeId;
            const isPastAct =
              item.isAct && (item.actIndex ?? 0) < activeActIndex;

            if (item.isAct) {
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? "text-nvme-blue"
                      : isPastAct
                      ? "text-text-secondary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isActive
                        ? "bg-nvme-blue"
                        : isPastAct
                        ? "bg-nvme-blue/40"
                        : "bg-story-border"
                    }`}
                  />
                  <span className="text-[11px] font-semibold truncate">
                    {item.actNum}. {item.label}
                  </span>
                </button>
              );
            }

            // Sub-section
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`flex items-center gap-2 w-full pl-5 pr-2 py-1 rounded-lg text-left transition-colors ${
                  isActive
                    ? "text-nvme-green bg-nvme-green/5"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <span
                  className={`w-1 h-1 rounded-full flex-shrink-0 ${
                    isActive ? "bg-nvme-green" : "bg-story-border/50"
                  }`}
                />
                <span className="text-[10px] truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ─── Mobile: Bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="h-0.5 bg-story-border">
          <div
            className="h-full bg-nvme-blue transition-all duration-300"
            style={{
              width: `${((activeActIndex + 1) / totalActs) * 100}%`,
            }}
          />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute bottom-4 right-4 bg-story-card border border-story-border rounded-full px-4 py-2 text-xs text-text-secondary font-mono shadow-lg shadow-black/5"
        >
          Act {activeActIndex + 1} / {totalActs}
        </button>
      </div>

      {/* ─── Mobile: Overlay ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-16 right-4 bg-story-card border border-story-border rounded-2xl p-3 shadow-xl max-h-[70vh] overflow-y-auto w-52">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`block w-full text-left rounded-lg transition-colors ${
                  item.isAct
                    ? `px-3 py-2 text-xs font-semibold ${
                        item.id === activeId
                          ? "text-nvme-blue bg-nvme-blue/5"
                          : "text-text-secondary hover:bg-story-surface"
                      }`
                    : `pl-7 pr-3 py-1.5 text-[11px] ${
                        item.id === activeId
                          ? "text-nvme-green"
                          : "text-text-muted hover:text-text-secondary"
                      }`
                }`}
              >
                {item.isAct ? `${item.actNum}. ${item.label}` : item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
