import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CreateUserPayload } from "@/hooks/useAllUsers";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: CreateUserPayload) => void;
  isLoading?: boolean;
}

// Produtos disponíveis — espelha os slugs do kiwify-webhook / admin-create-user
const PRODUCTS: { slug: string; name: string; hint?: string }[] = [
  { slug: "genios-ia", name: "Gênios da IA", hint: "libera todos os produtos" },
  { slug: "influencer-ia", name: "Influencer de IA Ultra-realista" },
  { slug: "agente-atendimento", name: "Agente de Atendimento IA + Claude Code" },
  { slug: "videos-cinematograficos", name: "Vídeos Cinematográficos com IA" },
  { slug: "fotos-profissionais", name: "Fotos Profissionais com IA" },
  { slug: "clone-criativo", name: "Método Clone Criativo" },
  { slug: "banco-prompts", name: "Banco de 200 Prompts" },
];

const DEFAULT_PASSWORD = "123456";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = () => ({
  name: "",
  email: "",
  password: DEFAULT_PASSWORD,
  products: [] as string[],
});

export function AddUserModal({ open, onOpenChange, onCreate, isLoading }: AddUserModalProps) {
  const [form, setForm] = useState(emptyForm());

  const emailValid = EMAIL_RE.test(form.email.trim());
  const canSubmit = emailValid && !isLoading;

  const toggleProduct = (slug: string) => {
    setForm((f) => ({
      ...f,
      products: f.products.includes(slug)
        ? f.products.filter((s) => s !== slug)
        : [...f.products, slug],
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCreate({
      email: form.email.trim().toLowerCase(),
      name: form.name.trim() || undefined,
      password: form.password.trim() || DEFAULT_PASSWORD,
      products: form.products,
    });
  };

  // Limpa o form ao fechar
  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(emptyForm());
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Adicionar usuário
          </DialogTitle>
          <DialogDescription>
            Cria o acesso manualmente e libera os produtos selecionados. Use quando a compra não
            liberou o acesso automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="add-user-name" className="text-xs">
              Nome (opcional)
            </Label>
            <Input
              id="add-user-name"
              placeholder="Nome do aluno"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="add-user-email" className="text-xs">
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-user-email"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={cn("mt-1", form.email && !emailValid && "border-destructive")}
            />
            {form.email && !emailValid && (
              <p className="text-xs text-destructive mt-1">E-mail inválido</p>
            )}
          </div>

          <div>
            <Label htmlFor="add-user-password" className="text-xs">
              Senha
            </Label>
            <Input
              id="add-user-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Padrão da plataforma: {DEFAULT_PASSWORD}. O aluno pode trocar depois.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Liberar produtos</Label>
            <div className="grid gap-2 rounded-lg border border-border p-3">
              {PRODUCTS.map((product) => {
                const checked = form.products.includes(product.slug);
                return (
                  <label
                    key={product.slug}
                    htmlFor={`prod-${product.slug}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors",
                      checked ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      id={`prod-${product.slug}`}
                      checked={checked}
                      onCheckedChange={() => toggleProduct(product.slug)}
                    />
                    <span className="text-sm flex-1">
                      {product.name}
                      {product.hint && (
                        <span className="text-xs text-muted-foreground ml-1">({product.hint})</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            {form.products.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum produto marcado — o usuário terá login, mas sem produto liberado.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar acesso"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
