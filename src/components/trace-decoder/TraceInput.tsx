"use client";

interface TraceInputProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onLoadSample: (name: string) => void;
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
        <label className="text-sm font-medium text-warm-300">
          Paste ftrace output
        </label>
        <div className="flex gap-2">
          {samples.map((s) => (
            <button
              key={s.name}
              onClick={() => onLoadSample(s.name)}
              className="text-xs px-2 py-1 bg-nvme-gray rounded text-warm-400 hover:text-warm-50 transition-colors"
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
        className="w-full h-48 px-4 py-3 bg-nvme-dark border border-warm-700 rounded-lg text-warm-100 font-mono text-xs placeholder-warm-600 focus:outline-none focus:border-nvme-accent resize-y"
        spellCheck={false}
      />
    </div>
  );
}
