import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Trophy, Bot } from "lucide-react";
import { getWeekNumber } from "./challenge-utils";

function PastChallengeCard({
  challenge,
  weekNumber,
}: {
  challenge: { id: string; title: string; description: string; end_date: string };
  weekNumber: number;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="w-24 bg-muted flex-shrink-0 flex items-center justify-center">
          <Bot className="h-8 w-8 text-muted-foreground/50" />
        </div>

        <CardContent className="p-4 flex-1">
          <Badge variant="secondary" className="mb-2 text-xs">
            Semana {weekNumber}
          </Badge>
          <h4 className="font-medium text-sm line-clamp-1">{challenge.title}</h4>
          <div className="flex items-center gap-1 mt-2 text-xs text-accent">
            <Trophy className="h-3 w-3" />
            <span>Ver detalhes</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function PastChallenges({ challenges }: { challenges: { id: string; title: string; description: string; end_date: string }[] }) {
  if (challenges.length === 0) {
    return (
      <Card className="p-8 text-center">
        <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Nenhum desafio anterior ainda.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        Desafios Anteriores
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {challenges.map((challenge) => (
          <PastChallengeCard
            key={challenge.id}
            challenge={challenge}
            weekNumber={getWeekNumber(challenge.end_date)}
          />
        ))}
      </div>
    </div>
  );
}
