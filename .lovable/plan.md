
# Plano de Implementacao

## 1. Atualizacoes em Tempo Real para Mentorados

### Problema Atual
Quando o mentor cria etapas ou modifica conteudos no MenteeEditor, o aluno precisa recarregar a pagina para ver as mudancas.

### Solucao: Supabase Realtime
Habilitar realtime nas tabelas de mentoria para que alteracoes feitas pelo mentor aparecam automaticamente para o aluno.

### Tabelas a Habilitar Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_pillars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_notes;
```

### Modificacoes no Hook `useMenteeData.ts`

Adicionar subscricoes realtime que invalidam as queries quando houver mudancas:

```tsx
useEffect(() => {
  if (!activeMenteeId) return;
  
  const channel = supabase
    .channel(`mentee-${activeMenteeId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'mentorship_pillars', filter: `mentee_id=eq.${activeMenteeId}` },
      () => queryClient.invalidateQueries({ queryKey: ["pillars", activeMenteeId] })
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'mentorship_stages', filter: `mentee_id=eq.${activeMenteeId}` },
      () => queryClient.invalidateQueries({ queryKey: ["stages", activeMenteeId] })
    )
    // ... outras tabelas
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [activeMenteeId]);
```

---

## 2. Nova Pagina: Banco de Prompts

### Estrutura de Navegacao

A pagina tera navegacao interna com 3 abas (tabs):

```
/prompts
  ├── Tab: Videos
  ├── Tab: Imagens
  └── Tab: Agentes de IA
```

### Estrutura do Banco de Dados

Nova tabela para armazenar prompts:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | ID unico |
| category | TEXT | 'video', 'image' ou 'agent' |
| title | TEXT | Titulo do prompt |
| content | TEXT | Conteudo do prompt |
| description | TEXT | Descricao breve |
| tags | TEXT[] | Tags para filtro |
| created_at | TIMESTAMP | Data de criacao |
| updated_at | TIMESTAMP | Data de atualizacao |

```sql
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('video', 'image', 'agent')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Todos podem ver, apenas admins podem gerenciar
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view prompts"
  ON public.prompts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage prompts"
  ON public.prompts FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### Novos Arquivos

| Arquivo | Funcao |
|---------|--------|
| `src/pages/Prompts.tsx` | Pagina principal com tabs |
| `src/pages/admin/AdminPrompts.tsx` | Gerenciamento de prompts (admin) |
| `src/components/prompts/PromptCard.tsx` | Card para exibir um prompt |

### Interface da Pagina `/prompts`

```
┌─────────────────────────────────────────────────────────────┐
│ Banco de Prompts                                            │
│ Prompts prontos para usar com IAs                           │
├─────────────────────────────────────────────────────────────┤
│ [ Videos ] [ Imagens ] [ Agentes de IA ]     🔍 Buscar...   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│ │ 🎬 Titulo   │  │ 🎬 Titulo   │  │ 🎬 Titulo   │          │
│ │ Descricao  │  │ Descricao  │  │ Descricao  │          │
│ │ #tag #tag  │  │ #tag #tag  │  │ #tag #tag  │          │
│ │ [Copiar]   │  │ [Copiar]   │  │ [Copiar]   │          │
│ └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Atualizacao da Sidebar

Adicionar item "Banco de Prompts" no menu principal:

```tsx
// Em AppSidebar.tsx
<Link to="/prompts" ...>
  <Lightbulb className="h-5 w-5" />
  Banco de Prompts
</Link>
```

### Rotas no App.tsx

```tsx
<Route path="/prompts" element={<ProtectedRoute><Prompts /></ProtectedRoute>} />
<Route path="/admin/prompts" element={<AdminRoute><AdminPrompts /></AdminRoute>} />
```

---

## Resumo de Arquivos

### Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Prompts.tsx` | Pagina com tabs para videos, imagens e agentes |
| `src/pages/admin/AdminPrompts.tsx` | CRUD de prompts para admin |
| `src/components/prompts/PromptCard.tsx` | Componente card para prompts |

### Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/App.tsx` | Adicionar rotas /prompts e /admin/prompts |
| `src/components/layout/AppSidebar.tsx` | Adicionar link "Banco de Prompts" |
| `src/hooks/useMenteeData.ts` | Adicionar subscricao realtime |

### Migracao SQL

1. Habilitar realtime nas tabelas de mentoria
2. Criar tabela `prompts` com RLS

---

## Secao Tecnica

### Realtime Implementation

O Supabase Realtime usa WebSockets para notificar mudancas. Ao receber um evento, invalidamos a query no React Query que automaticamente refaz a busca.

### Estrutura do PromptCard

```tsx
interface Prompt {
  id: string;
  category: 'video' | 'image' | 'agent';
  title: string;
  content: string;
  description: string | null;
  tags: string[];
}

function PromptCard({ prompt, onCopy }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{prompt.title}</CardTitle>
        <CardDescription>{prompt.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <pre>{prompt.content}</pre>
        <div className="flex gap-1">
          {prompt.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onCopy(prompt.content)}>
          <Copy /> Copiar Prompt
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Tabs com Radix UI

Usar o componente Tabs ja existente no projeto para navegacao entre categorias.
