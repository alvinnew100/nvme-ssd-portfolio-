interface LessonDividerProps {
  lesson: number;
  title: string;
  id: string;
}

export default function LessonDivider({ lesson, title, id }: LessonDividerProps) {
  return (
    <div id={id} className="relative py-24 scroll-mt-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-story-border" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-story-bg px-8 text-center">
          <div className="text-nvme-blue text-xs font-mono tracking-[0.3em] uppercase mb-2 font-medium">
            Lesson {lesson}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
