import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Pencil, RotateCcw } from "lucide-react";
import { useObjectives } from "@/hooks/useObjectives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ObjectivesSummaryProps {
  selectedObjectives: string[];
  onEdit: () => void;
  onResetObjective?: (objectiveItemId: string) => void;
}

export function ObjectivesSummary({
  selectedObjectives,
  onEdit,
  onResetObjective,
}: ObjectivesSummaryProps) {
  const { objectives, isLoading } = useObjectives();
  const [resetTarget, setResetTarget] = useState<{ id: string; label: string } | null>(null);

  // Get selected items
  const selectedItems = objectives.filter((item) =>
    selectedObjectives.includes(item.objective_key)
  );

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-3" />
        <div className="flex gap-2">
          <div className="h-6 w-32 bg-muted rounded-full" />
          <div className="h-6 w-40 bg-muted rounded-full" />
        </div>
      </Card>
    );
  }

  // Empty state - prompt to define objectives
  if (selectedItems.length === 0) {
    return (
      <Card
        className="p-4 border-dashed border-primary/50 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onEdit}
      >
        <div className="flex items-center justify-center gap-2 text-primary py-2">
          <Target className="h-5 w-5" />
          <span className="font-medium">Clique para definir seus objetivos</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-medium">
              Seus Objetivos ({selectedItems.length})
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="py-1.5 pr-1.5 flex items-center gap-1"
            >
              {item.label}
              {onResetObjective && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setResetTarget({ id: item.id, label: item.label });
                  }}
                  className="ml-1 p-0.5 rounded hover:bg-destructive/20 transition-colors"
                  title="Reiniciar progresso deste objetivo"
                >
                  <RotateCcw className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </Card>

      <AlertDialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar objetivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Todo seu progresso em "{resetTarget?.label}" será apagado e os desafios voltarão ao início. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (resetTarget) {
                  onResetObjective?.(resetTarget.id);
                  setResetTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
