
# Plano: Melhorias nas Aulas

## 1. Reordenação de Aulas pelo Mentor

### Problema
Atualmente não há como o mentor/admin mudar a ordem das aulas - elas são ordenadas por `order_index` mas não há interface para alterar.

### Solução
Adicionar botões de seta (up/down) na tabela de aulas para reordenar, com atualização do `order_index` no banco.

### Arquivos a modificar
- `src/pages/admin/AdminLessons.tsx`
  - Adicionar ícones `ArrowUp` e `ArrowDown`
  - Criar mutation para atualizar `order_index`
  - Agrupar aulas por módulo para reordenação correta

---

## 2. Carregamento Instantâneo de Imagens (Eager Loading)

### Problema
As imagens ainda demoram a carregar, mesmo com otimização. Isso acontece porque:
1. `ContinueLearning.tsx` usa `<img>` nativo sem otimização
2. Falta `loading="eager"` nas imagens críticas
3. Podemos adicionar **preload** para imagens importantes

### Solução
- Aplicar otimização em `ContinueLearning.tsx`
- Usar `loading="eager"` em imagens above-the-fold
- Adicionar preload hints para thumbnails dos módulos

### Arquivos a modificar
- `src/components/dashboard/ContinueLearning.tsx`
  - Importar `getOptimizedImageUrl`
  - Aplicar otimização nas thumbnails (width: 300)

---

## 3. Links Clicáveis na Descrição

### Problema
A descrição das aulas é exibida como texto puro, sem converter URLs em links clicáveis.

### Solução
Criar um componente utilitário `LinkifyText` que detecta URLs e converte em `<a>` clicáveis.

### Arquivos a criar/modificar
- `src/components/ui/linkify-text.tsx` (novo)
  - Regex para detectar URLs
  - Renderiza links com `target="_blank"`
- `src/components/aulas/VideoPlayer.tsx`
  - Usar `LinkifyText` no lugar de texto simples

---

## Implementação Técnica

### AdminLessons.tsx - Reordenação

```tsx
// Adicionar imports
import { ArrowUp, ArrowDown } from "lucide-react";

// Mutation para reordenar
const reorderMutation = useMutation({
  mutationFn: async ({ lessonId, direction }: { lessonId: string; direction: 'up' | 'down' }) => {
    // Lógica de troca de order_index
  }
});

// Na tabela, adicionar coluna de ordem com botões
<TableHead className="w-20">Ordem</TableHead>
...
<TableCell>
  <div className="flex gap-1">
    <Button size="icon" variant="ghost" onClick={() => reorder(lesson, 'up')}>
      <ArrowUp className="h-4 w-4" />
    </Button>
    <Button size="icon" variant="ghost" onClick={() => reorder(lesson, 'down')}>
      <ArrowDown className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
```

### ContinueLearning.tsx - Otimização

```tsx
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

// Na imagem
<img
  src={getOptimizedImageUrl(module.cover_image_url, { width: 300 }) || module.cover_image_url}
  loading="eager"
  ...
/>
```

### LinkifyText.tsx - Novo Componente

```tsx
interface LinkifyTextProps {
  text: string;
  className?: string;
}

export function LinkifyText({ text, className }: LinkifyTextProps) {
  // Regex para detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  
  return (
    <span className={className}>
      {parts.map((part, i) => 
        urlRegex.test(part) ? (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        ) : part
      )}
    </span>
  );
}
```

### VideoPlayer.tsx - Usar LinkifyText

```tsx
import { LinkifyText } from "@/components/ui/linkify-text";

// Na descrição
{lesson.description && (
  <LinkifyText 
    text={lesson.description} 
    className="text-muted-foreground" 
  />
)}
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/admin/AdminLessons.tsx` | Adicionar botões de reordenação |
| `src/components/dashboard/ContinueLearning.tsx` | Aplicar otimização de imagem |
| `src/components/ui/linkify-text.tsx` | Criar componente (novo) |
| `src/components/aulas/VideoPlayer.tsx` | Usar LinkifyText na descrição |

---

## Resultado Esperado

1. **Reordenação**: Mentor pode subir/descer aulas dentro de cada módulo
2. **Imagens mais rápidas**: Otimização aplicada em todos os locais + eager loading
3. **Links clicáveis**: URLs na descrição abrem em nova aba automaticamente
