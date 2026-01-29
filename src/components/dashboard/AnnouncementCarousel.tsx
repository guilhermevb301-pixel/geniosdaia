import { Link } from "react-router-dom";
import { Users, Calendar, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const announcements = [
  {
    id: 1,
    title: "Junte-se à Comunidade",
    description: "Conecte-se com outros automatizadores e troque experiências",
    icon: Users,
    gradient: "from-primary via-primary to-accent",
    cta: "Acessar Comunidade",
    link: "/eventos",
  },
  {
    id: 2,
    title: "Próximo Evento Ao Vivo",
    description: "Workshop: Automações Avançadas com IA - Quinta às 18h",
    icon: Calendar,
    gradient: "from-accent via-accent to-primary",
    cta: "Ver Eventos",
    link: "/eventos",
  },
  {
    id: 3,
    title: "Novos Templates Disponíveis",
    description: "Confira os templates mais recentes da nossa biblioteca",
    icon: Sparkles,
    gradient: "from-primary to-chart-4",
    cta: "Explorar Templates",
    link: "/templates",
  },
];

export function AnnouncementCarousel() {
  return (
    <Carousel
      opts={{
        loop: true,
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {announcements.map((item) => (
          <CarouselItem key={item.id} className="pl-3 md:pl-4 md:basis-1/2 lg:basis-1/3">
            <div
              className={`relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br ${item.gradient} p-6 flex flex-col justify-between group hover-scale cursor-pointer`}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-primary-foreground/5" />
              </div>
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-foreground/20 -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/20 translate-y-1/2 -translate-x-1/2 blur-2xl" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary-foreground">{item.title}</h3>
                <p className="text-sm text-primary-foreground/80 mt-1.5 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="relative z-10 w-fit bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 backdrop-blur-sm font-medium"
                asChild
              >
                <Link to={item.link}>
                  {item.cta}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4 bg-card border-border hover:bg-secondary hover:border-primary/40" />
      <CarouselNext className="hidden md:flex -right-4 bg-card border-border hover:bg-secondary hover:border-primary/40" />
    </Carousel>
  );
}
