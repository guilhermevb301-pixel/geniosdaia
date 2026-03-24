import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronUp, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { LEVEL_NAMES } from "@/lib/gamification";
import { ChallengeSubmission } from "@/hooks/useChallenges";
import { PositionBadge } from "./PositionBadge";
import { formatRelativeDate, getAvatarColor } from "./challenge-utils";

export function SubmissionCard({
  submission,
  position,
  onVote,
  hasVoted,
}: {
  submission: ChallengeSubmission;
  position: number;
  onVote: (id: string) => void;
  hasVoted: boolean;
}) {
  const level = 3;
  const levelName = LEVEL_NAMES[level] || "Aprendiz";

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-card border-border",
      position <= 3 && "ring-1 ring-primary/20"
    )}>
      <PositionBadge position={position} />

      <div className="bg-muted h-32 flex items-center justify-center">
        {submission.image_url ? (
          <ImageWithSkeleton
            src={submission.image_url}
            alt={submission.title}
            containerClassName="w-full h-full"
            optimizedWidth={400}
          />
        ) : (
          <Bot className="h-12 w-12 text-muted-foreground/50" />
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(submission.user_id))}>
              {submission.title.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Autor #{submission.user_id.substring(0, 4)}</p>
            <p className="text-xs text-muted-foreground">Nível {level} - {levelName}</p>
          </div>
        </div>

        <h4 className="font-semibold text-sm mb-1 line-clamp-1">{submission.title}</h4>

        {submission.track && (
          <Badge variant="secondary" className="text-xs mb-3">
            {submission.track}
          </Badge>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(submission.id)}
            className={cn(
              "gap-1 transition-all bg-muted hover:bg-muted/80",
              hasVoted && "bg-primary/20 hover:bg-primary/30 text-primary"
            )}
          >
            <ChevronUp className={cn("h-4 w-4", hasVoted && "animate-pulse")} />
            {submission.votes_count}
          </Button>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(submission.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
