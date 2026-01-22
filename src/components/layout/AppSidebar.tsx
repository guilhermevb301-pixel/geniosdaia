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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const courses = [
  { id: 1, label: "Introdução ao n8n", href: "/aulas" },
  { id: 2, label: "Integrações com IA", href: "/aulas" },
  { id: 3, label: "Workflows Avançados", href: "/aulas" },
];

const tools = [
  { label: "Templates", href: "/templates", icon: Zap },
  { label: "Eventos", href: "/eventos", icon: Calendar },
];

export function AppSidebar() {
  const location = useLocation();
  const [coursesOpen, setCoursesOpen] = useState(true);

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
        {/* Menu Label */}
        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Menu
        </p>

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

        {/* Courses Collapsible */}
        <Collapsible open={coursesOpen} onOpenChange={setCoursesOpen}>
          <CollapsibleTrigger className="w-full">
            <div
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname.startsWith("/aulas")
                  ? "bg-accent/50 text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <span>Aulas</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  coursesOpen && "rotate-180"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-accent/30 pl-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={course.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive(course.href) && location.pathname === "/aulas"
                      ? "text-accent-foreground bg-accent/20"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                  )}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {course.label}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tools Section */}
        <p className="px-3 mt-6 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Ferramentas
        </p>

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
