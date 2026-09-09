import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
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
    <AuthShell
      eyebrow="Novo acesso"
      title="Criar conta"
      description="Cadastre seus dados para acompanhar aulas, produtos e sua evolução."
      className="max-w-[440px]"
    >
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
    </AuthShell>
  );
}
