import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function DifficultyStars({ level = 2 }: { level?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= level ? "text-accent fill-accent" : "text-muted-foreground"
          )}
        />
      ))}
      <span className="text-sm ml-1">
        {level === 1 ? "Iniciante" : level === 2 ? "Intermediário" : "Avançado"}
      </span>
    </div>
  );
}
