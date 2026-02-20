---
title: "NVMe I/O Commands: Read, Write, and Beyond"
date: "2026-02-09"
tags: ["nvme", "io-commands", "read", "write", "trim"]
youtubeId: ""
description: "Understanding NVMe I/O commands — Read, Write, Flush, TRIM, Write Zeroes, Compare, and their key fields."
---

## I/O Command Fundamentals

I/O commands are submitted on I/O Submission Queues (qid >= 1) and are the workhorses of NVMe — they move data between the host and the SSD.

## Read (Opcode 0x02) and Write (Opcode 0x01)

The most common I/O commands. Key fields:

- **SLBA** (CDW10-CDW11): Starting Logical Block Address — a 64-bit value spread across two dwords
- **NLB** (CDW12[15:0]): Number of Logical Blocks, 0-based (0 = 1 block, 0xFF = 256 blocks)
- **FUA** (CDW12[30]): Force Unit Access — when set, bypasses the volatile write cache
- **LR** (CDW12[31]): Limited Retry — limits the number of retry attempts

### Example: Reading 128 blocks starting at LBA 0x1000

```
CDW10 = 0x00001000  (SLBA lower 32 bits)
CDW11 = 0x00000000  (SLBA upper 32 bits)
CDW12 = 0x0000007F  (NLB = 127 = 128 blocks, 0-based)
```

## Flush (Opcode 0x00)

Flush ensures all data in the volatile write cache is committed to non-volatile media. It takes no command-specific parameters — just the opcode. Critical for data durability guarantees.

## Dataset Management / TRIM (Opcode 0x09)

TRIM informs the controller that certain LBA ranges are no longer in use. This allows the controller to:
- Free internal mapping table entries
- Return blocks to the free pool for garbage collection
- Potentially improve write performance

The key field is **AD** (CDW11[2]) — the Deallocate bit must be set for actual TRIM behavior.

## Write Zeroes (Opcode 0x08)

More efficient than writing a buffer of zeroes — the controller can simply update its mapping table without actually programming NAND pages. Useful for secure erase of specific ranges.

## Compare (Opcode 0x05)

Reads data from the specified LBA range and compares it to data provided by the host. Returns success only if they match. Useful for atomic check-and-set operations in shared storage scenarios.

## Key Testing Scenarios

- **Boundary testing**: LBA 0, max LBA, max transfer size
- **FUA behavior**: Verify data survives power loss with FUA=1
- **TRIM verification**: Read after TRIM returns zeroes or deterministic pattern
- **Misalignment**: Commands crossing internal boundary conditions
- **Error injection**: What happens when NAND read fails during a host read?
