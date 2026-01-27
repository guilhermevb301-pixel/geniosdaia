

# Plano: Sistema de Etapas Editaveis para Mentoria

## Resumo

Substituir a seção "To-do List" na página /minha-mentoria pela seção "Etapas" já existente, que exibe Pilares com Fases e Tarefas conforme a imagem de referência. Além disso, corrigir todas as ocorrências de "Gêneos" para "Gênios".

---

## Estrutura Visual de Referência

```text
Etapas
+------------------------------------------+------------------------------------------+------------------------------------------+
| 🔧 Pilar Técnico                         | 💼 Pilar de Vendas                        | 📦 Pilar de Entrega                       |
|                                          |                                          |                                          |
| Fase 1: Preparação Técnica               | Fase 3: Estratégia de Vendas             | Fase 4: Entrega e Escala                 |
| Objetivo: ter o ambiente pronto...       | Objetivo: preparar a base...             | Objetivo: aprender a entregar...         |
|                                          |                                          |                                          |
| ✅ Onboarding e alinhamento              | ☐ Definir estratégia de venda            | ☐ Passo a passo: "Cliente fechou..."     |
| ✅ Contratação e configuração de VPS     | ☐ Estruturar presença no Instagram       | ☐ Modelo validado de organização         |
| ✅ Instalação das ferramentas            | ☐ Roteiro para primeiras reuniões        | ☐ Ajustes para aumentar capacidade       |
| ...                                      | ✅ Mapeamento, precificação...           |                                          |
|                                          |                                          |                                          |
| Fase 2: Construção de Projeto            |                                          |                                          |
| Objetivo: criar um projeto funcional...  |                                          |                                          |
| ☐ Escolha de nicho do primeiro projeto   |                                          |                                          |
| ...                                      |                                          |                                          |
+------------------------------------------+------------------------------------------+------------------------------------------+
```

---

## Situação Atual

O sistema já possui:

1. **Tabela `mentorship_pillars`** - Pilares (ex: "Pilar Técnico")
2. **Tabela `mentorship_stages`** - Fases vinculadas aos pilares via `pillar_id`
3. **Tabela `mentorship_tasks`** - Tarefas vinculadas às fases via `stage_id`
4. **Componente `PillarCard`** - Já exibe a estrutura de Pilares > Fases > Tarefas
5. **MenteeEditor** - Permite mentores editarem etapas (stages) mas não pilares diretamente

O problema: A seção "Etapas" (Pillars) já existe mas só aparece se houver pilares criados. A To-do List está sendo exibida acima dela.

---

## Mudanças Necessárias

### 1. Reorganizar Layout da Página MinhaMentoria

Remover a seção TodoList e mover a seção de Pilares/Etapas para o lugar dela:

| Antes | Depois |
|-------|--------|
| Header | Header |
| QuickAccessCards | QuickAccessCards |
| **TodoList** | **Etapas (Pillars)** |
| MeetingsTable | MeetingsTable |
| Etapas (Pillars) | *(removido daqui)* |

### 2. Mostrar Etapas Mesmo Sem Pilares

Atualmente a seção só aparece se `pillars.length > 0`. Precisamos mostrar uma mensagem quando não há pilares cadastrados.

### 3. Adicionar Gerenciamento de Pilares no MenteeEditor

O MenteeEditor atual gerencia apenas "Stages" (etapas planas, sem hierarquia de pilares). Precisamos adicionar:

- CRUD para Pilares (criar, editar, excluir)
- Vincular Stages (Fases) aos Pilares
- Interface visual semelhante à imagem de referência

### 4. Corrigir Ortografia

Substituir "Gêneos" por "Gênios" em todos os arquivos:

| Arquivo | Ocorrências |
|---------|-------------|
| `index.html` | 4 ocorrências |
| `src/index.css` | 1 comentário |
| `src/pages/Eventos.tsx` | 1 ocorrência |
| `src/pages/Login.tsx` | 2 ocorrências |
| `src/pages/Register.tsx` | 2 ocorrências |
| `src/components/SupportWidget.tsx` | 1 ocorrência |
| `src/components/layout/AppSidebar.tsx` | 1 ocorrência |

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/MinhaMentoria.tsx` | Remover TodoList, reposicionar Etapas |
| `src/pages/admin/MenteeEditor.tsx` | Adicionar CRUD de Pilares e vincular Fases |
| `index.html` | Corrigir "Gêneos" → "Gênios" |
| `src/index.css` | Corrigir comentário |
| `src/pages/Eventos.tsx` | Corrigir texto |
| `src/pages/Login.tsx` | Corrigir textos |
| `src/pages/Register.tsx` | Corrigir textos |
| `src/components/SupportWidget.tsx` | Corrigir mensagem |
| `src/components/layout/AppSidebar.tsx` | Corrigir nome |

---

## Implementação Detalhada

### Parte 1: Reorganizar MinhaMentoria.tsx

Remover o componente TodoList e seus imports/hooks relacionados. Mover a seção de Pillars para onde estava a TodoList:

```tsx
// Remover:
import { TodoList } from "@/components/mentoria/TodoList";

