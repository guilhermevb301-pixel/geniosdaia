import { useState } from "react";
import { MessageSquare, CheckCircle, ExternalLink } from "lucide-react";
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

const WHATSAPP_NUMBER = "5571981939047";

const INTEREST_OPTIONS = [
  { value: "Automatizações com IA", label: "Automatizações com IA" },
  { value: "Marketing Digital com IA", label: "Marketing Digital com IA" },
  { value: "Produto Digital / SaaS com IA", label: "Produto Digital / SaaS com IA" },
  { value: "Criação de Conteúdo com IA", label: "Criação de Conteúdo com IA" },
  { value: "Renda Extra com IA", label: "Renda Extra com IA" },
  { value: "Outro", label: "Outro" },
];

export default function Mentoria() {
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [objective, setObjective] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = `Olá, Gui! Sou o ${name}, preenchi o formulário e tenho interesse na mentoria. Meu foco principal é ${interest}. Objetivo: ${objective}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full bg-card border-border text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h2 className="text-xl font-semibold">Formulário enviado!</h2>
              <p className="text-sm text-muted-foreground">
                Uma nova aba foi aberta com o WhatsApp do Gui. Se não abriu automaticamente, clique abaixo.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => {
                    const message = `Olá, Gui! Sou o ${name}, preenchi o formulário e tenho interesse na mentoria. Meu foco principal é ${interest}. Objetivo: ${objective}`;
                    window.open(
                      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
                      "_blank"
                    );
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setInterest("");
                    setObjective("");
                  }}
                >
                  Voltar ao formulário
                </Button>
              </div>
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
            <h1 className="text-2xl font-semibold">Mentoria Individual</h1>
            <p className="text-sm text-muted-foreground">
              Responda 3 perguntas rápidas e fale direto com o Gui
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Qualificação rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Qual é o seu nome?</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>

              {/* Área de interesse */}
              <div className="space-y-2">
                <Label htmlFor="interest">Qual é a sua principal área de interesse?</Label>
                <Select value={interest} onValueChange={setInterest} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEREST_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Objetivo */}
              <div className="space-y-2">
                <Label htmlFor="objective">
                  Qual é o seu objetivo com a mentoria? Onde quer chegar?
                </Label>
                <Textarea
                  id="objective"
                  placeholder="Ex: quero criar meu primeiro agente de IA e vender para empresas locais..."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="bg-background min-h-[100px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={!name || !interest || !objective}
              >
                <MessageSquare className="h-4 w-4" />
                Falar com o Gui no WhatsApp
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao clicar, você será redirecionado para o WhatsApp com sua mensagem já preenchida.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
