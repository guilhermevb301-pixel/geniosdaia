
# Plano: Reorganizar Etapas - Fases como Cards Principais

## Resumo

Inverter a hierarquia visual: em vez de mostrar Pilares como cards com Fases dentro, mostrar **Fases (4 cards)** como elementos principais, cada uma com o nome do Pilar como badge/subtítulo e suas tarefas.

---

## Estrutura Visual Desejada

```text
Etapas
+------------------------------------------+------------------------------------------+
|                                          |                                          |
| Fase 1: Preparação Técnica               | Fase 3: Estratégia de Vendas             |
| 🔧 Pilar Técnico                         | 💼 Pilar de Vendas                        |
| Objetivo: ter o ambiente pronto...       | Objetivo: preparar a base...             |
|                                          |                                          |
| ✅ Onboarding e alinhamento              | ☐ Definir estratégia de venda            |
| ✅ Contratação e configuração de VPS     | ☐ Estruturar presença no Instagram       |
| ✅ Instalação das ferramentas            | ☐ Roteiro para primeiras reuniões        |
| ...                                      | ✅ Mapeamento, precificação...           |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
| Fase 2: Construção de Projeto            | Fase 4: Entrega e Escala                 |
| 🔧 Pilar Técnico                         | 📦 Pilar de Entrega                       |
| Objetivo: criar um projeto funcional...  | Objetivo: aprender a entregar...         |
|                                          |                                          |
| ☐ Escolha de nicho do primeiro projeto   | ☐ Passo a passo: "Cliente fechou..."     |
| ☐ Definição do objetivo e escopo         | ☐ Modelo validado de organização         |
| ☐ Montagem do projeto real               | ☐ Ajustes para aumentar capacidade       |
+------------------------------------------+------------------------------------------+
```

---

## Mudanças Necessárias

### 1. Página MinhaMentoria.tsx

Substituir o grid de `PillarCard` por um grid de `StageCard` (fases):

| Item | Mudança |
|------|---------|
| Componente | Usar `stages` em vez de `pillars` |
| Grid | 2 colunas (md:grid-cols-2) para 4 fases |
| Visual | Cada card mostra: Título da Fase, Badge do Pilar, Objetivo, Tarefas |

### 2. Criar Novo Componente StageCard

Componente que exibe uma Fase com:
- Título da Fase (ex: "Fase 1: Preparação Técnica")
- Badge com ícone e nome do Pilar vinculado
- Objetivo em destaque (cor do pilar)
- Lista de tarefas com checkboxes

### 3. Atualizar MenteeEditor.tsx

- Remover seção de "Pilares" como cards principais
- Manter Pilares apenas como opções de dropdown ao criar/editar Fases
- Foco na gestão de Fases e suas Tarefas
- Interface simplificada: Fases como lista principal, cada uma com suas tarefas

### 4. Atualizar Hook useMenteeData

Garantir que `stages` inclua informações do Pilar vinculado para exibição.

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/pages/MinhaMentoria.tsx` | Substituir PillarCard por StageCard, usar stages |
| `src/components/mentoria/StageCard.tsx` | Atualizar para incluir badge do Pilar |
| `src/pages/admin/MenteeEditor.tsx` | Remover seção de Pilares como cards, manter como dropdown |
| `src/hooks/useMenteeData.ts` | Incluir dados do pilar vinculado nos stages |

---

## Implementação Detalhada

### Parte 1: Atualizar MinhaMentoria.tsx

```tsx
// Importar StageCard em vez de PillarCard
import { StageCard } from "@/components/mentoria/StageCard";

// Usar stages em vez de pillars
const { mentee, meetings, stages, pillars, isLoading, toggleTask } = useMenteeData();

// Na seção Etapas:
<div className="grid gap-4 md:grid-cols-2">
  {stages.map((stage) => {
    const linkedPillar = pillars.find(p => p.id === stage.pillar_id);
    return (
      <StageCard
        key={stage.id}
        stage={stage}
        pillar={linkedPillar}
        onToggleTask={handleToggleTask}
      />
    );
  })}
