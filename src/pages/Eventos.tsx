import { Calendar, Clock, Users, Video, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";

const events = [
  {
    id: 1,
    title: "Workshop: n8n do Zero ao Avançado",
    description: "Aprenda a criar workflows complexos em 2 horas.",
    date: "23 Jan",
    time: "18:00",
    attendees: 45,
    status: "upcoming",
    type: "live",
  },
  {
    id: 2,
    title: "Q&A: Dúvidas sobre Automação com IA",
    description: "Sessão de perguntas e respostas ao vivo.",
    date: "25 Jan",
    time: "19:00",
    attendees: 32,
    status: "upcoming",
    type: "live",
  },
  {
    id: 3,
    title: "Masterclass: Integrações Avançadas",
    description: "Técnicas avançadas de integração entre sistemas.",
    date: "28 Jan",
    time: "14:00",
    attendees: 28,
    status: "upcoming",
    type: "live",
  },
  {
    id: 4,
    title: "Meetup: Comunidade Gêneos",
    description: "Encontro mensal da comunidade para networking.",
    date: "15 Jan",
    time: "19:00",
    attendees: 67,
    status: "recorded",
    type: "recording",
  },
  {
    id: 5,
    title: "Workshop: APIs e Webhooks",
    description: "Como trabalhar com APIs externas no n8n.",
    date: "10 Jan",
    time: "18:00",
    attendees: 89,
    status: "recorded",
    type: "recording",
  },
];

const statusStyles: Record<string, string> = {
  upcoming: "bg-success/10 text-success border-success/20",
  live: "bg-destructive/10 text-destructive border-destructive/20",
  recorded: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  upcoming: "Em breve",
  live: "Ao vivo",
  recorded: "Gravado",
};

export default function Eventos() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            Workshops, lives e encontros da comunidade
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="bg-card border-border hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Date */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-muted text-center">
                    <span className="text-lg font-semibold">
                      {event.date.split(" ")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {event.date.split(" ")[1]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{event.title}</h3>
                      <Badge
                        variant="outline"
                        className={statusStyles[event.status]}
                      >
                        {statusLabels[event.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendees} participantes
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {event.status === "recorded" ? (
                      <Button variant="outline" size="sm">
                        <Video className="mr-1 h-3 w-3" />
                        Assistir
                      </Button>
                    ) : (
                      <Button variant="accent" size="sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        Inscrever
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
