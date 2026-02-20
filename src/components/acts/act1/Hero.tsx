"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-nvme-green/5 via-story-bg to-story-bg" />
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #6db33f 1px, transparent 1px), linear-gradient(to bottom, #6db33f 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative text-center px-4"
      >
        <div className="inline-block mb-6 px-4 py-1.5 border border-story-border rounded-full text-text-muted text-sm tracking-widest uppercase font-mono">
          From NAND Basics to NVMe Mastery
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold text-text-primary mb-6 tracking-tight">
          The NVMe{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-nvme-green to-nvme-blue">
            Deep Dive
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-text-secondary mb-4 max-w-2xl mx-auto">
          A complete journey through modern storage technology
        </p>
        <p className="text-text-muted mb-16 max-w-xl mx-auto font-mono text-sm">
          Scroll to begin. Everything is on this one page.
        </p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-text-muted"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
