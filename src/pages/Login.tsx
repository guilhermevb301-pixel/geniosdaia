import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgentMark } from "@/components/brand/AgentMark";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await signIn(normalizedEmail, password);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Email ou senha incorretos. Verifique suas credenciais.",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] p-4 sm:p-6 lg:p-10">
      <div aria-hidden="true" className="absolute left-0 top-1/4 h-32 w-px bg-codex/35" />
      <div aria-hidden="true" className="absolute bottom-1/4 right-0 h-24 w-px bg-claude/35" />

      <section className="grid min-h-[calc(100svh-2rem)] w-full max-w-5xl grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-white/10 bg-card sm:min-h-0 lg:grid-cols-[0.72fr_1.28fr] lg:grid-rows-1">
        <aside className="relative flex min-h-24 items-center justify-between overflow-hidden border-b border-border bg-[#101318] p-4 sm:min-h-36 sm:p-6 lg:min-h-[620px] lg:flex-col lg:items-start lg:border-b-0 lg:border-r lg:p-8">
          <AgentMark
            size="lg"
            className="h-14 w-14 p-2 sm:h-20 sm:w-20 sm:p-2.5"
          />

          <div className="max-w-[15rem] text-right lg:text-left">
            <p className="micro-label text-primary">Área de membros</p>
            <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
              Sistemas práticos para criar, automatizar e executar com IA.
            </p>
            <div className="mt-5 hidden items-center gap-2 border-t border-white/10 pt-4 lg:flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[11px] uppercase text-muted-foreground">
                sistema online
              </span>
            </div>
          </div>

          <div aria-hidden="true" className="absolute right-0 top-16 h-20 w-px bg-codex/45" />
          <div aria-hidden="true" className="absolute bottom-14 left-0 h-px w-20 bg-claude/45" />
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
          <div className="w-full max-w-md">
            <div>
              <h1 className="text-[2rem] text-foreground sm:text-4xl">RealFrame IA</h1>
              <p className="mt-3 max-w-sm text-muted-foreground">
                Entre para continuar de onde parou.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg border-white/10 bg-[#0b0d10] focus-visible:ring-[#34d399] focus-visible:ring-offset-card"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="/forgot-password"
                    className="focus-ring inline-flex min-h-11 items-center rounded-sm px-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-white/10 bg-[#0b0d10] focus-visible:ring-[#34d399] focus-visible:ring-offset-card"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                className="h-11 w-full rounded-lg bg-[#34d399] text-[#07130f] transition-[transform,opacity] hover:bg-[#34d399]/90 hover:shadow-none active:translate-y-px"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
                {!loading && <ArrowRight aria-hidden="true" />}
              </Button>
            </form>

            <p className="mt-8 flex items-center gap-1 text-sm text-muted-foreground">
              <span>Não tem conta?</span>
              <Link
                to="/register"
                className="focus-ring inline-flex min-h-11 items-center rounded-sm px-1 text-primary hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
