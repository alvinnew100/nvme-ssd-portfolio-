"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function MuseumSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`museum-section ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* 1. Hero — "The NVMe Museum" */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-nvme-blue/10 via-nvme-darker to-nvme-darker" />
        <div className="relative text-center px-4">
          <div className="inline-block mb-6 px-4 py-1.5 border border-warm-700 rounded-full text-warm-400 text-sm tracking-widest uppercase">
            An Interactive Exhibition
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-warm-50 mb-6 tracking-tight">
            The NVMe{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nvme-accent to-nvme-orange">
              Museum
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-warm-300 mb-4 max-w-2xl mx-auto">
            A guided journey through the world of NVMe storage
          </p>
          <p className="text-warm-500 mb-12 max-w-xl mx-auto">
            You may explore the exhibits at your own pace.
          </p>
          <div className="animate-bounce text-warm-600">
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* 2. The Hardware */}
      <section className="py-24 px-4">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit I</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">The Hardware</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              Every NVMe SSD starts here. A host computer talks to a controller chip
              over PCIe, and the controller manages the NAND flash memory where your
              data lives.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {[
              { label: "Host CPU", sub: "Runs NVMe driver", color: "border-nvme-accent bg-nvme-accent/10" },
              { label: "PCIe Bus", sub: "x4 Gen4 link", color: "border-warm-600 bg-warm-800/50" },
              { label: "Controller", sub: "Command processor", color: "border-nvme-green bg-nvme-green/10" },
              { label: "NAND Flash", sub: "Data storage", color: "border-nvme-orange bg-nvme-orange/10" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center">
                <div className={`w-36 h-24 rounded-lg border-2 ${item.color} flex flex-col items-center justify-center`}>
                  <span className="text-warm-100 font-semibold text-sm">{item.label}</span>
                  <span className="text-warm-500 text-xs mt-1">{item.sub}</span>
                </div>
                {i < 3 && (
                  <svg className="w-8 h-4 text-warm-600 hidden sm:block mx-1" viewBox="0 0 32 16">
                    <path d="M2 8 H24 M20 3 L26 8 L20 13" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </MuseumSection>
      </section>

      {/* 3. Discovery */}
      <section className="py-24 px-4 bg-nvme-dark/40">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit II</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Discovery</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              First, the host says hello. The <strong className="text-nvme-accent">Identify Controller</strong> command
              (opcode 0x06, CNS=1) asks the drive what it can do &mdash; model name, capacity,
              supported features, and more.
            </p>
          </div>
          <div className="bg-nvme-darker rounded-xl border border-warm-800 p-6 font-mono text-sm max-w-2xl mx-auto">
            <div className="text-warm-500 mb-2"># The host asks: &quot;Who are you?&quot;</div>
            <div className="text-nvme-accent">opcode=0x06</div>
            <div className="text-warm-300">CDW10=0x00000001 <span className="text-warm-500">(CNS=1: Identify Controller)</span></div>
            <div className="text-warm-500 mt-3"># The drive responds with 4096 bytes of identity data</div>
            <div className="text-warm-300">Model: &quot;Samsung 990 PRO 2TB&quot;</div>
            <div className="text-warm-300">Firmware: &quot;4B2QJXD7&quot;</div>
          </div>
        </MuseumSection>
      </section>

      {/* 4. Setting Up Queues */}
      <section className="py-24 px-4">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit III</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Setting Up Queues</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              Before data flows, host and controller need a way to talk.
              They set up <strong className="text-nvme-accent">Submission Queues</strong> (SQ) to send commands and{" "}
              <strong className="text-nvme-accent">Completion Queues</strong> (CQ) to receive results &mdash; circular
              buffers in host memory.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="bg-nvme-darker rounded-xl border border-warm-800 p-6 text-center w-64">
              <div className="text-nvme-accent font-semibold mb-2">Create I/O CQ</div>
              <div className="text-warm-500 text-xs font-mono">opcode=0x05</div>
              <p className="text-warm-400 text-sm mt-3">
                Set up a completion queue first &mdash; commands need somewhere to report back.
              </p>
            </div>
            <svg className="w-6 h-6 text-warm-600 rotate-90 sm:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="bg-nvme-darker rounded-xl border border-warm-800 p-6 text-center w-64">
              <div className="text-nvme-accent font-semibold mb-2">Create I/O SQ</div>
              <div className="text-warm-500 text-xs font-mono">opcode=0x01</div>
              <p className="text-warm-400 text-sm mt-3">
                Then create a submission queue, linked to that CQ. Now commands can flow.
              </p>
            </div>
          </div>
        </MuseumSection>
      </section>

      {/* 5. Reading Data */}
      <section className="py-24 px-4 bg-nvme-dark/40">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit IV</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Reading Data</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              Now, let&apos;s read something. The host places a 64-byte{" "}
              <strong className="text-nvme-accent">Read</strong> command into the Submission Queue.
              Two key fields: where to start (SLBA) and how many blocks (NLB).
            </p>
          </div>
          <div className="bg-nvme-darker rounded-xl border border-warm-800 p-6 font-mono text-sm max-w-2xl mx-auto">
            <div className="text-warm-500 mb-2"># Read 128 blocks starting at LBA 0x100</div>
            <div className="text-nvme-accent">opcode=0x02 <span className="text-warm-500">(Read)</span></div>
            <div className="text-warm-300">CDW10=0x00000100 <span className="text-warm-500">(SLBA low = 256)</span></div>
            <div className="text-warm-300">CDW12=0x0000007f <span className="text-warm-500">(NLB = 127 → 128 blocks, 0-based)</span></div>
            <div className="mt-3 pt-3 border-t border-warm-800 text-warm-500">
              The controller fetches this from the SQ, reads the NAND, DMAs data to host memory, then posts a CQE.
            </div>
          </div>
        </MuseumSection>
      </section>

      {/* 6. Writing Data */}
      <section className="py-24 px-4">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit V</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Writing Data</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              Writing works the same way, in reverse. The host puts data in memory, then tells
              the controller where to store it. The <strong className="text-nvme-accent">FUA</strong> (Force Unit Access)
              bit ensures data hits NAND immediately, bypassing the write cache.
            </p>
          </div>
          <div className="bg-nvme-darker rounded-xl border border-warm-800 p-6 font-mono text-sm max-w-2xl mx-auto">
            <div className="text-warm-500 mb-2"># Write 256 blocks to LBA 0x1000 with FUA</div>
            <div className="text-nvme-accent">opcode=0x01 <span className="text-warm-500">(Write)</span></div>
            <div className="text-warm-300">CDW10=0x00001000 <span className="text-warm-500">(SLBA low = 4096)</span></div>
            <div className="text-warm-300">CDW12=0x400000ff <span className="text-warm-500">(FUA=1, NLB=255 → 256 blocks)</span></div>
          </div>
        </MuseumSection>
      </section>

      {/* 7. Health Check */}
      <section className="py-24 px-4 bg-nvme-dark/40">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit VI</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Health Check</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              How&apos;s the drive feeling? The <strong className="text-nvme-accent">Get Log Page</strong> command
              with Log ID 0x02 retrieves SMART health data &mdash; temperature, wear, errors,
              and data written over the drive&apos;s lifetime.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Temperature", value: "42 C", icon: "~" },
              { label: "Wear Level", value: "3%", icon: "#" },
              { label: "Power On", value: "2,847 hrs", icon: ">" },
              { label: "Data Written", value: "18.4 TB", icon: "+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-nvme-darker rounded-xl border border-warm-800 p-4 text-center">
                <div className="text-nvme-accent text-2xl font-bold">{stat.value}</div>
                <div className="text-warm-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </MuseumSection>
      </section>

      {/* 8. Cleanup — TRIM */}
      <section className="py-24 px-4">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit VII</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Cleanup</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              When you delete a file, the SSD doesn&apos;t know those blocks are free.{" "}
              <strong className="text-nvme-accent">TRIM</strong> (Dataset Management, opcode 0x09) tells the controller
              which LBA ranges are no longer needed &mdash; enabling better garbage collection
              and maintaining performance.
            </p>
          </div>
          <div className="bg-nvme-darker rounded-xl border border-warm-800 p-6 font-mono text-sm max-w-2xl mx-auto">
            <div className="text-warm-500 mb-2"># TRIM: tell the SSD these blocks are free</div>
            <div className="text-nvme-accent">opcode=0x09 <span className="text-warm-500">(Dataset Management)</span></div>
            <div className="text-warm-300">CDW11=0x00000004 <span className="text-warm-500">(AD=1: Attribute Deallocate)</span></div>
            <div className="text-warm-500 mt-3">
              The range list in the data buffer describes which LBA ranges to trim.
            </div>
          </div>
        </MuseumSection>
      </section>

      {/* 9. Tracing It All */}
      <section className="py-24 px-4 bg-nvme-dark/40">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Exhibit VIII</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Tracing It All</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              Linux can show you every NVMe command in real-time using <strong className="text-nvme-accent">ftrace</strong>.
              Enable the nvme trace events and watch commands flow between host and controller.
            </p>
          </div>
          <div className="bg-nvme-darker rounded-xl border border-warm-800 p-6 font-mono text-xs max-w-3xl mx-auto overflow-x-auto">
            <div className="text-warm-600 mb-3"># Real-time NVMe command trace</div>
            <div className="space-y-1">
              <div>
                <span className="text-warm-500">kworker/0:1H-312 [000] 1234.567890:</span>{" "}
                <span className="text-nvme-accent">nvme_setup_cmd:</span>{" "}
                <span className="text-warm-200">qid=1 opcode=0x02 nsid=1</span>{" "}
                <span className="text-nvme-green">Read 128 blocks @ LBA 256</span>
              </div>
              <div>
                <span className="text-warm-500">fio-1234 &nbsp; &nbsp; &nbsp; &nbsp;[001] 1234.568100:</span>{" "}
                <span className="text-nvme-accent">nvme_setup_cmd:</span>{" "}
                <span className="text-warm-200">qid=2 opcode=0x01 nsid=1</span>{" "}
                <span className="text-nvme-green">Write 256 blocks @ LBA 4096 (FUA)</span>
              </div>
              <div>
                <span className="text-warm-500">fstrim-5678 &nbsp; &nbsp; [000] 1234.569000:</span>{" "}
                <span className="text-nvme-accent">nvme_setup_cmd:</span>{" "}
                <span className="text-warm-200">qid=1 opcode=0x09 nsid=1</span>{" "}
                <span className="text-nvme-green">TRIM / Dataset Management</span>
              </div>
            </div>
          </div>
        </MuseumSection>
      </section>

      {/* 10. Explore Further */}
      <section className="py-24 px-4">
        <MuseumSection className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-warm-600 text-sm tracking-widest uppercase">Continue Your Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-50 mt-2">Explore Further</h2>
            <p className="text-warm-400 mt-4 max-w-2xl mx-auto">
              Dive deeper into any topic. Every tool below is interactive and built for hands-on learning.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Trace Decoder",
                desc: "Paste real ftrace output and decode every NVMe command instantly.",
                href: "/trace-decoder",
                accent: "border-nvme-accent/50 hover:border-nvme-accent",
              },
              {
                title: "Command Builder",
                desc: "Build any NVMe command field-by-field and see the raw 64-byte SQ entry.",
                href: "/command-builder",
                accent: "border-nvme-green/50 hover:border-nvme-green",
              },
              {
                title: "Command Reference",
                desc: "All 38 NVMe commands — 26 admin and 12 I/O — with field-level detail.",
                href: "/commands",
                accent: "border-nvme-orange/50 hover:border-nvme-orange",
              },
              {
                title: "Architecture",
                desc: "Interactive diagrams of queues, PCIe BARs, FTL, and the host-controller stack.",
                href: "/architecture",
                accent: "border-warm-600/50 hover:border-warm-500",
              },
              {
                title: "Articles",
                desc: "In-depth articles on SSD internals, NAND flash, and storage engineering.",
                href: "/articles",
                accent: "border-warm-600/50 hover:border-warm-500",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group block p-6 rounded-xl border-2 ${card.accent} bg-nvme-dark/50 hover:bg-nvme-dark transition-all`}
                prefetch={false}
              >
                <h3 className="text-warm-50 font-semibold mb-2 group-hover:text-nvme-accent transition-colors">
                  {card.title}
                </h3>
                <p className="text-warm-500 text-sm">{card.desc}</p>
              </Link>
            ))}
          </div>
        </MuseumSection>
      </section>
    </div>
  );
}
