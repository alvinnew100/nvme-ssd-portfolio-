import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "NVMe Explorer — Interactive NVMe Command Reference & Tools",
  description:
    "Interactive NVMe command reference, ftrace decoder, command builder, and architecture visualizer. Built to demonstrate deep SSD/NVMe engineering knowledge.",
  keywords: [
    "NVMe",
    "SSD",
    "ftrace",
    "NVMe commands",
    "storage",
    "PCIe",
    "flash",
    "NAND",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
