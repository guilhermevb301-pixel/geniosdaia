import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Calendar, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout/AppLayout";

const stats = [
  { label: "Aulas em progresso", value: "4", icon: BookOpen },
  { label: "Templates disponíveis", value: "25", icon: Sparkles },
  { label: "Próximo evento", value: "Quinta 18h", icon: Calendar },
];

const continueLearning = [
  { id: 1, title: "Introdução ao n8n", module: "Módulo 1", progress: 75 },
  { id: 2, title: "Integrações com IA", module: "Módulo 3", progress: 40 },
  { id: 3, title: "Workflows Avançados", module: "Módulo 2", progress: 20 },
];

const popularTemplates = [
  { id: 1, name: "Lead Capture → CRM", tags: ["Slack", "HubSpot"] },
  { id: 2, name: "Email Parser com GPT", tags: ["Gmail", "OpenAI"] },
  { id: 3, name: "Social Media Scheduler", tags: ["Twitter", "Buffer"] },
  { id: 4, name: "Invoice Automation", tags: ["Stripe", "Notion"] },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Seu progresso e atividades recentes
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Learning */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Continuar de onde parou
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/aulas" className="text-xs">
                Ver todas
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {continueLearning.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {course.module}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={course.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Popular Templates */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Templates Populares
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/templates" className="text-xs">
                Ver todos
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {popularTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10">
                      <Sparkles className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium">{template.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
