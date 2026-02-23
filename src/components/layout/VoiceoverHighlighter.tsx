"use client";

import { useEffect } from "react";
import { useVoiceover } from "@/hooks/useVoiceover";
import { SECTION_IDS } from "@/hooks/useActiveSection";

const NARRATIVE_SELECTOR =
  "p.text-text-secondary:not([data-vo] *), h3:not([data-vo] *), [data-vo]";

/**
 * Click-to-play: clicking any narrative text block starts audio from that point.
 * Uses event delegation on the document — renders nothing visible.
 */
export default function VoiceoverClickHandler() {
  const { playFromBlock } = useVoiceover();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

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
      if (!sectionId || !el) return;

      // Find all narrative elements in this section
      const elements = el.querySelectorAll(NARRATIVE_SELECTOR);

      // Find which element was clicked (walk up from target)
      let clickedElement: Element | null = target;
      let blockIndex = -1;
      while (clickedElement && clickedElement !== el) {
        blockIndex = Array.from(elements).indexOf(clickedElement);
        if (blockIndex >= 0) break;
        clickedElement = clickedElement.parentElement;
      }

      if (blockIndex < 0) return;

      playFromBlock(sectionId, blockIndex);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [playFromBlock]);

  return null;
}
