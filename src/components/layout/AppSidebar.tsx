import { Link, useLocation } from "react-router-dom";
import { BookOpen, Layout, Calendar, MessageSquare, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/", icon: Layout },
  { label: "Aulas", href: "/aulas", icon: BookOpen },
  { label: "Templates", href: "/templates", icon: Sparkles },
  { label: "Eventos", href: "/eventos", icon: Calendar },
  { label: "Aplicar Mentoria", href: "/mentoria", icon: MessageSquare },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Gêneos da IA</span>
          <span className="text-xs text-muted-foreground">Plataforma de Automação</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/suporte"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-sidebar-foreground transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          Suporte
        </Link>
      </div>
    </aside>
  );
}
