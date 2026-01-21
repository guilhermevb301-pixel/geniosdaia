import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles, Users, BookOpen, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { label: "Alunos ativos", value: "2.500+", icon: Users },
  { label: "Templates prontos", value: "150+", icon: Zap },
  { label: "Horas de aulas", value: "80+", icon: BookOpen },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="px-4 py-2 text-sm border-primary/30 bg-primary/5 animate-fade-in"
          >
            <Sparkles className="h-4 w-4 mr-2 text-secondary" />
            Novo: Mentoria 1:1 disponível
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up">
            Domine{" "}
            <span className="text-gradient">n8n</span>
            {" "}e{" "}
            <span className="text-gradient">IA</span>
            <br />
            <span className="text-muted-foreground">para automações poderosas</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
            Acesse cursos exclusivos, templates prontos, mentoria individual e uma comunidade
            ativa de profissionais que dominam automações.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button asChild variant="hero" size="xl">
              <Link to="/onboarding">
                Comece por aqui
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <Link to="/cursos">
                <Play className="mr-2 h-5 w-5" />
                Ver aulas grátis
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-4 md:p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
