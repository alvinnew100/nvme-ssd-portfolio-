"use client";

import { useEffect } from "react";
import { useVoiceover } from "@/hooks/useVoiceover";
import { SECTION_IDS } from "@/hooks/useActiveSection";

/**
 * Click-to-play: clicking any text in a section starts audio from that point.
 * Uses text-content matching against metadata blocks — no fragile index mapping.
 */
export default function VoiceoverClickHandler() {
  const { playFromText } = useVoiceover();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Don't intercept clicks on buttons, links, inputs, or interactive elements
      const interactive = target.closest("button, a, input, select, textarea, [role='button']");
      if (interactive) return;

      // Walk up to find the section container
      let sectionId: string | null = null;
      let el: HTMLElement | null = target;
      while (el) {
        if (el.id && SECTION_IDS.includes(el.id)) {
          sectionId = el.id;
          break;
        }
        el = el.parentElement;
      }
      if (!sectionId) return;

      // Get text from the clicked element or its closest narrative parent
      let textSource: HTMLElement | null = target;

      // Walk up to find a substantial text element (p, h3, or data-vo container)
      while (textSource && textSource.id !== sectionId) {
        const tag = textSource.tagName.toLowerCase();
        const isNarrative =
          (tag === "p" && textSource.classList.contains("text-text-secondary")) ||
          tag === "h3" ||
          textSource.hasAttribute("data-vo");

        if (isNarrative) break;
        textSource = textSource.parentElement;
      }

      if (!textSource || textSource.id === sectionId) return;

      const clickedText = (textSource.textContent || "").trim();
      if (clickedText.length < 5) return;

      playFromText(sectionId, clickedText);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [playFromText]);

  return null;
}
