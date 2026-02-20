interface InfoCardProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "tip" | "note";
  title?: string;
}

const variants = {
  info: {
    border: "border-l-nvme-blue",
    bg: "bg-nvme-blue/5",
    icon: "i",
    iconBg: "bg-nvme-blue/10 text-nvme-blue",
  },
  warning: {
    border: "border-l-nvme-amber",
    bg: "bg-nvme-amber/5",
    icon: "!",
    iconBg: "bg-nvme-amber/10 text-nvme-amber",
  },
  tip: {
    border: "border-l-nvme-green",
    bg: "bg-nvme-green/5",
    icon: "*",
    iconBg: "bg-nvme-green/10 text-nvme-green",
  },
  note: {
    border: "border-l-nvme-violet",
    bg: "bg-nvme-violet/5",
    icon: "#",
    iconBg: "bg-nvme-violet/10 text-nvme-violet",
  },
};

export default function InfoCard({
  children,
  variant = "info",
  title,
}: InfoCardProps) {
  const v = variants[variant];
  return (
    <div className={`rounded-xl border-l-4 ${v.border} ${v.bg} p-5`}>
      <div className="flex gap-3">
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full ${v.iconBg} flex items-center justify-center text-xs font-bold`}
        >
          {v.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-text-primary font-semibold text-sm mb-1">
              {title}
            </div>
          )}
          <div className="text-text-secondary text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
