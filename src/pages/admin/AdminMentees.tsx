import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllMentees, type Mentee } from "@/hooks/useMenteeData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminMentees() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mentees, isLoading } = useAllMentees();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    display_name: "",
    plan_tag: "Individual 2.0",
    welcome_message: "",
    scheduling_url: "",
    community_url: "",
    status: "active",
  });

  const filteredMentees = mentees.filter((mentee) =>
    mentee.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      user_id: "",
      display_name: "",
      plan_tag: "Individual 2.0",
      welcome_message: "",
      scheduling_url: "",
      community_url: "",
      status: "active",
    });
  };

  const handleCreate = async () => {
    if (!formData.user_id || !formData.display_name) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const { error } = await supabase.from("mentees").insert({
      user_id: formData.user_id,
      display_name: formData.display_name,
      plan_tag: formData.plan_tag,
      welcome_message: formData.welcome_message || null,
      scheduling_url: formData.scheduling_url || null,
      community_url: formData.community_url || null,
      status: formData.status,
    });

    if (error) {
      toast.error("Erro ao criar mentorado: " + error.message);
      return;
    }

    toast.success("Mentorado criado com sucesso!");
    queryClient.invalidateQueries({ queryKey: ["allMentees"] });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedMentee) return;

    const { error } = await supabase
      .from("mentees")
      .update({
        display_name: formData.display_name,
        plan_tag: formData.plan_tag,
        welcome_message: formData.welcome_message || null,
        scheduling_url: formData.scheduling_url || null,
        community_url: formData.community_url || null,
        status: formData.status,
      })
      .eq("id", selectedMentee.id);

    if (error) {
      toast.error("Erro ao atualizar mentorado: " + error.message);
      return;
    }

    toast.success("Mentorado atualizado com sucesso!");
    queryClient.invalidateQueries({ queryKey: ["allMentees"] });
    setIsEditOpen(false);
    setSelectedMentee(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedMentee) return;

    const { error } = await supabase
      .from("mentees")
      .delete()
      .eq("id", selectedMentee.id);

    if (error) {
      toast.error("Erro ao excluir mentorado: " + error.message);
      return;
    }

    toast.success("Mentorado excluído com sucesso!");
    queryClient.invalidateQueries({ queryKey: ["allMentees"] });
    setIsDeleteOpen(false);
    setSelectedMentee(null);
  };

  const openEdit = (mentee: Mentee) => {
    setSelectedMentee(mentee);
    setFormData({
      user_id: mentee.user_id,
      display_name: mentee.display_name,
      plan_tag: mentee.plan_tag,
      welcome_message: mentee.welcome_message || "",
      scheduling_url: mentee.scheduling_url || "",
      community_url: mentee.community_url || "",
      status: mentee.status,
    });
    setIsEditOpen(true);
  };

  const openDelete = (mentee: Mentee) => {
    setSelectedMentee(mentee);
    setIsDeleteOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      paused: "secondary",
      completed: "outline",
    };
    const labels: Record<string, string> = {
      active: "Ativo",
      paused: "Pausado",
      completed: "Concluído",
    };
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Mentorados</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie todos os mentorados da plataforma
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} variant="accent">
            <Plus className="h-4 w-4 mr-2" />
            Novo Mentorado
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mentorados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Nome</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredMentees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum mentorado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredMentees.map((mentee) => (
                  <TableRow key={mentee.id} className="border-border">
                    <TableCell className="font-medium">
                      {mentee.display_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{mentee.plan_tag}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(mentee.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(mentee.created_at), "dd MMM yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/mentees/${mentee.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(mentee)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDelete(mentee)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Mentorado</DialogTitle>
            <DialogDescription>
              Adicione um novo mentorado à plataforma
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID (UUID) *</Label>
              <Input
                id="user_id"
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_id: e.target.value })
                }
                placeholder="UUID do usuário"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Nome de exibição *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="Nome do mentorado"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan_tag">Plano</Label>
              <Input
                id="plan_tag"
                value={formData.plan_tag}
                onChange={(e) =>
                  setFormData({ ...formData, plan_tag: e.target.value })
                }
                placeholder="Ex: Individual 2.0"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduling_url">URL de Agendamento</Label>
              <Input
                id="scheduling_url"
                value={formData.scheduling_url}
                onChange={(e) =>
                  setFormData({ ...formData, scheduling_url: e.target.value })
                }
                placeholder="https://calendly.com/..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community_url">URL da Comunidade</Label>
              <Input
                id="community_url"
                value={formData.community_url}
                onChange={(e) =>
                  setFormData({ ...formData, community_url: e.target.value })
                }
                placeholder="https://discord.gg/..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome_message">Mensagem de boas-vindas</Label>
              <Textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) =>
                  setFormData({ ...formData, welcome_message: e.target.value })
                }
                placeholder="Escreva uma mensagem de boas-vindas..."
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleCreate}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Mentorado</DialogTitle>
            <DialogDescription>
              Atualize as informações do mentorado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_display_name">Nome de exibição *</Label>
              <Input
                id="edit_display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="Nome do mentorado"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_plan_tag">Plano</Label>
              <Input
                id="edit_plan_tag"
                value={formData.plan_tag}
                onChange={(e) =>
                  setFormData({ ...formData, plan_tag: e.target.value })
                }
                placeholder="Ex: Individual 2.0"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_scheduling_url">URL de Agendamento</Label>
              <Input
                id="edit_scheduling_url"
                value={formData.scheduling_url}
                onChange={(e) =>
                  setFormData({ ...formData, scheduling_url: e.target.value })
                }
                placeholder="https://calendly.com/..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_community_url">URL da Comunidade</Label>
              <Input
                id="edit_community_url"
                value={formData.community_url}
                onChange={(e) =>
                  setFormData({ ...formData, community_url: e.target.value })
                }
                placeholder="https://discord.gg/..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_welcome_message">
                Mensagem de boas-vindas
              </Label>
              <Textarea
                id="edit_welcome_message"
                value={formData.welcome_message}
                onChange={(e) =>
                  setFormData({ ...formData, welcome_message: e.target.value })
                }
                placeholder="Escreva uma mensagem de boas-vindas..."
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleEdit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Mentorado</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{selectedMentee?.display_name}</strong>? Esta ação não
              pode ser desfeita e removerá todos os encontros, etapas e tarefas
              associados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
