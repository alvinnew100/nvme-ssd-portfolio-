---
title: "Format NVM vs Sanitize: Secure Data Destruction"
date: "2026-02-15"
tags: ["format", "sanitize", "security", "data-destruction"]
youtubeId: ""
description: "Understanding the difference between Format NVM and Sanitize commands for secure data destruction on SSDs."
---

## The Need for Secure Data Destruction

When decommissioning SSDs, simply deleting files or formatting the filesystem isn't enough. The FTL maintains mappings, and data may remain in over-provisioned space, NAND blocks awaiting garbage collection, or controller caches. NVMe provides two mechanisms for secure data destruction.

## Format NVM (Opcode 0x80)

Format NVM performs a low-level format on a namespace. Key parameters:

- **LBAF** (bits [3:0]): LBA Format — can change the sector size (512B, 4KB, etc.)
- **SES** (bits [11:9]): Secure Erase Settings
  - 0: No secure erase (just format)
  - 1: User Data Erase — all user data becomes indeterminate
  - 2: Cryptographic Erase — changes the encryption key, making data unreadable

### Key Characteristics
- Operates on a **single namespace** (or all namespaces if NSID=0xFFFFFFFF)
- Can change the LBA format (sector size)
- Relatively fast for cryptographic erase
- Does NOT guarantee destruction of data in over-provisioned areas

## Sanitize (Opcode 0x84)

Sanitize is a more thorough data destruction mechanism that operates on the **entire NVM subsystem**.

### Sanitize Actions (SANACT field)
- **Block Erase (2)**: Erases all NAND blocks
- **Crypto Erase (4)**: Changes encryption keys
- **Overwrite (3)**: Writes a pattern to all user-accessible locations

### Key Characteristics
- Affects the **entire NVM subsystem**, not just one namespace
- Cannot be interrupted once started
- Controller reports progress via Sanitize Status log page (LID=0x81)
- More thorough than Format NVM
- Required for compliance with standards like NIST 800-88

## Which to Use?

| Scenario | Recommendation |
|---|---|
| Quick namespace reset during development | Format NVM (SES=0) |
| Removing data before reuse | Format NVM (SES=1 or 2) |
| Decommissioning for compliance | Sanitize (Block Erase or Crypto Erase) |
| Government/military requirements | Sanitize (Overwrite) with verification |

## Testing Considerations

- Verify data is actually unreadable after sanitize
- Test sanitize during active I/O (should be rejected)
- Verify sanitize progress reporting
- Test power loss during sanitize (should resume on next power-on)
- Verify namespace recreation after format
