import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, Users, Video, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Workshop: Automações com IA",
    description: "Aprenda a integrar ChatGPT e Claude em seus fluxos n8n.",
    date: "2025-02-15",
    time: "19:00",
    duration: "2h",
    type: "online",
    attendees: 156,
    maxAttendees: 200,
    isFeatured: true,
  },
  {
    id: 2,
    title: "Live: Q&A com o Mentor",
    description: "Sessão ao vivo para tirar dúvidas da comunidade.",
    date: "2025-02-08",
    time: "20:00",
    duration: "1h30",
    type: "online",
    attendees: 89,
    maxAttendees: null,
    isFeatured: false,
  },
  {
    id: 3,
    title: "Meetup São Paulo",
    description: "Encontro presencial da comunidade n8n Brasil.",
    date: "2025-02-22",
    time: "14:00",
    duration: "4h",
    type: "presencial",
    attendees: 34,
    maxAttendees: 50,
    isFeatured: false,
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatWeekday(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  }).format(date);
}

export function EventsPreview() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Próximos <span className="text-gradient">eventos</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Webinars, lives e meetups da comunidade.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/eventos">
              Ver calendário completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className={`group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                event.isFeatured ? "md:col-span-1 lg:row-span-1" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Date */}
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 rounded-xl gradient-primary flex flex-col items-center justify-center text-primary-foreground">
                      <span className="text-2xl font-bold leading-none">
                        {formatDate(event.date).split(" ")[0]}
                      </span>
                      <span className="text-xs uppercase opacity-80">
                        {formatDate(event.date).split(" ")[1]}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block capitalize">
                      {formatWeekday(event.date)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
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
                      {event.isFeatured && (
                        <Badge className="bg-secondary text-secondary-foreground">
                          Destaque
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
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

                    {/* CTA */}
                    <Button
                      size="sm"
                      className="w-full"
                      variant={event.isFeatured ? "default" : "outline"}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Inscrever-se
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
