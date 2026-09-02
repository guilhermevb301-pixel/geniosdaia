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
  Palette,
  Lock,
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
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPrefetchHandler } from "@/lib/prefetchRoutes";

const NAV_ITEM_BASE =
  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-1 before:absolute before:left-0 before:top-1/2 before:h-0 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary before:transition-all before:duration-300";

const tools = [
  { label: "Meus GPTs", href: "/meus-gpts", icon: MessageSquare },
  { label: "Eventos", href: "/eventos", icon: Calendar },
  { label: "Desafios", href: "/desafios", icon: Trophy },
];


interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();
  const { isMentor } = useIsMentor();
  const { isMentee } = useIsMentee();
  const [adminOpen, setAdminOpen] = useState(true);


  const isActive = (href: string) => location.pathname === href;
  const isAdminSection = location.pathname.startsWith("/admin");
  const isPromptsSection = location.pathname === "/prompts";

  const handleClick = () => {
    onNavigate?.();
  };

  // Prefetch data when hovering over links
  const handlePrefetch = useCallback((route: string) => {
    const prefetchFn = getPrefetchHandler(route, queryClient);
    if (prefetchFn) {
      prefetchFn();
    }
  }, [queryClient]);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow-sm">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-2xl leading-none text-sidebar-foreground">
            RealFrame <span className="text-primary [font-size:inherit]">IA</span>
          </span>
          <span className="eyebrow mt-1 text-muted-foreground">Área de membros</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard */}
        <Link
          to="/"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/")}
          className={cn(
            NAV_ITEM_BASE,
            isActive("/")
              ? "bg-primary/10 text-primary before:h-5"
              : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
          )}
        >
          <Layout className={"h-5 w-5 shrink-0"} />
          Dashboard
        </Link>

        {/* Aulas */}
        <Link
          to="/aulas"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/aulas")}
          className={cn(
            NAV_ITEM_BASE,
            isActive("/aulas")
              ? "bg-primary/10 text-primary before:h-5"
              : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
          )}
        >
          <BookOpen className={"h-5 w-5 shrink-0"} />
          Aulas
        </Link>

        {/* Templates Link */}
        <Link
          to="/templates"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/templates")}
          className={cn(
            NAV_ITEM_BASE,
            isActive("/templates")
              ? "bg-primary/10 text-primary before:h-5"
              : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
          )}
        >
          <Zap className={"h-5 w-5 shrink-0"} />
          Templates
        </Link>

        {/* Banco de Prompts - link direto */}
        <Link
          to="/prompts"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/prompts")}
          className={cn(
            NAV_ITEM_BASE,
            isPromptsSection
              ? "bg-primary/10 text-primary before:h-5"
              : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
          )}
        >
          <Lightbulb className={"h-5 w-5 shrink-0"} />
          Banco de Prompts
        </Link>

        {/* Other Tools */}
        {tools.map((item) => {
          const isDesafios = item.href === "/desafios";
          if (isDesafios && !isAdmin) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium mb-1 opacity-40 cursor-not-allowed select-none"
                title="Em breve"
              >
                <item.icon className="h-5 w-5 text-sidebar-foreground/50" />
                <span>{item.label}</span>
                <Lock className="h-3.5 w-3.5 ml-auto text-sidebar-foreground/50" />
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleClick}
              onMouseEnter={() => handlePrefetch(item.href)}
              className={cn(
                NAV_ITEM_BASE,
                isActive(item.href)
                  ? "bg-primary/10 text-primary before:h-5"
                  : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
              )}
            >
              <item.icon className={"h-5 w-5 shrink-0"} />
              {item.label}
            </Link>
          );
        })}

        {/* Spacer */}
        <div className="my-4 border-t border-sidebar-border" />

        {/* Personal Section */}
        <Link
          to="/certificados"
          onClick={handleClick}
          className={cn(
            NAV_ITEM_BASE,
            isActive("/certificados")
              ? "bg-primary/10 text-primary before:h-5"
              : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
          )}
        >
          <Award className={"h-5 w-5 shrink-0"} />
          Certificados
        </Link>

        <Link
          to="/meu-caderno"
          onClick={handleClick}
          className={cn(
            NAV_ITEM_BASE,
            isActive("/meu-caderno")
              ? "bg-primary/10 text-primary before:h-5"
              : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
          )}
        >
          <NotebookPen className={"h-5 w-5 shrink-0"} />
          Meu Caderno
        </Link>

        {/* Mentoria - Apply (visible for all) */}
        <Link
          to="/mentoria"
          onClick={handleClick}
          className={cn(
            NAV_ITEM_BASE,
            isActive("/mentoria")
              ? "bg-primary/10 text-primary before:h-5"
              : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
          )}
        >
          <MessageSquare className={"h-5 w-5 shrink-0"} />
          Aplicar Mentoria
        </Link>

        {/* Minha Mentoria - Only for approved mentees */}
        {isMentee && (
          <Link
            to="/minha-mentoria"
            onClick={handleClick}
            className={cn(
              NAV_ITEM_BASE,
              isActive("/minha-mentoria")
                ? "bg-primary/10 text-primary before:h-5"
                : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
            )}
          >
            <GraduationCap className={"h-5 w-5 shrink-0"} />
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
                      ? "bg-primary/10 text-primary before:h-5"
                      : "text-sidebar-foreground/90 hover:bg-primary/5 hover:text-primary hover:before:h-3"
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
                            ? "text-primary bg-primary/10 border border-primary/20"
                            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                            ? "text-primary bg-primary/10 border border-primary/20"
                            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                            ? "text-primary bg-primary/10 border border-primary/20"
                            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                            ? "text-primary bg-primary/10 border border-primary/20"
                            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                            ? "text-primary bg-primary/10 border border-primary/20"
                            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
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
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <Image className="h-4 w-4" />
                    Banners
                  </Link>
                  <Link
                    to="/admin/appearance"
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/admin/appearance")
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
                    )}
                  >
                    <Palette className="h-4 w-4" />
                    Aparência
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
