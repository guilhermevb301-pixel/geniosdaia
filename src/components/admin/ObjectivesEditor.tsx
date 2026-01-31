import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, GripVertical, FolderPlus, Target, Link2 } from "lucide-react";
import { useObjectives, ObjectiveGroup, ObjectiveItem } from "@/hooks/useObjectives";
import { useDailyChallengesAdmin } from "@/hooks/useDailyChallengesAdmin";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { ChallengeLinkingModal } from "./ChallengeLinkingModal";

export function ObjectivesEditor() {
  const {
    objectiveGroups,
    isLoading,
    updateGroup,
    addGroup,
    deleteGroup,
    updateItem,
    addItem,
    deleteItem,
    isUpdating,
  } = useObjectives();

  // Daily challenges for linking
  const { challenges: allDailyChallenges, isLoading: isLoadingChallenges } = useDailyChallengesAdmin();

  // Get link counts for all items
  const { linkCounts, linkedChallengeIds, saveLinks, isSaving } = useObjectiveChallengeLinks();

  const [editingGroup, setEditingGroup] = useState<ObjectiveGroup | null>(null);
  const [editingItem, setEditingItem] = useState<ObjectiveItem | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "group" | "item"; id: string } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [challengeSearchQuery, setChallengeSearchQuery] = useState("");

  // Linking modal state
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [linkingItem, setLinkingItem] = useState<ObjectiveItem | null>(null);

  // Linked challenges state for item dialog
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([]);

  // Get existing links for the editing item via separate hook call
  const { linkedChallengeIds: editingItemLinks } = useObjectiveChallengeLinks(editingItem?.id);

  // Sync linked challenges when editing item changes
  useEffect(() => {
    if (editingItem && editingItemLinks) {
      setSelectedChallengeIds(editingItemLinks);
    }
  }, [editingItem?.id, editingItemLinks]);

  // Filter challenges by search
  const filteredChallenges = allDailyChallenges.filter(challenge => {
    if (!challengeSearchQuery) return true;
    const query = challengeSearchQuery.toLowerCase();
    return (
      challenge.title.toLowerCase().includes(query) ||
      challenge.track.toLowerCase().includes(query)
    );
  });

  // Form states
  const [groupTitle, setGroupTitle] = useState("");
  const [itemForm, setItemForm] = useState({
    label: "",
    objective_key: "",
    requires_infra: false,
    is_infra: false,
    tags: "",
  });

  const handleOpenGroupDialog = (group?: ObjectiveGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupTitle(group.title);
    } else {
      setEditingGroup(null);
      setGroupTitle("");
    }
    setIsGroupDialogOpen(true);
  };

  const handleOpenItemDialog = (groupId: string, item?: ObjectiveItem) => {
    setSelectedGroupId(groupId);
    setChallengeSearchQuery("");
    if (item) {
      setEditingItem(item);
      setItemForm({
        label: item.label,
        objective_key: item.objective_key,
        requires_infra: item.requires_infra,
        is_infra: item.is_infra,
        tags: item.tags.join(", "),
      });
      // linkedChallengeIds will be loaded via useEffect
    } else {
      setEditingItem(null);
      setSelectedChallengeIds([]);
      setItemForm({
        label: "",
        objective_key: "",
        requires_infra: false,
        is_infra: false,
        tags: "",
      });
    }
    setIsItemDialogOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupTitle.trim()) return;

    if (editingGroup) {
      updateGroup({ id: editingGroup.id, title: groupTitle });
    } else {
      const maxOrder = Math.max(...objectiveGroups.map(g => g.order_index), -1);
      addGroup({ title: groupTitle, order_index: maxOrder + 1 });
    }
    setIsGroupDialogOpen(false);
  };

  const handleSaveItem = async () => {
    if (!itemForm.label.trim() || !itemForm.objective_key.trim() || !selectedGroupId) return;

    const tags = itemForm.tags
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    if (editingItem) {
      updateItem({
        id: editingItem.id,
        label: itemForm.label,
        objective_key: itemForm.objective_key,
        requires_infra: itemForm.requires_infra,
        is_infra: itemForm.is_infra,
        tags,
      });
      
      // Save challenge links
      saveLinks({
        objectiveItemId: editingItem.id,
        challengeIds: selectedChallengeIds,
      });
    } else {
      const group = objectiveGroups.find(g => g.id === selectedGroupId);
      const maxOrder = Math.max(...(group?.items.map(i => i.order_index) || []), -1);
      addItem({
        group_id: selectedGroupId,
        label: itemForm.label,
        objective_key: itemForm.objective_key,
        requires_infra: itemForm.requires_infra,
        is_infra: itemForm.is_infra,
        tags,
        order_index: maxOrder + 1,
      });
      // Note: links for new items will need to be added after item creation
    }
    setIsItemDialogOpen(false);
  };

  const toggleChallengeLink = (challengeId: string) => {
    setSelectedChallengeIds(prev => 
      prev.includes(challengeId)
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "group") {
      deleteGroup(deleteTarget.id);
    } else {
      deleteItem(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Gerenciar Objetivos
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure os grupos e itens do checklist de objetivos
          </p>
        </div>
        <Button onClick={() => handleOpenGroupDialog()} className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      {/* Groups List */}
      {objectiveGroups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Nenhum grupo de objetivos cadastrado. Clique em "Novo Grupo" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {objectiveGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {group.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenItemDialog(group.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenGroupDialog(group)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget({ type: "group", id: group.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum item neste grupo
                  </p>
                ) : (
                  group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.is_infra && (
                            <Badge variant="secondary" className="text-xs">
                              INFRA
                            </Badge>
                          )}
                          {item.requires_infra && (
                            <Badge variant="outline" className="text-xs">
                              Requer Infra
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                            {item.objective_key}
                          </code>
                          {/* Link count indicator */}
                          <Badge 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-primary/10"
                            onClick={() => {
                              setLinkingItem(item);
                              setIsLinkingModalOpen(true);
                            }}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            {linkCounts[item.id] || 0} desafio(s)
                          </Badge>
                          {item.tags.length > 0 && (
                            <div className="flex gap-1">
                              {item.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Vincular desafios"
                          onClick={() => {
                            setLinkingItem(item);
                            setIsLinkingModalOpen(true);
                          }}
                        >
                          <Link2 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenItemDialog(group.id, item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget({ type: "item", id: item.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
            <DialogDescription>
              {editingGroup ? "Altere o título do grupo" : "Crie um novo grupo de objetivos"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-title">Título do Grupo *</Label>
              <Input
                id="group-title"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="Ex: A) Quero construir meu Agente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGroup} disabled={isUpdating || !groupTitle.trim()}>
              {editingGroup ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Novo Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Altere as informações do item" : "Adicione um novo objetivo ao grupo"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-label">Texto do Objetivo *</Label>
              <Input
                id="item-label"
                value={itemForm.label}
                onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                placeholder="Ex: Criar meu 1º Agente de IA do zero"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-key">Chave Única *</Label>
              <Input
                id="item-key"
                value={itemForm.objective_key}
                onChange={(e) => setItemForm({ ...itemForm, objective_key: e.target.value })}
                placeholder="Ex: criar_agente"
              />
              <p className="text-xs text-muted-foreground">
                Identificador único para este objetivo (sem espaços, use underscore)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-tags">Tags (para filtrar desafios)</Label>
              <Input
                id="item-tags"
                value={itemForm.tags}
                onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                placeholder="Ex: agentes, n8n, automação"
              />
              <p className="text-xs text-muted-foreground">
                Separadas por vírgula. Usadas para recomendar desafios relacionados.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires-infra"
                  checked={itemForm.requires_infra}
                  onCheckedChange={(checked) =>
                    setItemForm({ ...itemForm, requires_infra: !!checked })
                  }
                />
                <Label htmlFor="requires-infra" className="text-sm">
                  Requer Infra
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-infra"
                  checked={itemForm.is_infra}
                  onCheckedChange={(checked) =>
                    setItemForm({ ...itemForm, is_infra: !!checked })
                  }
                />
                <Label htmlFor="is-infra" className="text-sm">
                  É item de Infra
                </Label>
              </div>
            </div>

            {/* Linked Challenges Section - Only show when editing */}
            {editingItem && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Desafios Vinculados ({selectedChallengeIds.length} selecionados)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Selecione quais desafios aparecem quando este objetivo for marcado
                </p>
                <Input
                  placeholder="Buscar desafios..."
                  value={challengeSearchQuery}
                  onChange={(e) => setChallengeSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="h-48 border rounded-lg p-2">
                  {isLoadingChallenges ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : filteredChallenges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum desafio encontrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredChallenges.map(challenge => (
                        <div
                          key={challenge.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleChallengeLink(challenge.id)}
                        >
                          <Checkbox
                            checked={selectedChallengeIds.includes(challenge.id)}
                            onCheckedChange={() => toggleChallengeLink(challenge.id)}
                          />
                          <span className="text-sm flex-1 truncate">{challenge.title}</span>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {challenge.track}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
            
            {!editingItem && (
              <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                💡 Após criar o item, você poderá editar para vincular desafios recomendados.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveItem}
              disabled={isUpdating || isSaving || !itemForm.label.trim() || !itemForm.objective_key.trim()}
            >
              {editingItem ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "group"
                ? "Tem certeza que deseja excluir este grupo? Todos os itens dentro dele também serão excluídos."
                : "Tem certeza que deseja excluir este item?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Challenge Linking Modal */}
      <ChallengeLinkingModal
        open={isLinkingModalOpen}
        onOpenChange={setIsLinkingModalOpen}
        objectiveItem={linkingItem}
      />
    </div>
  );
}
