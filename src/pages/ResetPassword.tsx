import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPasswordValidationError } from "@/lib/passwordPolicy";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const { toast } = useToast();
  const { isPasswordRecovery, loading: authLoading, signOut } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: passwordError,
      });
      return;
    }

    if (password !== confirmation) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description:
          "Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.",
      });
      return;
    }

    await signOut();
    setLoading(false);
    setUpdated(true);
    toast({
      title: "Senha atualizada",
      description: "Agora você pode entrar com sua nova senha.",
    });
  };

  return (
    <AuthShell
      eyebrow="Acesso seguro"
      title={
        updated
          ? "Senha atualizada"
          : !authLoading && !isPasswordRecovery
            ? "Link inválido"
            : "Definir nova senha"
      }
      description={
        updated
          ? "Agora você pode entrar com sua nova senha."
          : !authLoading && !isPasswordRecovery
            ? "Solicite um novo link de recuperação para proteger sua conta."
            : "Use pelo menos 8 caracteres, uma letra maiúscula e um número."
      }
    >
      <div role="status" aria-live="polite" aria-atomic="true">
        {updated && (
          <div className="mt-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
              <CheckCircle2
                aria-hidden="true"
                className="h-5 w-5 text-primary"
              />
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

      {!authLoading && !isPasswordRecovery && !updated && (
        <div className="mt-10">
          <h2 className="text-2xl text-foreground">
            Link inválido ou expirado
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Solicite um novo link de recuperação para proteger sua conta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="accent"
              className="h-11 flex-1 bg-[#34d399] text-[#07130f] hover:bg-[#34d399]/90"
            >
              <Link to="/forgot-password">Solicitar novo link</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 flex-1">
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </div>
        </div>
      )}

      {authLoading && (
        <div
          className="mt-10 h-44 animate-pulse rounded-lg bg-muted"
          aria-label="Validando link"
        />
      )}

      {!authLoading && isPasswordRecovery && !updated && (
        <>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-lg border-white/10 bg-[#0b0d10] focus-visible:ring-[#34d399] focus-visible:ring-offset-card"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirmation">
                Confirmar nova senha
              </Label>
              <Input
                id="password-confirmation"
                type="password"
                autoComplete="new-password"
                minLength={8}
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
    </AuthShell>
  );
}
