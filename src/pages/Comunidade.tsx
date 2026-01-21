import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  TrendingUp,
  Plus,
  Filter,
  Users,
  Flame
} from "lucide-react";

const posts = [
  {
    id: 1,
    author: {
      name: "Maria Silva",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      role: "Top Contributor",
    },
    title: "Como integrei WhatsApp com n8n para atendimento automatizado",
    excerpt: "Depois de muito estudo, consegui criar um fluxo completo de atendimento que responde clientes automaticamente, categoriza mensagens e notifica a equipe quando necessário. Neste post, compartilho o passo a passo completo...",
    tags: ["WhatsApp", "Atendimento", "Tutorial"],
    likes: 89,
    comments: 24,
    isPinned: true,
    createdAt: "2h atrás",
  },
  {
    id: 2,
    author: {
      name: "João Santos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      role: "Member",
    },
    title: "Dúvida: Como fazer retry automático em webhooks?",
    excerpt: "Estou tentando configurar um retry quando o webhook falha, mas não encontrei uma solução nativa no n8n. Alguém já passou por isso? O cenário é: quando a API de destino retorna 500...",
    tags: ["Dúvida", "Webhook", "Error Handling"],
    likes: 12,
    comments: 8,
    isPinned: false,
    createdAt: "5h atrás",
  },
  {
    id: 3,
    author: {
      name: "Ana Costa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      role: "Pro Member",
    },
    title: "Template: Bot de agendamento com Google Calendar + Telegram",
    excerpt: "Compartilhando meu template de bot que permite agendar reuniões diretamente pelo Telegram! O usuário envia uma mensagem, o bot verifica disponibilidade no Google Calendar e confirma o horário...",
    tags: ["Template", "Google Calendar", "Telegram"],
    likes: 156,
    comments: 42,
    isPinned: false,
    createdAt: "1d atrás",
  },
  {
    id: 4,
    author: {
      name: "Pedro Lima",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      role: "Member",
    },
    title: "Automatizei todo o onboarding de clientes da minha empresa",
    excerpt: "Quando um cliente fecha negócio, automaticamente: cria pasta no Drive, envia e-mail de boas-vindas, adiciona no CRM, cria canal no Slack e agenda reunião de kickoff...",
    tags: ["Case", "Onboarding", "CRM"],
    likes: 234,
    comments: 67,
    isPinned: false,
    createdAt: "2d atrás",
  },
  {
    id: 5,
    author: {
      name: "Carla Mendes",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      role: "Top Contributor",
    },
    title: "Guia completo: Integrando n8n com APIs que exigem OAuth 2.0",
    excerpt: "OAuth pode ser confuso no início, mas depois que você entende o fluxo fica simples. Neste guia, explico como configurar credenciais OAuth 2.0 no n8n para qualquer API...",
    tags: ["Tutorial", "OAuth", "API"],
    likes: 312,
    comments: 89,
    isPinned: false,
    createdAt: "3d atrás",
  },
];

const trendingTopics = [
  { tag: "OpenAI", count: 234 },
  { tag: "WhatsApp", count: 189 },
  { tag: "E-commerce", count: 145 },
  { tag: "CRM", count: 98 },
  { tag: "Webhooks", count: 87 },
];

const topContributors = [
  { name: "Maria Silva", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", posts: 45, likes: 1234 },
  { name: "Carla Mendes", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", posts: 38, likes: 987 },
  { name: "Pedro Lima", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", posts: 32, likes: 876 },
];

const Comunidade = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-muted/30 border-b border-border">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Comunidade
                </h1>
                <p className="text-muted-foreground">
                  Discussões, dúvidas e projetos da comunidade n8n Brasil.
                </p>
              </div>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Novo Post
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Posts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Search & Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar posts..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>

                {/* Create Post */}
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea 
                          placeholder="Compartilhe algo com a comunidade..."
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button size="sm">Publicar</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts List */}
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card
                      key={post.id}
                      className="group border-border/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold">{post.author.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {post.author.role}
                              </Badge>
                              {post.isPinned && (
                                <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
                                  Fixado
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                • {post.createdAt}
                              </span>
                            </div>

                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs bg-muted text-muted-foreground cursor-pointer hover:bg-primary/10"
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
                {/* Stats */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Comunidade</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gradient">2.5k+</p>
                        <p className="text-sm text-muted-foreground">Membros</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gradient">12k+</p>
                        <p className="text-sm text-muted-foreground">Posts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Tópicos em alta</h3>
                    </div>
                    <div className="space-y-3">
                      {trendingTopics.map((topic, index) => (
                        <div
                          key={topic.tag}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Contributors */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Flame className="h-5 w-5 text-secondary" />
                      <h3 className="font-semibold">Top Contribuidores</h3>
                    </div>
                    <div className="space-y-3">
                      {topContributors.map((user, index) => (
                        <div
                          key={user.name}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium text-muted-foreground w-4">
                            {index + 1}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.posts} posts • {user.likes} likes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Comunidade;
