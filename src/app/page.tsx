"use client";

import dynamic from "next/dynamic";
import LessonDivider from "@/components/story/ActDivider";
import LessonObjectives from "@/components/story/LessonObjectives";

// Lesson 1 — Bits, Bytes, and Addressing
import Hero from "@/components/acts/act1/Hero";
import Binary from "@/components/acts/act1/Binary";
import LBA from "@/components/acts/act1/LBA";

// Lesson 2 — NAND Flash Memory
import NandCell from "@/components/acts/act1/NandCell";
import NandHierarchy from "@/components/acts/act1/NandHierarchy";

// Lesson 3 — SSD Architecture and FTL
import SsdOverview from "@/components/acts/act1/SsdOverview";
import FTLBasics from "@/components/acts/act1/FTLBasics";

// Lesson 4 — PCIe
import PCIe from "@/components/acts/act2/PCIe";

// Lesson 5 — BAR0, Queues, and Doorbells
import BAR0 from "@/components/acts/act2/BAR0";
import Queues from "@/components/acts/act2/Queues";
import Doorbells from "@/components/acts/act2/Doorbells";

// Lesson 6 — Boot Sequence and Bus Trace
import BootSequence from "@/components/acts/act2/BootSequence";
import BusTrace from "@/components/acts/act2/BusTrace";

// Lesson 7 — Command Structure
import SQEStructure from "@/components/acts/act3/SQEStructure";
import Identify from "@/components/acts/act3/Identify";
import Namespaces from "@/components/acts/act3/Namespaces";

// Lesson 8 — NVMe Commands
import AdminCommands from "@/components/acts/act3/AdminCommands";
import IOCommands from "@/components/acts/act3/IOCommands";

// Lesson 9 — Error Handling and I/O Path
import ErrorHandling from "@/components/acts/act3/ErrorHandling";
import IOPathDiagram from "@/components/acts/act3/IOPathDiagram";

// Lesson 10 — SMART, TRIM, and Drive Health
import SMART from "@/components/acts/act4/SMART";
import TRIM from "@/components/acts/act4/TRIM";
import WriteAmplification from "@/components/acts/act4/WriteAmplification";
import FormatSanitize from "@/components/acts/act4/FormatSanitize";
import WearLeveling from "@/components/acts/act4/WearLeveling";

// Lesson 11 — Storage Stack and Testing
import Filesystems from "@/components/acts/act5/Filesystems";
import FioGuide from "@/components/acts/act5/FioGuide";
import Testing from "@/components/acts/act5/Testing";

// Lesson 12 — Advanced & Tools
import FirmwareUpdate from "@/components/acts/act5/FirmwareUpdate";
import Security from "@/components/acts/act5/Security";
import Passthru from "@/components/acts/act5/Passthru";
import Tracing from "@/components/acts/act5/Tracing";

