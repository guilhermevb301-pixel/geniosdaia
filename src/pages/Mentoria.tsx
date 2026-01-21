import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  Video, 
  Clock,
  Star,
  Users,
  Zap,
  FileText
} from "lucide-react";

const benefits = [
  "Sessões individuais de 1 hora via vídeo",
  "Review detalhado de projetos e automações",
  "Consultoria para casos específicos do seu negócio",
  "Acesso prioritário ao mentor",
  "Gravação das sessões para revisão",
  "Suporte por mensagem por 7 dias após a sessão",
];

const packages = [
  {
    id: 1,
    name: "Sessão Única",
    price: 297,
    description: "Ideal para tirar dúvidas pontuais ou revisar um projeto específico.",
    features: ["1 sessão de 1 hora", "Gravação da sessão", "7 dias de suporte"],
    popular: false,
  },
  {
    id: 2,
    name: "Pacote Mensal",
    price: 997,
    description: "Para quem quer acompanhamento contínuo e acelerar resultados.",
    features: ["4 sessões de 1 hora", "Gravação das sessões", "30 dias de suporte", "Prioridade no agendamento"],
    popular: true,
  },
  {
    id: 3,
    name: "Pacote Intensivo",
    price: 2497,
    description: "Mentoria intensiva para projetos complexos ou transição de carreira.",
    features: ["12 sessões de 1 hora", "Gravação das sessões", "90 dias de suporte", "Review de código ilimitado", "Acesso a templates exclusivos"],
    popular: false,
  },
];

const testimonials = [
  {
    name: "Carlos Eduardo",
    role: "Founder, TechFlow",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    content: "A mentoria foi fundamental para estruturar as automações da minha startup. Em 3 sessões, consegui implementar tudo que precisava.",
    rating: 5,
  },
  {
    name: "Juliana Martins",
    role: "Analista de Marketing",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    content: "Transformou completamente minha forma de trabalhar. Automatizei processos que levavam horas e agora tenho tempo para focar no estratégico.",
    rating: 5,
  },
  {
    name: "Roberto Alves",
    role: "Freelancer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    content: "O investimento se pagou na primeira semana. Consegui fechar 2 clientes novos só com os conhecimentos da primeira sessão.",
    rating: 5,
  },
];

const Mentoria = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-32 gradient-hero text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary blur-3xl" />
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 border-primary-foreground/30 text-primary-foreground">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mentoria Individual
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Acelere seu aprendizado com mentoria 1:1
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                Sessões individuais para tirar dúvidas, revisar projetos e receber 
                orientação personalizada do mentor.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="secondary" size="xl">
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar sessão
                </Button>
                <Button variant="heroOutline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Ver como funciona
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
                <div className="text-center">
                  <p className="text-3xl font-bold">200+</p>
                  <p className="text-sm text-primary-foreground/70">Mentorias</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">95%</p>
                  <p className="text-sm text-primary-foreground/70">Satisfação</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">4.9</p>
                  <p className="text-sm text-primary-foreground/70">Avaliação</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  O que você ganha com a <span className="text-gradient">mentoria</span>
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 border-border/50">
                  <Video className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Vídeo chamada</h3>
                  <p className="text-sm text-muted-foreground">Sessões ao vivo via Google Meet ou Zoom</p>
                </Card>
                <Card className="p-6 border-border/50">
                  <Clock className="h-8 w-8 text-secondary mb-3" />
                  <h3 className="font-semibold mb-1">Flexibilidade</h3>
                  <p className="text-sm text-muted-foreground">Horários adaptados à sua agenda</p>
                </Card>
                <Card className="p-6 border-border/50">
                  <Zap className="h-8 w-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-1">Prático</h3>
                  <p className="text-sm text-muted-foreground">Foco em resolver problemas reais</p>
                </Card>
                <Card className="p-6 border-border/50">
                  <FileText className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Documentado</h3>
                  <p className="text-sm text-muted-foreground">Resumo e gravação de cada sessão</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Escolha seu <span className="text-gradient">pacote</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Opções flexíveis para diferentes necessidades e objetivos.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative border-border/50 ${
                    pkg.popular ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Mais popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">R${pkg.price}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={pkg.popular ? "hero" : "outline"}
                    >
                      Escolher pacote
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                O que dizem os <span className="text-gradient">mentorados</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16 md:py-24 bg-muted/30" id="aplicar">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Aplicar para <span className="text-gradient">mentoria</span>
                </h2>
                <p className="text-muted-foreground">
                  Preencha o formulário abaixo e entraremos em contato para agendar sua sessão.
                </p>
              </div>
              
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">Nível de experiência com n8n</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante - Ainda não usei</SelectItem>
                        <SelectItem value="basic">Básico - Já fiz automações simples</SelectItem>
                        <SelectItem value="intermediate">Intermediário - Uso regularmente</SelectItem>
                        <SelectItem value="advanced">Avançado - Domino a ferramenta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="package">Pacote de interesse</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o pacote" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Sessão Única - R$297</SelectItem>
                        <SelectItem value="monthly">Pacote Mensal - R$997</SelectItem>
                        <SelectItem value="intensive">Pacote Intensivo - R$2.497</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goals">Quais são seus objetivos?</Label>
                    <Textarea 
                      id="goals" 
                      placeholder="Descreva o que você espera alcançar com a mentoria..."
                      rows={4}
                    />
                  </div>
                  
                  <Button variant="hero" size="lg" className="w-full">
                    <Users className="mr-2 h-5 w-5" />
                    Enviar aplicação
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Mentoria;
