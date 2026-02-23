#!/usr/bin/env python3
"""
Generate voiceover audio using Hume AI TTS (Octave v2) with word-level timestamps.
Uses the Sitcom Girl voice with version 2 for timestamp support.
"""

import asyncio
import base64
import json
import os
import shutil
import sys
import tempfile
import time
from pathlib import Path

import httpx

PROJECT_ROOT = Path(__file__).parent.parent
EXTRACTED_DIR = PROJECT_ROOT / "scripts" / "extracted"
MANIFEST_PATH = PROJECT_ROOT / "scripts" / "section-manifest.json"
AUDIO_OUTPUT_DIR = PROJECT_ROOT / "public" / "audio" / "sections"
METADATA_OUTPUT_DIR = PROJECT_ROOT / "public" / "audio" / "metadata"

HUME_VOICE_ID = "5bbc32c1-a1f6-44e8-bedb-9870f23619e2"  # Sitcom Girl
HUME_VOICE_NAME = "Sitcom Girl"
CHUNK_CHAR_LIMIT = 4500  # Hume limit ~5000 chars/request
HUME_API_KEY = os.environ.get("HUME_API_KEY", "")

if not HUME_API_KEY:
    print("ERROR: Set HUME_API_KEY environment variable")
    print("  export HUME_API_KEY='your-api-key-here'")
    sys.exit(1)

API_URL = "https://api.hume.ai/v0/tts"
API_HEADERS = {
    "X-Hume-Api-Key": HUME_API_KEY,
    "Content-Type": "application/json",
}


def chunk_blocks(blocks: list[dict], char_limit: int = CHUNK_CHAR_LIMIT) -> list[list[dict]]:
    """Split blocks into chunks that fit within the character limit."""
    chunks = []
    current_chunk = []
    current_chars = 0

    for block in blocks:
        text_len = len(block["text"])
        if current_chars + text_len > char_limit and current_chunk:
            chunks.append(current_chunk)
            current_chunk = []
            current_chars = 0
        current_chunk.append(block)
        current_chars += text_len

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


