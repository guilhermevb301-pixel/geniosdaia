import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserXP } from "@/hooks/useUserXP";
import { Progress } from "@/components/ui/progress";
import { displayNameOf } from "@/lib/displayName";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function SidebarUserFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const { levelInfo, isLoading } = useUserXP();
  const navigate = useNavigate();

  const name =
    displayNameOf(user?.user_metadata?.full_name as string | undefined, user?.email) ?? "Membro";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="shrink-0 border-t border-sidebar-border bg-sidebar p-5">
      {!isLoading && (
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="micro-label text-muted-foreground">{levelInfo.name}</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {levelInfo.xpInLevel}/{levelInfo.xpForNextLevel} XP
            </span>
          </div>
          <Progress value={levelInfo.progress} className="h-1" />
        </div>
      )}

      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
          {initialsOf(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <Link
            to="/perfil"
            onClick={onNavigate}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            {isLoading ? "Ver perfil" : `Nível ${levelInfo.level} · ver perfil`}
          </Link>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="focus-ring flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label="Sair da conta"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </div>
  );
}
