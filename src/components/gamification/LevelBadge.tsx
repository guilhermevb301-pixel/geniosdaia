import { Badge } from "@/components/ui/badge";
import { getLevelColor, getLevelBgColor } from "@/lib/gamification";

interface LevelBadgeProps {
  level: number;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, name, size = "md" }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge
      variant="outline"
      className={`
        ${sizeClasses[size]}
        ${getLevelColor(level)}
        ${getLevelBgColor(level)}
        border-current font-semibold
      `}
    >
      Nível {level} • {name}
    </Badge>
  );
}
