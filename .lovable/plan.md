

# Plano: Otimizacao de Carregamento + Nova Pagina "Meus GPTs"

## Visao Geral

Este plano aborda duas melhorias:
1. **Performance**: Otimizar carregamento de fotos e videos com lazy loading, placeholders e tecnicas modernas
2. **Nova Funcionalidade**: Criar pagina "Meus GPTs" para links de GPTs personalizados

---

## PARTE 1: Otimizacao de Carregamento

### Problemas Identificados

Analisando o codigo atual, identifiquei os seguintes pontos de lentidao:

1. **Imagens sem lazy loading** - Todas carregam de uma vez
2. **Sem placeholders/skeleton** - Usuario ve espaco vazio enquanto carrega
3. **Sem atributo loading="lazy"** - Browser nao otimiza carregamento
4. **Videos do YouTube carregam imediatamente** - iframes pesados
5. **Imagens grandes sem dimensoes definidas** - causa layout shift

### Solucoes a Implementar

```text
ANTES                              DEPOIS
+------------------+              +------------------+
| [carrega tudo    |              | [skeleton]       |
|  de uma vez]     |              | [lazy load]      |
| Lento e pesado   |              | [blur-up effect] |
+------------------+              +------------------+
```

### Componentes a Modificar

| Arquivo | Otimizacao |
|---------|------------|
| `ModuleCard.tsx` | Lazy loading + skeleton + blur placeholder |
| `PromptCard.tsx` | Lazy loading + skeleton em thumbnails |
| `Templates.tsx` | Lazy loading nas imagens de templates |
| `VideoPlayer.tsx` | Thumbnail do YouTube antes de carregar iframe |

### Implementacao Tecnica

**1. Componente ImageWithSkeleton (Novo)**

```tsx
// src/components/ui/image-with-skeleton.tsx
interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

export function ImageWithSkeleton({ src, alt, className, aspectRatio = "video" }: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio])}>
      {/* Skeleton enquanto carrega */}
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0" />
      )}
      
      {/* Imagem com lazy loading nativo */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}
```

**2. Video com Thumbnail (Lite YouTube Embed)**

Em vez de carregar o iframe pesado do YouTube imediatamente, mostrar apenas a thumbnail ate o usuario clicar:

```tsx
// VideoPlayer.tsx - Otimizado
const [showVideo, setShowVideo] = useState(false);

// Extrair ID do YouTube
const videoId = extractYouTubeId(lesson.videoUrl);

return showVideo ? (
  <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} ... />
) : (
  <button onClick={() => setShowVideo(true)} className="relative">
    {/* Thumbnail do YouTube (muito leve) */}
    <img 
      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
      loading="lazy"
      alt={lesson.title}
    />
    {/* Icone de play */}
    <PlayCircle className="absolute inset-0 m-auto h-16 w-16" />
  </button>
);
```

**3. Atualizacoes nos Componentes Existentes**

Adicionar em todas as tags `<img>`:
- `loading="lazy"` - carregamento nativo preguicoso
- `decoding="async"` - decodificacao assincrona
- Skeleton como fallback durante carregamento

---

## PARTE 2: Nova Pagina "Meus GPTs"

### Estrutura Visual

```text
+------------------------------------------------------------------+
|  MEUS GPTs                                                        |
|  GPTs personalizados para acelerar seu aprendizado               |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------+  +------------------------+          |
|  | [Logo GPT]             |  | [Logo GPT]             |          |
|  | Nome do GPT            |  | Nome do GPT            |          |
|  | Descricao breve...     |  | Descricao breve...     |          |
|  | [Acessar GPT ->]       |  | [Acessar GPT ->]       |          |
|  +------------------------+  +------------------------+          |
|                                                                   |
|  +------------------------+  +------------------------+          |
|  | [Logo GPT]             |  | [Logo GPT]             |          |
|  | Assistente de Codigo   |  | Gerador de Workflows   |          |
|  | Ajuda com scripts...   |  | Cria automacoes...     |          |
|  | [Acessar GPT ->]       |  | [Acessar GPT ->]       |          |
|  +------------------------+  +------------------------+          |
+------------------------------------------------------------------+
```

### Arquitetura

Dois caminhos possiveis:

**Opcao A: Dados no Banco (Recomendado)**
- Criar tabela `custom_gpts` no Supabase
- Admin pode gerenciar via painel
- Mais flexivel e escalavel

