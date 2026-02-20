---
title: "Using Linux ftrace to Trace NVMe Commands"
date: "2026-02-11"
tags: ["ftrace", "linux", "tracing", "debugging"]
youtubeId: ""
description: "How to use Linux ftrace to capture and analyze NVMe commands at the kernel level — essential for SSD debugging."
---

## What is ftrace?

ftrace is Linux's built-in tracing framework. It can trace function calls, events, and more with minimal overhead. For NVMe engineers, the `nvme:nvme_setup_cmd` and `nvme:nvme_complete_cmd` tracepoints are invaluable — they capture every NVMe command as it's submitted and completed.

## Enabling NVMe Tracing

```bash
# Mount tracefs (usually already mounted)
mount -t tracefs nodev /sys/kernel/debug/tracing

# Enable NVMe trace events
echo 1 > /sys/kernel/debug/tracing/events/nvme/enable

# Run your workload
fio --name=test --rw=randread --bs=4k --runtime=5 --filename=/dev/nvme0n1

# Read the trace buffer
cat /sys/kernel/debug/tracing/trace > /tmp/nvme-trace.txt

# Disable tracing
echo 0 > /sys/kernel/debug/tracing/events/nvme/enable
```

## Reading the Trace Output

Each line looks like:

```
kworker/0:1H-312 [000] .... 1234.567890: nvme_setup_cmd: nvme0n1: qid=1, cmdid=0, nsid=1, cdw10=0x00000000, cdw11=0x00000000, cdw12=0x000000ff, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x02
```

Breaking this down:
- `kworker/0:1H-312`: Process name and PID
- `[000]`: CPU number
- `1234.567890`: Timestamp
- `nvme_setup_cmd`: Trace event (setup = submitted, complete = finished)
- `qid=1`: Queue ID (0 = admin, 1+ = I/O)
- `opcode=0x02`: NVMe opcode (0x02 on qid=1 = Read)
- `cdw10-cdw15`: Command-specific dwords

## Decoding Commands from Traces

The `cdw10` through `cdw15` fields contain all the command-specific information. For a Read command:
- cdw10/cdw11 = Starting LBA
- cdw12 bits [15:0] = Number of blocks (0-based)
- cdw12 bit [30] = FUA flag

This is exactly what our ftrace decoder tool does — it parses these raw values and maps them to human-readable field names using the NVMe specification.

## Practical Debugging Tips

1. **Filter by qid**: `qid=0` shows only admin commands during initialization
2. **Look for patterns**: Sequential LBAs suggest sequential I/O; random LBAs suggest random workload
3. **Check NLB values**: Reveals the I/O size your application is using
4. **Monitor TRIM**: Look for opcode=0x09 on I/O queues
5. **Correlate setup/complete**: Match cmdid values to measure per-command latency
