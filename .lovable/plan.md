
# Plano: Drag-and-Drop para Aulas + Correção de Links

## Problema 1: Links não clicáveis

Olhando a imagem, o texto mostra:
```
LINKS USADOS:
- higgsfield.io
```

O regex atual só detecta URLs com `http://` ou `https://`. Links como "higgsfield.io" não são convertidos porque não têm protocolo.

### Solução
Melhorar o regex do `LinkifyText` para detectar também:
- URLs sem protocolo (ex: `higgsfield.io`, `www.google.com`)
- Adicionar `https://` automaticamente quando o protocolo não estiver presente

---

## Problema 2: Drag-and-Drop para Aulas

Atualmente existem botões de setas (ArrowUp/ArrowDown), mas você quer uma interface mais intuitiva.

### Solução
Instalar `@dnd-kit` (biblioteca leve e moderna para drag-and-drop em React) e implementar na tabela de aulas.

---

## Implementação Técnica

### 1. LinkifyText - Regex Melhorado

```typescript
// Novo regex que detecta URLs com ou sem protocolo
const urlRegex = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/gi;

// Adiciona https:// se não tiver protocolo
function ensureProtocol(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}
```

### 2. Drag-and-Drop com @dnd-kit

A biblioteca `@dnd-kit` é:
- Leve (~10KB gzipped)
- Acessível (keyboard support)
- Performante (sem re-renders desnecessários)
- Touch-friendly (mobile)

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `package.json` | Adicionar `@dnd-kit/core` e `@dnd-kit/sortable` |
| `src/components/ui/linkify-text.tsx` | Melhorar regex para detectar URLs sem protocolo |
| `src/pages/admin/AdminLessons.tsx` | Implementar drag-and-drop nas linhas da tabela |

---

## Detalhes da Implementação

### LinkifyText Melhorado

```typescript
export function LinkifyText({ text, className }: LinkifyTextProps) {
  // Regex mais robusto que detecta URLs com ou sem protocolo
  const urlRegex = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  
  function ensureProtocol(url: string): string {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  }
  
  // Renderiza links com protocolo adicionado automaticamente
  return (
    <span>
      {parts.map((part, i) => 
        isUrl(part) ? (
          <a href={ensureProtocol(part)} target="_blank">
            {part}
          </a>
        ) : part
      )}
    </span>
  );
}
```

### AdminLessons com Drag-and-Drop

```tsx
// Componente SortableRow para cada linha da tabela
function SortableRow({ lesson, ... }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lesson.id
  });
  
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <GripVertical {...listeners} className="cursor-grab" />
      </TableCell>
      {/* resto das células */}
    </TableRow>
  );
}

// DndContext envolvendo a tabela
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={lessonIds}>
    <TableBody>
      {sortedLessons.map(lesson => (
        <SortableRow key={lesson.id} lesson={lesson} />
      ))}
    </TableBody>
  </SortableContext>
</DndContext>
```

---

## Comportamento do Drag-and-Drop

1. Ícone de "arrastar" (GripVertical) aparece em cada linha
2. Usuário arrasta a aula para nova posição
3. Ao soltar, `order_index` é atualizado no banco
4. Só permite reordenar dentro do mesmo módulo
5. Mantém os botões de seta como alternativa (acessibilidade)

---

## Resultado Esperado

1. **Links funcionando**: URLs como `higgsfield.io` serão clicáveis e abrirão com `https://`
2. **Drag-and-drop intuitivo**: Arrastar aulas para reordenar visualmente
3. **Botões mantidos**: Setas continuam disponíveis para quem preferir

