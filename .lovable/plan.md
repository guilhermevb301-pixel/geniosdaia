
# Plano: Otimização de Imagens em TODA a Plataforma

## Problema Identificado

A otimização já foi implementada em alguns componentes (`PromptCard`, `ModuleCard`, `GptCard`, `Templates`), mas várias outras partes da plataforma ainda usam `<img>` nativo sem otimização:

| Local | Componente/Arquivo | Status Atual |
|-------|-------------------|--------------|
| Prompts Grid | PromptCard.tsx | ✅ Otimizado |
| Aulas Grid | ModuleCard.tsx | ✅ Otimizado |
| Templates Grid | Templates.tsx | ✅ Otimizado |
| GPTs Grid | GptCard.tsx | ✅ Otimizado |
| Dashboard Banners | AnnouncementCarousel.tsx | ❌ Não otimizado |
| Desafios (submissions) | Desafios.tsx | ❌ Não otimizado |
| Modal de Prompt (variações) | PromptCard.tsx (modal) | ❌ Não otimizado |
| Modal de Prompt (exemplos) | PromptCard.tsx (modal) | ❌ Não otimizado |
| Admin - Módulos | AdminModules.tsx | ❌ Não otimizado |
| Admin - Templates | AdminTemplates.tsx | ❌ Não otimizado |
| Admin - Prompts | AdminPrompts.tsx | ❌ Não otimizado |
| Admin - GPTs | AdminGpts.tsx | ❌ Não otimizado |
| Variation Editor (preview) | VariationEditor.tsx | ❌ Não otimizado |

---

## Solução

Aplicar otimização usando `ImageWithSkeleton` ou `getOptimizedImageUrl()` em todos os locais identificados.

### Estratégia por Contexto:

| Contexto | Width | Componente |
|----------|-------|------------|
| Thumbnails em grid (3 colunas) | 400px | ImageWithSkeleton |
| Thumbnails pequenas em tabelas | 200px | getOptimizedImageUrl() |
| Ícones pequenos | 100px | getOptimizedImageUrl() |
| Imagens em modal (qualidade maior) | 800px | getOptimizedImageUrl() |
| Banners hero | 800px | getOptimizedImageUrl() |

---

## Arquivos a Modificar

### 1. Dashboard - AnnouncementCarousel.tsx
- Adicionar otimização às imagens dos banners
- Width: 800px (banners são maiores)

### 2. Desafios.tsx
- Submissions usam `<img>` nativo
- Substituir por `ImageWithSkeleton` com width 400px

### 3. PromptCard.tsx (Modal interno)
- Imagens dentro do modal de detalhes
- Variações e exemplos usam `<img>` nativo
- Aplicar `getOptimizedImageUrl()` com width 800px

### 4. Admin - AdminModules.tsx
- Grid de módulos usa `<img>` nativo
- Aplicar `getOptimizedImageUrl()` com width 400px

### 5. Admin - AdminTemplates.tsx
- Tabela de templates usa `<img>` nativo
- Aplicar `getOptimizedImageUrl()` com width 200px (thumbnail em tabela)

### 6. Admin - AdminPrompts.tsx
- Grid de cards usa `<img>` nativo
- Aplicar `getOptimizedImageUrl()` com width 400px

### 7. Admin - AdminGpts.tsx
- Ícones na tabela usam `<img>` nativo
- Aplicar `getOptimizedImageUrl()` com width 100px

### 8. VariationEditor.tsx
- Preview de imagens durante edição
- Aplicar `getOptimizedImageUrl()` com width 400px

---

## Mudanças Detalhadas

### AnnouncementCarousel.tsx
```tsx
// Antes
<img src={banner.image_url} ... />

// Depois
import { getOptimizedImageUrl } from "@/lib/imageOptimization";
...
<img src={getOptimizedImageUrl(banner.image_url, { width: 800 }) || banner.image_url} ... />
```

### Desafios.tsx
```tsx
// Antes
<img src={submission.image_url} alt={submission.title} className="w-full h-full object-cover" />

// Depois
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
...
<ImageWithSkeleton
  src={submission.image_url}
  alt={submission.title}
  containerClassName="w-full h-full"
  optimizedWidth={400}
/>
```

### PromptCard.tsx (modal)
```tsx
// Imagens de variação e exemplos no modal
// Aplicar getOptimizedImageUrl com width 800px para qualidade no modal
```

### Admin pages
- Todas usam `<img>` nativo
- Aplicar `getOptimizedImageUrl()` diretamente nas URLs

---

## Impacto Esperado

| Página | Antes | Depois | Redução |
|--------|-------|--------|---------|
| Dashboard (banners) | ~10MB | ~200KB | ~98% |
| Desafios (submissions) | ~20MB | ~500KB | ~97% |
| Admin Módulos | ~45MB | ~1MB | ~98% |
| Admin Templates | ~15MB | ~400KB | ~97% |
| Admin Prompts | ~90MB | ~2MB | ~98% |

---

## Resultado Final

Após implementação:
- Todas as páginas carregarão muito mais rápido
- Menos consumo de dados para usuários mobile
- Experiência mais fluida com skeleton loaders
- Admin também se beneficia da otimização
