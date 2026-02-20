"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "Commands", href: "/commands" },
  { label: "Trace Decoder", href: "/trace-decoder" },
  { label: "Command Builder", href: "/command-builder" },
  { label: "Architecture", href: "/architecture" },
  { label: "Articles", href: "/articles" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-nvme-dark border-b border-warm-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-warm-50 font-bold text-lg hover:text-nvme-accent transition-colors"
            prefetch={false}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-nvme-accent"
              fill="currentColor"
            >
              <path d="M4 4h16v2H4V4zm0 4h10v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2zm14-4l4 4h-3v4h-2v-4h-3l4-4z" />
            </svg>
            NVMe Explorer
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm text-warm-300 hover:text-warm-50 hover:bg-nvme-gray transition-colors"
                prefetch={false}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-warm-400 hover:text-warm-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-warm-300 hover:text-warm-50 hover:bg-nvme-gray transition-colors"
                onClick={() => setMobileOpen(false)}
                prefetch={false}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
