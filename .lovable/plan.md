
# Plano: Carregamento Instantaneo de Imagens

## Problema Atual

O sistema ja usa otimizacao de imagens (WebP 75%, resize), mas as imagens ainda demoram a aparecer porque:
1. **Lazy loading em tudo**: Todas imagens usam `loading="lazy"`, mesmo as visiveis imediatamente
2. **Sem prefetch de dados**: Os dados das queries nao sao pre-carregados
3. **Sem cache de imagens**: Imagens nao sao cacheadas entre navegacoes
4. **Sem preload estrategico**: Nao ha preload das imagens criticas

## Solucao em 4 Frentes

### 1. Prefetch de Dados nas Rotas Principais

Usar o `prefetchQuery` do TanStack Query para carregar dados **antes** de navegar:
- Quando o usuario passa o mouse sobre um link na sidebar, pre-carregar os dados daquela pagina
- Dados ficam em cache e a pagina carrega instantaneamente

Exemplo de fluxo:
```text
Usuario passa mouse em "Prompts" na sidebar
  -> prefetchQuery carrega lista de prompts em background
  -> Quando clica, dados ja estao prontos
  -> Imagens comecam a carregar antes de renderizar
```

### 2. Eager Loading para Imagens Criticas

Diferenciar imagens criticas (above-the-fold) de secundarias:
- Banners do dashboard: `loading="eager"` + preload hints
- Primeiros 6-8 items de grids: `loading="eager"`
- Restante: manter `loading="lazy"`

### 3. Preload de Imagens via Link Hints

Adicionar preload dinamico para imagens criticas:
```html
<link rel="preload" as="image" href="url-otimizada" />
```

Injetar esses hints quando os dados chegam, antes de renderizar.

### 4. Cache Longo no QueryClient

Configurar `staleTime` maior para dados estaticos como prompts, modulos e banners:
- `staleTime: 5 * 60 * 1000` (5 minutos) - dados considerados frescos
- `gcTime: 10 * 60 * 1000` (10 minutos) - manter em cache

## Detalhes Tecnicos

### Arquivos a Criar/Modificar

1. **`src/App.tsx`** - Configurar QueryClient com staleTime global
2. **`src/lib/prefetchRoutes.ts`** (novo) - Funcoes de prefetch por rota
3. **`src/components/layout/SidebarContent.tsx`** - Adicionar onMouseEnter nos links para prefetch
4. **`src/components/ui/image-with-skeleton.tsx`** - Adicionar prop `priority` para eager loading
5. **`src/hooks/useImagePreload.ts`** (novo) - Hook para preload dinamico de imagens

### Implementacao do QueryClient

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos cache
      refetchOnWindowFocus: false,
    },
  },
});
```

### Prefetch na Sidebar

```typescript
// Quando mouse entra no link
const handlePrefetch = (route: string) => {
  if (route === '/prompts') {
    queryClient.prefetchQuery({
      queryKey: ['prompts'],
      queryFn: fetchPrompts,
      staleTime: 5 * 60 * 1000,
    });
  }
  // ... outras rotas
};
```

### Componente ImageWithSkeleton Atualizado

```typescript
interface Props {
  // ... existentes
  priority?: boolean; // Se true, usa eager loading
}

// No img:
loading={priority ? "eager" : "lazy"}
```

### Hook useImagePreload

```typescript
export function useImagePreload(urls: string[]) {
  useEffect(() => {
    urls.forEach((url) => {
      if (!url) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
}
```

### Uso nas Paginas

```typescript
// Em Prompts.tsx
const { data: prompts } = useQuery({...});

// Preload das primeiras 6 imagens
const criticalImages = prompts?.slice(0, 6).map(p => 
  getOptimizedImageUrl(p.thumbnail_url, { width: 400 })
);
useImagePreload(criticalImages);
```

## Fluxo Final

```text
1. Usuario loga -> Dashboard carrega
2. Sidebar renderiza com prefetch handlers
3. Mouse passa em "Prompts" -> prefetch da query
4. Dados chegam -> preload das primeiras 6 imagens
5. Usuario clica -> pagina renderiza instantaneamente
6. Imagens criticas ja estao no cache do browser
```

## Beneficios Esperados

- Dados pre-carregados: navegacao instantanea
- Imagens criticas com preload: aparecem muito mais rapido
- Cache de 5 minutos: menos requests repetidos
- Experiencia "nativa": parece app nativo, nao web

## Esforco Estimado

- Modificar 4-5 arquivos existentes
- Criar 2 novos arquivos pequenos
- Sem alteracoes no banco de dados
- Tempo estimado: implementacao media
