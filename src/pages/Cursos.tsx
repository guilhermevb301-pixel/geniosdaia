import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Clock, 
  BarChart, 
  Play, 
  CheckCircle, 
  Star,
  Users,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    id: 1,
    title: "n8n do Zero ao Avançado",
    description: "Aprenda a criar automações do básico ao avançado com n8n. Domine workflows, triggers, webhooks e integrações.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=340&fit=crop",
    duration: "12h",
    level: "Iniciante",
    lessons: 45,
    students: 1240,
    rating: 4.9,
    progress: 65,
    featured: true,
    tags: ["n8n", "Básico", "Workflows"],
  },
  {
    id: 2,
    title: "Integração com IA (ChatGPT, Claude)",
    description: "Conecte modelos de IA às suas automações n8n. Crie chatbots, assistentes e processadores de texto.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop",
    duration: "8h",
    level: "Intermediário",
    lessons: 32,
    students: 890,
    rating: 4.8,
    progress: 30,
    featured: true,
    tags: ["IA", "ChatGPT", "Claude", "OpenAI"],
  },
  {
    id: 3,
    title: "Automações para E-commerce",
    description: "Automatize processos de vendas, estoque, atendimento e logística para sua loja online.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=340&fit=crop",
    duration: "6h",
    level: "Intermediário",
    lessons: 28,
    students: 654,
    rating: 4.7,
    progress: 0,
    featured: false,
    tags: ["E-commerce", "Shopify", "WooCommerce"],
  },
  {
    id: 4,
    title: "Webhooks e APIs Avançado",
    description: "Domine integrações complexas com webhooks, APIs REST e GraphQL no n8n.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=340&fit=crop",
    duration: "5h",
    level: "Avançado",
    lessons: 22,
    students: 432,
    rating: 4.9,
    progress: 0,
    featured: false,
    tags: ["API", "Webhooks", "REST", "GraphQL"],
  },
  {
    id: 5,
    title: "Automações para Marketing Digital",
    description: "Leads, e-mail marketing, social media e analytics automatizados com n8n.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop",
    duration: "7h",
    level: "Intermediário",
    lessons: 35,
    students: 756,
    rating: 4.6,
    progress: 0,
    featured: false,
    tags: ["Marketing", "Email", "Social Media"],
  },
  {
    id: 6,
    title: "Projeto Prático: CRM Automatizado",
    description: "Construa um sistema CRM completo com automações de vendas, follow-up e relatórios.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=340&fit=crop",
    duration: "10h",
    level: "Avançado",
    lessons: 40,
    students: 345,
    rating: 4.8,
    progress: 0,
    featured: false,
    tags: ["CRM", "Vendas", "Projeto"],
  },
];

const levelColors: Record<string, string> = {
  "Iniciante": "bg-accent/10 text-accent border-accent/30",
  "Intermediário": "bg-warning/10 text-warning-foreground border-warning/30",
  "Avançado": "bg-secondary/10 text-secondary border-secondary/30",
};

const Cursos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 gradient-hero text-primary-foreground">
          <div className="container">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4 border-primary-foreground/30 text-primary-foreground">
                <BookOpen className="h-4 w-4 mr-2" />
                {courses.length} cursos disponíveis
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Cursos de n8n e Automação
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Aprenda a criar automações poderosas do zero ao avançado com vídeos práticos, 
                recursos e suporte da comunidade.
              </p>
              
              {/* Search */}
              <div className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar cursos..."
                    className="pl-10 bg-background text-foreground"
                  />
                </div>
                <Button variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="py-12 md:py-20">
          <div className="container">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                Todos
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                Iniciante
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                Intermediário
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                Avançado
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                IA
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                E-commerce
              </Badge>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className={`absolute top-3 right-3 ${levelColors[course.level]}`}
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
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>

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
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {course.rating}
                      </span>
                    </div>

                    {/* Students */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {course.students.toLocaleString()} alunos
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
                      </div>
                    ) : (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to={`/cursos/${course.id}`}>
                          Começar curso
                        </Link>
                      </Button>
                    )}
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

export default Cursos;
