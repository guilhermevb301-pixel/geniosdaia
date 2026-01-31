
# Plano: Centralizar Edicao da Arena em /admin/challenges

## Resumo

Mover toda a funcionalidade de edicao (objetivos + desafios recomendados) para a pagina `/admin/challenges` e remover os botoes de edicao da pagina `/desafios`. A pagina de admin tera 3 abas principais: Desafios Semanais, Objetivos do Checklist, e Desafios Recomendados.

---

## Mudancas na Pagina /admin/challenges

A pagina sera reorganizada com um sistema de abas:

```text
+----------------------------------------------------------+
|  GERENCIAR ARENA DOS GENIOS                              |
+----------------------------------------------------------+
|  [Desafios Semanais] [Objetivos] [Desafios Recomendados] |
+----------------------------------------------------------+
|                                                          |
|  (conteudo da aba selecionada)                           |
|                                                          |
+----------------------------------------------------------+
```

### Aba 1: Desafios Semanais (ja existe)
- Lista de desafios da tabela `challenges`
- CRUD completo (criar, editar, excluir)
- Filtros por status (ativos, agendados, encerrados)

### Aba 2: Objetivos (NOVO)
- Gerenciar grupos e itens de objetivos (tabelas `objective_groups` e `objective_items`)
- Mesmo conteudo que atualmente esta no `ObjectivesEditorModal`
- Sera renderizado inline (nao em modal)
- Permite adicionar/editar/excluir grupos e itens
- Configurar regras de dependencia (requires_infra, is_infra)
- Definir tags para filtragem

### Aba 3: Desafios Recomendados (NOVO)
- CRUD completo para a tabela `daily_challenges`
- Campos: titulo, objetivo, trilha, dificuldade, tempo estimado, checklist, passos, is_bonus
- Permite criar novos desafios personalizados
- Permite editar desafios existentes
- Permite excluir desafios

---

## Remover Edicao da Pagina /desafios

Atualmente a pagina `/desafios` tem botoes de edicao visiveis para mentor/admin:
- Botao "Editar" no componente `ObjectivesChecklist`
- Link "Gerenciar" no componente `RecommendedChallenges`

Mudancas:
1. Remover o botao "Editar" do `ObjectivesChecklist.tsx`
2. Remover o link "Gerenciar Desafios" do `RecommendedChallenges.tsx`
3. Remover a importacao e renderizacao do `ObjectivesEditorModal` no `ObjectivesChecklist.tsx`

---

## Estrutura do Novo AdminChallenges

```tsx
export default function AdminChallenges() {
  const [activeTab, setActiveTab] = useState("weekly");

  return (
    <AppLayout>
      <div className="space-y-6">
        <Header />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="weekly">Desafios Semanais</TabsTrigger>
            <TabsTrigger value="objectives">Objetivos</TabsTrigger>
            <TabsTrigger value="recommended">Desafios Recomendados</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            {/* Conteudo atual - lista de challenges */}
            <WeeklyChallengesTab />
          </TabsContent>

          <TabsContent value="objectives">
            {/* Editor de objetivos inline */}
            <ObjectivesTab />
          </TabsContent>

          <TabsContent value="recommended">
            {/* CRUD de daily_challenges */}
            <RecommendedChallengesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
```

---

## Novo CRUD para Desafios Recomendados

Criar hook `useDailyChallengesAdmin.ts` com:

```tsx
// Queries
- listar todos daily_challenges
- buscar por id

// Mutations
- createDailyChallenge(data)
- updateDailyChallenge(id, data)
- deleteDailyChallenge(id)
```

