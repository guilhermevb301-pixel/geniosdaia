import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, MessageSquare, Video, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Sessões individuais de 1 hora",
  "Review de projetos e automações",
  "Consultoria para casos específicos",
  "Acesso prioritário ao mentor",
  "Gravação das sessões",
  "Suporte pós-sessão por 7 dias",
];

export function MentorshipCTA() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm border-secondary/30 bg-secondary/5"
            >
              <MessageSquare className="h-4 w-4 mr-2 text-secondary" />
              Mentoria Individual
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold">
              Acelere seu aprendizado com{" "}
              <span className="text-gradient">mentoria 1:1</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Sessões individuais para tirar dúvidas específicas, revisar seus projetos
              e receber orientação personalizada do mentor.
            </p>

            {/* Benefits */}
            <ul className="grid sm:grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/mentoria">
                  Aplicar para mentoria
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/mentoria#como-funciona">
                  Como funciona
                </Link>
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Background decorations */}
              <div className="absolute inset-0 rounded-3xl gradient-primary opacity-10 blur-3xl" />
              
              {/* Main card */}
              <div className="relative bg-card rounded-3xl border border-border/50 p-8 shadow-xl">
                <div className="space-y-6">
                  {/* Mentor avatar placeholder */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                      M
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Mentor n8n</h4>
                      <p className="text-sm text-muted-foreground">
                        Especialista em automações
                      </p>
                    </div>
                  </div>

                  {/* Session types */}
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                      <Video className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Sessão por vídeo</p>
                        <p className="text-sm text-muted-foreground">
                          1 hora • R$297
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                      <Calendar className="h-6 w-6 text-secondary" />
                      <div>
                        <p className="font-medium">Pacote mensal</p>
                        <p className="text-sm text-muted-foreground">
                          4 sessões • R$997
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Availability indicator */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                    </span>
                    <span className="text-muted-foreground">
                      3 vagas disponíveis este mês
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 p-3 rounded-xl bg-card border border-border/50 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium">95% satisfação</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 p-3 rounded-xl bg-card border border-border/50 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">+200 mentorias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
