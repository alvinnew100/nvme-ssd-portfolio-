interface TermDefinitionProps {
  term: string;
  definition: string;
}

export default function TermDefinition({ term, definition }: TermDefinitionProps) {
  return (
    <span className="inline">
      <strong className="text-text-primary border-b border-dotted border-nvme-blue/40">
        {term}
      </strong>{" "}
      <span className="text-text-muted text-[0.85em]">({definition})</span>
    </span>
  );
}
