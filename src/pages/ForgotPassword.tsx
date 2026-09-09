import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
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
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

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
    <AuthShell
      eyebrow="Acesso seguro"
      title={sent ? "Email enviado" : "Recuperar senha"}
      description={
        sent
          ? "Verifique sua caixa de entrada e spam para continuar."
          : "Digite seu email e enviaremos um link para redefinir sua senha."
      }
    >
      <div role="status" aria-live="polite" aria-atomic="true">
        {sent && (
          <div className="mt-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
              <Mail aria-hidden="true" className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-6 text-2xl text-foreground">Email enviado</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Enviamos um link de recuperação para{" "}
              <strong className="text-foreground">{email}</strong>. Verifique
              sua caixa de entrada e spam.
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

          <p className="mt-8 flex items-center gap-1 text-sm text-muted-foreground">
            <span>Lembrou a senha?</span>
            <Link
              to="/login"
              className="focus-ring inline-flex min-h-11 items-center rounded-sm px-1 text-primary hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
