import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserXP } from "@/hooks/useUserXP";
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
    <div className="border-t border-sidebar-border px-4 py-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {initialsOf(name)}
          </div>
          <span className="text-[13px] font-medium leading-tight text-foreground">{name}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Sair"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>

      {!isLoading && (
        <Link
          to="/perfil"
          onClick={onNavigate}
          className="flex items-center justify-between text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>
            Nível {levelInfo.level} · {levelInfo.name}
          </span>
          <span className="tabular-nums">
            {levelInfo.xpInLevel}/{levelInfo.xpForNextLevel} XP
          </span>
        </Link>
      )}
    </div>
  );
}
