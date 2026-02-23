"use client";

import { useEffect, useRef } from "react";
import { useVoiceoverStore } from "@/store/voiceoverStore";

/**
 * Pure side-effect component that highlights the currently narrated text block.
 * Sets data-vo-active="true" on the active DOM element and smooth-scrolls to it.
 * Renders nothing visible.
 */
export default function VoiceoverHighlighter() {
  const { isPlaying, currentSectionId, currentBlockIndex, loadedMetadata } =
    useVoiceoverStore();
  const prevElementRef = useRef<Element | null>(null);
  const userScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Track manual scrolling to avoid fighting with auto-scroll
  useEffect(() => {
    const onScroll = () => {
      userScrolledRef.current = true;
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        userScrolledRef.current = false;
      }, 3000);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Apply/remove highlight attribute
  useEffect(() => {
    if (!isPlaying || !currentSectionId) {
      // Remove highlight when not playing
      if (prevElementRef.current) {
        prevElementRef.current.removeAttribute("data-vo-active");
        prevElementRef.current = null;
      }
      return;
    }

    const meta = loadedMetadata[currentSectionId];
    if (!meta) return;

    // Find the container for this section
    const container = document.getElementById(currentSectionId);
    if (!container) return;

    // Query narrative elements in DOM order:
    // p tags, h3 tags, and elements with data-vo attribute
    const elements = container.querySelectorAll(
      "p.text-text-secondary, h3, [data-vo]"
    );

    const targetElement = elements[currentBlockIndex];

    // Remove from previous
    if (prevElementRef.current && prevElementRef.current !== targetElement) {
      prevElementRef.current.removeAttribute("data-vo-active");
    }

    // Apply to current
    if (targetElement) {
      targetElement.setAttribute("data-vo-active", "true");
      prevElementRef.current = targetElement;

      // Auto-scroll to keep active block visible (unless user manually scrolled)
      if (!userScrolledRef.current) {
        const rect = targetElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isInView = rect.top >= 60 && rect.bottom <= viewportHeight - 100;

        if (!isInView) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (prevElementRef.current) {
        prevElementRef.current.removeAttribute("data-vo-active");
      }
    };
  }, [isPlaying, currentSectionId, currentBlockIndex, loadedMetadata]);

  return null;
}
