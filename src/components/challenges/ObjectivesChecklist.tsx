import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Lightbulb, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useObjectives } from "@/hooks/useObjectives";

interface ObjectivesChecklistProps {
  selectedObjectives: string[];
  onObjectivesChange: (objectives: string[]) => void;
}

export function ObjectivesChecklist({ 
  selectedObjectives, 
  onObjectivesChange 
}: ObjectivesChecklistProps) {
  const { objectiveGroups, isLoading, infraRequiredBy } = useObjectives();

  // IDs que requerem infra dinamicamente do banco
  const isInfraLocked = selectedObjectives.some(o => infraRequiredBy.includes(o));
  
  // IDs do grupo B que sugerem proposta
  const suggestsProposal = ["vender_projeto", "fechar_clientes", "vender_fechar_combo"];
  const showProposalSuggestion = 
    selectedObjectives.some(o => suggestsProposal.includes(o)) &&
    !selectedObjectives.includes("criar_proposta");

  const toggleObjective = useCallback((id: string, requiresInfra: boolean, isInfra: boolean) => {
    let newSelection: string[];

    if (selectedObjectives.includes(id)) {
      // Desmarcando
      // Se for infra e está bloqueada, não permite desmarcar
      if (isInfra && isInfraLocked) {
        return;
      }
      newSelection = selectedObjectives.filter(o => o !== id);
    } else {
      // Marcando
      newSelection = [...selectedObjectives, id];
      
      // Se marcou algo que requer infra, adiciona infra automaticamente
      if (requiresInfra && !newSelection.includes("infra_agente")) {
        newSelection.push("infra_agente");
      }
    }

    onObjectivesChange(newSelection);
  }, [selectedObjectives, onObjectivesChange, isInfraLocked]);

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-card">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-64" />
              <div className="space-y-2 pl-1">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Defina Seus Objetivos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
            Marque seus objetivos para receber desafios personalizados
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {objectiveGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground/90">{group.title}</h4>
              <div className="space-y-2 pl-1">
                {group.items.map((item) => {
                  const isChecked = selectedObjectives.includes(item.objective_key);
                  const isLocked = item.is_infra && isInfraLocked;

                  return (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer",
                        isChecked 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-muted/30 border border-transparent hover:bg-muted/50",
                        isLocked && "cursor-not-allowed opacity-70"
                      )}
                      onClick={() => !isLocked && toggleObjective(item.objective_key, item.requires_infra, item.is_infra)}
                    >
                      <Checkbox 
                        id={item.objective_key}
                        checked={isChecked}
                        disabled={isLocked}
                        className="mt-0.5"
                        onCheckedChange={() => !isLocked && toggleObjective(item.objective_key, item.requires_infra, item.is_infra)}
                      />
                      <div className="flex-1 min-w-0">
                        <label 
                          htmlFor={item.objective_key} 
                          className={cn(
                            "text-sm cursor-pointer block",
                            isChecked && "font-medium",
                            isLocked && "cursor-not-allowed"
                          )}
                        >
                          {item.label}
                        </label>
                        {item.is_infra && isLocked && (
                          <div className="flex items-center gap-1 mt-1">
                            <Lock className="h-3 w-3 text-primary" />
                            <span className="text-xs text-primary">
                              Obrigatório enquanto "Criar Agente" estiver marcado
                            </span>
                          </div>
                        )}
                      </div>
                      {item.is_infra && !isLocked && isChecked && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          PRÉ-REQUISITO
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sugestão de proposta */}
          {showProposalSuggestion && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-500">
                  Dica: Recomendamos marcar "Criar proposta que vende"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você marcou objetivos de venda. Uma proposta bem estruturada aumenta suas chances de fechar negócios!
                </p>
              </div>
            </div>
          )}

          {selectedObjectives.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">Marque seus objetivos acima para personalizar seus desafios</p>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
