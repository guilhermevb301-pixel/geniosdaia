import { useState } from "react";
import { MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Mentoria() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full bg-card border-border text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>
              <h2 className="text-xl font-semibold">Aplicação Enviada!</h2>
              <p className="text-sm text-muted-foreground">
                Recebemos sua aplicação para mentoria. Entraremos em contato em
                até 48 horas.
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="mt-4"
              >
                Enviar outra aplicação
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Aplicar para Mentoria</h1>
            <p className="text-sm text-muted-foreground">
              Mentoria individual 1:1 para acelerar seus resultados
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Formulário de Aplicação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    className="bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Nível de experiência com n8n</Label>
                <Select required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante - Nunca usei</SelectItem>
                    <SelectItem value="basic">Básico - Conheço o básico</SelectItem>
                    <SelectItem value="intermediate">
                      Intermediário - Já criei workflows
                    </SelectItem>
                    <SelectItem value="advanced">
                      Avançado - Uso profissionalmente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">
                  O que você espera alcançar com a mentoria?
                </Label>
                <Textarea
                  id="goals"
                  placeholder="Descreva seus objetivos..."
                  className="bg-background min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilidade semanal</Label>
                <Select required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione sua disponibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2h">1-2 horas por semana</SelectItem>
                    <SelectItem value="3-5h">3-5 horas por semana</SelectItem>
                    <SelectItem value="5-10h">5-10 horas por semana</SelectItem>
                    <SelectItem value="10h+">Mais de 10 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" variant="accent" className="w-full">
                Enviar Aplicação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
