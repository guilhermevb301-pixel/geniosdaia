
# Plano: Otimização de Carregamento de Imagens

## Diagnóstico

### Problema Identificado
As imagens estão demorando para carregar porque:

1. **Imagens muito grandes**: As thumbnails no bucket `prompts` têm em média **4.7 MB** cada, com algumas chegando a **9.6 MB**
2. **Formato não otimizado**: Todas são PNG (sem compressão)
3. **Sem redimensionamento**: Imagens são servidas em tamanho original mesmo para thumbnails pequenas

### Dados do Banco

| Bucket | Arquivos | Tamanho Médio | Maior Arquivo | Total |
|--------|----------|---------------|---------------|-------|
| prompts | 43 | 4.6 MB | 9.6 MB | 199 MB |
| modules | 10 | 4.5 MB | 7.5 MB | 45 MB |
| templates | 15 | 1.3 MB | 18 MB | 19 MB |

**Exemplo**: Ao abrir a aba "Imagens" em `/prompts`, o navegador precisa baixar ~18 imagens × ~5 MB = **~90 MB de dados**!

---

## Solução: Image Transformations do Supabase

O Supabase Storage oferece transformações de imagem on-the-fly via query parameters. Podemos solicitar versões menores e otimizadas das imagens.

### Sintaxe

```
URL_ORIGINAL?width=400&quality=80&format=webp
```

### Parâmetros disponíveis:
- `width` - Largura máxima em pixels
- `height` - Altura máxima em pixels
- `quality` - Qualidade (1-100, padrão 80)
- `format` - webp, avif, jpeg, png
- `resize` - cover, contain, fill

---

## Implementação

### 1. Criar Helper de Otimização de URLs

Novo arquivo `src/lib/imageOptimization.ts`:

```typescript
interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'origin';
}

export function getOptimizedImageUrl(
  url: string | null,
  options: ImageOptions = {}
): string | null {
  if (!url) return null;
  
  // Só otimiza URLs do Supabase Storage
  if (!url.includes('supabase.co/storage')) return url;
  
  const { 
    width = 400, 
    quality = 75, 
    format = 'webp' 
  } = options;
  
  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  if (quality) params.set('quality', quality.toString());
  if (format) params.set('format', format);
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
}
```

### 2. Atualizar ImageWithSkeleton

Adicionar prop para tamanho otimizado:

```typescript
interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  optimizedWidth?: number; // Nova prop
  // ... resto
}
```

### 3. Atualizar Componentes

| Componente | Contexto | Width Recomendado |
|------------|----------|-------------------|
| `PromptCard` | Grid 3 colunas | 400px |
| `ModuleCard` | Grid 5 colunas | 300px |
| `TemplateCard` | Grid 3 colunas | 400px |
| `GptCard` | Ícone pequeno | 100px |

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/lib/imageOptimization.ts` | Criar helper (novo) |
| `src/components/ui/image-with-skeleton.tsx` | Adicionar otimização |
| `src/components/prompts/PromptCard.tsx` | Usar imagem otimizada |
| `src/components/aulas/ModuleCard.tsx` | Usar imagem otimizada |
| `src/pages/Templates.tsx` | Usar imagem otimizada |
| `src/components/gpts/GptCard.tsx` | Usar imagem otimizada |

---

## Impacto Esperado

### Antes (18 imagens de prompts)
- Tamanho total: ~90 MB
- Tempo estimado (3G): ~5 minutos
- Tempo estimado (4G): ~45 segundos

### Depois (mesmas 18 imagens otimizadas)
- Tamanho total: ~1.5 MB (400px webp ~85KB cada)
- Tempo estimado (3G): ~5 segundos
- Tempo estimado (4G): ~1 segundo

**Redução de ~98% no tamanho dos downloads!**

---

## Considerações Técnicas

1. **Primeira requisição**: Pode ser um pouco mais lenta (Supabase precisa gerar a versão otimizada)
2. **Requisições subsequentes**: Muito rápidas (imagem cacheada no CDN)
3. **Qualidade visual**: WebP 75% com 400px é imperceptível em thumbnails
4. **Fallback**: Se a transformação falhar, usa imagem original

---

## Resultado

1. Páginas `/prompts`, `/aulas`, `/templates` carregam muito mais rápido
2. Menos consumo de dados para usuários mobile
3. Melhor experiência de usuário com skeleton enquanto carrega
4. Mantém imagem original disponível ao clicar (modal usa full-size)
