---
title: "TRIM and Deallocate in NVMe"
date: 2026-02-07
tags: [nvme, trim, deallocate, garbage-collection, dataset-management, write-amplification]
youtubeId: ""
description: "How the TRIM and Deallocate mechanisms work in NVMe SSDs, why they matter for performance and endurance, and how they interact with garbage collection."
---

TRIM — or more precisely, the Deallocate operation within the NVMe Dataset Management command — is one of the most important mechanisms for maintaining long-term SSD performance and endurance. It bridges a critical information gap between the file system and the SSD controller.

## The Problem TRIM Solves

When a file system deletes a file, it typically marks the corresponding blocks as free in its own metadata but does not inform the storage device. From the SSD controller's perspective, those blocks still contain valid data that must be preserved during garbage collection. Over time, the controller wastes effort relocating stale data it believes is still in use, increasing write amplification and degrading performance.

## The NVMe Dataset Management Command

NVMe addresses this with the Dataset Management command (opcode 09h). This command includes an Attribute — Deallocate (AD) bit that, when set, tells the controller that the specified LBA ranges are no longer in use. The command can specify multiple LBA ranges in a single operation, making it efficient for bulk deallocation.

Upon receiving a Deallocate hint, the controller can immediately mark those physical pages as invalid in its Flash Translation Layer (FTL) mapping table. This has several benefits:

- **Reduced write amplification:** Garbage collection can skip invalid pages rather than copying them to new blocks, significantly reducing unnecessary writes.
- **Improved sustained performance:** With more blocks eligible for immediate erasure, the controller maintains a healthier pool of free blocks and avoids performance cliffs.
- **Extended drive lifespan:** Fewer unnecessary program/erase cycles translate directly into longer flash endurance.

## TRIM and Garbage Collection Interaction

Garbage collection (GC) is the background process by which the SSD reclaims blocks containing a mix of valid and invalid pages. The controller selects a victim block, copies its valid pages to a new block, and then erases the victim block for reuse.

When TRIM hints are delivered promptly, GC becomes significantly more efficient. Blocks may end up with all pages marked invalid, allowing the controller to erase them without copying any data — the ideal scenario. Without TRIM, GC must conservatively treat every programmed page as valid, leading to excessive data migration.

## Practical Considerations

Not all TRIM behavior is equal. The NVMe specification defines a Deallocate Logical Block Features field that indicates what the controller returns when a deallocated LBA is subsequently read. The possible behaviors include returning all zeros, returning all ones, or returning the last written data. Deterministic read behavior after TRIM (DRAT and DULBE attributes) matters for applications that depend on consistent read-after-deallocate semantics.

File systems and operating systems should issue TRIM commands regularly. Linux supports continuous TRIM via the `discard` mount option or periodic TRIM via `fstrim`. For optimal results, batching TRIM operations reduces command overhead while still keeping the controller informed about freed blocks.
