import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVEL_NAMES } from "@/lib/gamification";
import { ChallengeSubmission } from "@/hooks/useChallenges";
import { getAvatarColor } from "./challenge-utils";

export function RankingRow({
  submission,
  position,
}: {
  submission: ChallengeSubmission;
  position: number;
}) {
  const level = Math.min(position + 2, 6);
  const levelName = LEVEL_NAMES[level] || "Aprendiz";

  const positionStyles: Record<number, string> = {
    1: "bg-amber-500 text-amber-950",
    2: "bg-gray-400 text-gray-900",
    3: "bg-amber-700 text-amber-100",
  };

  const rowBgStyles: Record<number, string> = {
    1: "bg-amber-500/10 border-l-4 border-l-amber-500",
    2: "bg-gray-500/10 border-l-4 border-l-gray-400",
    3: "bg-amber-700/10 border-l-4 border-l-amber-700",
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg transition-colors",
      position <= 3 ? rowBgStyles[position] : "hover:bg-muted/30"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
        position <= 3 ? positionStyles[position] : "bg-muted text-muted-foreground"
      )}>
        {position === 1 && <Crown className="h-4 w-4" />}
        {position > 1 && position}
      </div>

      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(submission.user_id))}>
          {submission.title.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{submission.title}</p>
        <p className="text-sm text-muted-foreground">Nível {level} - {levelName}</p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-primary">{submission.votes_count}</p>
        <p className="text-xs text-muted-foreground">votos</p>
      </div>
    </div>
  );
}
