import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Target, Lock, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useObjectives, ObjectiveItem } from "@/hooks/useObjectives";

interface ObjectivesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedObjectives: string[];
  onConfirm: (objectives: string[]) => void;
}

export function ObjectivesModal({
  open,
  onOpenChange,
  selectedObjectives,
  onConfirm,
}: ObjectivesModalProps) {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedObjectives);
  const { objectiveGroups, infraRequiredBy, isLoading } = useObjectives();

  // Sync local selection when prop changes
  useEffect(() => {
    setLocalSelection(selectedObjectives);
  }, [selectedObjectives]);

  // Flatten all items (no grouping by A, B, C)
  const allItems = objectiveGroups.flatMap((g) => g.items);

  // Check if infra is locked (required by another selected objective)
  const isInfraLocked = localSelection.some((o) => infraRequiredBy.includes(o));

  // Check if we should suggest "criar_proposta"
  const salesObjectiveKeys = ["vender_projeto", "fechar_clientes", "vender_fechar_combo"];
  const showProposalSuggestion =
    localSelection.some((o) => salesObjectiveKeys.includes(o)) &&
    !localSelection.includes("criar_proposta");

  const toggleObjective = useCallback(
    (item: ObjectiveItem) => {
      const { objective_key, requires_infra, is_infra } = item;

      // If it's infra and locked, don't allow uncheck
      if (is_infra && isInfraLocked && localSelection.includes(objective_key)) {
        return;
      }

      let newSelection: string[];

      if (localSelection.includes(objective_key)) {
        // Unchecking
        newSelection = localSelection.filter((o) => o !== objective_key);
      } else {
        // Checking
        newSelection = [...localSelection, objective_key];

        // If requires infra, auto-add infra
        if (requires_infra && !newSelection.includes("infra_agente")) {
          newSelection.push("infra_agente");
        }
      }

      setLocalSelection(newSelection);
    },
    [localSelection, isInfraLocked]
  );

  const handleConfirm = () => {
    onConfirm(localSelection);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="text-center pb-2">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Target className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Qual é o seu objetivo?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Escolha um ou mais objetivos para personalizarmos seus desafios e sua jornada de
              aprendizado.
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[400px] pr-4 -mr-4">
          <div className="space-y-2 pr-4">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-lg bg-muted/50 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              allItems.map((item) => {
                const isChecked = localSelection.includes(item.objective_key);
                const isLocked = item.is_infra && isInfraLocked;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg transition-all cursor-pointer",
                      isChecked
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/30 border border-transparent hover:bg-muted/50",
                      isLocked && "cursor-not-allowed opacity-70"
                    )}
                    onClick={() => {
                      if (!isLocked) toggleObjective(item);
                    }}
                  >
                    <Checkbox
                      id={`modal-${item.objective_key}`}
                      checked={isChecked}
                      disabled={isLocked}
                      onCheckedChange={() => {
                        if (!isLocked) toggleObjective(item);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-sm block",
                          isChecked && "font-medium"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.is_infra && isLocked && (
                        <div className="flex items-center gap-1 mt-1">
                          <Lock className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary">Obrigatório</span>
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
              })
            )}
          </div>

          {/* Proposal suggestion */}
          {showProposalSuggestion && (
            <div className="flex items-start gap-3 p-4 mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-500">
                  Dica: Recomendamos marcar "Criar proposta que vende"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Uma proposta bem estruturada aumenta suas chances de fechar negócios!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t">
          <p className="text-xs text-muted-foreground sm:mr-auto">
            Você pode mudar seus objetivos depois
          </p>
          <Button
            onClick={handleConfirm}
            disabled={localSelection.length === 0}
            className="w-full sm:w-auto"
          >
            Confirmar Objetivos ({localSelection.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
