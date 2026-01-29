import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface XPBarProps {
  currentXP: number;
  xpForNextLevel: number;
  progress: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function XPBar({ 
  currentXP, 
  xpForNextLevel, 
  progress, 
  size = "md",
  showLabel = true 
}: XPBarProps) {
  return (
    <div className="w-full">
      <Progress 
        value={progress} 
        className={cn(
          "bg-muted",
          size === "sm" ? "h-1.5" : "h-2"
        )} 
      />
      {showLabel && (
        <p className="text-xs text-muted-foreground mt-1">
          {currentXP} / {xpForNextLevel} XP
        </p>
      )}
    </div>
  );
}
