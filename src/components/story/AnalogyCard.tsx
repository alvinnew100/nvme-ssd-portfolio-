interface AnalogyCardProps {
  concept: string;
  analogy: string;
}

export default function AnalogyCard({ concept, analogy }: AnalogyCardProps) {
  return (
    <div data-vo="analogy" className="bg-nvme-green/5 border border-nvme-green/20 rounded-xl p-5 my-6">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nvme-green/10 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-nvme-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-text-primary font-semibold text-sm mb-1">
            {concept}
          </div>
          <p className="text-text-secondary text-sm leading-relaxed italic">
            {analogy}
          </p>
        </div>
      </div>
    </div>
  );
}
