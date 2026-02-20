"use client";

import { useState } from "react";
import Link from "next/link";
import { NvmeCommand } from "@/lib/nvme/types";

interface CommandListProps {
  commands: NvmeCommand[];
}

export default function CommandList({ commands }: CommandListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "io">("all");

  const filtered = commands.filter((cmd) => {
    const matchesSearch =
      search === "" ||
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.id.toLowerCase().includes(search.toLowerCase()) ||
      `0x${cmd.opcode.toString(16)}`.includes(search.toLowerCase());
    const matchesFilter = filter === "all" || cmd.type === filter;
    return matchesSearch && matchesFilter;
  });

  const adminCount = commands.filter((c) => c.type === "admin").length;
  const ioCount = commands.filter((c) => c.type === "io").length;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search commands by name or opcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-nvme-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nvme-accent"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-nvme-accent text-nvme-darker"
                : "bg-nvme-dark border border-gray-700 text-gray-300 hover:text-white"
            }`}
          >
            All ({commands.length})
          </button>
          <button
            onClick={() => setFilter("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "admin"
                ? "bg-blue-600 text-white"
                : "bg-nvme-dark border border-gray-700 text-gray-300 hover:text-white"
            }`}
          >
            Admin ({adminCount})
          </button>
          <button
            onClick={() => setFilter("io")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "io"
                ? "bg-emerald-600 text-white"
                : "bg-nvme-dark border border-gray-700 text-gray-300 hover:text-white"
            }`}
          >
            I/O ({ioCount})
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm mb-4">
        Showing {filtered.length} of {commands.length} commands
      </p>

      {/* Command grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cmd) => (
          <Link
            key={cmd.id}
            href={`/commands/${cmd.id}`}
            className="group block p-4 rounded-lg border border-gray-800 hover:border-gray-600 bg-nvme-dark/50 hover:bg-nvme-dark transition-all"
            prefetch={false}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-sm text-nvme-accent">
                0x{cmd.opcode.toString(16).padStart(2, "0")}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  cmd.type === "admin"
                    ? "bg-blue-900/50 text-blue-300"
                    : "bg-emerald-900/50 text-emerald-300"
                }`}
              >
                {cmd.type === "admin" ? "Admin" : "I/O"}
              </span>
            </div>
            <h3 className="text-white font-semibold group-hover:text-nvme-accent transition-colors mb-1">
              {cmd.name}
            </h3>
            <p className="text-gray-500 text-xs line-clamp-2">
              {cmd.description}
            </p>
            <div className="mt-2 text-xs text-gray-600">
              {cmd.fields.length} field{cmd.fields.length !== 1 ? "s" : ""}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No commands match your search.
        </div>
      )}
    </div>
  );
}
