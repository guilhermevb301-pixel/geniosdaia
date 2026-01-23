import { User, Crown, GraduationCap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserWithRoles } from "@/hooks/useAllUsers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserCardProps {
  user: UserWithRoles;
  onManageRole: (user: UserWithRoles) => void;
}

export function UserCard({ user, onManageRole }: UserCardProps) {
  const getHighestRole = (): "admin" | "mentor" | "mentee" | "user" => {
    if (user.roles.includes("admin")) return "admin";
    if (user.roles.includes("mentor")) return "mentor";
    if (user.mentee_status === "active") return "mentee";
    return "user";
  };

  const role = getHighestRole();

  const roleConfig = {
    admin: {
      label: "Administrador",
      icon: Crown,
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/30",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    mentor: {
      label: "Mentor",
      icon: Star,
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30",
      badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    mentee: {
      label: "Mentorado",
      icon: GraduationCap,
      gradient: "from-primary/20 to-primary/10",
      border: "border-primary/30",
      badge: "bg-primary/20 text-primary border-primary/30",
    },
    user: {
      label: "Aluno",
      icon: User,
      gradient: "from-muted/50 to-muted/30",
      border: "border-border",
      badge: "bg-muted text-muted-foreground border-border",
    },
  };

  const config = roleConfig[role];
  const RoleIcon = config.icon;

  const initials = user.display_name
    ? user.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        `bg-gradient-to-br ${config.gradient}`,
        config.border
      )}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/80 pointer-events-none" />
      
      <CardContent className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 ring-2 ring-background/50 shadow-md">
            <AvatarFallback className={cn("text-sm font-semibold", config.badge)}>
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {user.display_name || user.email.split("@")[0]}
              </h3>
              <Badge variant="outline" className={cn("shrink-0 text-xs", config.badge)}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground truncate mb-2">
              {user.email}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Desde {format(new Date(user.created_at), "MMM yyyy", { locale: ptBR })}
              </span>
              
              <Button 
                size="sm" 
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7"
                onClick={() => onManageRole(user)}
              >
                Gerenciar
              </Button>
            </div>
          </div>
        </div>

        {/* Status indicator for mentees */}
        {user.mentee_status && (
          <div className="absolute top-3 right-3">
            <div 
              className={cn(
                "h-2 w-2 rounded-full",
                user.mentee_status === "active" ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
