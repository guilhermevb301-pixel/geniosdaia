import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Target, Lightbulb, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Objetivos organizados por grupo
const OBJECTIVES_GROUPS = [
  {
    id: "grupo_a",
    title: "A) Quero construir meu Agente (produto)",
    items: [
      { 
        id: "criar_agente", 
        label: "Criar meu 1º Agente de IA do zero (rodando)", 
        requiresInfra: true 
      }
    ]
  },
  {
    id: "grupo_b",
    title: "B) Quero vender (dinheiro)",
    items: [
      { id: "vender_projeto", label: "Vender primeiro projeto de Agente de IA (pacotes + oferta)" },
      { id: "fechar_clientes", label: "Fechar clientes para Agentes (prospecção ativa + passiva)" },
      { id: "vender_fechar_combo", label: "Vender + Fechar clientes (combo)" },
      { id: "criar_proposta", label: "Criar proposta que vende (1 página + 3 pacotes)" }
    ]
  },
  {
    id: "grupo_c",
    title: "C) Quero crescer (audiência)",
    items: [
      { id: "viralizar", label: "Viralizar nas redes (posicionamento + ideias + consistência)" },
      { id: "conteudo_vende", label: "Criar conteúdo que vende (não só viral)" },
      { id: "agentes_viralizar_combo", label: "Criar Agentes + Viralizar (combo)", requiresInfra: true },
      { id: "agentes_fechar_viralizar_combo", label: "Criar Agentes + Fechar clientes + Viralizar (combo completo)", requiresInfra: true }
    ]
  },
  {
    id: "grupo_d",
    title: "D) Infra obrigatória (pré-requisito do Agente)",
    items: [
      { 
        id: "infra_agente", 
        label: "Infra do Agente: VPS + Baserow + n8n + credenciais + número/WhatsApp",
        isInfra: true
      }
    ]
  },
  {
    id: "grupo_e",
    title: "E) Ativos criativos",
    items: [
      { id: "criar_videos", label: "Criar vídeos incríveis (produção)" },
      { id: "videos_viralizar_combo", label: "Criar vídeos + Viralizar (combo)" },
      { id: "criar_fotos", label: "Criar fotos profissionais (produção)" },
      { id: "fotos_portfolio", label: "Fotos profissionais + portfólio pra vender serviço" }
    ]
  }
];

// IDs que requerem infra
const INFRA_REQUIRED_BY = ["criar_agente", "agentes_viralizar_combo", "agentes_fechar_viralizar_combo"];

// IDs do grupo B que sugerem proposta
const SUGGESTS_PROPOSAL = ["vender_projeto", "fechar_clientes", "vender_fechar_combo"];

interface ObjectivesChecklistProps {
  selectedObjectives: string[];
  onObjectivesChange: (objectives: string[]) => void;
}

export function ObjectivesChecklist({ 
  selectedObjectives, 
  onObjectivesChange 
}: ObjectivesChecklistProps) {
  const isInfraLocked = selectedObjectives.some(o => INFRA_REQUIRED_BY.includes(o));
  
  const showProposalSuggestion = 
    selectedObjectives.some(o => SUGGESTS_PROPOSAL.includes(o)) &&
    !selectedObjectives.includes("criar_proposta");

  const toggleObjective = useCallback((id: string) => {
    let newSelection: string[];

    if (selectedObjectives.includes(id)) {
      // Desmarcando
      // Se for infra e está bloqueada, não permite desmarcar
      if (id === "infra_agente" && isInfraLocked) {
        return;
      }
      newSelection = selectedObjectives.filter(o => o !== id);
    } else {
      // Marcando
      newSelection = [...selectedObjectives, id];
      
      // Se marcou algo que requer infra, adiciona infra automaticamente
      if (INFRA_REQUIRED_BY.includes(id) && !newSelection.includes("infra_agente")) {
        newSelection.push("infra_agente");
      }
    }

    onObjectivesChange(newSelection);
  }, [selectedObjectives, onObjectivesChange, isInfraLocked]);

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
        {OBJECTIVES_GROUPS.map((group) => (
          <div key={group.id} className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/90">{group.title}</h4>
            <div className="space-y-2 pl-1">
              {group.items.map((item) => {
                const isChecked = selectedObjectives.includes(item.id);
                const isLocked = item.id === "infra_agente" && isInfraLocked;
                const isInfraItem = (item as any).isInfra;

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
                    onClick={() => !isLocked && toggleObjective(item.id)}
                  >
                    <Checkbox 
                      id={item.id}
                      checked={isChecked}
                      disabled={isLocked}
                      className="mt-0.5"
                      onCheckedChange={() => !isLocked && toggleObjective(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <label 
                        htmlFor={item.id} 
                        className={cn(
                          "text-sm cursor-pointer block",
                          isChecked && "font-medium",
                          isLocked && "cursor-not-allowed"
                        )}
                      >
                        {item.label}
                      </label>
                      {isInfraItem && isLocked && (
                        <div className="flex items-center gap-1 mt-1">
                          <Lock className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary">
                            Obrigatório enquanto "Criar Agente" estiver marcado
                          </span>
                        </div>
                      )}
                    </div>
                    {isInfraItem && !isLocked && isChecked && (
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
