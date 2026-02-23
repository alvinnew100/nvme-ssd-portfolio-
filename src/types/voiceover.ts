/** Word-level timestamp from Hume AI TTS */
export interface WordTimestamp {
  word: string;
  begin: number; // milliseconds
  end: number;   // milliseconds
}

/** A block of narrated text (paragraph, heading, analogy, etc.) */
export interface TextBlock {
  blockIndex: number;
  type: "heading" | "paragraph" | "analogy" | "info" | "reveal" | "term";
  text: string;
  beginMs: number;
  endMs: number;
  timestamps: WordTimestamp[];
  requiresReveal?: boolean;
}

/** Metadata for a single section's audio */
export interface SectionMetadata {
  sectionId: string;
  audioFile: string;
  totalDurationMs: number;
  fileSizeBytes: number;
  blocks: TextBlock[];
}

/** Entry in the master manifest */
export interface ManifestEntry {
  sectionId: string;
  label: string;
  audioFile: string;
  totalDurationMs: number;
  fileSizeBytes: number;
  blockCount: number;
}

/** Master manifest for all sections */
export interface AudioManifest {
  generatedAt: string;
  voice: string;
  totalDurationMs: number;
  totalSizeBytes: number;
  sections: ManifestEntry[];
}