// Heavy components — dynamic imports
const CommandBuilderEmbed = dynamic(
  () => import("@/components/acts/act3/CommandBuilderEmbed"),
  { ssr: false }
);
const TraceDecoderEmbed = dynamic(
  () => import("@/components/acts/act5/TraceDecoderEmbed"),
  { ssr: false }
);
const CommandAccordion = dynamic(
  () => import("@/components/acts/act5/CommandAccordion"),
  { ssr: false }
);
const Playground = dynamic(
  () => import("@/components/acts/act6/Playground"),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div>
      {/* ===================== HERO ===================== */}
      <Hero />

      {/* ===================== LESSON 1: BITS, BYTES, AND ADDRESSING ===================== */}
      <LessonDivider lesson={1} title="Bits, Bytes, and Addressing" id="lesson-1" />
      <LessonObjectives objectives={[
        "Understand binary and hexadecimal number systems and convert between them",
        "Understand how LBA provides uniform storage addressing",
      ]} />
      <div id="sec-binary"><Binary /></div>
      <div id="sec-lba"><LBA /></div>

      {/* ===================== LESSON 2: NAND FLASH MEMORY ===================== */}
      <LessonDivider lesson={2} title="NAND Flash Memory" id="lesson-2" />
      <LessonObjectives objectives={[
        "Understand how NAND cells store data using charge levels (SLC/MLC/TLC/QLC tradeoffs)",
        "Understand the page/block/plane/die hierarchy and why erases are block-level",
      ]} />
      <div id="sec-nand"><NandCell /></div>
      <div id="sec-nand-hierarchy"><NandHierarchy /></div>

      {/* ===================== LESSON 3: SSD ARCHITECTURE AND FTL ===================== */}
      <LessonDivider lesson={3} title="SSD Architecture and FTL" id="lesson-3" />
      <LessonObjectives objectives={[
        "Identify the major SSD components (controller, DRAM, NAND) and their roles",
        "Understand how the FTL maps logical to physical addresses and why out-of-place writes are necessary",
      ]} />
      <div id="sec-ssd"><SsdOverview /></div>
      <div id="sec-ftl"><FTLBasics /></div>

      {/* ===================== LESSON 4: PCIe — THE HIGHWAY ===================== */}
      <LessonDivider lesson={4} title="PCIe — The Highway" id="lesson-4" />
      <LessonObjectives objectives={[
        "Understand link speed (GT/s), link width (x1-x16), and how to calculate usable bandwidth",
        "Understand how NVMe operations map to PCIe TLPs",
        "Read an M.2 connector pinout",
      ]} />
      <div id="sec-pcie"><PCIe /></div>

      {/* ===================== LESSON 5: BAR0, QUEUES, AND DOORBELLS ===================== */}
      <LessonDivider lesson={5} title="BAR0, Queues, and Doorbells" id="lesson-5" />
      <LessonObjectives objectives={[
        "Understand Memory-Mapped I/O (MMIO) and key BAR0 registers",
        "Understand SQ/CQ circular buffer mechanics (head/tail pointers, phase bit)",
        "Understand the doorbell notification mechanism",
      ]} />
      <div id="sec-bar0"><BAR0 /></div>
      <div id="sec-queues"><Queues /></div>
      <div id="sec-doorbells"><Doorbells /></div>

      {/* ===================== LESSON 6: BOOT SEQUENCE AND BUS TRACE ===================== */}
      <LessonDivider lesson={6} title="Boot Sequence and Bus Trace" id="lesson-6" />
      <LessonObjectives objectives={[
        "Trace the complete NVMe boot sequence from PCIe enumeration to I/O queue creation",
        "Distinguish between MMIO writes, DMA transfers, and MSI-X interrupts in a real I/O flow",
      ]} />
      <div id="sec-boot"><BootSequence /></div>
      <div id="sec-bus-trace"><BusTrace /></div>

      {/* ===================== LESSON 7: COMMAND STRUCTURE ===================== */}
      <LessonDivider lesson={7} title="Command Structure" id="lesson-7" />
      <LessonObjectives objectives={[
        "Understand the 64-byte SQE format and purpose of each DWord field",
        "Know what Identify Controller/Namespace returns and why it matters",
        "Understand NVMe namespaces as logical storage partitions",
      ]} />
      <div id="sec-sqe"><SQEStructure /></div>
      <div id="sec-identify"><Identify /></div>
      <div id="sec-namespaces"><Namespaces /></div>

      {/* ===================== LESSON 8: NVMe COMMANDS ===================== */}
      <LessonDivider lesson={8} title="NVMe Commands" id="lesson-8" />
      <LessonObjectives objectives={[
        "Distinguish Admin commands (management) from I/O commands (data) and know common examples",
        "Use the command builder to construct well-formed NVMe commands",
      ]} />
      <div id="sec-admin-cmds"><AdminCommands /></div>
      <CommandBuilderEmbed
        presetId="admin-identify"
        presetFields={{ CNS: 1 }}
        presetNsid={0}
        title="Try It — Build an Identify Command"
        description="Click to load the Identify Controller preset and see the full 64-byte SQ entry."
      />
      <div id="sec-io-cmds"><IOCommands /></div>
      <CommandBuilderEmbed
        presetId="io-read"
        presetFields={{ SLBA_L: 0, NLB: 7 }}
        presetNsid={1}
        title="Try It — Build a Read Command"
        description="Load a Read preset: 8 blocks starting at LBA 0."
      />

      {/* ===================== LESSON 9: ERROR HANDLING AND I/O PATH ===================== */}
      <LessonDivider lesson={9} title="Error Handling and the I/O Path" id="lesson-9" />
      <LessonObjectives objectives={[
        "Interpret NVMe Completion Queue status codes for common errors",
        "Trace a 4KB read through all layers of the Linux I/O stack",
      ]} />
      <div id="sec-errors"><ErrorHandling /></div>
      <div id="sec-io-path"><IOPathDiagram /></div>

      {/* ===================== LESSON 10: SMART, TRIM, AND DRIVE HEALTH ===================== */}
      <LessonDivider lesson={10} title="SMART, TRIM, and Drive Health" id="lesson-10" />
      <LessonObjectives objectives={[
        "Read and interpret SMART health data using nvme-cli",
        "Understand how TRIM reduces write amplification and extends drive life",
        "Explain WAF and factors that affect it (TRIM, fullness, workload)",
        "Know when to use Format NVM vs Sanitize",
      ]} />
      <div id="sec-smart"><SMART /></div>
      <CommandBuilderEmbed
        presetId="admin-get-log-page"
        presetFields={{ LID: 2, NUMDL: 127 }}
        presetNsid={0}
        title="Try It — Get SMART Log"
        description="Build a Get Log Page command for SMART health data (Log ID 0x02)."
      />
      <div id="sec-trim"><TRIM /></div>
      <div id="sec-waf"><WriteAmplification /></div>
      <div id="sec-format-sanitize"><FormatSanitize /></div>
      <div id="sec-wear"><WearLeveling /></div>

      {/* ===================== LESSON 11: STORAGE STACK AND TESTING ===================== */}
      <LessonDivider lesson={11} title="Storage Stack and Testing" id="lesson-11" />
      <LessonObjectives objectives={[
        "Understand how filesystems translate files to LBAs and how filesystem choice affects SSD performance",
        "Construct fio workloads and interpret benchmark results",
        "Test NVMe drives for correctness and performance",
      ]} />
      <div id="sec-filesystems"><Filesystems /></div>
      <div id="sec-fio"><FioGuide /></div>
      <div id="sec-testing"><Testing /></div>

      {/* ===================== LESSON 12: ADVANCED FEATURES AND TOOLS ===================== */}
      <LessonDivider lesson={12} title="Advanced Features and Tools" id="lesson-12" />
      <LessonObjectives objectives={[
        "Understand firmware update process and security features (TCG Opal)",
        "Use passthru to send raw vendor commands",
        "Use ftrace/blktrace to debug I/O performance",
        "Use the Command Playground to explore any NVMe command",
      ]} />
      <div id="sec-firmware"><FirmwareUpdate /></div>
      <div id="sec-security"><Security /></div>
      <div id="sec-passthru"><Passthru /></div>
      <div id="sec-tracing"><Tracing /></div>
      <TraceDecoderEmbed />
      <div id="sec-command-ref"><CommandAccordion /></div>
      <div id="sec-playground"><Playground /></div>
    </div>
  );
}
