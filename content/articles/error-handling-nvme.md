---
title: "Error Handling in NVMe"
date: 2026-02-09
tags: [nvme, error-handling, status-codes, completion-queue, async-event, error-log]
youtubeId: ""
description: "How NVMe handles errors through status codes in completion queue entries, the error information log, and asynchronous event requests."
---

Robust error handling is a cornerstone of the NVMe specification. The protocol provides multiple mechanisms for reporting errors and exceptional conditions, from per-command status codes to asynchronous notifications, giving host software the information it needs to respond appropriately.

## Completion Queue Status Field

Every NVMe command completion entry includes a 16-bit Status Field that indicates the outcome of the command. This field is subdivided into several components:

- **Status Code Type (SCT):** A 3-bit field that categorizes the error. Type 0 is Generic Command Status, Type 1 is Command Specific Status, Type 2 is Media and Data Integrity Errors, and Type 3 is Path Related Status. Vendor-specific types are also permitted.
- **Status Code (SC):** An 8-bit field within the given SCT that identifies the specific error. For example, under Generic Command Status, code 00h means Successful Completion, code 02h means Invalid Field in Command, and code 80h means LBA Out of Range.
- **Do Not Retry (DNR):** A single bit indicating whether the host should avoid retrying the command. When set, the error is considered permanent for the given command parameters.
- **More (M):** A single bit indicating that there is more status information available in the Error Information log.

This structured approach allows host drivers to implement layered error handling: first check the SCT for the error category, then examine the SC for specifics, and use DNR to decide on retry policy.

## Error Information Log (Log Page 01h)

The Error Information log provides detailed records of errors encountered by the controller. Each entry includes the command that caused the error (via its Command ID and Submission Queue ID), the status code, the LBA involved (if applicable), and a namespace identifier. The log can store multiple entries, and the host retrieves them using the Get Log Page command.

This log is invaluable for post-mortem analysis. When a command fails, the host can correlate the completion entry's status with the detailed error log entry to determine exactly what went wrong and where. The Number of Error Information Log Entries field in the SMART log tracks the cumulative count.

## Asynchronous Event Requests (AERs)

Not all important events are tied to specific I/O commands. NVMe uses Asynchronous Event Requests to notify the host of conditions that arise independently, such as:

- **Health status changes:** The SMART critical warning field transitions, for example when temperature exceeds the threshold or available spare drops below the configured level.
- **Namespace attribute changes:** A namespace may be added, removed, or have its attributes modified.
- **Firmware activation notices:** The controller can inform the host that a firmware update requires a reset to take effect.
- **Vendor-specific events:** Manufacturers can define proprietary asynchronous events for device-specific conditions.

The host pre-posts AER commands to the Admin Submission Queue. These commands remain outstanding until the controller has an event to report, at which point it completes the AER with an event type and log page identifier. The host then retrieves the appropriate log page for full details.

## Building Resilient Storage Software

Effective NVMe error handling in practice involves checking every completion entry status, implementing intelligent retry logic that respects the DNR bit, periodically polling the SMART log for degradation trends, and keeping AER commands outstanding so that critical notifications are never missed. Together, these mechanisms provide a comprehensive framework for building reliable storage systems on NVMe.
