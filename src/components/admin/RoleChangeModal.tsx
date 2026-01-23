import { useState } from "react";
import { User, GraduationCap, Star, Crown, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserWithRoles, RoleChangePayload } from "@/hooks/useAllUsers";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface RoleChangeModalProps {
  user: UserWithRoles | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeRole: (payload: RoleChangePayload) => void;
  isLoading?: boolean;
}

type RoleOption = "user" | "mentee" | "mentor";

export function RoleChangeModal({
  user,
  open,
  onOpenChange,
  onChangeRole,
  isLoading,
}: RoleChangeModalProps) {
  const { isAdmin } = useIsAdmin();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [menteeForm, setMenteeForm] = useState({
    display_name: "",
    plan_tag: "Individual 2.0",
    scheduling_url: "",
    community_url: "",
    welcome_message: "Bem-vindo à sua jornada de mentoria! Aqui você encontrará todos os recursos e acompanhamento do seu progresso.",
  });

  if (!user) return null;

  const getCurrentRole = (): RoleOption => {
    if (user.roles.includes("mentor")) return "mentor";
    if (user.mentee_status === "active") return "mentee";
    return "user";
  };

  const currentRole = getCurrentRole();

  const roleOptions: { role: RoleOption; label: string; icon: typeof User; description: string; color: string }[] = [
    {
      role: "user",
      label: "Aluno",
      icon: User,
      description: "Acesso básico às aulas e templates",
      color: "text-muted-foreground",
    },
    {
      role: "mentee",
      label: "Mentorado",
      icon: GraduationCap,
      description: "Acesso à área de mentoria personalizada",
      color: "text-primary",
    },
    ...(isAdmin ? [{
      role: "mentor" as RoleOption,
      label: "Mentor",
      icon: Star,
      description: "Pode gerenciar mentorados e usuários",
      color: "text-purple-400",
    }] : []),
  ];

  const handleConfirm = () => {
    if (!selectedRole) return;

    const payload: RoleChangePayload = {
      userId: user.user_id,
      newRole: selectedRole,
      previousRole: currentRole,
    };

    if (selectedRole === "mentee") {
      payload.menteeData = {
        display_name: menteeForm.display_name || user.email.split("@")[0],
        plan_tag: menteeForm.plan_tag,
        scheduling_url: menteeForm.scheduling_url || undefined,
        community_url: menteeForm.community_url || undefined,
        welcome_message: menteeForm.welcome_message,
      };
    }

    onChangeRole(payload);
    setSelectedRole(null);
    setMenteeForm({
      display_name: "",
      plan_tag: "Individual 2.0",
      scheduling_url: "",
      community_url: "",
      welcome_message: "Bem-vindo à sua jornada de mentoria! Aqui você encontrará todos os recursos e acompanhamento do seu progresso.",
    });
  };

  const initials = user.display_name
    ? user.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Usuário</DialogTitle>
          <DialogDescription>
            Altere o cargo e permissões deste usuário
          </DialogDescription>
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg font-semibold bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">
              {user.display_name || user.email.split("@")[0]}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          {user.roles.includes("admin") && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Crown className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Selecione o cargo</Label>
          <div className="grid gap-2">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.role;
              const isCurrent = currentRole === option.role && !selectedRole;

              return (
                <button
                  key={option.role}
                  onClick={() => setSelectedRole(option.role)}
                  disabled={user.roles.includes("admin")}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : isCurrent
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/50",
                    user.roles.includes("admin") && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn("p-2 rounded-lg bg-muted", option.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">Atual</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mentee Form */}
        {selectedRole === "mentee" && (
          <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-in slide-in-from-top-2">
            <Label className="text-sm font-medium text-primary">Configurar Mentoria</Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="display_name" className="text-xs">Nome de exibição</Label>
                <Input
                  id="display_name"
                  placeholder="Nome do mentorado"
                  value={menteeForm.display_name}
                  onChange={(e) => setMenteeForm({ ...menteeForm, display_name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="plan_tag" className="text-xs">Plano</Label>
                <Input
                  id="plan_tag"
                  placeholder="Ex: Individual 2.0"
                  value={menteeForm.plan_tag}
                  onChange={(e) => setMenteeForm({ ...menteeForm, plan_tag: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="welcome_message" className="text-xs">Mensagem de Boas-vindas</Label>
                <Textarea
                  id="welcome_message"
                  placeholder="Mensagem personalizada..."
                  value={menteeForm.welcome_message}
                  onChange={(e) => setMenteeForm({ ...menteeForm, welcome_message: e.target.value })}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedRole || selectedRole === currentRole || isLoading}
          >
            {isLoading ? "Salvando..." : "Confirmar Alteração"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
