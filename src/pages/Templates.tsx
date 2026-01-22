import { Search, Sparkles, Download, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

const templates = [
  {
    id: 1,
    name: "Lead Capture → CRM",
    description: "Capture leads de formulários e envie automaticamente para seu CRM.",
    tags: ["Slack", "HubSpot", "Forms"],
    downloads: 234,
  },
  {
    id: 2,
    name: "Email Parser com GPT",
    description: "Extraia informações de emails usando GPT e organize em planilhas.",
    tags: ["Gmail", "OpenAI", "Sheets"],
    downloads: 189,
  },
  {
    id: 3,
    name: "Social Media Scheduler",
    description: "Agende posts em múltiplas redes sociais a partir de uma planilha.",
    tags: ["Twitter", "LinkedIn", "Buffer"],
    downloads: 156,
  },
  {
    id: 4,
    name: "Invoice Automation",
    description: "Gere faturas automaticamente quando pagamentos são confirmados.",
    tags: ["Stripe", "Notion", "PDF"],
    downloads: 145,
  },
  {
    id: 5,
    name: "Support Ticket Router",
    description: "Roteie tickets de suporte com base em palavras-chave usando IA.",
    tags: ["Zendesk", "Slack", "AI"],
    downloads: 123,
  },
  {
    id: 6,
    name: "Data Sync Bidirectional",
    description: "Sincronize dados entre duas plataformas em tempo real.",
    tags: ["Airtable", "PostgreSQL"],
    downloads: 98,
  },
];

export default function Templates() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Templates</h1>
            <p className="text-sm text-muted-foreground">
              Workflows prontos para usar no n8n
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar templates..."
              className="pl-9 bg-muted border-0"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="bg-card border-border hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Download className="h-3 w-3" />
                    {template.downloads}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-1 h-3 w-3" />
                    Baixar
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
