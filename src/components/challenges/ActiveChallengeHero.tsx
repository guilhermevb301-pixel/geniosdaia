import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Gift, FileText } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { DifficultyStars } from "./DifficultyStars";
import { getDifficultyLevel } from "./challenge-utils";
import { SubmitChallengeModal } from "./SubmitChallengeModal";

interface ActiveChallengeHeroProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    rules: string | null;
    xp_reward: number;
    end_date: string;
    difficulty?: string;
    reward_badge?: string | null;
    reward_highlight?: boolean;
  };
  submissionsCount: number;
  onSubmitSuccess: () => void;
  userTrack: string;
}

export function ActiveChallengeHero({ challenge, submissionsCount, onSubmitSuccess, userTrack }: ActiveChallengeHeroProps) {
  const [showRules, setShowRules] = useState(false);
  const difficulty = challenge.difficulty || "intermediario";
  const difficultyLevel = getDifficultyLevel(difficulty);

  return (
    <Card className="relative overflow-hidden border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />

      <CardContent className="relative p-6 sm:p-8 text-white">
        <Badge className="bg-success hover:bg-success text-success-foreground border-0 mb-4">
          DESAFIO DA SEMANA
        </Badge>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{challenge.title}</h2>
        <p className="text-foreground/80 mb-6 max-w-2xl">{challenge.description}</p>

        <div className="flex flex-wrap gap-6 sm:gap-10 mb-6">
          <div>
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Tempo Restante</p>
            <CountdownTimer endDate={challenge.end_date} />
          </div>

          <div className="text-center">
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Participantes</p>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white/80" />
              <span className="text-2xl font-bold">{submissionsCount}</span>
              <span className="text-sm text-white/60">inscritos</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">Dificuldade</p>
            <DifficultyStars level={difficultyLevel} />
          </div>
        </div>

        <div className="bg-background/10 backdrop-blur rounded-lg p-4 mb-6 inline-flex items-center gap-3">
          <Gift className="h-6 w-6 text-accent" />
          <span className="font-medium">
            Prêmio: <span className="text-accent">+{challenge.xp_reward} XP</span>
            {challenge.reward_badge && <> + Badge "{challenge.reward_badge}"</>}
            {challenge.reward_highlight && <> + Destaque</>}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <SubmitChallengeModal
            challengeId={challenge.id}
            defaultTrack={userTrack as "agentes" | "videos" | "fotos" | "crescimento" | "propostas"}
            onSuccess={onSubmitSuccess}
          />
          {challenge.rules && (
            <Button
              variant="outline"
              size="lg"
              className="border-border/50 hover:bg-muted/20"
              onClick={() => setShowRules(!showRules)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Regras Completas
            </Button>
          )}
        </div>

        {showRules && challenge.rules && (
          <Dialog open={showRules} onOpenChange={setShowRules}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Regras do Desafio</DialogTitle>
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert">
                <p className="whitespace-pre-line">{challenge.rules}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
