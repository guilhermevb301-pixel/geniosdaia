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
    gradient: "from-primary to-purple-600",
    cta: "Acessar Comunidade",
    link: "/eventos",
  },
  {
    id: 2,
    title: "Próximo Evento Ao Vivo",
    description: "Workshop: Automações Avançadas com IA - Quinta às 18h",
    icon: Calendar,
    gradient: "from-blue-500 to-cyan-500",
    cta: "Ver Eventos",
    link: "/eventos",
  },
  {
    id: 3,
    title: "Novos Templates Disponíveis",
    description: "Confira os templates mais recentes da nossa biblioteca",
    icon: Sparkles,
    gradient: "from-accent to-orange-500",
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
      <CarouselContent className="-ml-2 md:-ml-4">
        {announcements.map((item) => (
          <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
            <div
              className={`relative h-44 rounded-xl overflow-hidden bg-gradient-to-br ${item.gradient} p-5 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-background/20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-background/20 translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-background/20 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-background" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-background">{item.title}</h3>
                <p className="text-sm text-background/80 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="relative z-10 w-fit bg-background/20 hover:bg-background/30 text-background border-0"
                asChild
              >
                <Link to={item.link}>
                  {item.cta}
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4 bg-card border-border hover:bg-muted" />
      <CarouselNext className="hidden md:flex -right-4 bg-card border-border hover:bg-muted" />
    </Carousel>
  );
}
