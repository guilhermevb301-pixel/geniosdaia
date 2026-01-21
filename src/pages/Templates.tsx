import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Star,
  Zap,
  Layout,
  Copy
} from "lucide-react";

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
  {
    id: 7,
    title: "Slack Notification Hub",
    description: "Centraliza notificações de múltiplos serviços no Slack.",
    integrations: ["Slack", "GitHub", "Jira", "Trello"],
    downloads: 987,
    stars: 4.8,
    complexity: "Fácil",
    category: "Produtividade",
  },
  {
    id: 8,
    title: "Data Sync Multi-Cloud",
    description: "Sincroniza dados entre Google Drive, Dropbox e OneDrive.",
    integrations: ["Google Drive", "Dropbox", "OneDrive"],
    downloads: 567,
    stars: 4.5,
    complexity: "Médio",
    category: "Produtividade",
  },
  {
    id: 9,
    title: "AI Content Generator",
    description: "Gera conteúdo para blog e redes sociais com Claude/GPT.",
    integrations: ["OpenAI", "Anthropic", "Notion", "WordPress"],
    downloads: 1456,
    stars: 4.9,
    complexity: "Médio",
    category: "IA",
  },
];

const complexityColors: Record<string, string> = {
  "Fácil": "bg-accent/10 text-accent border-accent/30",
  "Médio": "bg-warning/10 text-warning-foreground border-warning/30",
  "Avançado": "bg-secondary/10 text-secondary border-secondary/30",
};

const categories = ["Todos", "Marketing", "IA", "E-commerce", "Finanças", "Produtividade", "Conteúdo"];

const Templates = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4">
                <Layout className="h-4 w-4 mr-2" />
                {templates.length}0+ templates disponíveis
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Templates <span className="text-gradient">n8n</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Automações prontas para usar. Importe para seu n8n e personalize 
                conforme sua necessidade.
              </p>
              
              {/* Search */}
              <div className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por integração, categoria..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 md:py-20">
          <div className="container">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <Badge 
                  key={cat}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {cat}
                </Badge>
              ))}
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
                        {template.downloads.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
