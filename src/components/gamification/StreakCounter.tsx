import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

export function StreakCounter({ streak, size = "md" }: StreakCounterProps) {
  const isActive = streak > 0;
  
  const sizeClasses = {
    sm: { icon: "h-4 w-4", text: "text-sm", container: "gap-1" },
    md: { icon: "h-5 w-5", text: "text-base", container: "gap-1.5" },
    lg: { icon: "h-6 w-6", text: "text-lg", container: "gap-2" },
  };

  return (
    <div 
      className={cn(
        "flex items-center",
        sizeClasses[size].container
      )}
    >
      <Flame 
        className={cn(
          sizeClasses[size].icon,
          isActive 
            ? "text-orange-500 fill-orange-500 animate-pulse" 
            : "text-muted-foreground"
        )} 
      />
      <span 
        className={cn(
          "font-bold",
          sizeClasses[size].text,
          isActive ? "text-orange-500" : "text-muted-foreground"
        )}
      >
        {streak}
      </span>
    </div>
  );
}
