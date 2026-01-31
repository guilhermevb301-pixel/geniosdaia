import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { cn } from "@/lib/utils";

// Mapeamento de objetivos para tags
const OBJECTIVE_TAGS: Record<string, string[]> = {
  criar_agente: ["agentes", "n8n", "automacao", "ia"],
  vender_projeto: ["vendas", "comercial", "propostas"],
  fechar_clientes: ["prospecao", "clientes", "vendas"],
  vender_fechar_combo: ["vendas", "prospecao", "comercial"],
  criar_proposta: ["propostas", "comercial", "vendas"],
  viralizar: ["crescimento", "redes", "marketing"],
  conteudo_vende: ["conteudo", "marketing", "vendas"],
  agentes_viralizar_combo: ["agentes", "crescimento", "marketing", "automacao"],
  agentes_fechar_viralizar_combo: ["agentes", "vendas", "crescimento", "automacao"],
  infra_agente: ["infra", "n8n", "vps", "baserow", "whatsapp"],
  criar_videos: ["videos", "producao"],
  videos_viralizar_combo: ["videos", "crescimento", "marketing"],
  criar_fotos: ["fotos", "producao"],
  fotos_portfolio: ["fotos", "portfolio", "vendas"]
};

interface RecommendedChallengesProps {
  selectedObjectives: string[];
  allChallenges: DailyChallenge[];
  isLoading?: boolean;
}

export function RecommendedChallenges({ 
  selectedObjectives, 
  allChallenges,
  isLoading 
}: RecommendedChallengesProps) {
  // Calcular tags relevantes baseadas nos objetivos selecionados
  const relevantTags = selectedObjectives.flatMap(o => OBJECTIVE_TAGS[o] || []);
  const uniqueTags = [...new Set(relevantTags)];

  // Filtrar desafios que correspondem às tags
  const filteredChallenges = allChallenges.filter(challenge => {
    // Match por track
    if (uniqueTags.some(tag => challenge.track?.toLowerCase().includes(tag))) {
      return true;
    }
    // Match por título
    if (uniqueTags.some(tag => challenge.title?.toLowerCase().includes(tag))) {
      return true;
    }
    return false;
  });

  // Estado vazio
  if (selectedObjectives.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-semibold text-lg mb-2">Desafios Recomendados Para Você</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Marque seus objetivos acima para ver desafios personalizados baseados no que você quer alcançar.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sem desafios correspondentes
  if (filteredChallenges.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Desafios Recomendados Para Você
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Nenhum desafio encontrado para seus objetivos atuais. 
            Novos desafios serão adicionados em breve!
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {uniqueTags.slice(0, 6).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Desafios Recomendados Para Você
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Baseado nos seus objetivos: {uniqueTags.slice(0, 4).join(", ")}
          {uniqueTags.length > 4 && ` +${uniqueTags.length - 4}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredChallenges.map((challenge) => (
          <RecommendedChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </CardContent>
    </Card>
  );
}

function RecommendedChallengeCard({ challenge }: { challenge: DailyChallenge }) {
  const difficultyColors: Record<string, string> = {
    iniciante: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediario: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    avancado: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors",
      challenge.is_bonus && "border-amber-500/30 bg-amber-500/5"
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {challenge.is_bonus && (
              <Badge className="bg-amber-500 text-amber-950 text-xs">
                BÔNUS
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={cn("text-xs", difficultyColors[challenge.difficulty] || difficultyColors.intermediario)}
            >
              {challenge.difficulty === "iniciante" ? "Iniciante" : 
               challenge.difficulty === "avancado" ? "Avançado" : "Intermediário"}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {challenge.track}
            </Badge>
          </div>
          <h4 className="font-semibold text-sm">{challenge.title}</h4>
        </div>
        {challenge.estimated_minutes && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            {challenge.estimated_minutes}min
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-3">{challenge.objective}</p>

      {/* Checklist preview */}
      {challenge.checklist && challenge.checklist.length > 0 && (
        <div className="space-y-1">
          {challenge.checklist.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-primary/50" />
              <span className="line-clamp-1">{item}</span>
            </div>
          ))}
          {challenge.checklist.length > 3 && (
            <p className="text-xs text-muted-foreground pl-5">
              +{challenge.checklist.length - 3} itens
            </p>
          )}
        </div>
      )}
    </div>
  );
}
