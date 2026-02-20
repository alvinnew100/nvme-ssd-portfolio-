import { NvmeCommand } from "./types";
import { FieldValues, encodeFields } from "./encoder";

interface CliMapping {
  subcommand: string | null;
  device: "ctrl" | "ns";
  fieldFlags?: Record<string, string>;
  kernelOnly?: boolean;
  note?: string;
}

const CLI_MAP: Record<string, CliMapping | ((values: FieldValues) => CliMapping)> = {
  "admin-identify": (values) => {
    const cns = values["CNS"] ?? 0;
    if (cns === 1) {
      return { subcommand: "id-ctrl", device: "ctrl" };
    }
    return { subcommand: "id-ns", device: "ns", fieldFlags: { CNTID: "--controller-id" } };
  },
  "admin-get-log-page": (values) => {
    const lid = values["LID"] ?? 0;
    if (lid === 0x02) {
      return { subcommand: "smart-log", device: "ctrl" };
    }
    if (lid === 0x03) {
      return { subcommand: "fw-log", device: "ctrl" };
    }
    return {
      subcommand: "get-log",
      device: "ctrl",
      fieldFlags: { LID: "--log-id", NUMDL: "--log-len", LSP: "--lsp" },
    };
  },
  "admin-get-features": {
    subcommand: "get-feature",
    device: "ctrl",
    fieldFlags: { FID: "--feature-id", SEL: "--sel" },
  },
  "admin-set-features": {
    subcommand: "set-feature",
    device: "ctrl",
    fieldFlags: { FID: "--feature-id", CDW11_VAL: "--value" },
  },
  "admin-fw-download": {
    subcommand: "fw-download",
    device: "ctrl",
    fieldFlags: { NUMD: "--xfer", OFST: "--offset" },
  },
  "admin-fw-commit": {
    subcommand: "fw-commit",
    device: "ctrl",
    fieldFlags: { FS: "--slot", CA: "--action" },
  },
  "admin-format-nvm": {
    subcommand: "format",
    device: "ns",
    fieldFlags: { LBAF: "--lbaf", SES: "--ses", PI: "--pi", PIL: "--pil" },
  },
  "admin-sanitize": {
    subcommand: "sanitize",
    device: "ctrl",
    fieldFlags: { SANACT: "--sanact", AUSE: "--ause", OWPASS: "--owpass", OIPBP: "--oipbp" },
  },
  "admin-self-test": {
    subcommand: "device-self-test",
    device: "ctrl",
    fieldFlags: { STC: "--stc" },
  },
  "admin-ns-mgmt": {
    subcommand: "create-ns",
    device: "ctrl",
    fieldFlags: { SEL: "--sel" },
  },
  "admin-ns-attach": {
    subcommand: "attach-ns",
    device: "ctrl",
    fieldFlags: { SEL: "--sel" },
  },
  "admin-security-send": {
    subcommand: "security-send",
    device: "ctrl",
    fieldFlags: { SPSP0: "--spsp0", SPSP1: "--spsp1", SECP: "--secp", TL: "--tl" },
  },
  "admin-security-recv": {
    subcommand: "security-recv",
    device: "ctrl",
    fieldFlags: { SPSP0: "--spsp0", SPSP1: "--spsp1", SECP: "--secp", AL: "--al" },
  },
  "admin-directive-send": {
    subcommand: "dir-send",
    device: "ctrl",
    fieldFlags: { DTYPE: "--dtype", DSPEC: "--dspec", DOPER: "--doper" },
  },
  "admin-directive-recv": {
    subcommand: "dir-receive",
    device: "ctrl",
    fieldFlags: { DTYPE: "--dtype", DSPEC: "--dspec", DOPER: "--doper" },
  },
  "admin-virt-mgmt": {
    subcommand: "virt-mgmt",
    device: "ctrl",
    fieldFlags: { ACT: "--act", RT: "--rt", CNTLID: "--cntlid", NR: "--nr" },
  },
  "admin-get-lba-status": {
    subcommand: "get-lba-status",
    device: "ns",
    fieldFlags: { SLBA_L: "--slba", MNDW: "--mndw", ATYPE: "--atype", RL: "--rl" },
  },
  "admin-create-sq": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Create I/O SQ is issued by the kernel NVMe driver during initialization, not directly via nvme-cli.",
  },
  "admin-create-cq": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Create I/O CQ is issued by the kernel NVMe driver during initialization, not directly via nvme-cli.",
  },
  "admin-delete-sq": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Delete I/O SQ is issued by the kernel NVMe driver, not directly via nvme-cli.",
  },
  "admin-delete-cq": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Delete I/O CQ is issued by the kernel NVMe driver, not directly via nvme-cli.",
  },
  "admin-abort": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Abort is issued by the kernel driver for command timeout recovery.",
  },
  "admin-async-event": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Async Event Request is managed automatically by the kernel NVMe driver.",
  },
  "admin-keep-alive": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Keep Alive is sent automatically by the kernel driver to maintain controller association.",
  },
  "admin-doorbell-buf": {
    subcommand: null,
    device: "ctrl",
    kernelOnly: true,
    note: "Doorbell Buffer Config is issued by the kernel driver for shadow doorbell setup.",
  },
  "io-read": {
    subcommand: "read",
    device: "ns",
    fieldFlags: {
      SLBA_L: "--start-block",
      NLB: "--block-count",
    },
  },
  "io-write": {
    subcommand: "write",
    device: "ns",
    fieldFlags: {
      SLBA_L: "--start-block",
      NLB: "--block-count",
    },
  },
  "io-flush": {
    subcommand: "flush",
    device: "ns",
  },
  "io-compare": {
    subcommand: "compare",
    device: "ns",
    fieldFlags: {
      SLBA_L: "--start-block",
      NLB: "--block-count",
    },
  },
  "io-write-zeroes": {
    subcommand: "write-zeroes",
    device: "ns",
    fieldFlags: {
      SLBA_L: "--start-block",
      NLB: "--block-count",
    },
  },
  "io-write-uncorrectable": {
    subcommand: "write-uncor",
    device: "ns",
    fieldFlags: {
      SLBA_L: "--start-block",
      NLB: "--block-count",
    },
  },
  "io-dataset-mgmt": {
    subcommand: "dsm",
    device: "ns",
    fieldFlags: {
      NR: "--nr",
      AD: "-d",
    },
  },
  "io-verify": {
    subcommand: "verify",
    device: "ns",
    fieldFlags: {
      SLBA_L: "--start-block",
      NLB: "--block-count",
    },
  },
  "io-reservation-register": {
    subcommand: "resv-register",
    device: "ns",
    fieldFlags: { RREGA: "--rrega", IEKEY: "--iekey", CPTPL: "--cptpl" },
  },
  "io-reservation-report": {
    subcommand: "resv-report",
    device: "ns",
    fieldFlags: { NUMD: "--numd" },
  },
  "io-reservation-acquire": {
    subcommand: "resv-acquire",
    device: "ns",
    fieldFlags: { RACQA: "--racqa", IEKEY: "--iekey", RTYPE: "--rtype" },
  },
  "io-reservation-release": {
    subcommand: "resv-release",
    device: "ns",
    fieldFlags: { RRELA: "--rrela", IEKEY: "--iekey", RTYPE: "--rtype" },
  },
};

