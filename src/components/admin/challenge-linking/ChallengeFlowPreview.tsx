import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowChallenge {
  id: string;
  title: string;
  is_initial_active: boolean;
  predecessor_challenge_id: string | null;
}

interface ChallengeFlowPreviewProps {
  challenges: FlowChallenge[];
}

export function ChallengeFlowPreview({ challenges }: ChallengeFlowPreviewProps) {
  if (challenges.length === 0) return null;

  const initialChallenges = challenges.filter((c) => c.is_initial_active);
  const sequentialChallenges = challenges.filter((c) => !c.is_initial_active);

  // Build flow lines
  const flowLines: { from: string; to: string }[] = [];
  sequentialChallenges.forEach((challenge) => {
    if (challenge.predecessor_challenge_id) {
      const predecessor = challenges.find(
        (c) => c.id === challenge.predecessor_challenge_id
      );
      if (predecessor) {
        flowLines.push({
          from: predecessor.title,
          to: challenge.title,
        });
      }
    }
  });

  // Find orphaned challenges (non-initial without predecessor)
  const orphaned = sequentialChallenges.filter(
    (c) => !c.predecessor_challenge_id
  );

  if (initialChallenges.length === 0 && flowLines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Preview do Fluxo
      </p>

      <div className="space-y-1.5">
        {/* Initial challenges */}
        {initialChallenges.map((challenge) => (
          <div key={challenge.id} className="flex items-center gap-2 text-sm">
            <Play className="h-3 w-3 text-primary fill-primary" />
            <span className="font-medium truncate">{challenge.title}</span>
            <span className="text-xs text-muted-foreground">(início)</span>
          </div>
        ))}

        {/* Flow lines */}
        {flowLines.map((line, index) => (
          <div key={index} className="flex items-center gap-2 text-sm pl-2">
            <span className="truncate max-w-[120px] text-muted-foreground">
              {line.from}
            </span>
            <ArrowRight className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate font-medium">{line.to}</span>
          </div>
        ))}

        {/* Orphaned warnings */}
        {orphaned.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed">
            <p className="text-xs text-amber-600 flex items-center gap-1">
              ⚠️ Desafios sem predecessor definido:
            </p>
            {orphaned.map((c) => (
              <p
                key={c.id}
                className="text-xs text-amber-600 pl-4 truncate"
              >
                • {c.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
