import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Layout,
  Radio,
  MessageSquare,
  MessageCircle,
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
  Image,
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
import { SidebarUserFooter } from "./SidebarUserFooter";
import { buildWhatsAppUrl, MENTORSHIP_APPLICATION_URL } from "@/lib/contactLinks";
import { BrandLogo } from "@/components/brand/BrandLogo";

const NAV_ITEM_BASE =
  "focus-ring group relative flex items-center gap-3 rounded-md px-2 py-2.5 text-[14px] before:absolute before:-left-3 before:top-1/2 before:h-5 before:w-[2px] before:-translate-y-1/2 before:scale-y-0 before:rounded-full before:bg-primary before:opacity-0 before:transition-[transform,opacity] before:duration-200 [&>svg]:text-muted-foreground";

const ADMIN_NAV_ITEM_BASE =
  "focus-ring group flex items-center gap-2 rounded-md px-3 py-2 text-sm [&>svg]:shrink-0 [&>svg]:text-muted-foreground";

function navItemClass(active: boolean) {
  return cn(
    NAV_ITEM_BASE,
    active
      ? "bg-secondary text-foreground before:scale-y-100 before:opacity-100 [&>svg]:text-primary"
      : "text-muted-foreground hover:bg-card hover:text-foreground hover:[&>svg]:text-primary",
  );
}

function adminNavItemClass(active: boolean) {
  return cn(
    ADMIN_NAV_ITEM_BASE,
    active
      ? "bg-secondary text-foreground [&>svg]:text-primary"
      : "text-muted-foreground hover:bg-card hover:text-foreground hover:[&>svg]:text-primary",
  );
}

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

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === href
      : location.pathname === href || location.pathname.startsWith(`${href}/`);
  const isAdminSection = location.pathname.startsWith("/admin");

  const handleClick = () => {
    onNavigate?.();
  };

  // Prefetch data when hovering over links
  const handlePrefetch = useCallback(
    (route: string) => {
      const prefetchFn = getPrefetchHandler(route, queryClient);
      if (prefetchFn) {
        prefetchFn();
      }
    },
    [queryClient],
  );

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="px-6 pb-8 pt-8">
        <BrandLogo size="lg" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-5 pb-4">
        <p className="eyebrow mb-3 px-2 text-muted-foreground">Conteúdo</p>
        {/* Dashboard */}
        <Link
          to="/"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/")}
          className={navItemClass(isActive("/"))}
        >
          <Layout className="h-5 w-5 shrink-0" />
          Dashboard
        </Link>

        {/* Aulas */}
        <Link
          to="/aulas"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/aulas")}
          className={navItemClass(isActive("/aulas"))}
        >
          <BookOpen className="h-5 w-5 shrink-0" />
          Aulas
        </Link>

        {/* Banco de Prompts - link direto */}
        <Link
          to="/prompts"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/prompts")}
          className={navItemClass(isActive("/prompts"))}
        >
          <Lightbulb className="h-5 w-5 shrink-0" />
          Banco de Prompts
        </Link>

        <Link
          to="/eventos"
          onClick={handleClick}
          className={navItemClass(isActive("/eventos"))}
        >
          <Radio className="h-5 w-5 shrink-0" />
          Lives
        </Link>

        {/* Bloco pessoal */}
        <p className="eyebrow mb-3 mt-8 px-2 text-muted-foreground">Você</p>

        {/* Personal Section */}
        <Link
          to="/certificados"
          onClick={handleClick}
          className={navItemClass(isActive("/certificados"))}
        >
          <Award className="h-5 w-5 shrink-0" />
          Certificados
        </Link>

        <Link
          to="/meu-caderno"
          onClick={handleClick}
          className={navItemClass(isActive("/meu-caderno"))}
        >
          <NotebookPen className="h-5 w-5 shrink-0" />
          Meu Caderno
        </Link>

        {/* Mentoria - Apply (visible for all) */}
        <a
          href={MENTORSHIP_APPLICATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={navItemClass(false)}
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          Aplicar Mentoria
        </a>

        {/* Minha Mentoria - Only for approved mentees */}
        {isMentee && (
          <Link
            to="/minha-mentoria"
            onClick={handleClick}
            className={navItemClass(isActive("/minha-mentoria"))}
          >
            <GraduationCap className="h-5 w-5 shrink-0" />
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
                    "group flex items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium [&_svg]:text-muted-foreground",
                    isAdminSection
                      ? "bg-secondary text-foreground [&_svg]:text-primary"
                      : "text-muted-foreground hover:bg-card hover:text-foreground hover:[&_svg]:text-primary",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>Gerenciar</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      adminOpen && "rotate-180",
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
                        className={adminNavItemClass(
                          isActive("/admin/modules"),
                        )}
                      >
                        <Layers className="h-4 w-4" />
                        Módulos
                      </Link>
                      <Link
                        to="/admin/lessons"
                        onClick={handleClick}
                        className={adminNavItemClass(
                          isActive("/admin/lessons"),
                        )}
                      >
                        <BookOpen className="h-4 w-4" />
                        Aulas
                      </Link>
                      <Link
                        to="/admin/prompts"
                        onClick={handleClick}
                        className={adminNavItemClass(
                          isActive("/admin/prompts"),
                        )}
                      >
                        <Lightbulb className="h-4 w-4" />
                        Prompts
                      </Link>
                      <Link
                        to="/admin/templates"
                        onClick={handleClick}
                        className={adminNavItemClass(
                          isActive("/admin/templates"),
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        Templates
                      </Link>
                      <Link
                        to="/admin/gpts"
                        onClick={handleClick}
                        className={adminNavItemClass(isActive("/admin/gpts"))}
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
                    className={adminNavItemClass(isActive("/admin/users"))}
                  >
                    <Users className="h-4 w-4" />
                    Usuários
                  </Link>
                  <Link
                    to="/admin/mentees"
                    onClick={handleClick}
                    className={adminNavItemClass(isActive("/admin/mentees"))}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Mentorados
                  </Link>
                  <Link
                    to="/admin/challenges"
                    onClick={handleClick}
                    className={adminNavItemClass(isActive("/admin/challenges"))}
                  >
                    <Trophy className="h-4 w-4" />
                    Desafios
                  </Link>
                  <Link
                    to="/admin/banners"
                    onClick={handleClick}
                    className={adminNavItemClass(isActive("/admin/banners"))}
                  >
                    <Image className="h-4 w-4" />
                    Banners
                  </Link>
                  <Link
                    to="/admin/appearance"
                    onClick={handleClick}
                    className={adminNavItemClass(isActive("/admin/appearance"))}
                  >
                    <Palette className="h-4 w-4" />
                    Aparência
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Comunidade */}
        <p className="eyebrow mb-3 mt-8 px-2 text-muted-foreground">
          Comunidade
        </p>
        <a
          href={buildWhatsAppUrl("Olá! Quero entrar no grupo da RealFrame IA.")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={navItemClass(false)}
        >
          <MessageCircle className="h-5 w-5 shrink-0" />
          Entrar no grupo
        </a>

        <p className="eyebrow mb-3 mt-8 px-2 text-muted-foreground">
          Recursos
        </p>
        <Link
          to="/templates"
          onClick={handleClick}
          onMouseEnter={() => handlePrefetch("/templates")}
          className={navItemClass(isActive("/templates"))}
        >
          <Zap className="h-5 w-5 shrink-0" />
          Templates
        </Link>
      </nav>

      <SidebarUserFooter />
    </div>
  );
}
