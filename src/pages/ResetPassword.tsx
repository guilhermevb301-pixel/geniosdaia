import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AgentMark } from "@/components/brand/AgentMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    if (password !== confirmation) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: "Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.",
      });
      return;
    }

    setUpdated(true);
    toast({
      title: "Senha atualizada",
      description: "Agora você pode entrar com sua nova senha.",
    });
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
            <p className="micro-label text-primary">Acesso seguro</p>
            <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
              Defina uma nova senha para concluir a recuperação da sua conta.
            </p>
            <div className="mt-5 hidden items-center gap-2 border-t border-white/10 pt-4 lg:flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[11px] uppercase text-muted-foreground">
                canal protegido
              </span>
            </div>
          </div>

          <div aria-hidden="true" className="absolute right-0 top-16 h-20 w-px bg-codex/45" />
          <div aria-hidden="true" className="absolute bottom-14 left-0 h-px w-20 bg-claude/45" />
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
          <div className="w-full max-w-md">
            <h1 className="text-[2rem] text-foreground sm:text-4xl">RealFrame IA</h1>

            <div role="status" aria-live="polite" aria-atomic="true">
              {updated && (
                <div className="mt-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                    <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="mt-6 text-2xl text-foreground">Senha atualizada</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Sua nova senha foi salva. Entre novamente para continuar.
                  </p>
                  <Button
                    asChild
                    variant="accent"
                    className="mt-8 h-11 w-full rounded-lg bg-[#34d399] text-[#07130f] transition-[transform,opacity] hover:bg-[#34d399]/90 hover:shadow-none active:translate-y-px"
                  >
                    <Link to="/login">
                      Fazer login
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {!updated && (
              <>
                <div className="mt-10">
                  <h2 className="text-2xl text-foreground">Definir nova senha</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Use pelo menos 6 caracteres e confirme a senha abaixo.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova senha</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 rounded-lg border-white/10 bg-[#0b0d10] focus-visible:ring-[#34d399] focus-visible:ring-offset-card"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-confirmation">Confirmar nova senha</Label>
                    <Input
                      id="password-confirmation"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
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
                    {loading ? "Atualizando..." : "Salvar nova senha"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
