---
title: "Understanding NVMe Submission and Completion Queues"
date: 2026-02-03
tags: [nvme, queues, submission-queue, completion-queue, doorbell-registers]
youtubeId: ""
description: "A deep dive into how NVMe submission and completion queues work, including doorbell registers, head/tail pointers, and queue depth considerations."
---

NVMe achieves its remarkable performance largely through its queue-based command submission architecture. Unlike legacy storage protocols that relied on a single command queue, NVMe supports up to 65,535 I/O queue pairs, each consisting of a Submission Queue (SQ) and a Completion Queue (CQ).

## Submission and Completion Queue Basics

A Submission Queue is a circular buffer in host memory where the host places commands destined for the NVMe controller. Each command is a fixed 64-byte structure that describes the operation — read, write, flush, and so on. The corresponding Completion Queue is where the controller posts 16-byte completion entries to inform the host that a command has finished processing.

Every NVMe device has one Admin Queue pair (Admin SQ and Admin CQ) used for management commands such as creating and deleting I/O queues, identifying the controller, and setting features. All remaining queue pairs are I/O queues dedicated to data transfer operations.

## Doorbell Registers

Communication between the host and the controller is coordinated through doorbell registers mapped into the controller's BAR0 memory-mapped I/O space. Each queue has a corresponding doorbell register. When the host writes a new command into the SQ, it updates the SQ Tail Doorbell to notify the controller that new work is available. When the host finishes processing a completion entry, it updates the CQ Head Doorbell to tell the controller it can reuse that CQ slot.

## Head and Tail Pointers

Each circular queue is managed with a head pointer and a tail pointer. For the Submission Queue, the host owns the tail (it enqueues commands) and the controller owns the head (it dequeues commands for processing). For the Completion Queue, the roles reverse: the controller owns the tail (it posts completions) and the host owns the head (it consumes completions).

A phase tag bit in each completion entry helps the host determine whether an entry is new without needing to compare pointers directly. The phase tag flips each time the controller wraps around the CQ, providing an elegant mechanism to distinguish fresh entries from stale ones.

## Queue Depth

Queue depth refers to the maximum number of outstanding commands a queue can hold. NVMe allows each queue to hold up to 65,536 entries for I/O queues and 4,096 for the Admin Queue. Deeper queues enable the controller to optimize internal scheduling, reorder requests for better NAND access patterns, and keep the flash media busy — all of which contribute to higher throughput and lower average latency under parallel workloads.

Selecting the right queue depth is a balancing act. Too shallow, and the drive may starve for work. Too deep, and tail latencies can increase as commands wait longer in the queue. Workload profiling is essential to finding the optimal configuration.
