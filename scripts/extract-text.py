#!/usr/bin/env python3
"""
Extract narrative text from JSX/TSX story components for voiceover generation.
Reads each section's .tsx file and outputs ordered text blocks as JSON.
"""

import json
import os
import re
import sys
import html

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(PROJECT_ROOT, "scripts", "section-manifest.json")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "scripts", "extracted")


def strip_jsx_tags(text: str) -> str:
    """Remove JSX/HTML tags and clean up whitespace, preserving inner text."""
    # Replace <br/> or <br /> with space
    text = re.sub(r"<br\s*/?>", " ", text)
    # Remove self-closing tags like <Component />
    text = re.sub(r"<[A-Z]\w+[^>]*/\s*>", "", text)
    # Remove all remaining HTML/JSX tags
    text = re.sub(r"<[^>]+>", "", text)
    return text


def clean_text(text: str) -> str:
    """Clean JSX text: handle entities, expressions, whitespace."""
    # Remove JSX comments {/* ... */}
    text = re.sub(r"\{/\*.*?\*/\}", "", text, flags=re.DOTALL)
    # Replace JSX string expressions like {" "} or {' '}
    text = re.sub(r'\{"([^"]*)"\}', r"\1", text)
    text = re.sub(r"\{'([^']*)'\}", r"\1", text)
    # Remove remaining JSX expressions like {variable} or {fn()}
    text = re.sub(r"\{[^}]*\}", "", text)
    # HTML entities
    text = text.replace("&apos;", "'")
    text = text.replace("&quot;", '"')
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    text = text.replace("&mdash;", " — ")
    text = text.replace("&ndash;", " – ")
    text = text.replace("&hellip;", "...")
    text = text.replace("&rarr;", "→")
    text = text.replace("&larr;", "←")
    text = text.replace("&times;", "×")
    text = text.replace("&nbsp;", " ")
    # Unicode entities
    text = re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), text)
    text = re.sub(r"&#x([0-9a-fA-F]+);", lambda m: chr(int(m.group(1), 16)), text)
    # Strip JSX tags
    text = strip_jsx_tags(text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_h3_blocks(content: str) -> list[tuple[int, dict]]:
    """Extract <h3> headings with their position."""
    blocks = []
    pattern = r"<h3\b[^>]*>(.*?)</h3>"
    for match in re.finditer(pattern, content, re.DOTALL):
        text = clean_text(match.group(1))
        if text and len(text) > 2:
            blocks.append((match.start(), {"type": "heading", "text": text}))
    return blocks


def extract_paragraph_blocks(content: str) -> list[tuple[int, dict]]:
    """Extract <p> paragraphs with text-secondary or leading-relaxed classes."""
    blocks = []
    # Match <p className="...text-text-secondary..."> or <p className="...leading-relaxed...">
    pattern = r"<p\b[^>]*className=[\"'][^\"']*(?:text-text-secondary|leading-relaxed)[^\"']*[\"'][^>]*>(.*?)</p>"
    for match in re.finditer(pattern, content, re.DOTALL):
        text = clean_text(match.group(1))
        if text and len(text) > 10:
            blocks.append((match.start(), {"type": "paragraph", "text": text}))
    return blocks


def extract_analogy_cards(content: str) -> list[tuple[int, dict]]:
    """Extract <AnalogyCard concept="..." analogy="..." />."""
    blocks = []
    pattern = r"<AnalogyCard\b([^>]*)/>"
    for match in re.finditer(pattern, content, re.DOTALL):
        attrs = match.group(1)
        concept = extract_prop(attrs, "concept")
        analogy = extract_prop(attrs, "analogy")
        if concept and analogy:
            text = f"Analogy: {clean_text(concept)}. {clean_text(analogy)}"
            blocks.append((match.start(), {"type": "analogy", "text": text}))
    return blocks


def extract_term_definitions(content: str) -> list[tuple[int, dict]]:
    """Extract standalone <TermDefinition term="..." definition="..." /> (outside <p> tags)."""
    blocks = []
    # Only match TermDefinition that is NOT inside a <p> tag
    # We'll find all TermDefinitions first, then filter out those inside paragraphs
    p_ranges = []
    for m in re.finditer(r"<p\b[^>]*>.*?</p>", content, re.DOTALL):
        p_ranges.append((m.start(), m.end()))

    pattern = r"<TermDefinition\b([^>]*)/>"
    for match in re.finditer(pattern, content, re.DOTALL):
        # Check if inside a <p> tag
        inside_p = any(start <= match.start() < end for start, end in p_ranges)
        if inside_p:
            continue
        attrs = match.group(1)
        term = extract_prop(attrs, "term")
        definition = extract_prop(attrs, "definition")
        if term and definition:
            text = f"{clean_text(term)}: {clean_text(definition)}"
            blocks.append((match.start(), {"type": "term", "text": text}))
    return blocks


def extract_info_cards(content: str) -> list[tuple[int, dict]]:
    """Extract <InfoCard title="...">children</InfoCard>."""
    blocks = []
    pattern = r"<InfoCard\b([^>]*)>(.*?)</InfoCard>"
    for match in re.finditer(pattern, content, re.DOTALL):
        attrs = match.group(1)
        children = match.group(2)
        title = extract_prop(attrs, "title") or ""
        inner_text = clean_text(children)
        if inner_text and len(inner_text) > 10:
            text = f"{clean_text(title)}: {inner_text}" if title else inner_text
            blocks.append((match.start(), {"type": "info", "text": text}))
    return blocks


def extract_reveal_cards(content: str) -> list[tuple[int, dict]]:
    """Extract <RevealCard prompt="..." answer="..."> or self-closing."""
    blocks = []
    # Self-closing form
    pattern_sc = r"<RevealCard\b([^>]*)/>"
    for match in re.finditer(pattern_sc, content, re.DOTALL):
        attrs = match.group(1)
        prompt_text = extract_prop(attrs, "prompt")
        answer_text = extract_prop(attrs, "answer")
        if prompt_text:
            text = f"Knowledge check: {clean_text(prompt_text)}"
            if answer_text:
                text += f" The answer: {clean_text(answer_text)}"
            blocks.append((match.start(), {"type": "reveal", "text": text, "requiresReveal": True}))

    # Open/close form <RevealCard ...>...</RevealCard>
    pattern_oc = r"<RevealCard\b([^>]*)>(.*?)</RevealCard>"
    for match in re.finditer(pattern_oc, content, re.DOTALL):
        attrs = match.group(1)
        prompt_text = extract_prop(attrs, "prompt")
        # For MCQ cards, extract options
        options = extract_prop_array(attrs, "options")
        if prompt_text:
            text = f"Knowledge check: {clean_text(prompt_text)}"
            if options:
                text += " Options: " + "; ".join(clean_text(o) for o in options) + "."
            blocks.append((match.start(), {"type": "reveal", "text": text, "requiresReveal": True}))
    return blocks


def extract_prop(attrs: str, prop_name: str) -> str | None:
    """Extract a string prop value from JSX attributes."""
    # Double-quoted: prop="value"
    pattern = rf'{prop_name}="([^"]*)"'
    match = re.search(pattern, attrs)
    if match:
        return match.group(1)
    # Single-quoted: prop='value'
    pattern = rf"{prop_name}='([^']*)'"
    match = re.search(pattern, attrs)
    if match:
        return match.group(1)
    # JSX expression: prop={"value"} or prop={'value'}
    pattern = rf'{prop_name}=\{{"([^"]*?)"\}}'
    match = re.search(pattern, attrs)
    if match:
        return match.group(1)
    # Template literal: prop={`value`}
    pattern = rf"{prop_name}=\{{`([^`]*?)`\}}"
    match = re.search(pattern, attrs)
    if match:
        return match.group(1)
    return None


def extract_prop_array(attrs: str, prop_name: str) -> list[str]:
    """Extract an array prop like options={["a", "b", "c"]}."""
    pattern = rf'{prop_name}=\{{\[(.*?)\]\}}'
    match = re.search(pattern, attrs, re.DOTALL)
    if not match:
        return []
    inner = match.group(1)
    # Extract quoted strings
    items = re.findall(r'"([^"]*)"', inner)
    if not items:
        items = re.findall(r"'([^']*)'", inner)
    return items


def extract_section(section_id: str, file_path: str) -> dict:
    """Extract all text blocks from a section's TSX file."""
    full_path = os.path.join(PROJECT_ROOT, file_path)
    if not os.path.exists(full_path):
        print(f"  WARNING: File not found: {full_path}", file=sys.stderr)
        return {"sectionId": section_id, "blocks": []}

    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Collect all blocks with their source positions
    all_blocks = []
    all_blocks.extend(extract_h3_blocks(content))
    all_blocks.extend(extract_paragraph_blocks(content))
    all_blocks.extend(extract_analogy_cards(content))
    all_blocks.extend(extract_term_definitions(content))
    all_blocks.extend(extract_info_cards(content))
    all_blocks.extend(extract_reveal_cards(content))

    # Sort by source position (DOM order)
    all_blocks.sort(key=lambda x: x[0])

    # Deduplicate overlapping blocks (e.g., a RevealCard matched both patterns)
    seen_positions = set()
    unique_blocks = []
    for pos, block in all_blocks:
        # Use a range key to avoid exact duplicates
        key = (pos, block["type"])
        if key not in seen_positions:
            seen_positions.add(key)
            unique_blocks.append(block)

    # Add block indices
    for i, block in enumerate(unique_blocks):
        block["blockIndex"] = i

    return {"sectionId": section_id, "blocks": unique_blocks}


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(MANIFEST_PATH, "r") as f:
        manifest = json.load(f)

    total_blocks = 0
    total_words = 0

    for section in manifest["sections"]:
        sec_id = section["id"]
        file_path = section["file"]
        label = section["label"]

        print(f"Extracting {sec_id} ({label}) from {file_path}...")
        result = extract_section(sec_id, file_path)

        block_count = len(result["blocks"])
        word_count = sum(len(b["text"].split()) for b in result["blocks"])
        total_blocks += block_count
        total_words += word_count

        output_path = os.path.join(OUTPUT_DIR, f"{sec_id}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"  → {block_count} blocks, {word_count} words")

    print(f"\nTotal: {total_blocks} blocks, {total_words} words across {len(manifest['sections'])} sections")
    print(f"Output: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
