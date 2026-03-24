import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { ChallengeSubmission } from "@/hooks/useChallenges";
import { RankingRow } from "./RankingRow";

export function ChallengeRanking({ submissions }: { submissions: ChallengeSubmission[] }) {
  const topSubmissions = submissions.slice(0, 10);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        Ranking do Desafio (Top 10)
      </h3>

      {topSubmissions.length > 0 ? (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-2">
              {topSubmissions.map((submission, index) => (
                <RankingRow
                  key={submission.id}
                  submission={submission}
                  position={index + 1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Crown className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Ranking vazio. Participe do desafio!</p>
        </Card>
      )}
    </div>
  );
}
