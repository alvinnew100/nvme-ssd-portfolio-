import type { Metadata } from "next";
import { StoryProvider } from "@/context/StoryContext";
import StoryNav from "@/components/layout/StoryNav";
import StoryFooter from "@/components/layout/StoryFooter";
import VoiceoverButton from "@/components/layout/VoiceoverButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "NVMe Explorer — From NAND to NVMe: An Interactive Deep Dive",
  description:
    "A single flowing story that takes you from binary basics and NAND flash all the way through NVMe commands, queues, SMART monitoring, and hands-on tools. Interactive command builder, trace decoder, and 38-command reference included.",
  keywords: [
    "NVMe",
    "SSD",
    "ftrace",
    "NVMe commands",
    "storage",
    "PCIe",
    "flash",
    "NAND",
    "nvme-cli",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <StoryProvider>
          <StoryNav />
          <main className="lg:pl-52">{children}</main>
          <VoiceoverButton />
          <StoryFooter />
        </StoryProvider>
      </body>
    </html>
  );
}
