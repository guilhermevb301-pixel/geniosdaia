import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Target } from "lucide-react";
import { formatEstimatedTimeShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  track: string;
  objective: string;
  difficulty: string;
  estimated_minutes: number | null;
  estimated_time_unit: string | null;
  is_bonus: boolean | null;
}

interface ChallengeSearchListProps {
  challenges: Challenge[];
  isLoading: boolean;
  searchQuery: string;
  onSelect: (challenge: Challenge) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "iniciante":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    case "intermediario":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "avancado":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "";
  }
};

export function ChallengeSearchList({
  challenges,
  isLoading,
  searchQuery,
  onSelect,
}: ChallengeSearchListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
        <Target className="h-12 w-12 mb-2 opacity-30" />
        <p>
          {searchQuery
            ? "Nenhum desafio encontrado"
            : "Todos os desafios já foram adicionados"}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="divide-y">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onSelect(challenge)}
          >
            <Checkbox checked={false} className="mt-1" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">
                {challenge.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {challenge.objective}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {challenge.track}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", getDifficultyColor(challenge.difficulty))}
                >
                  {challenge.difficulty}
                </Badge>
                {challenge.estimated_minutes && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatEstimatedTimeShort(
                      challenge.estimated_minutes,
                      (challenge.estimated_time_unit as "minutes" | "hours" | "days" | "weeks") || "minutes"
                    )}
                  </span>
                )}
                {challenge.is_bonus && (
                  <Badge className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Bônus
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
