import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Layout, Users, MessageSquare, Calendar, Trophy } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Cursos Completos",
    description: "Do básico ao avançado, aprenda n8n e IA com aulas em vídeo, recursos e certificados.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Layout,
    title: "Templates Prontos",
    description: "Biblioteca com +150 templates n8n para importar e usar nas suas automações.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Users,
    title: "Comunidade Ativa",
    description: "Tire dúvidas, compartilhe projetos e faça networking com outros profissionais.",
    gradient: "from-accent to-primary",
  },
  {
    icon: MessageSquare,
    title: "Mentoria 1:1",
    description: "Sessões individuais com o mentor para acelerar seu aprendizado e projetos.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Calendar,
    title: "Eventos ao Vivo",
    description: "Webinars, lives e workshops exclusivos para a comunidade.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Trophy,
    title: "Gamificação",
    description: "Ganhe badges, suba no ranking e seja reconhecido pela comunidade.",
    gradient: "from-accent to-secondary",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa em{" "}
            <span className="text-gradient">um só lugar</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Uma plataforma completa para aprender, praticar e evoluir em automações com n8n e IA.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`} />
              
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
