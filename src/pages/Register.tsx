import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgentMark } from "@/components/brand/AgentMark";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getPasswordValidationError } from "@/lib/passwordPolicy";

export default function Register() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Format phone number to show only digits
  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 11 digits (Brazilian phone format)
    return digits.slice(0, 11);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  // Format phone for display (XX) XXXXX-XXXX
  const formatPhoneDisplay = (value: string) => {
    if (value.length === 0) return "";
    if (value.length <= 2) return `(${value}`;
    if (value.length <= 7) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem",
      });
      return;
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: passwordError,
      });
      return;
    }

    // Validate phone (must have at least 10 digits - DDD + number)
    if (phone.length < 10) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um número de telefone válido com DDD",
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, { phone });
    setLoading(false);

    if (error) {
      const friendlyMessage = error.message.includes("already registered")
        ? "Este email já está cadastrado. Tente fazer login."
        : "Não foi possível criar sua conta. Tente novamente.";
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: friendlyMessage,
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar o cadastro.",
      });
      navigate("/login");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#0b0d10] p-4 sm:p-6 lg:p-10">
      <div aria-hidden="true" className="absolute left-0 top-1/4 h-32 w-px bg-codex/35" />
      <div aria-hidden="true" className="absolute bottom-1/4 right-0 h-24 w-px bg-claude/35" />

      <section className="grid min-h-[calc(100svh-2rem)] w-full max-w-5xl grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-white/10 bg-card lg:min-h-[680px] lg:grid-cols-[0.72fr_1.28fr] lg:grid-rows-1">
        <aside className="relative flex min-h-24 items-center justify-between overflow-hidden border-b border-border bg-[#101318] p-4 sm:min-h-36 sm:p-6 lg:min-h-[680px] lg:flex-col lg:items-start lg:border-b-0 lg:border-r lg:p-8">
          <AgentMark
            size="lg"
            className="h-14 w-14 p-2 sm:h-20 sm:w-20 sm:p-2.5"
          />

          <div className="max-w-[15rem] text-right lg:text-left">
            <p className="micro-label text-primary">Novo acesso</p>
            <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
              Crie sua conta para acompanhar aulas, produtos e sua evolução.
            </p>
            <div className="mt-5 hidden items-center gap-2 border-t border-white/10 pt-4 lg:flex">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[11px] uppercase text-muted-foreground">
                cadastro seguro
              </span>
            </div>
          </div>

          <div aria-hidden="true" className="absolute right-0 top-16 h-20 w-px bg-codex/45" />
          <div aria-hidden="true" className="absolute bottom-14 left-0 h-px w-20 bg-claude/45" />
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-12">
          <div className="w-full max-w-md">
            <div>
              <h1 className="text-[2rem] text-foreground sm:text-4xl">RealFrame IA</h1>
              <h2 className="mt-6 text-2xl text-foreground">Criar conta</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Preencha os dados para se cadastrar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  value={formatPhoneDisplay(phone)}
                  onChange={handlePhoneChange}
                  className="h-11 rounded-lg border-white/10 bg-[#0b0d10] focus-visible:ring-[#34d399] focus-visible:ring-offset-card"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-white/10 bg-[#0b0d10] focus-visible:ring-[#34d399] focus-visible:ring-offset-card"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Criando conta..." : "Criar conta"}
                {!loading && <ArrowRight aria-hidden="true" />}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
              <span>Já tem conta?</span>
              <Link
                to="/login"
                className="focus-ring inline-flex min-h-11 items-center rounded-sm text-primary hover:underline"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
