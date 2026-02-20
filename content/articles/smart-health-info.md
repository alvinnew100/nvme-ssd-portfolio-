---
title: "SMART/Health Information in NVMe"
date: 2026-02-08
tags: [nvme, smart, health-monitoring, log-page, temperature, endurance]
youtubeId: ""
description: "An overview of the SMART/Health Information log in NVMe, covering critical health metrics like temperature, spare capacity, data units read and written, and error counts."
---

Monitoring the health and status of an NVMe SSD is essential for predicting failures, planning replacements, and ensuring data integrity. The NVMe specification defines a standardized SMART/Health Information log page (Log Page Identifier 02h) that provides a comprehensive snapshot of the drive's operating condition.

## Accessing the SMART Log

The host retrieves the SMART/Health Information log using the Get Log Page Admin command with Log Page Identifier set to 02h. The log is a fixed 512-byte structure containing a well-defined set of fields. Tools like `nvme-cli` on Linux make it straightforward to query this data with a simple `nvme smart-log /dev/nvme0` command.

## Key Health Metrics

**Critical Warning:** This single-byte field is a bitmask that flags urgent conditions. Bit 0 indicates the available spare capacity has fallen below threshold. Bit 1 signals that the temperature has exceeded a critical threshold. Bit 2 warns that the NVM subsystem reliability has been degraded. Bit 3 indicates the media has been placed in read-only mode, and Bit 4 flags that the volatile memory backup device has failed.

**Temperature:** Reported in Kelvin, this field reflects the composite temperature of the drive. The controller may also expose per-sensor temperature readings via additional fields. Operating within the manufacturer's specified thermal envelope is critical — excessive heat accelerates NAND wear and can trigger thermal throttling.

**Available Spare and Available Spare Threshold:** The available spare indicates the percentage of reserved spare blocks remaining, while the threshold defines the level below which the controller raises a critical warning. When spare capacity is exhausted, the drive can no longer remap failed blocks, increasing the risk of data loss.

**Data Units Read and Data Units Written:** These 128-bit counters track the total amount of data transferred to and from the host in units of 512 bytes multiplied by 1,000. They provide a clear picture of the total workload the drive has processed over its lifetime and are essential inputs for endurance projections.

**Media and Data Integrity Errors:** This counter tracks the number of unrecovered data integrity errors detected by the controller. A non-zero value here is a serious concern, as it indicates errors that ECC and internal recovery mechanisms could not correct.

**Number of Error Information Log Entries:** This field counts the total number of entries written to the Error Information log (Log Page 01h). It reflects all errors the controller has logged, including both recovered and unrecovered events.

## Proactive Monitoring

Enterprises typically poll the SMART log at regular intervals and feed the data into monitoring systems. Tracking trends in temperature, available spare, and data written over time allows storage administrators to project remaining drive life and schedule proactive replacements before failures occur. A sudden spike in media errors or a rapidly declining spare count are clear signals that a drive should be taken out of service.
