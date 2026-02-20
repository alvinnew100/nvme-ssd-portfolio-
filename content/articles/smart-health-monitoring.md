---
title: "SSD Health Monitoring with SMART and NVMe Log Pages"
date: "2026-02-13"
tags: ["smart", "health", "monitoring", "log-pages"]
youtubeId: ""
description: "How to monitor SSD health using NVMe SMART/Health log pages — temperature, wear, errors, and more."
---

## SMART/Health Information Log (Log Page 0x02)

The SMART/Health Information log is a 512-byte data structure returned by the Get Log Page command (opcode 0x02) with LID=0x02. It contains the most critical health metrics for any SSD.

## Key SMART Attributes

### Temperature
- **Composite Temperature**: Current drive temperature in Kelvin (subtract 273 for Celsius)
- Critical for throttling decisions and reliability

### Spare Capacity
- **Available Spare**: Percentage of spare blocks remaining (100% = new drive)
- **Available Spare Threshold**: The level below which the drive is considered unhealthy
- When Available Spare drops below the threshold, the controller reports a critical warning

### Endurance
- **Data Units Written**: Total data written in units of 1000 x 512 bytes
- **Data Units Read**: Total data read
- **Host Read/Write Commands**: Total command counts
- Used to calculate drive-level Write Amplification Factor (WAF)

### Reliability
- **Media and Data Integrity Errors**: Unrecovered errors — should be zero
- **Number of Error Information Log Entries**: Count of logged errors
- **Critical Warning**: Bitmask indicating critical conditions

### Lifetime
- **Percentage Used**: Estimated percentage of drive life consumed
- 100% means the drive has reached its rated endurance
- Many drives continue operating past 100% but are out of warranty

### Power
- **Power Cycles**: Number of power on/off cycles
- **Power On Hours**: Total hours of operation
- **Unsafe Shutdowns**: Power loss events without clean shutdown

## Monitoring Best Practices

1. **Poll regularly**: Read SMART every 5-60 minutes in production
2. **Track trends**: A rising temperature or falling spare count indicates issues
3. **Alert on critical warnings**: The Critical Warning field is a bitmask:
   - Bit 0: Available spare below threshold
   - Bit 1: Temperature exceeded threshold
   - Bit 2: NVM subsystem reliability degraded
   - Bit 3: Media placed in read-only mode
   - Bit 4: Volatile memory backup failed

4. **Compare across fleet**: Outliers in endurance or error rates may indicate firmware bugs or weak NAND lots

## Using nvme-cli

```bash
# Read SMART log
nvme smart-log /dev/nvme0n1

# Outputs human-readable SMART data including temperature,
# available spare, data units written, and more
```

This is the same data you'd get from sending Get Log Page with LID=0x02 — nvme-cli just formats it nicely.
