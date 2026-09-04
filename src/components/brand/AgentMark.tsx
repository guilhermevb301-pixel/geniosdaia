import { cn } from "@/lib/utils";

type AgentMarkSize = "sm" | "md" | "lg";

interface AgentMarkProps {
  size?: AgentMarkSize;
  className?: string;
}

const sizeClasses: Record<AgentMarkSize, string> = {
  sm: "h-10 w-10 p-1.5",
  md: "h-14 w-14 p-2",
  lg: "h-20 w-20 p-2.5",
};

export function AgentMark({ size = "md", className }: AgentMarkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0b0d10]",
        sizeClasses[size],
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-white/10 pb-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-codex/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-claude/80" />
      </div>

      <div className="mt-2 space-y-1.5 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] leading-none text-primary">&gt;</span>
          <span className="h-1 flex-1 rounded-full bg-primary" />
        </div>
        <div className="flex items-center gap-1.5 pl-2.5">
          <span className="h-1 w-2/5 rounded-full bg-codex/55" />
          <span className="h-1 flex-1 rounded-full bg-claude/55" />
        </div>
        <div className="flex items-center gap-1.5 pl-2.5">
          <span className="h-1 flex-1 rounded-full bg-white/15" />
          <span className="h-2 w-1 bg-primary" />
        </div>
      </div>
    </div>
  );
}
