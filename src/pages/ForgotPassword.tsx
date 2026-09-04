import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgentMark } from "@/components/brand/AgentMark";
import { ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/login`,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o email. Tente novamente.",
      });
    } else {
      setSent(true);
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
            <p className="micro-label text-primary">Acesso seguro</p>
            <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
              Recupere sua conta e retome sua jornada na área de membros.
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
            <div>
              <h1 className="text-[2rem] text-foreground sm:text-4xl">RealFrame IA</h1>
            </div>

            <div role="status" aria-live="polite" aria-atomic="true">
              {sent && (
                <div className="mt-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                    <Mail aria-hidden="true" className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="mt-6 text-2xl text-foreground">Email enviado</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Enviamos um link de recuperação para <strong className="text-foreground">{email}</strong>.
                    Verifique sua caixa de entrada e spam.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-8 h-11 w-full rounded-lg transition-[transform,opacity] hover:shadow-none"
                  >
                    <Link to="/login">
                      <ArrowLeft aria-hidden="true" />
                      Voltar para o login
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {!sent && (
              <>
                <div className="mt-10">
                  <h2 className="text-2xl text-foreground">Recuperar senha</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Digite seu email e enviaremos um link para redefinir sua senha.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

                  <Button
                    type="submit"
                    variant="accent"
                    className="h-11 w-full rounded-lg bg-[#34d399] text-[#07130f] transition-[transform,opacity] hover:bg-[#34d399]/90 hover:shadow-none active:translate-y-px"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>
                </form>

                <p className="mt-8 text-sm text-muted-foreground">
                  Lembrou a senha?{" "}
                  <Link to="/login" className="focus-ring rounded-sm text-primary hover:underline">
                    Fazer login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
