import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, MapPin, ArrowRight } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Workshop: Automações com IA",
    description: "Aprenda a integrar ChatGPT e Claude em seus fluxos n8n. Vamos construir um chatbot completo do zero.",
    date: "2025-02-15",
    time: "19:00",
    duration: "2h",
    type: "online",
    attendees: 156,
    maxAttendees: 200,
    isFeatured: true,
    instructor: "Mentor n8n",
    price: "Gratuito",
  },
  {
    id: 2,
    title: "Live: Q&A com o Mentor",
    description: "Sessão ao vivo para tirar dúvidas da comunidade. Traga suas perguntas sobre n8n, automações e IA.",
    date: "2025-02-08",
    time: "20:00",
    duration: "1h30",
    type: "online",
    attendees: 89,
    maxAttendees: null,
    isFeatured: false,
    instructor: "Mentor n8n",
    price: "Gratuito",
  },
  {
    id: 3,
    title: "Meetup São Paulo",
    description: "Encontro presencial da comunidade n8n Brasil. Networking, apresentações e muito aprendizado.",
    date: "2025-02-22",
    time: "14:00",
    duration: "4h",
    type: "presencial",
    attendees: 34,
    maxAttendees: 50,
    isFeatured: false,
    location: "São Paulo, SP",
    price: "R$49",
  },
  {
    id: 4,
    title: "Masterclass: APIs Avançadas",
    description: "Domine integrações complexas com OAuth, GraphQL e webhooks customizados no n8n.",
    date: "2025-03-01",
    time: "10:00",
    duration: "3h",
    type: "online",
    attendees: 67,
    maxAttendees: 100,
    isFeatured: true,
    instructor: "Mentor n8n",
    price: "R$97",
  },
  {
    id: 5,
    title: "Hackathon n8n Brasil",
    description: "24 horas de criação de automações! Forme equipes e dispute prêmios criando os melhores workflows.",
    date: "2025-03-15",
    time: "09:00",
    duration: "24h",
    type: "online",
    attendees: 120,
    maxAttendees: 200,
    isFeatured: true,
    instructor: "Comunidade",
    price: "Gratuito",
  },
  {
    id: 6,
    title: "Office Hours: Dúvidas Técnicas",
    description: "Horário aberto para debugging ao vivo. Traga seu workflow problemático e resolveremos juntos.",
    date: "2025-02-12",
    time: "18:00",
    duration: "1h",
    type: "online",
    attendees: 23,
    maxAttendees: 30,
    isFeatured: false,
    instructor: "Mentor n8n",
    price: "Gratuito",
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatWeekday(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(date);
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    day: new Intl.DateTimeFormat("pt-BR", { day: "numeric" }).format(date),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
  };
}

const Eventos = () => {
  const featuredEvents = events.filter(e => e.isFeatured);
  const upcomingEvents = events.filter(e => !e.isFeatured);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                {events.length} eventos programados
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Eventos da <span className="text-gradient">comunidade</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Webinars, workshops, lives e meetups para aprender e conectar 
                com outros profissionais de automação.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="py-12 md:py-20">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Eventos em destaque</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {featuredEvents.map((event) => {
                const shortDate = formatShortDate(event.date);
                return (
                  <Card
                    key={event.id}
                    className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Header with gradient */}
                    <div className="h-24 gradient-primary flex items-end p-4">
                      <Badge className="bg-background/20 text-primary-foreground border-0">
                        {event.isFeatured ? "Destaque" : event.type}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6 -mt-8 relative">
                      {/* Date card */}
                      <div className="absolute -top-8 right-6 w-16 h-16 rounded-xl bg-card border border-border shadow-lg flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{shortDate.day}</span>
                        <span className="text-xs uppercase text-muted-foreground">{shortDate.month}</span>
                      </div>
                      
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={
                              event.type === "online"
                                ? "border-primary/30 bg-primary/5 text-primary"
                                : "border-accent/30 bg-accent/5 text-accent"
                            }
                          >
                            {event.type === "online" ? (
                              <Video className="h-3 w-3 mr-1" />
                            ) : (
                              <MapPin className="h-3 w-3 mr-1" />
                            )}
                            {event.type}
                          </Badge>
                          <Badge variant="outline">{event.price}</Badge>
                        </div>
                        
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        
                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time} • {event.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.attendees}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}
                          </span>
                        </div>
                        
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Inscrever-se
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upcoming Events */}
            <h2 className="text-2xl font-bold mb-8">Próximos eventos</h2>
            
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group border-border/50 hover:border-primary/30 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Date */}
                      <div className="flex-shrink-0 text-center md:w-24">
                        <div className="text-3xl font-bold text-primary">
                          {formatShortDate(event.date).day}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {formatShortDate(event.date).month}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize mt-1">
                          {formatWeekday(event.date)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={
                              event.type === "online"
                                ? "border-primary/30 bg-primary/5 text-primary"
                                : "border-accent/30 bg-accent/5 text-accent"
                            }
                          >
                            {event.type === "online" ? (
                              <Video className="h-3 w-3 mr-1" />
                            ) : (
                              <MapPin className="h-3 w-3 mr-1" />
                            )}
                            {event.type}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time} • {event.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.attendees}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">{event.price}</div>
                        </div>
                        <Button>
                          Inscrever
                          <ArrowRight className="ml-2 h-4 w-4" />
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

export default Eventos;
