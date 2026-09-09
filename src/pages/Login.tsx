import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
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
    <AuthShell
      eyebrow="Área de membros"
      title="Entrar na RealFrame IA"
      description="Continue suas aulas, templates e sistemas práticos de onde parou."
    >
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

      <p className="mt-7 flex items-center gap-1 text-sm text-muted-foreground">
        <span>Não tem conta?</span>
        <Link
          to="/register"
          className="focus-ring inline-flex min-h-11 items-center rounded-sm px-1 text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
