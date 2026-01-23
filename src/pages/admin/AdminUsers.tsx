import { useState, useMemo } from "react";
import { Search, Users, Filter, Crown, Star, GraduationCap, User } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UserCard } from "@/components/admin/UserCard";
import { RoleChangeModal } from "@/components/admin/RoleChangeModal";
import { useAllUsers, type UserWithRoles } from "@/hooks/useAllUsers";
import { cn } from "@/lib/utils";

type RoleFilter = "all" | "admin" | "mentor" | "mentee" | "user";

export default function AdminUsers() {
  const { users, isLoading, changeRole } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      // Role filter
      if (roleFilter === "all") return matchesSearch;
      if (roleFilter === "admin") return matchesSearch && user.roles.includes("admin");
      if (roleFilter === "mentor") return matchesSearch && user.roles.includes("mentor");
      if (roleFilter === "mentee") return matchesSearch && user.mentee_status === "active";
      if (roleFilter === "user") {
        return matchesSearch && 
          !user.roles.includes("admin") && 
          !user.roles.includes("mentor") && 
          user.mentee_status !== "active";
      }
      return matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.roles.includes("admin")).length,
    mentors: users.filter(u => u.roles.includes("mentor")).length,
    mentees: users.filter(u => u.mentee_status === "active").length,
    users: users.filter(u => 
      !u.roles.includes("admin") && 
      !u.roles.includes("mentor") && 
      u.mentee_status !== "active"
    ).length,
  }), [users]);

  const filterButtons: { filter: RoleFilter; label: string; icon: typeof User; count: number }[] = [
    { filter: "all", label: "Todos", icon: Users, count: stats.total },
    { filter: "admin", label: "Admins", icon: Crown, count: stats.admins },
    { filter: "mentor", label: "Mentores", icon: Star, count: stats.mentors },
    { filter: "mentee", label: "Mentorados", icon: GraduationCap, count: stats.mentees },
    { filter: "user", label: "Alunos", icon: User, count: stats.users },
  ];

  const handleManageRole = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleRoleChange = (payload: Parameters<typeof changeRole.mutate>[0]) => {
    changeRole.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedUser(null);
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Gestão de Usuários
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os cargos e permissões dos usuários da plataforma
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Role Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ filter, label, icon: Icon, count }) => (
              <Button
                key={filter}
                variant={roleFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(filter)}
                className={cn(
                  "gap-2",
                  roleFilter === filter && "shadow-md"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-1 text-xs",
                    roleFilter === filter && "bg-primary-foreground/20 text-primary-foreground"
                  )}
                >
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchTerm
                ? "Tente ajustar sua busca ou remover os filtros"
                : "Não há usuários com o filtro selecionado"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.user_id}
                user={user}
                onManageRole={handleManageRole}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredUsers.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Mostrando {filteredUsers.length} de {users.length} usuários
          </p>
        )}
      </div>

      {/* Role Change Modal */}
      <RoleChangeModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onChangeRole={handleRoleChange}
        isLoading={changeRole.isPending}
      />
    </AppLayout>
  );
}
