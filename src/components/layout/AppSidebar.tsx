import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  Layout, 
  Calendar, 
  MessageSquare, 
  HelpCircle, 
  Sparkles,
  ChevronDown,
  Zap,
  Settings,
  Users,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const tools = [
  { label: "Templates", href: "/templates", icon: Zap },
  { label: "Eventos", href: "/eventos", icon: Calendar },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin } = useIsAdmin();
  const [adminOpen, setAdminOpen] = useState(true);

  const isActive = (href: string) => location.pathname === href;

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
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard */}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <Layout className="h-5 w-5" />
          Dashboard
        </Link>

        {/* Aulas */}
        <Link
          to="/aulas"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/aulas")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <BookOpen className="h-5 w-5" />
          Aulas
        </Link>

        {/* Tools Section */}
        <div className="mt-6">
        {tools.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
              isActive(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        </div>

        {/* Mentoria */}
        <Link
          to="/mentoria"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/mentoria")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <MessageSquare className="h-5 w-5" />
          Aplicar Mentoria
        </Link>

        {/* Admin Section - Only visible for admins */}
        {isAdmin && (
          <div className="mt-6">

            <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
              <CollapsibleTrigger className="w-full">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    location.pathname.startsWith("/admin")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>Gerenciar</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      adminOpen && "rotate-180"
                    )}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary/30 pl-4">
                  <Link
                    to="/admin/modules"
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/modules")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Módulos
                  </Link>
                  <Link
                    to="/admin/lessons"
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/lessons")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                    Aulas
                  </Link>
                  <Link
                    to="/admin/templates"
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/templates")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Templates
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
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
