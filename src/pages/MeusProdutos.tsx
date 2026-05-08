import { Lock, ExternalLink, Play, Sparkles, Bot, Image, Video, Users, Copy, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserProducts, type ProductSlug } from "@/hooks/useUserProducts";
import { cn } from "@/lib/utils";

interface Product {
  slug: ProductSlug;
  name: string;
  description: string;
  price: string;
  icon: React.ElementType;
  iconColor: string;
  href: string;
  buyUrl: string;
}

const PRODUCTS: Product[] = [
  {
    slug: "genios-ia",
    name: "Gênios da IA",
    description: "Curso completo — do zero a projetos de IA vendáveis. Acesso a todo o ecossistema.",
    price: "R$997",
    icon: Sparkles,
    iconColor: "text-purple-400",
    href: "/aulas",
    buyUrl: "https://pay.kiwify.com.br/dZG6AiO",
  },
  {
    slug: "agente-atendimento",
    name: "Agente de Atendimento IA",
    description: "Crie e venda agentes de atendimento com Claude Code para empresas locais.",
    price: "R$297",
    icon: Bot,
    iconColor: "text-blue-400",
    href: "/aulas",
    buyUrl: "https://pay.kiwify.com.br/gg698sf",
  },
  {
    slug: "banco-prompts",
    name: "Banco de 200 Prompts",
    description: "200 prompts ultra-realistas para imagens com IA. Resultados profissionais imediatos.",
    price: "R$27",
    icon: BookOpen,
    iconColor: "text-yellow-400",
    href: "/prompts",
    buyUrl: "https://pay.kiwify.com.br/6g5t8Mg",
  },
  {
    slug: "videos-cinematograficos",
    name: "Vídeos Cinematográficos com IA",
    description: "Produza vídeos de qualidade cinematográfica usando ferramentas de IA.",
    price: "R$97",
    icon: Video,
    iconColor: "text-red-400",
    href: "/aulas",
    buyUrl: "https://pay.kiwify.com.br/a8LzNm8",
  },
  {
    slug: "fotos-profissionais",
    name: "Fotos Profissionais com IA",
    description: "Gere fotos profissionais de qualidade com IA — sem câmera, sem fotógrafo.",
    price: "R$97",
    icon: Image,
    iconColor: "text-green-400",
    href: "/aulas",
    buyUrl: "https://pay.kiwify.com.br/HdtzNv8",
  },
  {
    slug: "influencer-ia",
    name: "Influencer de IA Ultra-realista",
    description: "Crie e monetize um influencer digital 100% gerado por IA.",
    price: "R$97",
    icon: Users,
    iconColor: "text-pink-400",
    href: "/aulas",
    buyUrl: "https://pay.kiwify.com.br/Itaz5PH",
  },
  {
    slug: "clone-criativo",
    name: "Método Clone Criativo",
    description: "Técnicas avançadas para clonar o estilo visual de criadores e marcas com IA.",
    price: "R$97",
    icon: Copy,
    iconColor: "text-orange-400",
    href: "/aulas",
    buyUrl: "https://pay.kiwify.com.br/vcFgUbO",
  },
];

export default function MeusProdutos() {
  const { hasProduct, isLoading } = useUserProducts();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acesse os produtos que você comprou. Os demais estão disponíveis para aquisição.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => {
            const unlocked = !isLoading && hasProduct(product.slug);
            const Icon = product.icon;

            return (
              <div
                key={product.slug}
                className={cn(
                  "relative rounded-xl border bg-card p-5 flex flex-col gap-4 transition-all",
                  unlocked
                    ? "border-border shadow-sm hover:shadow-md"
                    : "border-border/50 opacity-75"
                )}
              >
                {/* Lock overlay for locked products */}
                {!unlocked && !isLoading && (
                  <div className="absolute inset-0 rounded-xl bg-background/40 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-muted p-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Bloqueado</span>
                    </div>
                  </div>
                )}

                {/* Icon + badge */}
                <div className="flex items-start justify-between">
                  <div className={cn("rounded-lg bg-muted p-2.5", !unlocked && "grayscale")}>
                    <Icon className={cn("h-5 w-5", unlocked ? product.iconColor : "text-muted-foreground")} />
                  </div>
                  <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full",
                    unlocked
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {unlocked ? "Desbloqueado" : product.price}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h3 className={cn("font-semibold text-sm", !unlocked && "text-muted-foreground")}>
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* CTA */}
                {unlocked ? (
                  <a
                    href={product.href}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium transition-colors hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4" />
                    Acessar
                  </a>
                ) : (
                  <a
                    href={product.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted text-foreground py-2.5 text-sm font-medium transition-colors hover:bg-accent relative z-20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Comprar — {product.price}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