</div>
```

### Parte 2: Atualizar StageCard.tsx

Novo design do card de Fase:

```tsx
interface StageCardProps {
  stage: Stage;
  pillar?: Pillar;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export function StageCard({ stage, pillar, onToggleTask }: StageCardProps) {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        {/* Título da Fase */}
        <h3 className="font-semibold text-base">{stage.title}</h3>
        
        {/* Badge do Pilar */}
        {pillar && (
          <div className="flex items-center gap-2 mt-1">
            <IconComponent style={{ color: pillar.icon_color }} />
            <span className="text-sm text-muted-foreground">{pillar.title}</span>
          </div>
        )}
        
        {/* Objetivo */}
        {stage.objective && (
          <p className="text-xs font-medium" style={{ color: stage.icon_color }}>
            Objetivo: {stage.objective}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Tarefas */}
        {stage.tasks?.map((task) => (
          <TaskCheckbox key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </CardContent>
    </Card>
  );
}
```

### Parte 3: Simplificar MenteeEditor.tsx

Remover a seção visual de cards de Pilares:
- Manter CRUD de Pilares (apenas para o dropdown)
- Foco na lista de Fases como elemento principal
- Cada Fase mostra: título, objetivo, pilar vinculado (dropdown), tarefas

```tsx
// Remover grid de pillar cards
// Manter apenas um botão discreto para gerenciar pilares

// Seção principal: Lista de Fases
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2>Fases</h2>
    <div className="flex gap-2">
      <Button onClick={() => setIsPillarOpen(true)}>
        Gerenciar Pilares
      </Button>
      <Button onClick={() => setIsStageOpen(true)}>
        + Nova Fase
      </Button>
    </div>
  </div>
  
  {/* Lista de fases como cards principais */}
  <div className="grid gap-4 md:grid-cols-2">
    {stages.map((stage) => (
      <Card key={stage.id}>
        {/* Header da fase com badge do pilar */}
        {/* Tarefas editáveis */}
      </Card>
    ))}
  </div>
</div>
```

---

## Seção Técnica

### Atualização do Hook useMenteeData

Para exibir o nome do pilar em cada fase, precisamos buscar os dados do pilar. A query atual já faz isso, mas precisamos garantir que os stages incluam a referência:

```typescript
// Buscar stages com informações do pilar
const { data: stages = [] } = useQuery({
  queryKey: ["stages", activeMenteeId],
  queryFn: async () => {
    const { data: stagesData, error } = await supabase
      .from("mentorship_stages")
      .select(`
        *,
        tasks:mentorship_tasks(*),
        notes:mentorship_notes(*),
        pillar:mentorship_pillars(id, title, icon, icon_color)
      `)
      .eq("mentee_id", activeMenteeId)
      .order("order_index", { ascending: true });

    return stagesData;
  },
});
```

### Interface Stage Atualizada

```typescript
export interface Stage {
  id: string;
  mentee_id: string;
  pillar_id: string | null;
  title: string;
  objective: string | null;
  icon: string;
  icon_color: string;
  order_index: number;
  created_at: string;
  tasks?: Task[];
  notes?: Note[];
  pillar?: {
    id: string;
    title: string;
    icon: string;
    icon_color: string;
  };
}
```

---

## Fluxo do Mentor no Editor

1. Criar Pilares (opcional, via botão "Gerenciar Pilares")
2. Criar Fases - cada fase pode ser vinculada a um Pilar
3. Adicionar Tarefas dentro de cada Fase
4. Layout visual: grid de 2 colunas com as 4 fases

---

## Fluxo do Aluno

1. Ver página /minha-mentoria
2. Seção "Etapas" mostra 4 cards (Fase 1, 2, 3, 4)
3. Cada card mostra: título, badge do pilar, objetivo, tarefas
4. Aluno marca tarefas como concluídas com checkbox

---

## Resultado Esperado

1. Etapas exibidas como grid de Fases (não mais Pilares)
2. Cada Fase mostra o Pilar vinculado como badge/subtítulo
3. Layout 2x2 para 4 fases
4. Tarefas editáveis por mentores, marcáveis por alunos
5. Interface do MenteeEditor simplificada com foco em Fases
