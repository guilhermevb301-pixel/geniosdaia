
# Plano: Etapas e Tarefas Padrão para Novos Mentorados

## Resumo

Quando um novo mentorado for criado (promoção de usuário para mentee), o sistema automaticamente criará 4 fases padrão com suas respectivas tarefas, seguindo a estrutura fornecida.

---

## Estrutura Padrão a Criar

```text
Fase 1: Preparação Técnica (Pilar Técnico - Azul #4D96FF)
├── [x] Onboarding e alinhamento de expectativas
├── [x] Contratação e configuração de VPS
├── [x] Instalação das ferramentas
├── [x] Configuração de credenciais
├── [x] Visão geral do N8N e instalação de templates
└── [x] Criação do primeiro agente de IA

Fase 2: Construção de Projeto (Pilar Técnico - Azul #4D96FF)
├── [ ] Escolha de nicho do primeiro projeto
├── [ ] Definição do objetivo e escopo
└── [ ] Montagem do projeto real (passo a passo guiado)

Fase 3: Estratégia de Vendas (Pilar de Vendas - Amarelo #FFD93D)
├── [ ] Definir estratégia de venda e nicho
├── [ ] Estruturar presença no Instagram para vendas
├── [ ] Roteiro para primeiras reuniões
└── [x] Mapeamento, precificação e criação de proposta comercial

Fase 4: Entrega e Escala (Pilar de Entrega - Verde #6BCB77)
├── [ ] Passo a passo: "Cliente fechou, e agora?"
├── [ ] Modelo validado de organização e entrega de projetos
└── [ ] Ajustes para aumentar a capacidade e eficiência
```

---

## Mudanças Necessárias

### Arquivo: `src/hooks/useAllUsers.ts`

Após criar o registro do mentee na tabela `mentees`, adicionar a lógica para criar as 4 fases padrão com suas tarefas:

1. Inserir as 4 fases na tabela `mentorship_stages`
2. Para cada fase criada, inserir as tarefas correspondentes na tabela `mentorship_tasks`

---

## Implementação Detalhada

### Constante com Template Padrão

```typescript
const DEFAULT_MENTORSHIP_TEMPLATE = [
  {
    title: "Fase 1: Preparação Técnica",
    objective: "Ter o ambiente pronto para começar a criar e testar.",
    icon_color: "#4D96FF", // Azul - Pilar Técnico
    tasks: [
      { content: "Onboarding e alinhamento de expectativas", completed: false },
      { content: "Contratação e configuração de VPS", completed: false },
      { content: "Instalação das ferramentas", completed: false },
      { content: "Configuração de credenciais", completed: false },
      { content: "Visão geral do N8N e instalação de templates", completed: false },
      { content: "Criação do primeiro agente de IA", completed: false },
    ],
  },
  {
    title: "Fase 2: Construção de Projeto",
    objective: "Criar um projeto funcional, mesmo que simples, para ganhar experiência prática.",
    icon_color: "#4D96FF", // Azul - Pilar Técnico
    tasks: [
      { content: "Escolha de nicho do primeiro projeto", completed: false },
      { content: "Definição do objetivo e escopo", completed: false },
      { content: "Montagem do projeto real (passo a passo guiado)", completed: false },
    ],
  },
  {
    title: "Fase 3: Estratégia de Vendas",
    objective: "Preparar a base para conseguir os primeiros clientes.",
    icon_color: "#FFD93D", // Amarelo - Pilar de Vendas
    tasks: [
      { content: "Definir estratégia de venda e nicho", completed: false },
      { content: "Estruturar presença no Instagram para vendas", completed: false },
      { content: "Roteiro para primeiras reuniões", completed: false },
      { content: "Mapeamento, precificação e criação de proposta comercial", completed: false },
    ],
  },
  {
    title: "Fase 4: Entrega e Escala",
    objective: "Aprender a entregar bem e preparar o negócio para crescer.",
    icon_color: "#6BCB77", // Verde - Pilar de Entrega
    tasks: [
      { content: "Passo a passo: \"Cliente fechou, e agora?\"", completed: false },
      { content: "Modelo validado de organização e entrega de projetos", completed: false },
      { content: "Ajustes para aumentar a capacidade e eficiência", completed: false },
    ],
  },
];
```

### Função para Criar Template

Após a criação do mentee, adicionar:

```typescript
// Criar fases e tarefas padrão
const createDefaultStagesAndTasks = async (menteeId: string) => {
  for (let i = 0; i < DEFAULT_MENTORSHIP_TEMPLATE.length; i++) {
    const stage = DEFAULT_MENTORSHIP_TEMPLATE[i];
    
    // Inserir fase
    const { data: stageData, error: stageError } = await supabase
      .from("mentorship_stages")
      .insert({
        mentee_id: menteeId,
        title: stage.title,
        objective: stage.objective,
        icon_color: stage.icon_color,
        order_index: i,
      })
      .select("id")
      .single();
    
    if (stageError || !stageData) {
      console.error("Error creating stage:", stageError);
      continue;
    }
    
    // Inserir tarefas da fase
    const tasksToInsert = stage.tasks.map((task, index) => ({
      stage_id: stageData.id,
      content: task.content,
      completed: task.completed,
      order_index: index,
      is_subtask: false,
    }));
    
    await supabase.from("mentorship_tasks").insert(tasksToInsert);
  }
};
```

### Integração no Fluxo de Criação

No `changeRole` mutation, após criar o mentee:

```typescript
// Dentro do bloco que cria novo mentee
const { data: newMentee, error } = await supabase
  .from("mentees")
  .insert({...})
  .select("id")
  .single();

if (error) throw error;

// Criar template padrão de fases e tarefas
if (newMentee) {
  await createDefaultStagesAndTasks(newMentee.id);
}
```

---

## Seção Técnica

### Fluxo de Execução

1. Mentor seleciona usuário e escolhe promover para "mentee"
2. Sistema cria registro na tabela `mentees`
3. Sistema obtém o ID do novo mentee
4. Sistema insere as 4 fases na tabela `mentorship_stages`
5. Para cada fase, sistema insere as tarefas na tabela `mentorship_tasks`
6. Novo mentorado já visualiza todas as etapas configuradas

### Observações

- As tarefas são criadas como **não completadas** (`completed: false`) por padrão
- O mentor pode editar/excluir/adicionar fases e tarefas posteriormente
- Se a criação de alguma fase/tarefa falhar, o processo continua para as próximas (resiliência)

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/hooks/useAllUsers.ts` | Adicionar template padrão e função de criação automática |

---

## Resultado Esperado

1. Todo novo mentorado já recebe as 4 fases configuradas automaticamente
2. Cada fase vem com suas tarefas padrão
3. Cores diferentes para cada pilar (Técnico=Azul, Vendas=Amarelo, Entrega=Verde)
4. Mentor pode personalizar após a criação
