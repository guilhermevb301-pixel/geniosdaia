import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import { Plus, Pencil, Trash2, GripVertical, Target, Link2, Users } from "lucide-react";
import { useObjectives, ObjectiveItem } from "@/hooks/useObjectives";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { ChallengeLinkingModal } from "./ChallengeLinkingModal";

export function ObjectivesEditor() {
  const {
    objectives,
    isLoading,
    updateItem,
    addItem,
    deleteItem,
    isUpdating,
  } = useObjectives();

  // Get link counts for all items
  const { linkCounts } = useObjectiveChallengeLinks();

  const [editingItem, setEditingItem] = useState<ObjectiveItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Linking modal state
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [linkingItem, setLinkingItem] = useState<ObjectiveItem | null>(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    label: "",
    objective_key: "",
    requires_infra: false,
    is_infra: false,
    tags: "",
    active_slots: 1,
  });

  const handleOpenItemDialog = (item?: ObjectiveItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        label: item.label,
        objective_key: item.objective_key,
        requires_infra: item.requires_infra,
        is_infra: item.is_infra,
        tags: item.tags.join(", "),
        active_slots: item.active_slots || 1,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        label: "",
        objective_key: "",
        requires_infra: false,
        is_infra: false,
        tags: "",
        active_slots: 1,
      });
    }
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.label.trim() || !itemForm.objective_key.trim()) return;

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
        active_slots: itemForm.active_slots,
      });
    } else {
      const maxOrder = Math.max(...objectives.map(i => i.order_index), -1);
      addItem({
        group_id: null,
        label: itemForm.label,
        objective_key: itemForm.objective_key,
        requires_infra: itemForm.requires_infra,
        is_infra: itemForm.is_infra,
        tags,
        order_index: maxOrder + 1,
        active_slots: itemForm.active_slots,
      });
    }
    setIsItemDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="py-4">
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
            Configure os objetivos disponíveis para alunos
          </p>
        </div>
        <Button onClick={() => handleOpenItemDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Objetivo
        </Button>
      </div>

      {/* Objectives List */}
      {objectives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Nenhum objetivo cadastrado. Clique em "Novo Objetivo" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {objectives.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
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
                    <div className="flex items-center gap-2 mt-1 flex-wrap ml-6">
                      <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                        {item.objective_key}
                      </code>
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
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.tags.length - 3}
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
                      onClick={() => handleOpenItemDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Objetivo" : "Novo Objetivo"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Altere as informações do objetivo" : "Adicione um novo objetivo"}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveItem}
              disabled={isUpdating || !itemForm.label.trim() || !itemForm.objective_key.trim()}
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
              Tem certeza que deseja excluir este objetivo? Esta ação não pode ser desfeita.
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
      {linkingItem && (
        <ChallengeLinkingModal
          open={isLinkingModalOpen}
          onOpenChange={setIsLinkingModalOpen}
          objectiveItem={linkingItem}
        />
      )}
    </div>
  );
}