async def generate_chunk_audio(
    http_client: httpx.AsyncClient,
    text: str,
    output_path: Path,
) -> dict:
    """Generate audio for a single text chunk using Hume AI TTS v2.
    Returns metadata with word timestamps."""
    resp = await http_client.post(
        API_URL,
        headers=API_HEADERS,
        json={
            "utterances": [{
                "text": text,
                "voice": {"id": HUME_VOICE_ID},
            }],
            "format": {"type": "mp3"},
            "include_timestamp_types": ["word"],
            "version": "2",
        },
        timeout=120.0,
    )

    if resp.status_code != 200:
        raise Exception(f"Hume API error {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    gen = data["generations"][0]

    # Write audio to file
    audio_bytes = base64.b64decode(gen["audio"])
    with open(output_path, "wb") as f:
        f.write(audio_bytes)

    # Extract word timestamps from snippets
    word_timestamps = []
    for snippet_group in gen.get("snippets", []):
        for snippet in snippet_group:
            for ts in snippet.get("timestamps", []):
                word_timestamps.append({
                    "word": ts["text"],
                    "begin": ts["time"]["begin"],
                    "end": ts["time"]["end"],
                })

    duration_ms = int(gen.get("duration", 0) * 1000)
    if word_timestamps and word_timestamps[-1]["end"] > duration_ms:
        duration_ms = word_timestamps[-1]["end"]

    return {
        "timestamps": word_timestamps,
        "durationMs": duration_ms,
        "sizeBytes": len(audio_bytes),
    }


def merge_mp3_files(chunk_files: list[Path], output_path: Path) -> None:
    """Merge multiple MP3 files via byte concatenation."""
    if len(chunk_files) == 1:
        shutil.copy2(chunk_files[0], output_path)
        return

    with open(output_path, "wb") as out:
        for chunk_file in chunk_files:
            with open(chunk_file, "rb") as inp:
                out.write(inp.read())


async def process_section(
    http_client: httpx.AsyncClient,
    section_id: str,
    blocks: list[dict],
    label: str,
) -> dict | None:
    """Process a single section: generate audio for all chunks and merge."""
    print(f"\n{'='*60}")
    print(f"Processing {section_id} ({label})")
    print(f"  {len(blocks)} blocks, {sum(len(b['text'].split()) for b in blocks)} words")

    # Filter out very short blocks
    narration_blocks = [b for b in blocks if len(b["text"]) > 5]
    if not narration_blocks:
        print(f"  SKIP: No narration blocks")
        return None

    # Chunk blocks at paragraph boundaries
    chunks = chunk_blocks(narration_blocks)
    print(f"  Split into {len(chunks)} chunk(s)")

    chunk_files = []
    chunk_metadata = []
    cumulative_offset_ms = 0

    with tempfile.TemporaryDirectory() as tmp_dir:
        for i, chunk_blocks_list in enumerate(chunks):
            chunk_text = " ".join(b["text"] for b in chunk_blocks_list)
            chunk_path = Path(tmp_dir) / f"chunk_{i}.mp3"

            print(f"  Generating chunk {i+1}/{len(chunks)} ({len(chunk_text)} chars)...")

            try:
                meta = await generate_chunk_audio(http_client, chunk_text, chunk_path)
            except Exception as e:
                print(f"  ERROR on chunk {i+1}: {e}")
                await asyncio.sleep(3)
                try:
                    meta = await generate_chunk_audio(http_client, chunk_text, chunk_path)
                except Exception as e2:
                    print(f"  FATAL ERROR on chunk {i+1}: {e2}")
                    raise

            # Offset timestamps by cumulative duration of previous chunks
            for ts in meta["timestamps"]:
                ts["begin"] += cumulative_offset_ms
                ts["end"] += cumulative_offset_ms

            chunk_files.append(chunk_path)
            chunk_metadata.append({
                "blocks": chunk_blocks_list,
                "timestamps": meta["timestamps"],
                "durationMs": meta["durationMs"],
            })

            cumulative_offset_ms += meta["durationMs"]

            # Rate limit
            await asyncio.sleep(0.5)

        # Merge all chunks into final audio file
        output_audio = AUDIO_OUTPUT_DIR / f"{section_id}.mp3"
        merge_mp3_files(chunk_files, output_audio)

    # Build metadata: assign timestamps to blocks
    all_timestamps = []
    for cm in chunk_metadata:
        all_timestamps.extend(cm["timestamps"])

    total_duration_ms = cumulative_offset_ms
    file_size = output_audio.stat().st_size

    block_metadata = assign_timestamps_to_blocks(narration_blocks, all_timestamps)

    section_meta = {
        "sectionId": section_id,
        "audioFile": f"/audio/sections/{section_id}.mp3",
        "totalDurationMs": total_duration_ms,
        "fileSizeBytes": file_size,
        "blocks": block_metadata,
    }

    meta_path = METADATA_OUTPUT_DIR / f"{section_id}.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(section_meta, f, indent=2, ensure_ascii=False)

    print(f"  ✓ Audio: {output_audio.name} ({file_size:,} bytes, {total_duration_ms/1000:.1f}s)")
    print(f"  ✓ Metadata: {meta_path.name} ({len(block_metadata)} blocks)")

    return section_meta


def assign_timestamps_to_blocks(blocks: list[dict], word_timestamps: list[dict]) -> list[dict]:
    """Map word-level timestamps back to text blocks using sequential matching."""
    block_metadata = []
    ts_index = 0

    for block in blocks:
        block_words = block["text"].split()
        block_ts = []
        block_begin = None
        block_end = None
        words_matched = 0

        for word in block_words:
            if ts_index >= len(word_timestamps):
                break

            ts_word = word_timestamps[ts_index]["word"].strip(".,;:!?\"'()-–—")
            block_word = word.strip(".,;:!?\"'()-–—")

            if ts_word.lower() == block_word.lower() or words_matched > 0:
                if block_begin is None:
                    block_begin = word_timestamps[ts_index]["begin"]
                block_end = word_timestamps[ts_index]["end"]
                block_ts.append(word_timestamps[ts_index])
                ts_index += 1
                words_matched += 1
            else:
                # Lookahead to find match
                for lookahead in range(1, min(5, len(word_timestamps) - ts_index)):
                    la_word = word_timestamps[ts_index + lookahead]["word"].strip(".,;:!?\"'()-–—")
                    if la_word.lower() == block_word.lower():
                        ts_index += lookahead
                        if block_begin is None:
                            block_begin = word_timestamps[ts_index]["begin"]
                        block_end = word_timestamps[ts_index]["end"]
                        block_ts.append(word_timestamps[ts_index])
                        ts_index += 1
                        words_matched += 1
                        break

        meta = {
            "blockIndex": block["blockIndex"],
            "type": block["type"],
            "text": block["text"],
            "beginMs": block_begin or 0,
            "endMs": block_end or 0,
            "timestamps": block_ts,
        }
        if block.get("requiresReveal"):
            meta["requiresReveal"] = True

        block_metadata.append(meta)

    return block_metadata


async def main():
    AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)

    # Check which sections already have audio (for resuming)
    existing = set()
    for p in AUDIO_OUTPUT_DIR.glob("*.mp3"):
        existing.add(p.stem)

    manifest_entries = []
    total_duration = 0
    total_size = 0

    async with httpx.AsyncClient() as http_client:
        for section in manifest["sections"]:
            sec_id = section["id"]
            label = section["label"]

            # Load extracted text
            extracted_path = EXTRACTED_DIR / f"{sec_id}.json"
            if not extracted_path.exists():
                print(f"SKIP {sec_id}: No extracted text (run extract-text.py first)")
                continue

            with open(extracted_path) as f:
                extracted = json.load(f)

            blocks = extracted.get("blocks", [])
            if not blocks:
                print(f"SKIP {sec_id}: No blocks")
                continue

            # Skip if already generated (delete MP3 to regenerate)
            if sec_id in existing:
                meta_path = METADATA_OUTPUT_DIR / f"{sec_id}.json"
                if meta_path.exists():
                    with open(meta_path) as f:
                        meta = json.load(f)
                    manifest_entries.append({
                        "sectionId": sec_id,
                        "label": label,
                        "audioFile": meta["audioFile"],
                        "totalDurationMs": meta["totalDurationMs"],
                        "fileSizeBytes": meta["fileSizeBytes"],
                        "blockCount": len(meta["blocks"]),
                    })
                    total_duration += meta["totalDurationMs"]
                    total_size += meta["fileSizeBytes"]
                    print(f"EXISTS {sec_id} — skipping (delete MP3 to regenerate)")
                    continue

            result = await process_section(http_client, sec_id, blocks, label)
            if result:
                manifest_entries.append({
                    "sectionId": sec_id,
                    "label": label,
                    "audioFile": result["audioFile"],
                    "totalDurationMs": result["totalDurationMs"],
                    "fileSizeBytes": result["fileSizeBytes"],
                    "blockCount": len(result["blocks"]),
                })
                total_duration += result["totalDurationMs"]
                total_size += result["fileSizeBytes"]

    # Write master manifest
    master_manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "voice": HUME_VOICE_NAME,
        "voiceId": HUME_VOICE_ID,
        "totalDurationMs": total_duration,
        "totalSizeBytes": total_size,
        "sections": manifest_entries,
    }

    manifest_out = METADATA_OUTPUT_DIR / "manifest.json"
    with open(manifest_out, "w", encoding="utf-8") as f:
        json.dump(master_manifest, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"COMPLETE")
    print(f"  Sections: {len(manifest_entries)}")
    print(f"  Total duration: {total_duration/1000/60:.1f} minutes")
    print(f"  Total size: {total_size/1024/1024:.1f} MB")
    print(f"  Manifest: {manifest_out}")


if __name__ == "__main__":
    asyncio.run(main())
