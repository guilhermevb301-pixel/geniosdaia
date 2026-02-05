
# Plano: Ícones Amarelos na Sidebar + Remover Aba Agentes de IA

## Resumo das Mudanças

| Mudança | Arquivo | Descrição |
|---------|---------|-----------|
| **1. Ícones amarelos** | `SidebarContent.tsx` | Aplicar classe `text-amber-400` em todos os ícones da navegação |
| **2. Remover aba Agentes de IA** | `Prompts.tsx` | Remover item "agent" do array de tabs e ajustar tipo |

---

## 1. Ícones Amarelos na Sidebar

Adicionar a classe `text-amber-400` (tom dourado) em todos os ícones da sidebar para combinar com o design mostrado na imagem.

### Ícones afetados:
- Dashboard (Layout)
- Aulas (BookOpen)
- Templates (Zap)
- Banco de Prompts (Lightbulb)
- Meus GPTs (MessageSquare)
- Eventos (Calendar)
- Desafios (Trophy)
- Certificados (Award)
- Meu Caderno (NotebookPen)
- Aplicar Mentoria (MessageSquare)
- Minha Mentoria (GraduationCap)

### Código atual:
```tsx
<Layout className="h-5 w-5" />
```

### Código novo:
```tsx
<Layout className="h-5 w-5 text-amber-400" />
```

---

## 2. Remover Aba "Agentes de IA" do /prompts

### Antes:
```typescript
type PromptCategory = "video" | "image" | "agent";

const tabItems = [
  { value: "video", label: "Vídeos", icon: Video },
  { value: "image", label: "Imagens", icon: Image },
  { value: "agent", label: "Agentes de IA", icon: Bot },  // remover
];
```

### Depois:
```typescript
type PromptCategory = "video" | "image";

const tabItems = [
  { value: "video", label: "Vídeos", icon: Video },
  { value: "image", label: "Imagens", icon: Image },
];
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/layout/SidebarContent.tsx` | Adicionar `text-amber-400` em todos os ícones de navegação |
| `src/pages/Prompts.tsx` | Remover "agent" do tipo e do array de tabs |

---

## Resultado Esperado

1. Todos os ícones da sidebar ficam amarelos/dourados
2. Página de Prompts mostra apenas 2 abas: "Vídeos" e "Imagens"
