import { useState, useEffect, useCallback } from "react";
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
import { Link2, Clock, Target, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useDailyChallengesAdmin } from "@/hooks/useDailyChallengesAdmin";
import { formatEstimatedTimeShort } from "@/lib/utils";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { ObjectiveItem } from "@/hooks/useObjectives";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChallengeLinkingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectiveItem: ObjectiveItem | null;
}

interface SelectedChallenge {
  id: string;
  title: string;
  track: string;
  difficulty: string;
  estimated_minutes: number | null;
  estimated_time_unit: string;
  is_bonus: boolean;
  is_initial_active: boolean;
}

export function ChallengeLinkingModal({
  open,
  onOpenChange,
  objectiveItem,
}: ChallengeLinkingModalProps) {
  const { challenges: allDailyChallenges, isLoading: isLoadingChallenges } =
    useDailyChallengesAdmin();
  const { links, saveLinks, isSaving } = useObjectiveChallengeLinks(objectiveItem?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState<SelectedChallenge[]>([]);

  // Get active_slots from objective item
  const activeSlots = objectiveItem?.active_slots || 1;

  // Count how many are marked as initial active
  const initialActiveCount = selectedChallenges.filter((c) => c.is_initial_active).length;

  // Sync selected challenges when modal opens or links load
  useEffect(() => {
    if (open && links) {
      // Restore order from links
      const ordered = links
        .sort((a, b) => a.order_index - b.order_index)
        .map((link) => {
          const challenge = allDailyChallenges.find((c) => c.id === link.daily_challenge_id);
          if (!challenge) return null;
          return {
            id: challenge.id,
            title: challenge.title,
            track: challenge.track,
            difficulty: challenge.difficulty,
            estimated_minutes: challenge.estimated_minutes,
            estimated_time_unit: challenge.estimated_time_unit || "minutes",
            is_bonus: challenge.is_bonus || false,
            is_initial_active: link.is_initial_active || false,
          };
        })
        .filter(Boolean) as SelectedChallenge[];

      setSelectedChallenges(ordered);
    }
  }, [open, links, allDailyChallenges]);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Filter challenges by search (exclude already selected)
  const selectedIds = selectedChallenges.map((c) => c.id);
  const filteredChallenges = allDailyChallenges.filter((challenge) => {
    if (selectedIds.includes(challenge.id)) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      challenge.title.toLowerCase().includes(query) ||
      challenge.track.toLowerCase().includes(query) ||
      challenge.objective.toLowerCase().includes(query)
    );
  });

  const addChallenge = useCallback((challenge: typeof allDailyChallenges[0]) => {
    setSelectedChallenges((prev) => [
      ...prev,
      {
        id: challenge.id,
        title: challenge.title,
        track: challenge.track,
        difficulty: challenge.difficulty,
        estimated_minutes: challenge.estimated_minutes,
        estimated_time_unit: challenge.estimated_time_unit || "minutes",
        is_bonus: challenge.is_bonus || false,
        is_initial_active: false,
      },
    ]);
  }, []);

  const toggleInitialActive = useCallback((id: string) => {
    setSelectedChallenges((prev) => {
      const challenge = prev.find((c) => c.id === id);
      if (!challenge) return prev;

      // If already active, toggle off
      if (challenge.is_initial_active) {
        return prev.map((c) => (c.id === id ? { ...c, is_initial_active: false } : c));
      }

      // If trying to activate, check slot limit
      const currentActiveCount = prev.filter((c) => c.is_initial_active).length;
      // Get activeSlots from closure - we need to check against the limit
      return prev.map((c) => (c.id === id ? { ...c, is_initial_active: true } : c));
    });
  }, []);

  const removeChallenge = useCallback((id: string) => {
    setSelectedChallenges((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setSelectedChallenges((prev) => {
      const newArr = [...prev];
      [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
      return newArr;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setSelectedChallenges((prev) => {
      if (index === prev.length - 1) return prev;
      const newArr = [...prev];
      [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
      return newArr;
    });
  }, []);

  const handleSave = () => {
    if (!objectiveItem) return;

    saveLinks(
      {
        objectiveItemId: objectiveItem.id,
        challengeIds: selectedChallenges.map((c) => c.id),
      },
      {
        onSuccess: () => {
          toast.success(`${selectedChallenges.length} desafio(s) vinculado(s) com sucesso!`);
          onOpenChange(false);
        },
      }
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "intermediario":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
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
          {/* Selected challenges with ordering */}
          {selectedChallenges.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <GripVertical className="h-4 w-4" />
                Ordem de liberação ({selectedChallenges.length})
              </p>
              <div className="space-y-1 max-h-[200px] overflow-y-auto border rounded-lg p-2 bg-muted/30">
                {selectedChallenges.map((challenge, index) => (
                  <div
                    key={challenge.id}
                    className="flex items-center gap-2 p-2 bg-background rounded border"
                  >
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-primary/10 text-primary rounded">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{challenge.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {challenge.track}
                        </Badge>
                        {challenge.estimated_minutes && (
                          <span className="text-xs text-muted-foreground">
                            {formatEstimatedTimeShort(
                              challenge.estimated_minutes,
                              challenge.estimated_time_unit as "minutes" | "hours" | "days" | "weeks"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => moveDown(index)}
                        disabled={index === selectedChallenges.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeChallenge(challenge.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                O primeiro desafio é liberado imediatamente. Os demais são desbloqueados após completar o anterior.
              </p>
            </div>
          )}

          {/* Search */}
          <Input
            placeholder="Buscar desafios para adicionar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Available challenges */}
          <ScrollArea className="h-[300px] border rounded-lg">
            {isLoadingChallenges ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Target className="h-12 w-12 mb-2 opacity-30" />
                <p>
                  {searchQuery
                    ? "Nenhum desafio encontrado"
                    : "Todos os desafios já foram adicionados"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => addChallenge(challenge)}
                  >
                    <Checkbox
                      checked={false}
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
                          className={cn("text-xs", getDifficultyColor(challenge.difficulty))}
                        >
                          {challenge.difficulty}
                        </Badge>
                        {challenge.estimated_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatEstimatedTimeShort(
                              challenge.estimated_minutes,
                              challenge.estimated_time_unit as "minutes" | "hours" | "days" | "weeks"
                            )}
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
            {isSaving ? "Salvando..." : `Salvar (${selectedChallenges.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
