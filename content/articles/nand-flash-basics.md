---
title: "NAND Flash Memory Fundamentals"
date: 2026-02-04
tags: [nand-flash, slc, mlc, tlc, qlc, program-erase, flash-memory]
youtubeId: ""
description: "An introduction to NAND flash memory covering SLC, MLC, TLC, and QLC cell types, the physical hierarchy of pages, blocks, and planes, and key reliability concerns."
---

NAND flash is the non-volatile storage medium at the heart of every SSD. Understanding its physical characteristics and constraints is essential for anyone working with solid-state storage, because the firmware and controller must constantly work around the inherent limitations of flash memory.

## Cell Types: SLC, MLC, TLC, and QLC

NAND flash stores data by trapping electrons in floating-gate or charge-trap transistors. The number of bits stored per cell defines the cell type:

- **SLC (Single-Level Cell):** 1 bit per cell. Two voltage states. Highest endurance and speed, but lowest density.
- **MLC (Multi-Level Cell):** 2 bits per cell. Four voltage states. A good balance of performance, density, and cost.
- **TLC (Triple-Level Cell):** 3 bits per cell. Eight voltage states. The mainstream choice for consumer and many enterprise SSDs.
- **QLC (Quad-Level Cell):** 4 bits per cell. Sixteen voltage states. Maximum density, but the most constrained in endurance and write performance.

As bits per cell increase, the voltage windows separating each state shrink, making reads more error-prone and requiring stronger error-correction codes (ECC).

## Physical Hierarchy: Pages, Blocks, and Planes

NAND flash is organized into a hierarchy. The smallest readable and writable unit is a **page**, typically 4 KB to 16 KB in modern flash. Pages are grouped into **blocks**, which commonly contain 256 to 1,024 pages. A block is the smallest unit that can be erased. This asymmetry — writing at the page level but erasing at the block level — creates the well-known write amplification challenge. Multiple blocks are organized into **planes**, and a NAND die may contain two or four planes that can operate in parallel to boost throughput.

## Program/Erase Cycles and Endurance

Each block can only endure a limited number of program/erase (P/E) cycles before the oxide layer degrades and the cell can no longer reliably hold charge. SLC flash can tolerate roughly 100,000 P/E cycles, while QLC may be rated for as few as 1,000. Wear leveling algorithms in the SSD firmware distribute writes evenly across blocks to maximize the overall lifespan of the drive.

## Read Disturb and Data Retention

Reading a page applies a pass-through voltage to neighboring cells, which can gradually shift their charge state — a phenomenon known as **read disturb**. Over many reads, this can cause bit errors. **Data retention** refers to how long a cell can hold its programmed state without power. Higher wear and higher temperatures accelerate charge leakage, reducing retention time. The controller mitigates these effects through background data refresh operations and periodic patrols of stored data.
