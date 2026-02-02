import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Pencil } from "lucide-react";
import { useObjectives, ObjectiveItem } from "@/hooks/useObjectives";

interface ObjectivesSummaryProps {
  selectedObjectives: string[];
  onEdit: () => void;
}

export function ObjectivesSummary({
  selectedObjectives,
  onEdit,
}: ObjectivesSummaryProps) {
  const { objectives, isLoading } = useObjectives();

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
          <Badge key={item.id} variant="secondary" className="py-1.5">
            {item.label}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
