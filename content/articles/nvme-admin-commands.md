---
title: "NVMe Admin Commands Explained"
date: "2026-02-07"
tags: ["nvme", "admin-commands", "identify", "get-log-page"]
youtubeId: ""
description: "A walkthrough of the most important NVMe admin commands — Identify, Get Log Page, Set/Get Features, and more."
---

## What Are Admin Commands?

Admin commands are submitted on the Admin Submission Queue (qid=0) and are used for controller management — not data transfer. They handle tasks like discovering controller capabilities, creating I/O queues, managing firmware, and configuring features.

## Identify (Opcode 0x06)

The Identify command is the first command any NVMe driver sends. It returns critical information about the controller or namespace:

- **CNS=0x01 (Controller)**: Returns the controller's serial number, model number, firmware revision, maximum queue entries, supported features, and much more in a 4KB data structure.
- **CNS=0x00 (Namespace)**: Returns namespace-specific information like capacity, LBA formats, and protection information capabilities.
- **CNS=0x02 (Active NS List)**: Returns a list of active namespace IDs.

## Get Log Page (Opcode 0x02)

Get Log Page retrieves various log pages from the controller:

- **LID=0x02 (SMART/Health)**: Temperature, available spare, media errors, power-on hours, unsafe shutdowns — essential for drive health monitoring.
- **LID=0x01 (Error Information)**: Detailed error log entries.
- **LID=0x03 (Firmware Slot)**: Information about firmware slots and active revision.
- **LID=0x06 (Device Self-test)**: Results from self-test operations.

## Create/Delete I/O Queues

Before any I/O can happen, the driver must create at least one I/O SQ/CQ pair:

1. **Create I/O CQ (0x05)**: Specifies queue ID, size, interrupt vector
2. **Create I/O SQ (0x01)**: Specifies queue ID, size, associated CQ, priority
3. When done, delete in reverse: Delete SQ (0x00), then Delete CQ (0x04)

## Set/Get Features (0x09/0x0A)

Features control controller behavior:

- **Number of Queues (FID=0x07)**: Negotiates how many I/O queues to use
- **Volatile Write Cache (FID=0x06)**: Enable/disable the write cache
- **Temperature Threshold (FID=0x04)**: Set alert thresholds
- **Power Management (FID=0x02)**: Configure power states

## Testing Implications

Admin commands are critical test targets because they affect the entire controller state. Key test areas include:
- Sending admin commands while I/O is active
- Invalid parameter handling (wrong CNS value, unsupported features)
- Admin queue full conditions
- Firmware update sequences (Download + Commit)
- Feature persistence across power cycles
