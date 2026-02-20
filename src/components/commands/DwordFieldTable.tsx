import { FieldDefinition } from "@/lib/nvme/types";
import { DWORD_COLORS } from "@/lib/nvme/constants";

interface DwordFieldTableProps {
  fields: FieldDefinition[];
}

export default function DwordFieldTable({ fields }: DwordFieldTableProps) {
  if (fields.length === 0) {
    return (
      <p className="text-text-muted italic">
        This command has no command-specific fields (CDW10-CDW15 are reserved).
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-story-border">
            <th className="text-left py-2 px-3 text-text-muted font-medium text-xs">
              Field
            </th>
            <th className="text-left py-2 px-3 text-text-muted font-medium text-xs">
              Dword
            </th>
            <th className="text-left py-2 px-3 text-text-muted font-medium text-xs">
              Bits
            </th>
            <th className="text-left py-2 px-3 text-text-muted font-medium text-xs">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => {
            const color = DWORD_COLORS[field.dword] ?? "#6b7280";
            return (
              <tr
                key={`${field.dword}-${field.name}`}
                className="border-b border-story-border/50 hover:bg-story-surface/50 transition-colors"
              >
                <td className="py-2 px-3">
                  <span
                    className="font-mono font-semibold"
                    style={{ color }}
                  >
                    {field.name}
                  </span>
                </td>
                <td className="py-2 px-3 text-text-secondary font-mono text-xs">
                  CDW{field.dword}
                </td>
                <td className="py-2 px-3 text-text-secondary font-mono text-xs">
                  [{field.bitEnd}:{field.bitStart}]
                </td>
                <td className="py-2 px-3 text-text-secondary text-xs">
                  {field.description}
                  {field.values && (
                    <div className="mt-1 space-y-0.5">
                      {Object.entries(field.values).map(([val, meaning]) => (
                        <div
                          key={val}
                          className="text-xs text-text-muted"
                        >
                          <span className="font-mono text-text-code">
                            {val}
                          </span>{" "}
                          = {meaning}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
