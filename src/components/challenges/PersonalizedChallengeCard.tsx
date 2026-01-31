import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Bot, 
  Video, 
  Image, 
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import { cn, formatEstimatedTime } from "@/lib/utils";
import type { DailyChallenge } from "@/hooks/useDailyChallenges";
import type { Track } from "@/hooks/useUserProfile";

const trackConfig: Record<Track, { icon: React.ElementType; label: string; color: string }> = {
  agentes: { icon: Bot, label: "Agentes de IA", color: "text-blue-500" },
  videos: { icon: Video, label: "Vídeos com IA", color: "text-purple-500" },
  fotos: { icon: Image, label: "Imagens com IA", color: "text-pink-500" },
  crescimento: { icon: TrendingUp, label: "Crescimento", color: "text-green-500" },
  propostas: { icon: FileText, label: "Propostas", color: "text-amber-500" },
};

interface PersonalizedChallengeCardProps {
  challenge: DailyChallenge;
  isBonus?: boolean;
}

export function PersonalizedChallengeCard({ challenge, isBonus = false }: PersonalizedChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const trackInfo = trackConfig[challenge.track as Track] || trackConfig.agentes;
  const TrackIcon = trackInfo.icon;

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const progress = challenge.checklist.length > 0 
    ? Math.round((checkedItems.size / challenge.checklist.length) * 100) 
    : 0;

  return (
    <Card className={cn(
      "overflow-hidden border transition-all",
      isBonus 
        ? "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30" 
        : "bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent border-primary/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isBonus ? (
                <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">
                  ⭐ BÔNUS DA SEMANA
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <TrackIcon className={cn("h-3 w-3", trackInfo.color)} />
                  {trackInfo.label}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatEstimatedTime(challenge.estimated_minutes, challenge.estimated_time_unit)}
              </Badge>
            </div>
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Objective */}
        <div className="flex items-start gap-2">
          <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">{challenge.objective}</p>
        </div>

        {isExpanded && (
          <>
            {/* Steps */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Passos
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pl-2">
                {challenge.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Deliverable */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-1">📦 Entregável</h4>
              <p className="text-sm text-muted-foreground">{challenge.deliverable}</p>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">✅ Checklist</h4>
              <div className="space-y-2">
                {challenge.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox 
                      id={`check-${challenge.id}-${index}`}
                      checked={checkedItems.has(index)}
                      onCheckedChange={() => toggleCheck(index)}
                    />
                    <label 
                      htmlFor={`check-${challenge.id}-${index}`}
                      className={cn(
                        "text-sm cursor-pointer",
                        checkedItems.has(index) && "line-through text-muted-foreground"
                      )}
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            {challenge.checklist.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      isBonus ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {!isExpanded && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(true)}
            className="w-full"
          >
            Ver detalhes do desafio
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