// Na desestruturação do hook, remover:
// todos, toggleTodo, createTodo, deleteTodo

// Substituir a seção TodoList pela seção Etapas
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <Layers className="h-5 w-5 text-primary" />
    <h2 className="text-lg font-semibold">Etapas</h2>
  </div>
  {pillars.length > 0 ? (
    <div className="grid gap-4 md:grid-cols-3">
      {pillars.map((pillar) => (
        <PillarCard
          key={pillar.id}
          pillar={pillar}
          onToggleTask={handleToggleTask}
        />
      ))}
    </div>
  ) : (
    <Card className="bg-card/50 border-border p-6 text-center">
      <p className="text-muted-foreground">
        Nenhuma etapa foi configurada ainda pelo seu mentor.
      </p>
    </Card>
  )}
</div>
```

### Parte 2: Atualizar MenteeEditor.tsx

Adicionar gerenciamento completo de Pilares:

1. **Novo estado para Pilares**:
```tsx
const [isPillarOpen, setIsPillarOpen] = useState(false);
const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
const [pillarForm, setPillarForm] = useState({
  title: "",
  icon: "folder",
  icon_color: "#FFD93D",
});
```

2. **Funções CRUD de Pilares**:
```tsx
const handleSavePillar = async () => {
  // Criar ou atualizar pilar
};

const handleDeletePillar = async (id: string) => {
  // Deletar pilar
};
```

3. **Formulário de Fase com seleção de Pilar**:
```tsx
// Adicionar campo pillar_id ao stageForm
const [stageForm, setStageForm] = useState({
  title: "",
  objective: "",
  icon_color: "#F59E0B",
  pillar_id: "", // Novo campo
});
```

4. **Nova seção de UI para Pilares**:
```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Layers className="h-5 w-5 text-primary" />
      <h2 className="text-lg font-semibold">Pilares</h2>
    </div>
    <Button onClick={() => setIsPillarOpen(true)}>
      <Plus /> Novo Pilar
    </Button>
  </div>
  
  <div className="grid gap-4 md:grid-cols-3">
    {pillars.map((pillar) => (
      <Card key={pillar.id}>
        {/* Header do pilar com botões editar/excluir */}
        {/* Lista de fases dentro do pilar */}
        {/* Botão para adicionar fase ao pilar */}
      </Card>
    ))}
  </div>
</div>
```

### Parte 3: Correção de Ortografia

Buscar e substituir em todos os arquivos:
- "Gêneos da IA" → "Gênios da IA"
- "GÊNEOS" → "GÊNIOS"
- "Comunidade Gêneos" → "Comunidade Gênios"

---

## Seção Técnica

### Atualização do Hook useMenteeData

O hook já busca pilares corretamente. Precisamos garantir que o MenteeEditor também use a query de pilares:

```typescript
const { mentee, meetings, stages, pillars, isLoading } = useMenteeData(menteeId);
```

### CRUD de Pilares no MenteeEditor

```typescript
// Criar pilar
const { error } = await supabase.from("mentorship_pillars").insert({
  mentee_id: menteeId,
  title: pillarForm.title,
  icon: pillarForm.icon,
  icon_color: pillarForm.icon_color,
  order_index: nextOrder,
});

// Atualizar pilar
const { error } = await supabase
  .from("mentorship_pillars")
  .update({ title, icon, icon_color })
  .eq("id", pillarId);

// Deletar pilar (cascade deleta fases e tarefas associadas)
const { error } = await supabase
  .from("mentorship_pillars")
  .delete()
  .eq("id", pillarId);
```

### Vincular Fase a Pilar

Ao criar/editar uma fase, incluir o `pillar_id`:

```typescript
const { error } = await supabase.from("mentorship_stages").insert({
  mentee_id: menteeId,
  pillar_id: stageForm.pillar_id, // Vincula ao pilar
  title: stageForm.title,
  objective: stageForm.objective,
  icon_color: stageForm.icon_color,
  order_index: nextOrder,
});
```

---

## Resultado Esperado

1. A página /minha-mentoria exibe a seção "Etapas" no lugar da To-do List
2. A estrutura visual segue o padrão da imagem: Pilares em grid de 3 colunas, cada um com suas Fases e Tarefas
3. Mentores podem criar/editar/excluir Pilares no MenteeEditor
4. Mentores podem vincular Fases aos Pilares
5. Todas as ocorrências de "Gêneos" são corrigidas para "Gênios"
6. O sistema de realtime continua funcionando para sincronizar alterações

