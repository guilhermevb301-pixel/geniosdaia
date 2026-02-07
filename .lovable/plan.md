
# Plano: Corrigir Scroll dos Objetivos + Cores dos Icones da Sidebar

## Problema 1: Modal de Objetivos Nao Rola

### Causa Raiz
O componente `ScrollArea` do Radix UI tem uma limitacao: o viewport interno nao herda automaticamente a altura do container pai quando usamos `flex-1`. Isso faz com que o scroll nao funcione corretamente.

### Solucao
Substituir o `ScrollArea` do Radix por um container com scroll nativo do CSS, que e mais confiavel em contextos flex:

```tsx
// Antes (bugado)
<ScrollArea className="flex-1 max-h-[60vh] pr-4 -mr-4">
  ...
</ScrollArea>

// Depois (funciona)
<div className="flex-1 overflow-y-auto max-h-[50vh] pr-4 -mr-4 scrollbar-thin">
  ...
</div>
```

Alternativa: corrigir o viewport do ScrollArea adicionando estilos inline:

```tsx
<ScrollArea className="flex-1 min-h-0">
  <div className="max-h-[50vh] overflow-visible">
    ...
  </div>
</ScrollArea>
```

### Ajustes Adicionais
- Reduzir `max-h-[60vh]` para `max-h-[50vh]` para garantir espaco para header/footer
- Adicionar `min-h-0` no container flex para permitir shrink
- Garantir que o DialogContent use `overflow-hidden`

---

## Problema 2: Cores dos Icones da Sidebar

### Situacao Atual
Todos os icones estao com cor fixa `text-amber-400` hardcoded no codigo:

```tsx
<Layout className="h-5 w-5 text-amber-400" />
<BookOpen className="h-5 w-5 text-amber-400" />
// etc.
```

### Solucao Proposta

Criar uma tabela `sidebar_settings` no banco de dados para armazenar configuracoes visuais:

```sql
CREATE TABLE public.sidebar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_color TEXT NOT NULL DEFAULT 'amber-400',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS: mentores e admins podem atualizar
CREATE POLICY "Mentors and admins can update sidebar settings"
  ON public.sidebar_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'mentor')
    )
  );
```

### Hook: useSidebarSettings

```tsx
export function useSidebarSettings() {
  const { data: settings } = useQuery({
    queryKey: ["sidebarSettings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sidebar_settings")
        .select("*")
        .single();
      return data;
    },
  });

  return {
    iconColor: settings?.icon_color || "amber-400",
    // ...
  };
}
```

### Componente de Configuracao para Mentores

Adicionar uma secao em uma pagina de administracao (ou criar nova rota `/admin/appearance`) onde o mentor pode escolher a cor dos icones:

```tsx
const colorOptions = [
  { value: "amber-400", label: "Dourado" },
  { value: "primary", label: "Roxo" },
  { value: "emerald-400", label: "Verde" },
  { value: "rose-400", label: "Rosa" },
  { value: "sky-400", label: "Azul" },
];
```

### Aplicacao no SidebarContent

```tsx
const { iconColor } = useSidebarSettings();

// Usar classe dinamica
<Layout className={cn("h-5 w-5", `text-${iconColor}`)} />
```

**Nota**: Para classes Tailwind dinamicas funcionarem, precisamos adicionar as cores ao safelist do `tailwind.config.ts`:

```ts
safelist: [
  'text-amber-400',
  'text-primary',
  'text-emerald-400',
  'text-rose-400',
  'text-sky-400',
],
```

---

## Arquivos a Modificar/Criar

### Problema 1 (Scroll)
1. **`src/components/challenges/ObjectivesModal.tsx`**
   - Substituir ScrollArea por div com overflow nativo
   - Ajustar max-height e adicionar min-h-0

### Problema 2 (Cores)
1. **Migration SQL** - Criar tabela `sidebar_settings`
2. **`src/hooks/useSidebarSettings.ts`** (NOVO) - Hook para buscar/atualizar configs
3. **`src/components/layout/SidebarContent.tsx`** - Usar cor dinamica do hook
4. **`src/pages/admin/AdminAppearance.tsx`** (NOVO) - Pagina para gerenciar aparencia
5. **`tailwind.config.ts`** - Adicionar safelist de cores
6. **`src/components/layout/SidebarContent.tsx`** - Adicionar link para /admin/appearance

---

## Resumo Visual

```text
PROBLEMA 1: SCROLL                          PROBLEMA 2: CORES
+-----------------------+                   +-----------------------+
| Modal de Objetivos    |                   | Sidebar               |
|-----------------------|                   |-----------------------|
| [x] Objetivo 1        |                   | [icon] Dashboard      |
| [x] Objetivo 2        | <-- nao rola      | [icon] Aulas          |
| [ ] Objetivo 3        |     por causa do  | [icon] Templates      |
| ...mais itens...      |     ScrollArea    | ...                   |
|                       |                   |                       |
| [Confirmar]           |                   | Cor atual: amber-400  |
+-----------------------+                   | (hardcoded)           |
                                            +-----------------------+

SOLUCAO 1:                                  SOLUCAO 2:
Usar overflow-y-auto                        Criar tabela + hook
em vez de ScrollArea                        para cor dinamica
```
