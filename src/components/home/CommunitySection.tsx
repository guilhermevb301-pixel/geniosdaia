import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, MessageSquare, Heart, Bookmark, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const posts = [
  {
    id: 1,
    author: {
      name: "Maria Silva",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      role: "Top Contributor",
    },
    title: "Como integrei WhatsApp com n8n para atendimento automatizado",
    excerpt: "Depois de muito estudo, consegui criar um fluxo completo de atendimento...",
    tags: ["WhatsApp", "Atendimento", "Tutorial"],
    likes: 89,
    comments: 24,
    isPinned: true,
  },
  {
    id: 2,
    author: {
      name: "João Santos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      role: "Member",
    },
    title: "Dúvida: Como fazer retry automático em webhooks?",
    excerpt: "Estou tentando configurar um retry quando o webhook falha, mas...",
    tags: ["Dúvida", "Webhook", "Error Handling"],
    likes: 12,
    comments: 8,
    isPinned: false,
  },
  {
    id: 3,
    author: {
      name: "Ana Costa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      role: "Pro Member",
    },
    title: "Template: Bot de agendamento com Google Calendar + Telegram",
    excerpt: "Compartilhando meu template de bot que permite agendar reuniões...",
    tags: ["Template", "Google Calendar", "Telegram"],
    likes: 156,
    comments: 42,
    isPinned: false,
  },
];

const trendingTopics = [
  { tag: "OpenAI", count: 234 },
  { tag: "WhatsApp", count: 189 },
  { tag: "E-commerce", count: 145 },
  { tag: "CRM", count: 98 },
  { tag: "Webhooks", count: 87 },
];

export function CommunitySection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Da <span className="text-gradient">comunidade</span>
                </h2>
                <p className="text-muted-foreground">
                  Discussões recentes e destaques dos membros.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/comunidade">
                  Ver tudo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="group border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{post.author.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {post.author.role}
                          </Badge>
                          {post.isPinned && (
                            <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
                              Fixado
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-muted text-muted-foreground"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            {post.comments}
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Bookmark className="h-4 w-4" />
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Tópicos em alta</h3>
                </div>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <Link
                      key={topic.tag}
                      to={`/comunidade?tag=${topic.tag}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-5">
                          {index + 1}
                        </span>
                        <span className="font-medium">#{topic.tag}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {topic.count} posts
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="border-primary/30 gradient-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-2">Faça parte!</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Tire suas dúvidas, compartilhe projetos e conecte-se com outros profissionais.
                </p>
                <Button variant="secondary" className="w-full bg-background text-foreground hover:bg-background/90">
                  Participar da comunidade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