**Opcao B: Dados Estaticos**
- Links hardcoded no codigo
- Mais simples, menos flexivel

### Implementacao com Banco (Opcao A)

**1. Nova Tabela `custom_gpts`**

```sql
CREATE TABLE public.custom_gpts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  gpt_url TEXT NOT NULL,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.custom_gpts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active GPTs"
ON public.custom_gpts FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage GPTs"
ON public.custom_gpts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

**2. Nova Pagina `/meus-gpts`**

```tsx
// src/pages/MeusGpts.tsx
export default function MeusGpts() {
  const { data: gpts } = useQuery({
    queryKey: ["custom_gpts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("custom_gpts")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meus GPTs</h1>
          <p className="text-muted-foreground">
            GPTs personalizados para acelerar seu aprendizado
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gpts?.map((gpt) => (
            <GptCard key={gpt.id} gpt={gpt} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
```

**3. Componente GptCard**

```tsx
// src/components/gpts/GptCard.tsx
interface GptCardProps {
  gpt: {
    id: string;
    title: string;
    description: string | null;
    gpt_url: string;
    icon_url: string | null;
  };
}

export function GptCard({ gpt }: GptCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-6 space-y-4">
        {/* Icone */}
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          {gpt.icon_url ? (
            <img src={gpt.icon_url} alt="" className="h-8 w-8 rounded-lg" />
          ) : (
            <Bot className="h-6 w-6 text-primary" />
          )}
        </div>

        {/* Conteudo */}
        <div>
          <h3 className="font-semibold">{gpt.title}</h3>
          {gpt.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {gpt.description}
            </p>
          )}
        </div>

        {/* Botao */}
        <a
          href={gpt.gpt_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Acessar GPT
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}
```

**4. Adicionar na Sidebar**

```tsx
// SidebarContent.tsx - Adicionar apos "Banco de Prompts"
<Link
  to="/meus-gpts"
  className={cn(/* estilos */)}
>
  <Bot className="h-5 w-5" />
  Meus GPTs
</Link>
```

**5. Adicionar Rota**

```tsx
// App.tsx
import MeusGpts from "./pages/MeusGpts";

<Route
  path="/meus-gpts"
  element={
    <ProtectedRoute>
      <MeusGpts />
    </ProtectedRoute>
  }
/>
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/ui/image-with-skeleton.tsx` | Criar | Componente de imagem otimizada |
| `src/components/aulas/ModuleCard.tsx` | Modificar | Usar ImageWithSkeleton |
| `src/components/prompts/PromptCard.tsx` | Modificar | Lazy loading nas imagens |
| `src/components/aulas/VideoPlayer.tsx` | Modificar | Thumbnail antes do iframe |
| `src/pages/Templates.tsx` | Modificar | Lazy loading nas imagens |
| Migracao SQL | Criar | Tabela custom_gpts |
| `src/pages/MeusGpts.tsx` | Criar | Pagina de GPTs |
| `src/components/gpts/GptCard.tsx` | Criar | Card de GPT |
| `src/components/layout/SidebarContent.tsx` | Modificar | Link para Meus GPTs |
| `src/App.tsx` | Modificar | Rota /meus-gpts |

---

## Resultado Esperado

### Performance
- Imagens carregam sob demanda (lazy loading nativo)
- Skeleton aparece enquanto imagem carrega
- Videos do YouTube so carregam ao clicar (economia de dados)
- Transicoes suaves de carregamento
- Reducao significativa no tempo inicial de carregamento

### Meus GPTs
- Nova pagina acessivel na sidebar
- Cards visuais para cada GPT
- Links externos para ChatGPT
- Admin pode gerenciar via banco de dados (futuro painel admin)

---

## Secao Tecnica

### Lazy Loading Nativo vs Intersection Observer

O atributo `loading="lazy"` e suportado em 95%+ dos browsers modernos e oferece:
- Zero JavaScript adicional
- Gerenciado pelo browser
- Performance otima

Para browsers antigos, a imagem simplesmente carrega normalmente (fallback gracioso).

### YouTube Lite Embed

Beneficios da abordagem thumbnail-first:
- Thumbnail: ~30-50KB vs iframe completo: ~500KB-1MB
- Zero JavaScript do YouTube ate o clique
- Primeira renderizacao muito mais rapida

