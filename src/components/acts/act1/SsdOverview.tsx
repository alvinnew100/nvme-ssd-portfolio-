"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

export default function SsdOverview() {
  return (
    <SectionWrapper className="py-20 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Inside the SSD
        </h3>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          An SSD is more than just NAND chips. It&apos;s a complete system with
          a powerful controller, DRAM for metadata, and firmware that
          orchestrates everything. The controller is the brain &mdash; it
          manages the FTL, wear leveling, error correction, and the NVMe
          protocol itself.
        </p>

        {/* SSD block diagram */}
        <div className="bg-story-panel rounded-xl border border-story-border p-6">
          <svg
            viewBox="0 0 700 280"
            className="w-full max-w-2xl mx-auto"
            fill="none"
          >
            {/* Host interface */}
            <rect
              x="10"
              y="110"
              width="100"
              height="60"
              rx="8"
              className="stroke-nvme-green"
              strokeWidth="2"
              fill="#6db33f10"
            />
            <text
              x="60"
              y="135"
              textAnchor="middle"
              className="fill-nvme-green text-[11px] font-bold"
            >
              Host
            </text>
            <text
              x="60"
              y="152"
              textAnchor="middle"
              className="fill-text-muted text-[9px]"
            >
              PCIe x4
            </text>

            {/* Arrow */}
            <line
              x1="110"
              y1="140"
              x2="150"
              y2="140"
              className="stroke-text-muted"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />

            {/* Controller box */}
            <rect
              x="150"
              y="30"
              width="240"
              height="220"
              rx="12"
              className="stroke-nvme-blue"
              strokeWidth="2"
              fill="#38bdf808"
            />
            <text
              x="270"
              y="55"
              textAnchor="middle"
              className="fill-nvme-blue text-[12px] font-bold"
            >
              SSD Controller
            </text>

            {/* Sub-blocks inside controller */}
            <rect
              x="170"
              y="70"
              width="90"
              height="40"
              rx="6"
              fill="#111927"
              className="stroke-story-border"
              strokeWidth="1"
            />
            <text
              x="215"
              y="94"
              textAnchor="middle"
              className="fill-text-secondary text-[9px]"
            >
              NVMe Frontend
            </text>

            <rect
              x="280"
              y="70"
              width="90"
              height="40"
              rx="6"
              fill="#111927"
              className="stroke-story-border"
              strokeWidth="1"
            />
            <text
              x="325"
              y="94"
              textAnchor="middle"
              className="fill-text-secondary text-[9px]"
            >
              FTL Engine
            </text>

            <rect
              x="170"
              y="125"
              width="90"
              height="40"
              rx="6"
              fill="#111927"
              className="stroke-story-border"
              strokeWidth="1"
            />
            <text
              x="215"
              y="149"
              textAnchor="middle"
              className="fill-text-secondary text-[9px]"
            >
              ECC Engine
            </text>

            <rect
              x="280"
              y="125"
              width="90"
              height="40"
              rx="6"
              fill="#111927"
              className="stroke-story-border"
              strokeWidth="1"
            />
            <text
              x="325"
              y="149"
              textAnchor="middle"
              className="fill-text-secondary text-[9px]"
            >
              Wear Leveling
            </text>

            <rect
              x="170"
              y="180"
              width="200"
              height="40"
              rx="6"
              fill="#111927"
              className="stroke-story-border"
              strokeWidth="1"
            />
            <text
              x="270"
              y="204"
              textAnchor="middle"
              className="fill-text-secondary text-[9px]"
            >
              NAND Flash Interface (ONFI / Toggle)
            </text>

            {/* DRAM */}
            <rect
              x="420"
              y="50"
              width="100"
              height="60"
              rx="8"
              className="stroke-nvme-violet"
              strokeWidth="2"
              fill="#a78bfa10"
            />
            <text
              x="470"
              y="75"
              textAnchor="middle"
              className="fill-nvme-violet text-[11px] font-bold"
            >
              DRAM
            </text>
            <text
              x="470"
              y="92"
              textAnchor="middle"
              className="fill-text-muted text-[9px]"
            >
              FTL Table Cache
            </text>

            {/* Arrow controller to DRAM */}
            <line
              x1="390"
              y1="80"
              x2="420"
              y2="80"
              className="stroke-text-muted"
              strokeWidth="2"
            />

            {/* NAND packages */}
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect
                  x={430 + i * 65}
                  y="160"
                  width="55"
                  height="80"
                  rx="6"
                  className="stroke-nvme-amber"
                  strokeWidth="1.5"
                  fill="#f59e0b08"
                />
                <text
                  x={457 + i * 65}
                  y="195"
                  textAnchor="middle"
                  className="fill-nvme-amber text-[9px] font-bold"
                >
                  NAND
                </text>
                <text
                  x={457 + i * 65}
                  y="210"
                  textAnchor="middle"
                  className="fill-text-muted text-[8px]"
                >
                  CE{i}
                </text>
              </g>
            ))}

            {/* Arrow controller to NAND */}
            <line
              x1="370"
              y1="200"
              x2="430"
              y2="200"
              className="stroke-text-muted"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />

            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-text-muted" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-story-panel rounded-lg border border-story-border p-4">
            <div className="text-nvme-blue font-semibold mb-1">Controller</div>
            <p className="text-text-muted text-xs">
              Processes NVMe commands, manages FTL mapping, handles ECC, and
              coordinates NAND operations.
            </p>
          </div>
          <div className="bg-story-panel rounded-lg border border-story-border p-4">
            <div className="text-nvme-violet font-semibold mb-1">DRAM</div>
            <p className="text-text-muted text-xs">
              Caches the FTL table (logical-to-physical mapping) for fast
              lookups. Some SSDs are DRAM-less and use HMB.
            </p>
          </div>
          <div className="bg-story-panel rounded-lg border border-story-border p-4">
            <div className="text-nvme-amber font-semibold mb-1">NAND Packages</div>
            <p className="text-text-muted text-xs">
              Multiple CE (chip enable) channels allow parallel access.
              More channels = higher bandwidth.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
