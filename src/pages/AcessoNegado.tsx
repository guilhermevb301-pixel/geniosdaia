import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldX } from "lucide-react";
import { AgentMark } from "@/components/brand/AgentMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { APP_ROUTES } from "@/lib/appRoutes";

export default function AcessoNegado() {
  const { user } = useAuth();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#0b0d10] p-4 sm:p-6 lg:p-10">
      <div aria-hidden="true" className="absolute left-0 top-1/4 h-32 w-px bg-codex/35" />
      <div aria-hidden="true" className="absolute bottom-1/4 right-0 h-24 w-px bg-claude/35" />

      <section className="grid min-h-[calc(100svh-2rem)] w-full max-w-5xl grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-white/10 bg-card sm:min-h-0 lg:grid-cols-[0.72fr_1.28fr] lg:grid-rows-1">
        <aside className="relative flex min-h-24 items-center justify-between overflow-hidden border-b border-border bg-[#101318] p-4 sm:min-h-36 sm:p-6 lg:min-h-[620px] lg:flex-col lg:items-start lg:border-b-0 lg:border-r lg:p-8">
          <AgentMark
            size="lg"
            className="h-14 w-14 p-2 sm:h-20 sm:w-20 sm:p-2.5"
          />

          <div className="max-w-[15rem] text-right lg:text-left">
            <p className="micro-label text-primary">Acesso da conta</p>
            <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
              Consulte o status dos seus conteúdos sem perder a sessão atual.
            </p>
            <div className="mt-5 hidden items-center gap-2 border-t border-white/10 pt-4 lg:flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[11px] uppercase text-muted-foreground">
                sessão preservada
              </span>
            </div>
          </div>

          <div aria-hidden="true" className="absolute right-0 top-16 h-20 w-px bg-codex/45" />
          <div aria-hidden="true" className="absolute bottom-14 left-0 h-px w-20 bg-claude/45" />
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
          <div className="w-full max-w-md">
            <h1 className="text-[2rem] text-foreground sm:text-4xl">RealFrame IA</h1>

            <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-lg border border-claude/25 bg-claude/10">
              <ShieldX aria-hidden="true" className="h-5 w-5 text-claude" />
            </div>

            <h2 className="mt-6 text-2xl text-foreground">Acesso não liberado</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {user
                ? "Sua conta está ativa, mas este conteúdo ainda não está disponível para o seu acesso."
                : "Entre na sua conta para consultar os produtos e conteúdos vinculados ao seu cadastro."}
            </p>

            <p className="mt-6 border-l border-primary/30 pl-4 text-sm text-muted-foreground">
              Se o acesso acabou de ser liberado, aguarde alguns instantes e tente novamente.
            </p>

            {user ? (
              <div className="mt-8 space-y-3">
                <Button
                  asChild
                  variant="accent"
                  className="h-11 w-full rounded-lg bg-[#34d399] text-[#07130f] transition-[transform,opacity] hover:bg-[#34d399]/90 hover:shadow-none active:translate-y-px"
                >
                  <Link to={APP_ROUTES.myProducts}>
                    Ver meus produtos
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-lg transition-[transform,opacity] hover:shadow-none"
                >
                  <Link to={APP_ROUTES.lessons}>
                    <ArrowLeft aria-hidden="true" />
                    Voltar para as aulas
                  </Link>
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="accent"
                className="mt-8 h-11 w-full rounded-lg bg-[#34d399] text-[#07130f] transition-[transform,opacity] hover:bg-[#34d399]/90 hover:shadow-none active:translate-y-px"
              >
                <Link to={APP_ROUTES.login}>
                  Ir para o login
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
