export const CELL_TYPES = [
  {
    name: "SLC",
    bits: 1,
    levels: 2,
    color: "#00d4aa",
    thresholds: ["0", "1"],
    endurance: "~100,000 P/E",
    analogy: "A glass that's either empty or full. Easy to tell apart.",
    desc: "Each cell stores just 1 bit. Since there are only 2 states (empty or full), it's fast to read, easy to write, and very reliable. Used in enterprise SSDs and as a write cache (SLC cache) in consumer drives.",
  },
  {
    name: "MLC",
    bits: 2,
    levels: 4,
    color: "#635bff",
    thresholds: ["11", "10", "00", "01"],
    endurance: "~10,000 P/E",
    analogy: "A glass with 4 fill levels: empty, 1/3, 2/3, full.",
    desc: "Each cell stores 2 bits by using 4 distinct charge levels. Harder to read (must distinguish 4 levels), slower to write, but stores twice as much data per cell. Good balance of speed and density.",
  },
  {
    name: "TLC",
    bits: 3,
    levels: 8,
    color: "#7c5cfc",
    thresholds: ["111", "110", "101", "100", "011", "010", "001", "000"],
    endurance: "~3,000 P/E",
    analogy: "A glass with 8 fill levels — you need a precise ruler to tell them apart.",
    desc: "Each cell stores 3 bits using 8 voltage levels. The most common type in consumer SSDs today. Writes are slower and the cell wears out faster, but you get 3x the storage of SLC per cell.",
  },
  {
    name: "QLC",
    bits: 4,
    levels: 16,
    color: "#f5a623",
    thresholds: [] as string[],
    endurance: "~1,000 P/E",
    analogy: "A glass with 16 fill levels — incredibly precise, fragile, and slow to measure.",
    desc: "Each cell stores 4 bits using 16 voltage levels. Maximum storage density. The margins between levels are razor-thin, making reads slower and cells less durable. Best for read-heavy, cold storage workloads.",
  },
];

// Gaussian-like bell curve points for SVG path
export function bellCurve(centerX: number, spread: number, height: number, steps = 20): string {
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 - 1; // -1 to 1
    const x = centerX + t * spread;
    const y = height * Math.exp(-4.5 * t * t);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${(100 - y).toFixed(1)}`);
  }
  return points.join(" ");
}
