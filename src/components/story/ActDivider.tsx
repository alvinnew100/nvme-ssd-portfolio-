interface ActDividerProps {
  act: number;
  title: string;
  id: string;
}

export default function ActDivider({ act, title, id }: ActDividerProps) {
  return (
    <div id={id} className="relative py-20 scroll-mt-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-story-border" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-story-bg px-8 text-center">
          <div className="text-nvme-violet text-xs font-mono tracking-[0.3em] uppercase mb-2">
            Act {act}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
