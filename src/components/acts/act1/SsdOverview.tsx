"use client";

import SectionWrapper from "@/components/story/SectionWrapper";

export default function SsdOverview() {
  return (
    <SectionWrapper className="py-24 px-4 bg-story-surface">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Inside the SSD — The Complete Picture
        </h3>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          So far we&apos;ve seen the building blocks: bits, bytes, LBAs, and NAND cells
          organized into pages, blocks, and dies. Now let&apos;s see how they all fit
          together inside an actual SSD.
        </p>
        <p className="text-text-secondary mb-4 leading-relaxed max-w-3xl">
          An SSD isn&apos;t just a pile of NAND chips. It&apos;s a complete
          mini-computer with three main parts:
        </p>
        <ul className="text-text-secondary mb-4 leading-relaxed max-w-3xl list-disc ml-5 space-y-1">
          <li>
            <strong className="text-text-primary">Controller</strong> — The &ldquo;brain.&rdquo;
            A specialized processor that runs all the software (firmware) managing the drive.
            It handles translating your read/write requests into NAND operations.
          </li>
          <li>
            <strong className="text-text-primary">DRAM</strong> — Fast temporary memory
            (like your computer&apos;s RAM). The controller uses it to store the mapping table
            that translates logical addresses (LBAs) to physical NAND locations. Without DRAM,
            every read would need an extra NAND lookup, making it much slower.
          </li>
          <li>
            <strong className="text-text-primary">NAND Flash Packages</strong> — The actual
            storage chips where your data lives permanently. Multiple packages connected through
            separate channels allow parallel access, which is how SSDs achieve high speeds.
          </li>
        </ul>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-3xl">
          The diagram below shows how these parts connect. The host computer talks to the
          controller through the PCIe bus (we&apos;ll cover that in the next act), and the
          controller manages everything else.
        </p>

        {/* SSD block diagram */}
        <div className="bg-story-card rounded-2xl p-6 card-shadow">
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
              fill="#00d4aa10"
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
              fill="#635bff08"
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
              fill="#f5f2ed"
              stroke="#ddd6ca"
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
              fill="#f5f2ed"
              stroke="#ddd6ca"
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
              fill="#f5f2ed"
              stroke="#ddd6ca"
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
              fill="#f5f2ed"
              stroke="#ddd6ca"
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
              fill="#f5f2ed"
              stroke="#ddd6ca"
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
              fill="#7c5cfc10"
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
                  fill="#f5a62308"
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
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-blue font-semibold mb-1">Controller</div>
            <p className="text-text-muted text-xs">
              Processes NVMe commands, manages FTL mapping, handles ECC, and
              coordinates NAND operations.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
            <div className="text-nvme-violet font-semibold mb-1">DRAM</div>
            <p className="text-text-muted text-xs">
              Caches the FTL table (logical-to-physical mapping) for fast
              lookups. Some SSDs are DRAM-less and use HMB.
            </p>
          </div>
          <div className="bg-story-card rounded-2xl p-5 card-shadow">
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
