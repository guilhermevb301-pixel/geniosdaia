import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login
    console.log("Login:", { email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-login relative overflow-hidden">
        {/* Decorative text */}
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 select-none">
          <div className="space-y-4 text-center">
            <p className="text-6xl font-bold text-white/10 tracking-widest">AUTOMAÇÃO</p>
            <p className="text-7xl font-bold text-white/15 tracking-widest">IA</p>
            <p className="text-5xl font-bold text-white/10 tracking-widest">N8N</p>
            <p className="text-8xl font-bold text-white/20 tracking-widest">GÊNEOS</p>
            <p className="text-6xl font-bold text-white/10 tracking-widest">WORKFLOWS</p>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Gêneos da IA</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Bem-vindo</h1>
            <p className="text-sm text-muted-foreground">
              Faça login para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <Button type="submit" variant="accent" className="w-full">
              Entrar
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
