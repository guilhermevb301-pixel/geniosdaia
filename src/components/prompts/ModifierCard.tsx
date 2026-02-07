import { Copy, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Variation {
  id: string;
  content: string;
  image_url: string | null; // Used as translation field for modifiers
  video_url: string | null;
  order_index: number;
}

interface Prompt {
  id: string;
  title: string;
  description: string | null;
  variations?: Variation[];
}

interface ModifierCardProps {
  prompt: Prompt;
  canManage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ModifierCard({ prompt, canManage, onEdit, onDelete }: ModifierCardProps) {
  const variations = prompt.variations?.sort((a, b) => a.order_index - b.order_index) || [];

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Prompt copiado!");
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with title and management buttons */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex-1">
          <h3 className="font-semibold text-base">{prompt.title}</h3>
          {prompt.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{prompt.description}</p>
          )}
        </div>
        {canManage && (
          <div className="flex gap-1 ml-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>

      {/* List of variations/prompts */}
      <div className="divide-y divide-border">
        {variations.length > 0 ? (
          variations.map((variation) => (
            <div
              key={variation.id}
              className="p-3 flex items-start gap-3 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm break-words">{variation.content}</p>
                {variation.image_url && (
                  <p className="text-muted-foreground text-sm mt-1">
                    → {variation.image_url}
                  </p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={() => handleCopy(variation.content)}
                title="Copiar prompt"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhum prompt adicionado
          </div>
        )}
      </div>
    </Card>
  );
}
