import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { LEVEL_NAMES } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface YourChallengesBannerProps {
  userTrack: string;
  userLevel: number;
  recommendedCount: number;
  selectedObjectivesCount: number;
  onScrollToObjectives?: () => void;
}

export function YourChallengesBanner({
  userTrack,
  userLevel,
  recommendedCount,
  selectedObjectivesCount,
  onScrollToObjectives,
}: YourChallengesBannerProps) {
  const levelName = LEVEL_NAMES[userLevel] || "Aprendiz";
  
  const trackLabels: Record<string, string> = {
    agentes: "Agentes de IA",
    videos: "Criação de Vídeos",
    fotos: "Fotografia Profissional",
    crescimento: "Crescimento Digital",
    propostas: "Propostas Comerciais",
  };

  const trackLabel = trackLabels[userTrack] || "Geral";

  return (
    <Card className="relative overflow-hidden border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-indigo-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="relative p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-accent hover:bg-accent text-accent-foreground border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                PERSONALIZADO PARA VOCÊ
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">Seus Desafios</h2>
            
            <p className="text-foreground/80 max-w-xl">
              {selectedObjectivesCount > 0 
                ? `Baseado nos seus ${selectedObjectivesCount} objetivos selecionados, encontramos desafios perfeitos para sua jornada.`
                : "Defina seus objetivos abaixo para receber desafios personalizados para sua jornada."}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-background/10 backdrop-blur px-3 py-2 rounded-lg">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  Trilha: <span className="font-medium">{trackLabel}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 bg-background/10 backdrop-blur px-3 py-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  Nível {userLevel}: <span className="font-medium">{levelName}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 min-w-[180px]">
            <div className={cn(
              "text-center p-6 rounded-2xl backdrop-blur",
              recommendedCount > 0 ? "bg-accent/20" : "bg-background/10"
            )}>
              <div className="text-4xl font-bold text-accent">
                {recommendedCount}
              </div>
              <div className="text-sm text-foreground/80">
                desafios para você
              </div>
            </div>

            {selectedObjectivesCount === 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onScrollToObjectives}
                className="gap-2"
              >
                Definir Objetivos
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
