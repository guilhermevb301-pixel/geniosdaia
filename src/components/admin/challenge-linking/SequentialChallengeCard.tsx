import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Lock, Unlock } from "lucide-react";
import { formatEstimatedTimeShort } from "@/lib/utils";

interface SequentialChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    track: string;
    estimated_minutes: number | null;
    estimated_time_unit: string;
    predecessor_challenge_id: string | null;
  };
  possiblePredecessors: { id: string; title: string }[];
  onPredecessorChange: (challengeId: string, predecessorId: string | null) => void;
  onRemove: (id: string) => void;
}

export function SequentialChallengeCard({
  challenge,
  possiblePredecessors,
  onPredecessorChange,
  onRemove,
}: SequentialChallengeCardProps) {
  const hasPredecessor = !!challenge.predecessor_challenge_id;

  return (
    <div className="p-2 bg-background rounded-lg border space-y-2">
      <div className="flex items-center gap-2">
        {hasPredecessor ? (
          <Unlock className="h-4 w-4 text-emerald-500 shrink-0" />
        ) : (
          <Lock className="h-4 w-4 text-amber-500 shrink-0" />
        )}
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

      <div className="flex items-center gap-2 pl-6">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Libera quando completar:
        </span>
        <Select
          value={challenge.predecessor_challenge_id || "none"}
          onValueChange={(value) =>
            onPredecessorChange(challenge.id, value === "none" ? null : value)
          }
        >
          <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
            <SelectValue placeholder="Selecionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-amber-600">⚠️ Nenhum (ficará bloqueado)</span>
            </SelectItem>
            {possiblePredecessors.map((pred) => (
              <SelectItem key={pred.id} value={pred.id}>
                <span className="truncate">{pred.title}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
