// NVMe Feature Identifiers (Get/Set Features)
export const FEATURE_IDS: Record<number, string> = {
  0x01: "Arbitration",
  0x02: "Power Management",
  0x03: "LBA Range Type",
  0x04: "Temperature Threshold",
  0x05: "Error Recovery",
  0x06: "Volatile Write Cache",
  0x07: "Number of Queues",
  0x08: "Interrupt Coalescing",
  0x09: "Interrupt Vector Configuration",
  0x0a: "Write Atomicity Normal",
  0x0b: "Async Event Configuration",
  0x0c: "Autonomous Power State Transition",
  0x0d: "Host Memory Buffer",
  0x0e: "Timestamp",
  0x0f: "Keep Alive Timer",
  0x10: "Host Controlled Thermal Management",
  0x11: "Non-Operational Power State Config",
  0x12: "Read Recovery Level Config",
  0x13: "Predictable Latency Mode Config",
  0x14: "Predictable Latency Mode Window",
  0x15: "LBA Status Information Report Interval",
  0x16: "Host Behavior Support",
  0x17: "Sanitize Config",
  0x18: "Endurance Group Event Configuration",
  0x80: "Software Progress Marker",
  0x81: "Host Identifier",
  0x82: "Reservation Notification Mask",
  0x83: "Reservation Persistence",
  0x84: "Namespace Write Protection Config",
};

// NVMe Log Page Identifiers
export const LOG_PAGE_IDS: Record<number, string> = {
  0x01: "Error Information",
  0x02: "SMART / Health Information",
  0x03: "Firmware Slot Information",
  0x04: "Changed Namespace List",
  0x05: "Commands Supported and Effects",
  0x06: "Device Self-test",
  0x07: "Telemetry Host-Initiated",
  0x08: "Telemetry Controller-Initiated",
  0x09: "Endurance Group Information",
  0x0a: "Predictable Latency Per NVM Set",
  0x0b: "Predictable Latency Event Aggregate",
  0x0c: "Asymmetric Namespace Access",
  0x0d: "Persistent Event Log",
  0x0e: "LBA Status Information",
  0x0f: "Endurance Group Event Aggregate",
  0x70: "Discovery",
  0x80: "Reservation Notification",
  0x81: "Sanitize Status",
};

// NVMe Sanitize Actions
export const SANITIZE_ACTIONS: Record<number, string> = {
  0x01: "Exit Failure Mode",
  0x02: "Block Erase",
  0x03: "Overwrite",
  0x04: "Crypto Erase",
};

// NVMe Format Secure Erase Settings
export const FORMAT_SES: Record<number, string> = {
  0x00: "No Secure Erase",
  0x01: "User Data Erase",
  0x02: "Cryptographic Erase",
};

// Dword colors for SVG visualizer
export const DWORD_COLORS: string[] = [
  "#1e40af", // CDW0 - blue
  "#047857", // CDW1 (NSID) - emerald
  "#7c3aed", // CDW2 - purple
  "#b45309", // CDW3 - amber
  "#be123c", // CDW4 - rose
  "#0e7490", // CDW5 - cyan
  "#4d7c0f", // CDW6 - lime
  "#c2410c", // CDW7 - orange
  "#4338ca", // CDW8 - indigo
  "#0f766e", // CDW9 - teal
  "#be185d", // CDW10 - pink
  "#0369a1", // CDW11 - sky
  "#6d28d9", // CDW12 - violet
  "#a21caf", // CDW13 - fuchsia
  "#a16207", // CDW14 - yellow
  "#dc2626", // CDW15 - red
];

// Standard SQ Entry dword labels
export const SQ_DWORD_LABELS: string[] = [
  "CDW0 (Opcode, CID)",
  "NSID",
  "CDW2 (Reserved)",
  "CDW3 (Reserved)",
  "CDW4 (Reserved)",
  "CDW5 (Reserved)",
  "MPTR [31:0]",
  "MPTR [63:32]",
  "PRP1 / SGL [31:0]",
  "PRP1 / SGL [63:32]",
  "CDW10",
  "CDW11",
  "CDW12",
  "CDW13",
  "CDW14",
  "CDW15",
];
