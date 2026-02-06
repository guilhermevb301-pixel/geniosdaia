import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link2, Play, ListOrdered, Search, AlertCircle } from "lucide-react";
import { useDailyChallengesAdmin } from "@/hooks/useDailyChallengesAdmin";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { ObjectiveItem } from "@/hooks/useObjectives";
import { toast } from "sonner";
import { InitialChallengeCard } from "./challenge-linking/InitialChallengeCard";
import { SequentialChallengeCard } from "./challenge-linking/SequentialChallengeCard";
import { ChallengeSearchList } from "./challenge-linking/ChallengeSearchList";
import { ChallengeFlowPreview } from "./challenge-linking/ChallengeFlowPreview";
import { SelectedChallenge, DailyChallenge } from "./challenge-linking/types";

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
  const { links, saveLinks, isSaving } = useObjectiveChallengeLinks(objectiveItem?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState<SelectedChallenge[]>([]);

  // Get active_slots from objective item
  const activeSlots = objectiveItem?.active_slots || 1;

  // Split challenges into initial and sequential
  const initialChallenges = selectedChallenges.filter((c) => c.is_initial_active);
  const sequentialChallenges = selectedChallenges.filter((c) => !c.is_initial_active);

  // Validation states
  const slotsUsed = initialChallenges.length;
  const slotsExceeded = slotsUsed > activeSlots;
  const orphanedChallenges = sequentialChallenges.filter(
    (c) => !c.predecessor_challenge_id
  );

  // Sync selected challenges when modal opens or links load
  useEffect(() => {
    if (open && links) {
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
            predecessor_challenge_id: link.predecessor_challenge_id || null,
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

  const addAsInitial = useCallback((challenge: DailyChallenge) => {
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
        is_initial_active: true,
        predecessor_challenge_id: null,
      },
    ]);
  }, []);

  const addAsSequential = useCallback((challenge: DailyChallenge) => {
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
        predecessor_challenge_id: null,
      },
    ]);
  }, []);

  const removeChallenge = useCallback((id: string) => {
    setSelectedChallenges((prev) => {
      // Also clear any references to this challenge as predecessor
      return prev
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          predecessor_challenge_id:
            c.predecessor_challenge_id === id ? null : c.predecessor_challenge_id,
        }));
    });
  }, []);

  const setPredecessor = useCallback(
    (id: string, predecessorId: string | null) => {
      setSelectedChallenges((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              predecessor_challenge_id: predecessorId,
            };
          }
          return c;
        })
      );
    },
    []
  );

  // Get possible predecessors for a challenge (all other selected challenges)
  const getPossiblePredecessors = useCallback(
    (currentId: string) => {
      return selectedChallenges
        .filter((c) => c.id !== currentId)
        .map((c) => ({ id: c.id, title: c.title }));
    },
    [selectedChallenges]
  );

  const handleSave = () => {
    if (!objectiveItem) return;

    // Validation
    if (slotsExceeded) {
      toast.error(`Máximo de ${activeSlots} desafio(s) inicial(is) permitido(s)`);
      return;
    }

    if (orphanedChallenges.length > 0) {
      toast.warning(
        `${orphanedChallenges.length} desafio(s) na sequência sem predecessor definido`
      );
    }

    // Get IDs of challenges marked as initial active
    const initialActiveIds = selectedChallenges
      .filter((c) => c.is_initial_active)
      .map((c) => c.id);

    // Build predecessor map
    const predecessorMap: Record<string, string | null> = {};
    selectedChallenges.forEach((c) => {
      predecessorMap[c.id] = c.predecessor_challenge_id;
    });

    saveLinks(
      {
        objectiveItemId: objectiveItem.id,
        challengeIds: selectedChallenges.map((c) => c.id),
        initialActiveIds,
        predecessorMap,
      },
      {
        onSuccess: () => {
          toast.success(`${selectedChallenges.length} desafio(s) vinculado(s) com sucesso!`);
          onOpenChange(false);
        },
      }
    );
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

        <div className="flex-1 min-h-0 py-4 space-y-4 overflow-y-auto">
          {/* Section 1: Initial Challenges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Desafios Iniciais</span>
              </div>
              <Badge
                variant={slotsExceeded ? "destructive" : "secondary"}
                className="text-xs"
              >
                {slotsUsed}/{activeSlots} slots
              </Badge>
            </div>

            {slotsExceeded && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="h-3 w-3" />
                Excedeu o limite de slots. Remova alguns desafios iniciais.
              </div>
            )}

            <div className="space-y-1.5 min-h-[60px] p-2 border rounded-lg bg-muted/20">
              {initialChallenges.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Adicione desafios que iniciam ativos
                </p>
              ) : (
                initialChallenges.map((challenge) => (
                  <InitialChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onRemove={removeChallenge}
                  />
                ))
              )}
            </div>
          </div>

          {/* Section 2: Sequential Challenges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sequência de Liberação</span>
            </div>

            <div className="space-y-1.5 min-h-[60px] p-2 border rounded-lg bg-muted/20">
              {sequentialChallenges.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Adicione desafios que são liberados após completar outros
                </p>
              ) : (
                sequentialChallenges.map((challenge) => (
                  <SequentialChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    possiblePredecessors={getPossiblePredecessors(challenge.id)}
                    onPredecessorChange={setPredecessor}
                    onRemove={removeChallenge}
                  />
                ))
              )}
            </div>
          </div>

          {/* Flow Preview */}
          <ChallengeFlowPreview
            challenges={selectedChallenges.map((c) => ({
              id: c.id,
              title: c.title,
              is_initial_active: c.is_initial_active,
              predecessor_challenge_id: c.predecessor_challenge_id,
            }))}
          />

          {/* Search and Add */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Adicionar Desafios</span>
            </div>

            <Input
              placeholder="Buscar desafios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="border rounded-lg">
              <ChallengeSearchList
                challenges={filteredChallenges}
                isLoading={isLoadingChallenges}
                searchQuery={searchQuery}
                slotsAvailable={slotsUsed < activeSlots}
                onAddAsInitial={addAsInitial}
                onAddAsSequential={addAsSequential}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              💡 Use <strong>Inicial</strong> para desafios ativos desde o início. 
              Use <strong>Sequência</strong> para desafios liberados após completar outros.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || slotsExceeded}>
            {isSaving ? "Salvando..." : `Salvar (${selectedChallenges.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
