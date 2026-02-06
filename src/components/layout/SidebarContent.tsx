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
  Lightbulb,
  Trophy,
  Award,
  NotebookPen,
  Bot,
  Image
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
  { label: "Meus GPTs", href: "/meus-gpts", icon: MessageSquare },
  { label: "Eventos", href: "/eventos", icon: Calendar },
  { label: "Desafios", href: "/desafios", icon: Trophy },
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
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
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
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/")
              ? "bg-accent text-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <Layout className="h-5 w-5 text-amber-400" />
          Dashboard
        </Link>

        {/* Aulas */}
        <Link
          to="/aulas"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/aulas")
              ? "bg-accent text-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <BookOpen className="h-5 w-5 text-amber-400" />
          Aulas
        </Link>

        {/* Tools Section */}
        {tools.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={handleClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
              isActive(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5 text-amber-400" />
            {item.label}
          </Link>
        ))}

        {/* Spacer */}
        <div className="my-4 border-t border-sidebar-border" />

        {/* Personal Section */}
        <Link
          to="/certificados"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/certificados")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <Award className="h-5 w-5 text-amber-400" />
          Certificados
        </Link>

        <Link
          to="/meu-caderno"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/meu-caderno")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <NotebookPen className="h-5 w-5 text-amber-400" />
          Meu Caderno
        </Link>

        {/* Mentoria - Apply (visible for all) */}
        <Link
          to="/mentoria"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
            isActive("/mentoria")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
          )}
        >
          <MessageSquare className="h-5 w-5 text-amber-400" />
          Aplicar Mentoria
        </Link>

        {/* Minha Mentoria - Only for approved mentees */}
        {isMentee && (
          <Link
            to="/minha-mentoria"
            onClick={handleClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
              isActive("/minha-mentoria")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
            )}
          >
            <GraduationCap className="h-5 w-5 text-amber-400" />
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
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isAdminSection
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
                  {/* Admin-only items */}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/modules"
                        onClick={handleClick}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive("/admin/modules")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                        )}
                      >
                        <Layers className="h-4 w-4" />
                        Módulos
                      </Link>
                      <Link
                        to="/admin/lessons"
                        onClick={handleClick}
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
                        to="/admin/prompts"
                        onClick={handleClick}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive("/admin/prompts")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                        )}
                      >
                        <Lightbulb className="h-4 w-4" />
                        Prompts
                      </Link>
                      <Link
                        to="/admin/templates"
                        onClick={handleClick}
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
                      <Link
                        to="/admin/gpts"
                        onClick={handleClick}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive("/admin/gpts")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                        )}
                      >
                        <Bot className="h-4 w-4" />
                        GPTs
                      </Link>
                    </>
                  )}
                  
                  {/* Mentor/Admin items */}
                  <Link
                    to="/admin/users"
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/users")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Usuários
                  </Link>
                  <Link
                    to="/admin/mentees"
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/mentees")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Mentorados
                  </Link>
                  <Link
                    to="/admin/challenges"
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/challenges")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                    Desafios
                  </Link>
                  <Link
                    to="/admin/banners"
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/banners")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <Image className="h-4 w-4" />
                    Banners
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </nav>

      {/* Footer - Support Widget */}
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
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
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-success hover:bg-success/90 text-success-foreground py-2.5 text-sm font-medium transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
