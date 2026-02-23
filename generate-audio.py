#!/usr/bin/env python3
"""
Generate voiceover audio files for the NVMe SSD Portfolio website.
Uses edge-tts with the en-US-JennyNeural voice at a slightly slower rate for clarity.
"""

import asyncio
import edge_tts
import os

VOICE = "en-US-JennyNeural"
RATE = "-5%"
OUTPUT_DIR = "/Users/alvinmichael/nvme-ssd-portfolio/public/audio"

SECTIONS = {
    "act0.mp3": (
        "Welcome to the world of NVMe storage! Let's start with the basics. "
        "Every computer has a storage hierarchy — from super-fast CPU registers at the top, "
        "to RAM, then SSDs, and finally hard drives. Each layer trades speed for capacity and cost. "
        "RAM is about a thousand times faster than an SSD, but it's volatile — meaning it loses "
        "everything when power is lost — and it costs sixty to a hundred times more per gigabyte. "
        "That's why we need SSDs for permanent storage. "
        "Now, when your computer wants to read a file from the SSD, the request flows through "
        "several layers: from the application, through the operating system kernel, to the NVMe driver, "
        "across the PCIe bus, and finally to the SSD controller and NAND flash. Each layer depends "
        "on the one above it. The PCIe bus is the high-speed highway connecting everything — think "
        "of it as a multi-lane road where each lane carries data independently. A typical NVMe SSD "
        "uses four lanes, giving it roughly eight gigabytes per second of bandwidth."
    ),
    "act1.mp3": (
        "Now let's look inside the SSD itself. At the heart of every SSD are billions of tiny "
        "NAND flash cells. Each cell is basically a transistor with a special floating gate that "
        "traps electrons — and those trapped electrons are what store your data, even when the "
        "power is off. There are different types of cells: SLC stores one bit per cell and is "
        "super fast and durable, while TLC stores three bits and QLC stores four bits. More bits "
        "per cell means more storage, but the tradeoff is slower writes and shorter lifespan. "
        "The SSD also has its own processor and RAM — it's basically a tiny computer. The processor "
        "runs the Flash Translation Layer, or FTL, which maps the logical addresses your operating "
        "system uses to the actual physical locations on NAND. This mapping is essential because "
        "NAND flash has a quirk: you can't overwrite data in place. You have to write to a fresh "
        "page, and eventually a process called garbage collection cleans up the old pages. "
        "Understanding these internals helps explain why SSDs behave the way they do."
    ),
    "act2.mp3": (
        "This section is where things get really interesting — we're going to learn how the host "
        "computer actually talks to the SSD. It all starts with PCIe, which is the high-speed "
        "serial bus connecting the SSD to the CPU. When you plug in an NVMe drive, the system "
        "assigns it a memory address range called BAR0 — think of it as the SSD's control panel. "
        "The CPU reads and writes to these memory addresses using regular instructions, and the "
        "hardware routes those accesses to the SSD's registers. This is called Memory-Mapped I O. "
        "But here's the cool part — commands aren't sent one at a time. Instead, they flow through "
        "circular queues in RAM. The host places commands into a Submission Queue, and the SSD "
        "places results into a Completion Queue. These queues use head and tail pointers that chase "
        "each other around a ring. When the SSD finishes a command, it fires an interrupt to let "
        "the CPU know. The whole boot sequence follows a strict order — discovery, controller setup, "
        "identification, queue creation, and then the drive is ready for data."
    ),
    "act3.mp3": (
        "Now that we know how commands travel through queues, let's look at the commands themselves. "
        "Every NVMe command is exactly sixty-four bytes — a fixed size that makes the circular queue "
        "math simple and fast. There are two categories: admin commands for managing the device, "
        "and I O commands for reading and writing data. Admin commands go through a special admin "
        "queue that's always available, so management operations never get stuck behind heavy data "
        "traffic. The Identify command is one of the first things sent during boot — it asks the "
        "drive: who are you, what can you do, and how much storage do you have? NVMe also supports "
        "namespaces, which are like hardware-level partitions that provide true isolation between "
        "workloads. One important thing to remember: when a write command completes successfully, "
        "your data might still be sitting in the SSD's volatile cache. You need to send a Flush "
        "command to guarantee it's safely written to NAND. This matters a lot for databases and "
        "any application that needs crash consistency."
    ),
    "act4.mp3": (
        "Let's talk about keeping your SSD healthy. Every SSD tracks its own health through SMART "
        "data — things like temperature, total bytes written, and percentage of life used. Here's "
        "a tricky detail: the 'data units written' field only counts what the host sent, but the "
        "actual NAND wear includes internal writes from garbage collection and wear leveling. This "
        "difference is called Write Amplification. TRIM is another critical concept. When you delete "
        "a file, the filesystem knows those blocks are free, but the SSD doesn't — unless you tell "
        "it. TRIM sends that notification so the garbage collector can skip dead data instead of "
        "wastefully copying it around. Without TRIM, performance degrades and the drive wears out "
        "faster. Wear leveling ensures all NAND blocks share the workload evenly. Dynamic wear "
        "leveling balances new writes, while static wear leveling goes further by relocating cold, "
        "rarely-changed data to spread the wear across every block. And when it's time to "
        "decommission a drive with sensitive data, remember: a simple format isn't enough. You "
        "need Sanitize with crypto erase to truly destroy the data."
    ),
    "act5.mp3": (
        "In this final section, we'll look at the tools and software stack that bring everything "
        "together. The filesystem sits at the top of the storage stack, and your choice matters — "
        "ext4, XFS, and Btrfs all interact differently with the SSD's internals. Things like TRIM "
        "support, journaling overhead, and write patterns all affect performance and longevity. "
        "For benchmarking, fio is the gold standard tool. But here's the key lesson: always "
        "precondition your drive before testing. A quick ten-second test only measures burst "
        "performance from the SLC cache. Real-world sustained performance shows up after the cache "
        "fills and garbage collection kicks in. When debugging performance issues, Linux tracing "
        "tools like ftrace and blktrace let you pinpoint exactly where latency is coming from — "
        "whether it's the kernel I O stack or the SSD itself. Firmware updates should be done "
        "carefully using the slot-based system that NVMe provides, always keeping a known-good "
        "firmware in a backup slot. And that wraps up our journey through the world of NVMe "
        "storage — from transistors all the way up to the operating system!"
    ),
}


async def generate_audio(filename: str, text: str):
    """Generate a single audio file using edge-tts."""
    output_path = os.path.join(OUTPUT_DIR, filename)
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(output_path)
    file_size = os.path.getsize(output_path)
    print(f"  Generated {filename} ({file_size:,} bytes)")


async def main():
    print(f"Generating {len(SECTIONS)} audio files...")
    print(f"Voice: {VOICE}, Rate: {RATE}")
    print(f"Output directory: {OUTPUT_DIR}\n")

    for filename, text in SECTIONS.items():
        word_count = len(text.split())
        print(f"Processing {filename} ({word_count} words)...")
        await generate_audio(filename, text)

    print("\nAll audio files generated successfully!")


if __name__ == "__main__":
    asyncio.run(main())
