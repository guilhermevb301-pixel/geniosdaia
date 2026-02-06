import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Play } from "lucide-react";
import { formatEstimatedTimeShort } from "@/lib/utils";

interface InitialChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    track: string;
    estimated_minutes: number | null;
    estimated_time_unit: string;
  };
  onRemove: (id: string) => void;
}

export function InitialChallengeCard({
  challenge,
  onRemove,
}: InitialChallengeCardProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
      <Play className="h-4 w-4 text-primary fill-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{challenge.title}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {challenge.track}
          </Badge>
          {challenge.estimated_minutes && (
            <span className="text-xs text-muted-foreground">
              {formatEstimatedTimeShort(
                challenge.estimated_minutes,
                challenge.estimated_time_unit as "minutes" | "hours" | "days" | "weeks"
              )}
            </span>
          )}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(challenge.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
