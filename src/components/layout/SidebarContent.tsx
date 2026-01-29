import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  Layout, 
  Calendar, 
  MessageSquare, 
  MessageCircle,
  Sparkles,
  ChevronDown,
  Zap,
  Settings,
  Users,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsMentor } from "@/hooks/useIsMentor";
import { useIsMentee } from "@/hooks/useIsMentee";
import { useState } from "react";

const tools = [
  { label: "Templates", href: "/templates", icon: Zap },
  { label: "Banco de Prompts", href: "/prompts", icon: Lightbulb },
  { label: "Eventos", href: "/eventos", icon: Calendar },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const { isAdmin } = useIsAdmin();
  const { isMentor } = useIsMentor();
  const { isMentee } = useIsMentee();
  const [adminOpen, setAdminOpen] = useState(true);

  const isActive = (href: string) => location.pathname === href;
  const isAdminSection = location.pathname.startsWith("/admin");

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary glow-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Gênios da IA</span>
          <span className="text-xs text-muted-foreground">Plataforma de Automação</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard */}
        <Link
          to="/"
          onClick={handleClick}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
            isActive("/")
              ? "bg-primary/15 text-primary sidebar-active"
              : "text-muted-foreground hover:bg-secondary hover:text-sidebar-foreground"
          )}
        >
          <Layout className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive("/") ? "text-primary" : "group-hover:text-primary"
          )} />
          Dashboard
        </Link>

        {/* Aulas */}
        <Link
          to="/aulas"
          onClick={handleClick}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
            isActive("/aulas")
              ? "bg-primary/15 text-primary sidebar-active"
              : "text-muted-foreground hover:bg-secondary hover:text-sidebar-foreground"
          )}
        >
          <BookOpen className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive("/aulas") ? "text-primary" : "group-hover:text-primary"
          )} />
          Aulas
        </Link>

        {/* Tools Section */}
        {tools.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={handleClick}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
              isActive(item.href)
                ? "bg-primary/15 text-primary sidebar-active"
                : "text-muted-foreground hover:bg-secondary hover:text-sidebar-foreground"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-all duration-200",
              isActive(item.href) ? "text-primary" : "group-hover:text-primary"
            )} />
            {item.label}
          </Link>
        ))}

        {/* Mentoria - Apply (visible for all) */}
        <Link
          to="/mentoria"
          onClick={handleClick}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
            isActive("/mentoria")
              ? "bg-primary/15 text-primary sidebar-active"
              : "text-muted-foreground hover:bg-secondary hover:text-sidebar-foreground"
          )}
        >
          <MessageSquare className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive("/mentoria") ? "text-primary" : "group-hover:text-primary"
          )} />
          Aplicar Mentoria
        </Link>

        {/* Minha Mentoria - Only for approved mentees */}
        {isMentee && (
          <Link
            to="/minha-mentoria"
            onClick={handleClick}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1",
              isActive("/minha-mentoria")
                ? "bg-primary/15 text-primary sidebar-active"
                : "text-muted-foreground hover:bg-secondary hover:text-sidebar-foreground"
            )}
          >
            <GraduationCap className={cn(
              "h-5 w-5 transition-all duration-200",
              isActive("/minha-mentoria") ? "text-primary" : "group-hover:text-primary"
            )} />
            Minha Mentoria
          </Link>
        )}

        {/* Admin/Mentor Section - Only visible for admins and mentors */}
        {(isAdmin || isMentor) && (
          <div className="mt-6">
            <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
              <CollapsibleTrigger className="w-full">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isAdminSection
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isAdminSection ? "text-primary" : ""
                    )} />
                    <span>Gerenciar</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      adminOpen && "rotate-180"
                    )}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary/30 pl-4">
                  {/* Admin-only items */}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/modules"
                        onClick={handleClick}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isActive("/admin/modules")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary"
                        )}
                      >
                        <Layers className={cn(
                          "h-4 w-4 transition-all duration-200",
                          isActive("/admin/modules") ? "text-primary" : "group-hover:text-primary"
                        )} />
                        Módulos
                      </Link>
                      <Link
                        to="/admin/lessons"
                        onClick={handleClick}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isActive("/admin/lessons")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary"
                        )}
                      >
                        <BookOpen className={cn(
                          "h-4 w-4 transition-all duration-200",
                          isActive("/admin/lessons") ? "text-primary" : "group-hover:text-primary"
                        )} />
                        Aulas
                      </Link>
                      <Link
                        to="/admin/prompts"
                        onClick={handleClick}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isActive("/admin/prompts")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary"
                        )}
                      >
                        <Lightbulb className={cn(
                          "h-4 w-4 transition-all duration-200",
                          isActive("/admin/prompts") ? "text-primary" : "group-hover:text-primary"
                        )} />
                        Prompts
                      </Link>
                      <Link
                        to="/admin/templates"
                        onClick={handleClick}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isActive("/admin/templates")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary"
                        )}
                      >
                        <FileText className={cn(
                          "h-4 w-4 transition-all duration-200",
                          isActive("/admin/templates") ? "text-primary" : "group-hover:text-primary"
                        )} />
                        Templates
                      </Link>
                    </>
                  )}
                  
                  {/* Mentor/Admin items */}
                  <Link
                    to="/admin/users"
                    onClick={handleClick}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      isActive("/admin/users")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary"
                    )}
                  >
                    <Users className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isActive("/admin/users") ? "text-primary" : "group-hover:text-primary"
                    )} />
                    Usuários
                  </Link>
                  <Link
                    to="/admin/mentees"
                    onClick={handleClick}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      isActive("/admin/mentees")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary"
                    )}
                  >
                    <GraduationCap className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isActive("/admin/mentees") ? "text-primary" : "group-hover:text-primary"
                    )} />
                    Mentorados
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </nav>

      {/* Footer - Support Widget */}
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-xl glass-purple p-4 space-y-3">
          <div>
            <h4 className="font-medium text-sm text-foreground">Precisa de Ajuda?</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Entre em contato com nosso suporte
            </p>
          </div>
          <a
            href="https://wa.me/5571981939047?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20a%20plataforma%20G%C3%AAnios%20da%20IA."
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-success hover:bg-success/90 text-success-foreground py-2.5 text-sm font-medium transition-all duration-200 hover-scale"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
