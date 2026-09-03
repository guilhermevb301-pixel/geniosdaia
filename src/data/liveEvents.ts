export interface LiveEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  attendees: number;
  status: "upcoming" | "live" | "recorded";
  type: "live" | "recording";
}

export const liveEvents: LiveEvent[] = [
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
    title: "Meetup: Comunidade Gênios",
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

export function nextLiveEvent(): LiveEvent | undefined {
  return liveEvents.find((e) => e.status === "upcoming");
}
