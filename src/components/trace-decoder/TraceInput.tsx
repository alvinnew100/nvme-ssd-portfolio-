"use client";

export interface TraceInputProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onLoadSample?: (name: string) => void;
}

const samples = [
  { name: "basic-read-write", label: "Basic Read/Write" },
  { name: "admin-commands", label: "Admin Commands" },
  { name: "mixed-workload", label: "Mixed Workload" },
];

export default function TraceInput({
  value,
  onChange,
  onClear,
  onLoadSample,
}: TraceInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-text-secondary">
          Paste ftrace output
        </label>
        <div className="flex gap-2">
          {onLoadSample &&
            samples.map((s) => (
              <button
                key={s.name}
                onClick={() => onLoadSample(s.name)}
                className="text-xs px-2 py-1 bg-story-panel rounded text-text-muted hover:text-text-primary transition-colors"
              >
                {s.label}
              </button>
            ))}
          {value && (
            <button
              onClick={onClear}
              className="text-xs px-2 py-1 bg-nvme-red/20 rounded text-nvme-red hover:text-nvme-red/80 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paste NVMe ftrace output here...

Example:
 kworker/0:1H-312   [000] ....  1234.567890: nvme_setup_cmd: nvme0n1: qid=1, cmdid=0, nsid=1, cdw10=0x00000000, cdw11=0x00000000, cdw12=0x000000ff, cdw13=0x00000000, cdw14=0x00000000, cdw15=0x00000000, opcode=0x01`}
        className="w-full h-48 px-4 py-3 bg-story-bg border border-story-border rounded-lg text-text-primary font-mono text-xs placeholder-text-muted focus:outline-none focus:border-nvme-green resize-y"
        spellCheck={false}
      />
    </div>
  );
}