export interface CliResult {
  command: string | null;
  isKernelOnly: boolean;
  note: string | null;
}

export function generateCliCommand(
  command: NvmeCommand,
  fieldValues: FieldValues,
  nsid: number = 1
): CliResult {
  const mapEntry = CLI_MAP[command.id];

  if (!mapEntry) {
    return generatePassthruCommand(command, fieldValues, nsid);
  }

  const mapping = typeof mapEntry === "function" ? mapEntry(fieldValues) : mapEntry;

  if (mapping.kernelOnly) {
    return {
      command: null,
      isKernelOnly: true,
      note: mapping.note ?? "This command is issued by the kernel driver, not directly via nvme-cli.",
    };
  }

  const device =
    mapping.device === "ctrl" ? "/dev/nvme0" : `/dev/nvme0n${nsid}`;

  let cmd = `nvme ${mapping.subcommand} ${device}`;

  if (mapping.fieldFlags) {
    for (const [fieldName, flag] of Object.entries(mapping.fieldFlags)) {
      const val = fieldValues[fieldName];
      if (val !== undefined && val !== 0) {
        if (flag === "-d") {
          cmd += ` ${flag}`;
        } else {
          cmd += ` ${flag}=${val}`;
        }
      }
    }
  }

  if (command.id === "io-read" || command.id === "io-write" || command.id === "io-compare") {
    const nlb = (fieldValues["NLB"] ?? 0) + 1;
    const blockSize = 512;
    cmd += ` --data-size=${nlb * blockSize}`;
  }

  return { command: cmd, isKernelOnly: false, note: null };
}

function generatePassthruCommand(
  command: NvmeCommand,
  fieldValues: FieldValues,
  nsid: number
): CliResult {
  const encoded = encodeFields(command, fieldValues);
  const isAdmin = command.type === "admin";
  const subcmd = isAdmin ? "admin-passthru" : "io-passthru";
  const device = isAdmin ? "/dev/nvme0" : `/dev/nvme0n${nsid}`;

  let cmd = `nvme ${subcmd} ${device} --opcode=0x${command.opcode.toString(16).padStart(2, "0")}`;

  for (let dw = 10; dw <= 15; dw++) {
    const val = encoded[dw];
    if (val !== undefined && val !== 0) {
      cmd += ` --cdw${dw}=0x${val.toString(16).padStart(8, "0")}`;
    }
  }

  return { command: cmd, isKernelOnly: false, note: null };
}
