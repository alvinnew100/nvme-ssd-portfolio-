import Link from "next/link";
import { DecodedCommand } from "@/lib/nvme/types";

interface TraceOutputProps {
  results: DecodedCommand[];
  error: string | null;
}

export default function TraceOutput({ results, error }: TraceOutputProps) {
  if (error) {
    return (
      <div className="bg-nvme-red/10 border border-nvme-red/40 rounded-lg p-4 text-nvme-red text-sm">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-warm-500 text-center py-8">
        Decoded commands will appear here. Try loading a sample trace or paste
        your own ftrace output above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-warm-400 mb-2">
        Decoded {results.length} command{results.length !== 1 ? "s" : ""}
      </div>
      {results.map((decoded, i) => (
        <div
          key={i}
          className="bg-nvme-dark rounded-lg border border-warm-800 overflow-hidden"
        >
          {/* Raw line */}
          <div className="px-4 py-2 bg-nvme-darker border-b border-warm-800 overflow-x-auto">
            <code className="text-xs text-warm-500 whitespace-nowrap">
              {decoded.raw}
            </code>
          </div>

          {/* Decoded header */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-nvme-accent">
                0x{decoded.opcode.toString(16).padStart(2, "0")}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  decoded.type === "admin"
                    ? "bg-nvme-blue/20 text-nvme-accent"
                    : "bg-nvme-green/20 text-nvme-green"
                }`}
              >
                {decoded.type === "admin" ? "Admin" : "I/O"}
              </span>
              {decoded.commandId ? (
                <Link
                  href={`/commands/${decoded.commandId}`}
                  className="text-warm-50 font-semibold hover:text-nvme-accent transition-colors"
                  prefetch={false}
                >
                  {decoded.commandName}
                </Link>
              ) : (
                <span className="text-warm-50 font-semibold">
                  {decoded.commandName}
                </span>
              )}
              <span className="text-xs text-warm-500">
                qid={decoded.qid} nsid={decoded.nsid}
              </span>
            </div>

            {/* Decoded fields */}
            {decoded.fields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {decoded.fields.map((f) => (
                  <div
                    key={f.name}
                    className="bg-nvme-darker rounded px-3 py-2"
                  >
                    <div className="text-xs text-warm-500">{f.name}</div>
                    <div className="text-sm text-warm-50 font-mono">
                      {f.hex}{" "}
                      <span className="text-warm-500">({f.value})</span>
                    </div>
                    {f.valueMeaning && (
                      <div className="text-xs text-nvme-accent mt-0.5">
                        {f.valueMeaning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CDW hex values */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono text-warm-600">
              <span>cdw10=0x{decoded.cdw10.toString(16).padStart(8, "0")}</span>
              <span>cdw11=0x{decoded.cdw11.toString(16).padStart(8, "0")}</span>
              <span>cdw12=0x{decoded.cdw12.toString(16).padStart(8, "0")}</span>
              <span>cdw13=0x{decoded.cdw13.toString(16).padStart(8, "0")}</span>
              <span>cdw14=0x{decoded.cdw14.toString(16).padStart(8, "0")}</span>
              <span>cdw15=0x{decoded.cdw15.toString(16).padStart(8, "0")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
