interface LessonObjectivesProps {
  objectives: string[];
}

export default function LessonObjectives({ objectives }: LessonObjectivesProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 -mt-12 mb-8">
      <div className="bg-story-card rounded-2xl p-6 card-shadow border border-nvme-blue/10">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-nvme-blue flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
            <circle cx="10" cy="10" r="3" />
          </svg>
          <h4 className="text-sm font-semibold text-nvme-blue font-mono uppercase tracking-wider">
            Learning Objectives
          </h4>
        </div>
        <ul className="space-y-2">
          {objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
              <span className="text-nvme-blue mt-1 flex-shrink-0">&#8226;</span>
              {obj}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
