import { BookOpen, Clock, BarChart3, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout/AppLayout";

const courses = [
  {
    id: 1,
    title: "Introdução ao n8n",
    description: "Aprenda os fundamentos do n8n e crie seus primeiros workflows.",
    level: "Iniciante",
    duration: "2h 30min",
    lessons: 12,
    progress: 75,
  },
  {
    id: 2,
    title: "Integrações com IA",
    description: "Conecte GPT, Claude e outras IAs aos seus workflows.",
    level: "Intermediário",
    duration: "4h 15min",
    lessons: 18,
    progress: 40,
  },
  {
    id: 3,
    title: "Workflows Avançados",
    description: "Técnicas avançadas para automações complexas.",
    level: "Avançado",
    duration: "6h 00min",
    lessons: 24,
    progress: 20,
  },
  {
    id: 4,
    title: "Automação de Vendas",
    description: "Automatize seu funil de vendas com n8n e CRMs.",
    level: "Intermediário",
    duration: "3h 45min",
    lessons: 15,
    progress: 0,
  },
  {
    id: 5,
    title: "Webhooks e APIs",
    description: "Domine webhooks e integrações com APIs externas.",
    level: "Intermediário",
    duration: "3h 00min",
    lessons: 14,
    progress: 0,
  },
  {
    id: 6,
    title: "Deploy e Produção",
    description: "Coloque seus workflows em produção de forma segura.",
    level: "Avançado",
    duration: "2h 00min",
    lessons: 8,
    progress: 0,
  },
];

const levelColors: Record<string, string> = {
  Iniciante: "bg-success/10 text-success border-success/20",
  Intermediário: "bg-accent/10 text-accent border-accent/20",
  Avançado: "bg-primary/10 text-primary border-primary/20",
};

export default function Aulas() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Aulas</h1>
            <p className="text-sm text-muted-foreground">
              Todos os cursos disponíveis na plataforma
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className={levelColors[course.level]}>
                    {course.level}
                  </Badge>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {course.lessons} aulas
                  </div>
                </div>

                {/* Progress */}
                {course.progress > 0 ? (
                  <div className="flex items-center gap-2">
                    <Progress value={course.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Play className="h-3 w-3" />
                    Não iniciado
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
