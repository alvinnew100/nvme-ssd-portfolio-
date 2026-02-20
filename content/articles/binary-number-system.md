---
title: "The Binary Number System for SSD Engineers"
date: "2026-02-01"
tags: ["fundamentals", "binary", "hardware"]
youtubeId: ""
description: "Understanding binary, hexadecimal, and bitwise operations — the foundation of everything in SSD firmware and NVMe."
---

## Why Binary Matters for SSD Engineers

Every NVMe command, every register value, every piece of data flowing between the host and an SSD is represented in binary. Understanding binary isn't just academic — it's a daily practical necessity.

When you look at an NVMe Submission Queue Entry, you're looking at 64 bytes — 512 bits — where specific bit ranges have specific meanings. CDW10[7:0] might be an opcode, CDW10[31:16] might be a queue size, and you need to extract these values fluently.

## Binary to Hex Conversion

Hexadecimal is the standard representation in NVMe work because each hex digit maps to exactly 4 binary bits:

| Hex | Binary | Decimal |
|-----|--------|---------|
| 0x0 | 0000   | 0       |
| 0x5 | 0101   | 5       |
| 0xA | 1010   | 10      |
| 0xF | 1111   | 15      |

So `0x1F` = `0001 1111` = 31. When you see CDW10=0x007f0002, you can immediately parse it:
- Upper 16 bits: 0x007f = 127
- Lower 16 bits: 0x0002 = 2

## Bitwise Operations in NVMe

Extracting a field from a dword is a mask-and-shift operation:

```
value = (dword >> bitStart) & ((1 << width) - 1)
```

For example, extracting the LID (bits 7:0) from Get Log Page CDW10:
```
lid = cdw10 & 0xFF  // mask lower 8 bits
```

This is exactly what our ftrace decoder does for every field of every command.

## Practical Example: Reading an NVMe Identify Command

An Identify command with CNS=1 (Controller) has:
- Opcode: 0x06
- CDW10: 0x00000001

Breaking down CDW10:
- Bits [7:0] = CNS = 0x01 = Controller Identify
- Bits [31:16] = CNTID = 0x0000 = No specific controller

Understanding this bit-level representation is essential for debugging NVMe issues in the field.
