import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, Eye, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const templates = [
  {
    id: 1,
    title: "Lead Capture + CRM Sync",
    description: "Captura leads do formulário e sincroniza com seu CRM automaticamente.",
    integrations: ["Typeform", "HubSpot", "Slack"],
    downloads: 1240,
    stars: 4.9,
    complexity: "Fácil",
    category: "Marketing",
  },
  {
    id: 2,
    title: "ChatGPT Customer Support",
    description: "Bot de atendimento inteligente com ChatGPT para responder clientes.",
    integrations: ["OpenAI", "Telegram", "Notion"],
    downloads: 890,
    stars: 4.8,
    complexity: "Médio",
    category: "IA",
  },
  {
    id: 3,
    title: "E-commerce Order Automation",
    description: "Automatiza confirmações de pedido, estoque e notificações.",
    integrations: ["Shopify", "Google Sheets", "WhatsApp"],
    downloads: 756,
    stars: 4.7,
    complexity: "Médio",
    category: "E-commerce",
  },
  {
    id: 4,
    title: "Social Media Scheduler",
    description: "Agende e publique posts em múltiplas redes sociais.",
    integrations: ["Twitter", "LinkedIn", "Instagram"],
    downloads: 2100,
    stars: 4.9,
    complexity: "Fácil",
    category: "Marketing",
  },
  {
    id: 5,
    title: "Invoice to Accounting",
    description: "Extrai dados de faturas e envia para seu sistema contábil.",
    integrations: ["Gmail", "QuickBooks", "Airtable"],
    downloads: 432,
    stars: 4.6,
    complexity: "Avançado",
    category: "Finanças",
  },
  {
    id: 6,
    title: "RSS to Newsletter",
    description: "Transforma posts de blogs em newsletters automáticas.",
    integrations: ["RSS", "Mailchimp", "Notion"],
    downloads: 654,
    stars: 4.5,
    complexity: "Fácil",
    category: "Conteúdo",
  },
];

const complexityColors: Record<string, string> = {
  "Fácil": "bg-accent/10 text-accent border-accent/30",
  "Médio": "bg-warning/10 text-warning-foreground border-warning/30",
  "Avançado": "bg-secondary/10 text-secondary border-secondary/30",
};

export function TemplatesPreview() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Templates <span className="text-gradient">populares</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Automações prontas para importar e usar no seu n8n.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/templates">
              Ver todos os templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${complexityColors[template.complexity]}`}
                      >
                        {template.complexity}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{template.stars}</span>
                  </div>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Integrations */}
                <div className="flex flex-wrap gap-2">
                  {template.integrations.map((integration) => (
                    <Badge
                      key={integration}
                      variant="secondary"
                      className="text-xs bg-muted text-muted-foreground"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {integration}
                    </Badge>
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {template.downloads.toLocaleString()} downloads
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Usar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
