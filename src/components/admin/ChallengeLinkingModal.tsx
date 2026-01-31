import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link2, Clock, Target } from "lucide-react";
import { useDailyChallengesAdmin } from "@/hooks/useDailyChallengesAdmin";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { ObjectiveItem } from "@/hooks/useObjectives";
import { toast } from "sonner";

interface ChallengeLinkingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectiveItem: ObjectiveItem | null;
}

export function ChallengeLinkingModal({
  open,
  onOpenChange,
  objectiveItem,
}: ChallengeLinkingModalProps) {
  const { challenges: allDailyChallenges, isLoading: isLoadingChallenges } =
    useDailyChallengesAdmin();
  const { linkedChallengeIds, saveLinks, isSaving } = useObjectiveChallengeLinks(
    objectiveItem?.id
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sync selected IDs when modal opens or linked challenges load
  useEffect(() => {
    if (open && linkedChallengeIds) {
      setSelectedIds(linkedChallengeIds);
    }
  }, [open, linkedChallengeIds]);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Filter challenges by search
  const filteredChallenges = allDailyChallenges.filter((challenge) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      challenge.title.toLowerCase().includes(query) ||
      challenge.track.toLowerCase().includes(query) ||
      challenge.objective.toLowerCase().includes(query)
    );
  });

  const toggleChallenge = (challengeId: string) => {
    setSelectedIds((prev) =>
      prev.includes(challengeId)
        ? prev.filter((id) => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleSave = () => {
    if (!objectiveItem) return;

    saveLinks(
      {
        objectiveItemId: objectiveItem.id,
        challengeIds: selectedIds,
      },
      {
        onSuccess: () => {
          toast.success(`${selectedIds.length} desafio(s) vinculado(s) com sucesso!`);
          onOpenChange(false);
        },
      }
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "intermediario":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "avancado":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Vincular Desafios ao Objetivo
          </DialogTitle>
          <DialogDescription className="truncate">
            {objectiveItem?.label}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-4 space-y-4">
          <Input
            placeholder="Buscar desafios por título, trilha ou objetivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {filteredChallenges.length} desafio(s) disponível(is)
            </span>
            <Badge variant="secondary">
              {selectedIds.length} selecionado(s)
            </Badge>
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            {isLoadingChallenges ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Target className="h-12 w-12 mb-2 opacity-30" />
                <p>Nenhum desafio encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedIds.includes(challenge.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => toggleChallenge(challenge.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(challenge.id)}
                      onCheckedChange={() => toggleChallenge(challenge.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight">
                        {challenge.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {challenge.objective}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {challenge.track}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDifficultyColor(
                            challenge.difficulty
                          )}`}
                        >
                          {challenge.difficulty}
                        </Badge>
                        {challenge.estimated_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {challenge.estimated_minutes}min
                          </span>
                        )}
                        {challenge.is_bonus && (
                          <Badge className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                            Bônus
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : `Salvar (${selectedIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
