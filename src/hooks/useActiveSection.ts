"use client";

import { useState, useEffect, useRef } from "react";

/** All voiceover-able section IDs (matches section-manifest.json order) */
const SECTION_IDS = [
  "sec-storage", "sec-bus", "sec-data-flow", "sec-transistor",
  "sec-binary", "sec-lba",
  "sec-nand-basics", "sec-nand-types", "sec-nand-endurance", "sec-nand-hierarchy",
  "sec-ssd", "sec-ftl", "sec-gc",
  "sec-vpc", "sec-qd",
  "sec-pcie",
  "sec-bar0", "sec-queues", "sec-doorbells",
  "sec-boot", "sec-bus-trace",
  "sec-sqe", "sec-identify", "sec-namespaces",
  "sec-admin-cmds", "sec-io-cmds",
  "sec-errors", "sec-io-path",
  "sec-smart", "sec-trim", "sec-waf", "sec-format-sanitize", "sec-wear",
  "sec-filesystems", "sec-fio", "sec-testing",
  "sec-firmware", "sec-security", "sec-passthru", "sec-tracing",
];

/**
 * Detects which section is currently visible using IntersectionObserver.
 * Returns the active section ID.
 */
export function useActiveSection(): string | null {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const visibleRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleRef.current.add(id);
          } else {
            visibleRef.current.delete(id);
          }
        }

        // Pick the topmost visible section (by DOM order)
        const visible = visibleRef.current;
        if (visible.size === 0) return;

        for (const id of SECTION_IDS) {
          if (visible.has(id)) {
            setActiveSection(id);
            return;
          }
        }
      },
      { rootMargin: "-15% 0px -60% 0px" }
    );

    // Observe all section wrapper divs
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return activeSection;
}

export { SECTION_IDS };