Interface de edicao tera:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| title | text | Titulo do desafio |
| objective | text | Objetivo do desafio |
| track | select | Trilha (agentes, videos, fotos, etc) |
| difficulty | select | Dificuldade (iniciante, intermediario, avancado) |
| estimated_minutes | number | Tempo estimado em minutos |
| steps | text[] | Lista de passos |
| checklist | text[] | Lista de itens do checklist |
| deliverable | text | Entregavel esperado |
| is_bonus | boolean | Se e desafio bonus |

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/admin/AdminChallenges.tsx` | Adicionar sistema de abas, incluir aba de Objetivos e Desafios Recomendados |
| `src/components/challenges/ObjectivesChecklist.tsx` | Remover botao de edicao e modal |
| `src/components/challenges/RecommendedChallenges.tsx` | Remover link de gerenciar |
| `src/components/challenges/ObjectivesEditorModal.tsx` | Converter para componente inline (ObjectivesEditor) |

## Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useDailyChallengesAdmin.ts` | Hook com CRUD completo para daily_challenges |

---

## Detalhes de Implementacao

### 1. ObjectivesEditor (inline)

Converter o modal existente em componente inline:
- Remover wrapper de Dialog
- Manter toda a logica de edicao
- Adicionar melhor tratamento de estados

### 2. DailyChallengesEditor

Novo componente para gerenciar desafios recomendados:

```tsx
function DailyChallengesEditor() {
  const { challenges, isLoading, createChallenge, updateChallenge, deleteChallenge } = useDailyChallengesAdmin();
  
  return (
    <div className="space-y-6">
      {/* Botao novo desafio */}
      <Button onClick={() => setShowForm(true)}>
        <Plus /> Novo Desafio Recomendado
      </Button>
      
      {/* Lista de desafios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map(challenge => (
          <DailyChallengeCard 
            key={challenge.id}
            challenge={challenge}
            onEdit={() => handleEdit(challenge)}
            onDelete={() => handleDelete(challenge.id)}
          />
        ))}
      </div>
      
      {/* Dialog/Modal de criacao/edicao */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {/* Campos do formulario */}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### 3. useDailyChallengesAdmin hook

```tsx
export function useDailyChallengesAdmin() {
  const queryClient = useQueryClient();

  // Fetch all daily challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["adminDailyChallenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from("daily_challenges").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDailyChallenges"] });
      toast.success("Desafio criado!");
    },
  });

  // Update mutation
  const updateMutation = useMutation({...});

  // Delete mutation
  const deleteMutation = useMutation({...});

  return {
    challenges,
    isLoading,
    createChallenge: createMutation.mutate,
    updateChallenge: updateMutation.mutate,
    deleteChallenge: deleteMutation.mutate,
  };
}
```

---

## Fluxo de Usuario (Mentor/Admin)

1. Mentor acessa `/admin/challenges`
2. Ve 3 abas: Desafios Semanais, Objetivos, Desafios Recomendados
3. Na aba "Objetivos", pode:
   - Ver todos os grupos e itens
   - Adicionar novo grupo
   - Editar titulo de grupo
   - Adicionar/editar/excluir itens
   - Configurar regras de dependencia
4. Na aba "Desafios Recomendados", pode:
   - Ver lista de desafios personalizados
   - Criar novo desafio com todos os campos
   - Editar desafio existente
   - Excluir desafio
5. Mudancas refletem imediatamente em `/desafios`

---

## Fluxo de Usuario (Membro)

1. Membro acessa `/desafios`
2. Ve checklist de objetivos (sem botao editar)
3. Marca seus objetivos
4. Ve desafios recomendados filtrados (sem link gerenciar)
5. Interage normalmente com a arena

---

## Criterios de Aceite

- [ ] `/admin/challenges` tem 3 abas: Desafios Semanais, Objetivos, Desafios Recomendados
- [ ] Aba Objetivos permite CRUD de grupos e itens (inline, nao modal)
- [ ] Aba Desafios Recomendados permite CRUD de daily_challenges
- [ ] Pagina `/desafios` nao tem botoes de edicao para ninguem
- [ ] Membros so visualizam e marcam objetivos
- [ ] Mudancas feitas no admin refletem para todos os usuarios
- [ ] Tudo persistente no banco de dados
- [ ] Visual dark consistente com design atual
