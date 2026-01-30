import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Bot, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface CustomGpt {
  id: string;
  title: string;
  description: string | null;
  gpt_url: string;
  icon_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminGpts() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGpt, setEditingGpt] = useState<CustomGpt | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gptUrl, setGptUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const { data: gpts, isLoading } = useQuery({
    queryKey: ["admin_custom_gpts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_gpts")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as CustomGpt[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<CustomGpt, "id" | "created_at">) => {
      const { error } = await supabase.from("custom_gpts").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_custom_gpts"] });
      toast.success("GPT criado com sucesso!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Erro ao criar GPT"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CustomGpt> & { id: string }) => {
      const { error } = await supabase
        .from("custom_gpts")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_custom_gpts"] });
      toast.success("GPT atualizado com sucesso!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Erro ao atualizar GPT"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_gpts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_custom_gpts"] });
      toast.success("GPT excluído com sucesso!");
    },
    onError: () => toast.error("Erro ao excluir GPT"),
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGptUrl("");
    setIconUrl("");
    setOrderIndex(0);
    setIsActive(true);
    setEditingGpt(null);
  };

  const handleEdit = (gpt: CustomGpt) => {
    setEditingGpt(gpt);
    setTitle(gpt.title);
    setDescription(gpt.description || "");
    setGptUrl(gpt.gpt_url);
    setIconUrl(gpt.icon_url || "");
    setOrderIndex(gpt.order_index);
    setIsActive(gpt.is_active);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title,
      description: description || null,
      gpt_url: gptUrl,
      icon_url: iconUrl || null,
      order_index: orderIndex,
      is_active: isActive,
    };

    if (editingGpt) {
      updateMutation.mutate({ id: editingGpt.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar GPTs</h1>
            <p className="text-muted-foreground">
              Adicione e gerencie os GPTs personalizados
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo GPT
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingGpt ? "Editar GPT" : "Novo GPT"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nome do GPT"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição breve do GPT"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gptUrl">URL do GPT *</Label>
                  <Input
                    id="gptUrl"
                    type="url"
                    value={gptUrl}
                    onChange={(e) => setGptUrl(e.target.value)}
                    placeholder="https://chat.openai.com/g/..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iconUrl">URL do Ícone</Label>
                  <Input
                    id="iconUrl"
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Ordem</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">Ativo</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingGpt ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>GPTs Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : gpts && gpts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GPT</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gpts.map((gpt) => (
                    <TableRow key={gpt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {gpt.icon_url ? (
                              <img
                                src={gpt.icon_url}
                                alt={gpt.title}
                                className="h-6 w-6 rounded"
                              />
                            ) : (
                              <Bot className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{gpt.title}</p>
                            {gpt.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {gpt.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={gpt.gpt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Abrir
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>{gpt.order_index}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            gpt.is_active
                              ? "bg-success/20 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {gpt.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(gpt)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir?")) {
                                deleteMutation.mutate(gpt.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum GPT cadastrado ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
