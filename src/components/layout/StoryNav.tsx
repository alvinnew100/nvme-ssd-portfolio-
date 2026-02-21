"use client";

import { useState, useEffect, useCallback } from "react";

interface NavItem {
  id: string;
  label: string;
  isLesson?: boolean;
  lessonNum?: number;
  lessonIndex?: number;
}

const NAV_ITEMS: NavItem[] = [
  // Lesson 1: Bits, Bytes, and Addressing
  { id: "lesson-1", label: "Bits & Addressing", isLesson: true, lessonNum: 1, lessonIndex: 0 },
  { id: "sec-binary", label: "Binary", lessonIndex: 0 },
  { id: "sec-lba", label: "LBA", lessonIndex: 0 },

  // Lesson 2: NAND Flash Memory
  { id: "lesson-2", label: "NAND Flash", isLesson: true, lessonNum: 2, lessonIndex: 1 },
  { id: "sec-nand", label: "NAND Cells", lessonIndex: 1 },
  { id: "sec-nand-hierarchy", label: "NAND Hierarchy", lessonIndex: 1 },

  // Lesson 3: SSD Architecture and FTL
  { id: "lesson-3", label: "SSD & FTL", isLesson: true, lessonNum: 3, lessonIndex: 2 },
  { id: "sec-ssd", label: "SSD Overview", lessonIndex: 2 },
  { id: "sec-ftl", label: "FTL", lessonIndex: 2 },

  // Lesson 4: PCIe — The Highway
  { id: "lesson-4", label: "PCIe", isLesson: true, lessonNum: 4, lessonIndex: 3 },
  { id: "sec-pcie", label: "PCIe", lessonIndex: 3 },

  // Lesson 5: BAR0, Queues, and Doorbells
  { id: "lesson-5", label: "BAR0 & Queues", isLesson: true, lessonNum: 5, lessonIndex: 4 },
  { id: "sec-bar0", label: "BAR0 Registers", lessonIndex: 4 },
  { id: "sec-queues", label: "Queues", lessonIndex: 4 },
  { id: "sec-doorbells", label: "Doorbells", lessonIndex: 4 },

  // Lesson 6: Boot Sequence and Bus Trace
  { id: "lesson-6", label: "Boot & Bus Trace", isLesson: true, lessonNum: 6, lessonIndex: 5 },
  { id: "sec-boot", label: "Boot Sequence", lessonIndex: 5 },
  { id: "sec-bus-trace", label: "Bus Trace", lessonIndex: 5 },

  // Lesson 7: Command Structure
  { id: "lesson-7", label: "Command Structure", isLesson: true, lessonNum: 7, lessonIndex: 6 },
  { id: "sec-sqe", label: "SQE Structure", lessonIndex: 6 },
  { id: "sec-identify", label: "Identify", lessonIndex: 6 },
  { id: "sec-namespaces", label: "Namespaces", lessonIndex: 6 },

  // Lesson 8: NVMe Commands
  { id: "lesson-8", label: "NVMe Commands", isLesson: true, lessonNum: 8, lessonIndex: 7 },
  { id: "sec-admin-cmds", label: "Admin Cmds", lessonIndex: 7 },
  { id: "sec-io-cmds", label: "I/O Cmds", lessonIndex: 7 },

  // Lesson 9: Error Handling and I/O Path
  { id: "lesson-9", label: "Errors & I/O Path", isLesson: true, lessonNum: 9, lessonIndex: 8 },
  { id: "sec-errors", label: "Errors", lessonIndex: 8 },
  { id: "sec-io-path", label: "I/O Path", lessonIndex: 8 },

  // Lesson 10: SMART, TRIM, and Drive Health
  { id: "lesson-10", label: "Drive Health", isLesson: true, lessonNum: 10, lessonIndex: 9 },
  { id: "sec-smart", label: "SMART", lessonIndex: 9 },
  { id: "sec-trim", label: "TRIM & GC", lessonIndex: 9 },
  { id: "sec-waf", label: "Write Amplification", lessonIndex: 9 },
  { id: "sec-format-sanitize", label: "Format & Sanitize", lessonIndex: 9 },
  { id: "sec-wear", label: "Wear Leveling", lessonIndex: 9 },

  // Lesson 11: Storage Stack and Testing
  { id: "lesson-11", label: "Storage & Testing", isLesson: true, lessonNum: 11, lessonIndex: 10 },
  { id: "sec-filesystems", label: "Filesystems", lessonIndex: 10 },
  { id: "sec-fio", label: "fio Guide", lessonIndex: 10 },
  { id: "sec-testing", label: "Testing", lessonIndex: 10 },

  // Lesson 12: Advanced Features and Tools
  { id: "lesson-12", label: "Advanced & Tools", isLesson: true, lessonNum: 12, lessonIndex: 11 },
  { id: "sec-firmware", label: "Firmware", lessonIndex: 11 },
  { id: "sec-security", label: "Security", lessonIndex: 11 },
  { id: "sec-passthru", label: "Passthru", lessonIndex: 11 },
  { id: "sec-tracing", label: "Tracing", lessonIndex: 11 },
  { id: "sec-command-ref", label: "Command Ref", lessonIndex: 11 },
  { id: "sec-playground", label: "Playground", lessonIndex: 11 },
];

export default function StoryNav() {
  const [activeId, setActiveId] = useState("lesson-1");
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((n) => n.id === activeId);
  const activeLessonIndex = activeItem?.lessonIndex ?? 0;
  const totalLessons = NAV_ITEMS.filter((n) => n.isLesson).length;

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

  // Filter: show all lessons + sub-sections of the active lesson
  const visibleItems = NAV_ITEMS.filter(
    (n) => n.isLesson || n.lessonIndex === activeLessonIndex
  );

  return (
    <>
      {/* ─── Desktop: Left sidebar ─── */}
      <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-story-card/95 backdrop-blur-md border border-story-border/50 rounded-xl py-3 px-2 shadow-xl shadow-black/10 w-44 max-h-[80vh] overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = item.id === activeId;
            const isPastLesson =
              item.isLesson && (item.lessonIndex ?? 0) < activeLessonIndex;

            if (item.isLesson) {
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? "text-nvme-blue"
                      : isPastLesson
                      ? "text-text-secondary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isActive
                        ? "bg-nvme-blue"
                        : isPastLesson
                        ? "bg-nvme-blue/40"
                        : "bg-story-border"
                    }`}
                  />
                  <span className="text-[11px] font-semibold truncate">
                    {item.lessonNum}. {item.label}
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
              width: `${((activeLessonIndex + 1) / totalLessons) * 100}%`,
            }}
          />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute bottom-4 right-4 bg-story-card border border-story-border rounded-full px-4 py-2 text-xs text-text-secondary font-mono shadow-lg shadow-black/5"
        >
          Lesson {activeLessonIndex + 1} / {totalLessons}
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
                  item.isLesson
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
                {item.isLesson ? `${item.lessonNum}. ${item.label}` : item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
