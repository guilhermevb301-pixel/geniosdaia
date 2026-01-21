import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Clock, BarChart, Play, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    id: 1,
    title: "n8n do Zero ao Avançado",
    description: "Aprenda a criar automações do básico ao avançado com n8n.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop",
    duration: "12h",
    level: "Iniciante",
    lessons: 45,
    progress: 65,
    featured: true,
  },
  {
    id: 2,
    title: "Integração com IA (ChatGPT, Claude)",
    description: "Conecte modelos de IA às suas automações n8n.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    duration: "8h",
    level: "Intermediário",
    lessons: 32,
    progress: 30,
    featured: false,
  },
  {
    id: 3,
    title: "Automações para E-commerce",
    description: "Automatize processos de vendas, estoque e atendimento.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop",
    duration: "6h",
    level: "Intermediário",
    lessons: 28,
    progress: 0,
    featured: false,
  },
  {
    id: 4,
    title: "Webhooks e APIs Avançado",
    description: "Domine integrações complexas com webhooks e APIs REST.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
    duration: "5h",
    level: "Avançado",
    lessons: 22,
    progress: 0,
    featured: false,
  },
];

export function CoursesPreview() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Cursos <span className="text-gradient">em destaque</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Continue de onde parou ou explore novos conteúdos.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/cursos">
              Ver todos os cursos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                    <Play className="h-6 w-6 text-primary-foreground ml-1" />
                  </div>
                </div>

                {/* Featured badge */}
                {course.featured && (
                  <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
                    Em destaque
                  </Badge>
                )}

                {/* Level badge */}
                <Badge
                  variant="outline"
                  className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
                >
                  {course.level}
                </Badge>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart className="h-4 w-4" />
                    {course.lessons} aulas
                  </span>
                </div>

                {/* Progress */}
                {course.progress > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium text-primary">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                ) : (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/cursos/${course.id}`}>
                      Começar curso
                    </Link>
                  </Button>
                )}

                {course.progress > 0 && (
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/cursos/${course.id}`}>
                      {course.progress === 100 ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Revisar
                        </>
                      ) : (
                        "Continuar"
                      )}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
