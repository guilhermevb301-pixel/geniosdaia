import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Save, X, GripVertical, Pencil } from "lucide-react";
import { ObjectiveGroup, ObjectiveItem, useObjectives } from "@/hooks/useObjectives";
import { cn } from "@/lib/utils";

interface ObjectivesEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ObjectivesEditorModal({ open, onOpenChange }: ObjectivesEditorModalProps) {
  const { 
    objectiveGroups, 
    updateGroup, 
    addGroup, 
    deleteGroup,
    updateItem,
    addItem,
    deleteItem,
    isUpdating 
  } = useObjectives();

  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newItemForm, setNewItemForm] = useState<{
    groupId: string;
    label: string;
    objectiveKey: string;
    requiresInfra: boolean;
    isInfra: boolean;
    tags: string;
  } | null>(null);

  const handleAddGroup = () => {
    if (!newGroupTitle.trim()) return;
    addGroup({ 
      title: newGroupTitle, 
      order_index: objectiveGroups.length 
    });
    setNewGroupTitle("");
    setShowNewGroupForm(false);
  };

  const handleUpdateGroup = (id: string, title: string) => {
    updateGroup({ id, title });
    setEditingGroup(null);
  };

  const handleAddItem = () => {
    if (!newItemForm || !newItemForm.label.trim() || !newItemForm.objectiveKey.trim()) return;
    
    const group = objectiveGroups.find(g => g.id === newItemForm.groupId);
    const orderIndex = group ? group.items.length : 0;

    addItem({
      group_id: newItemForm.groupId,
      label: newItemForm.label,
      objective_key: newItemForm.objectiveKey,
      requires_infra: newItemForm.requiresInfra,
      is_infra: newItemForm.isInfra,
      order_index: orderIndex,
      tags: newItemForm.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setNewItemForm(null);
  };

  const handleUpdateItem = (item: ObjectiveItem, updates: Partial<ObjectiveItem>) => {
    updateItem({ id: item.id, ...updates });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Editar Objetivos</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie os grupos e itens de objetivos que os membros podem selecionar.
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-6">
            {objectiveGroups.map((group) => (
              <Card key={group.id} className="border-border/50">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    
                    {editingGroup === group.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          defaultValue={group.title}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateGroup(group.id, e.currentTarget.value);
                            }
                            if (e.key === "Escape") {
                              setEditingGroup(null);
                            }
                          }}
                          className="h-8"
                        />
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingGroup(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="flex-1 text-sm font-medium">
                          {group.title}
                        </CardTitle>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingGroup(group.id)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteGroup(group.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="py-2 px-4 space-y-2">
                  {group.items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-start gap-2 p-2 rounded bg-muted/30 text-sm"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab mt-0.5" />
                      
                      <div className="flex-1 min-w-0">
                        {editingItem === item.id ? (
                          <div className="space-y-2">
                            <Input
                              defaultValue={item.label}
                              placeholder="Texto do objetivo"
                              className="h-8 text-sm"
                              id={`label-${item.id}`}
                            />
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`infra-req-${item.id}`}
                                  defaultChecked={item.requires_infra}
                                />
                                <Label htmlFor={`infra-req-${item.id}`} className="text-xs">
                                  Requer Infra
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`is-infra-${item.id}`}
                                  defaultChecked={item.is_infra}
                                />
                                <Label htmlFor={`is-infra-${item.id}`} className="text-xs">
                                  É item de Infra
                                </Label>
                              </div>
                            </div>
                            <Input
                              defaultValue={item.tags.join(", ")}
                              placeholder="Tags (separadas por vírgula)"
                              className="h-8 text-sm"
                              id={`tags-${item.id}`}
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  const labelEl = document.getElementById(`label-${item.id}`) as HTMLInputElement;
                                  const infraReqEl = document.getElementById(`infra-req-${item.id}`) as HTMLInputElement;
                                  const isInfraEl = document.getElementById(`is-infra-${item.id}`) as HTMLInputElement;
                                  const tagsEl = document.getElementById(`tags-${item.id}`) as HTMLInputElement;
                                  
                                  handleUpdateItem(item, {
                                    label: labelEl?.value || item.label,
                                    requires_infra: infraReqEl?.dataset?.state === "checked",
                                    is_infra: isInfraEl?.dataset?.state === "checked",
                                    tags: tagsEl?.value.split(",").map(t => t.trim()).filter(Boolean) || item.tags,
                                  });
                                  setEditingItem(null);
                                }}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Salvar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEditingItem(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="truncate">{item.label}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.requires_infra && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                  Requer Infra
                                </Badge>
                              )}
                              {item.is_infra && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary text-primary">
                                  INFRA
                                </Badge>
                              )}
                              {item.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{item.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {editingItem !== item.id && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => setEditingItem(item.id)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add item form */}
                  {newItemForm?.groupId === group.id ? (
                    <div className="p-3 rounded border border-dashed border-primary/50 space-y-2">
                      <Input
                        placeholder="Texto do objetivo"
                        value={newItemForm.label}
                        onChange={(e) => setNewItemForm({ ...newItemForm, label: e.target.value })}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="Chave única (ex: criar_agente)"
                        value={newItemForm.objectiveKey}
                        onChange={(e) => setNewItemForm({ ...newItemForm, objectiveKey: e.target.value })}
                        className="h-8 text-sm"
                      />
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="new-infra-req"
                            checked={newItemForm.requiresInfra}
                            onCheckedChange={(checked) => setNewItemForm({ ...newItemForm, requiresInfra: !!checked })}
                          />
                          <Label htmlFor="new-infra-req" className="text-xs">Requer Infra</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="new-is-infra"
                            checked={newItemForm.isInfra}
                            onCheckedChange={(checked) => setNewItemForm({ ...newItemForm, isInfra: !!checked })}
                          />
                          <Label htmlFor="new-is-infra" className="text-xs">É item de Infra</Label>
                        </div>
                      </div>
                      <Input
                        placeholder="Tags (separadas por vírgula)"
                        value={newItemForm.tags}
                        onChange={(e) => setNewItemForm({ ...newItemForm, tags: e.target.value })}
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddItem} disabled={isUpdating}>
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setNewItemForm(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border border-dashed border-border/50 text-muted-foreground hover:text-foreground"
                      onClick={() => setNewItemForm({
                        groupId: group.id,
                        label: "",
                        objectiveKey: "",
                        requiresInfra: false,
                        isInfra: false,
                        tags: "",
                      })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar Item
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add group form */}
            {showNewGroupForm ? (
              <Card className="border-dashed border-primary/50">
                <CardContent className="py-4 space-y-3">
                  <Input
                    placeholder="Título do novo grupo (ex: F) Novos Objetivos)"
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddGroup} disabled={isUpdating}>
                      <Plus className="h-3 w-3 mr-1" />
                      Criar Grupo
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setShowNewGroupForm(false);
                      setNewGroupTitle("");
                    }}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setShowNewGroupForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo Grupo
              </Button>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
