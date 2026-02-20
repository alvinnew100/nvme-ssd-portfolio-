"use client";

import dynamic from "next/dynamic";
import ActDivider from "@/components/story/ActDivider";

// Act 1 — Foundations
import Hero from "@/components/acts/act1/Hero";
import Binary from "@/components/acts/act1/Binary";
import LBA from "@/components/acts/act1/LBA";
import NandCell from "@/components/acts/act1/NandCell";
import NandHierarchy from "@/components/acts/act1/NandHierarchy";
import SsdOverview from "@/components/acts/act1/SsdOverview";

// Act 2 — The Interface
import PCIe from "@/components/acts/act2/PCIe";
import BAR0 from "@/components/acts/act2/BAR0";
import BootSequence from "@/components/acts/act2/BootSequence";
import Queues from "@/components/acts/act2/Queues";
import Doorbells from "@/components/acts/act2/Doorbells";
import BusTrace from "@/components/acts/act2/BusTrace";

// Act 3 — The Protocol
import SQEStructure from "@/components/acts/act3/SQEStructure";
import Identify from "@/components/acts/act3/Identify";
import Namespaces from "@/components/acts/act3/Namespaces";
import AdminCommands from "@/components/acts/act3/AdminCommands";
import IOCommands from "@/components/acts/act3/IOCommands";
import ErrorHandling from "@/components/acts/act3/ErrorHandling";

// Act 4 — Maintenance & Health
import SMART from "@/components/acts/act4/SMART";
import TRIM from "@/components/acts/act4/TRIM";
import FormatSanitize from "@/components/acts/act4/FormatSanitize";
import WearLeveling from "@/components/acts/act4/WearLeveling";

// Act 5 — Storage Stack & Testing
import Filesystems from "@/components/acts/act5/Filesystems";
import Testing from "@/components/acts/act5/Testing";
import FioGuide from "@/components/acts/act5/FioGuide";

// Act 6 — Advanced & Tools
import FirmwareUpdate from "@/components/acts/act5/FirmwareUpdate";
import Security from "@/components/acts/act5/Security";
import Reservations from "@/components/acts/act5/Reservations";
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

      {/* ===================== ACT 1: FOUNDATIONS ===================== */}
      <ActDivider act={1} title="Foundations" id="act-1" />
      <Binary />
      <LBA />
      <NandCell />
      <NandHierarchy />
      <SsdOverview />

      {/* ===================== ACT 2: THE INTERFACE ===================== */}
      <ActDivider act={2} title="The Interface" id="act-2" />
      <PCIe />
      <BAR0 />
      <BootSequence />
      <Queues />
      <Doorbells />
      <BusTrace />

      {/* ===================== ACT 3: THE PROTOCOL ===================== */}
      <ActDivider act={3} title="The Protocol" id="act-3" />
      <SQEStructure />
      <Identify />
      <Namespaces />
      <AdminCommands />
      <CommandBuilderEmbed
        presetId="admin-identify"
        presetFields={{ CNS: 1 }}
        presetNsid={0}
        title="Try It — Build an Identify Command"
        description="Click to load the Identify Controller preset and see the full 64-byte SQ entry."
      />
      <IOCommands />
      <CommandBuilderEmbed
        presetId="io-read"
        presetFields={{ SLBA_L: 0, NLB: 7 }}
        presetNsid={1}
        title="Try It — Build a Read Command"
        description="Load a Read preset: 8 blocks starting at LBA 0."
      />
      <ErrorHandling />

      {/* ===================== ACT 4: MAINTENANCE & HEALTH ===================== */}
      <ActDivider act={4} title="Maintenance & Health" id="act-4" />
      <SMART />
      <CommandBuilderEmbed
        presetId="admin-get-log-page"
        presetFields={{ LID: 2, NUMDL: 127 }}
        presetNsid={0}
        title="Try It — Get SMART Log"
        description="Build a Get Log Page command for SMART health data (Log ID 0x02)."
      />
      <TRIM />
      <FormatSanitize />
      <WearLeveling />

      {/* ===================== ACT 5: STORAGE STACK & TESTING ===================== */}
      <ActDivider act={5} title="Storage Stack & Testing" id="act-5" />
      <Filesystems />
      <Testing />
      <FioGuide />

      {/* ===================== ACT 6: ADVANCED & TOOLS ===================== */}
      <ActDivider act={6} title="Advanced & Tools" id="act-6" />
      <FirmwareUpdate />
      <Security />
      <Reservations />
      <Passthru />
      <Tracing />
      <TraceDecoderEmbed />
      <CommandAccordion />

      {/* ===================== ACT 7: PLAYGROUND ===================== */}
      <ActDivider act={7} title="Playground" id="act-7" />
      <Playground />
    </div>
  );
}
