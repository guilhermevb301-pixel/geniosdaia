

# Plano: Permitir que Mentores Criem Desafios

## Visao Geral

Vou implementar um sistema completo para que mentores (e admins) possam criar e gerenciar desafios semanais diretamente pela plataforma. Isso inclui atualizacao de permissoes no banco de dados, uma nova pagina administrativa e integracao na navegacao.

---

## Estrutura da Solucao

```text
+------------------------------------------------------------------+
|                    FLUXO DO MENTOR                                |
+------------------------------------------------------------------+
|                                                                   |
|  Sidebar > Gerenciar > Desafios (NOVO!)                          |
|                    |                                              |
|                    v                                              |
|  +------------------------------------------------------------+  |
|  |  [Trophy] Gerenciar Desafios                               |  |
|  |  Crie e gerencie os desafios semanais da Arena             |  |
|  |                                                            |  |
|  |  [+ Novo Desafio]                                          |  |
|  |                                                            |  |
|  |  [Ativos] [Agendados] [Encerrados]     <- TABS             |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +--------------------+  +--------------------+                   |
|  | Desafio Semana 13  |  | Desafio Semana 14  |                   |
|  | Status: Ativo      |  | Status: Agendado   |                   |
|  | 03/02 - 10/02      |  | 10/02 - 17/02      |                   |
|  | 15 submissoes      |  | 0 submissoes       |                   |
|  | [Editar] [Excluir] |  | [Editar] [Excluir] |                   |
|  +--------------------+  +--------------------+                   |
+------------------------------------------------------------------+
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/migrations/...` | Criar | Atualizar RLS para mentores |
| `src/pages/admin/AdminChallenges.tsx` | Criar | Pagina de gestao de desafios |
| `src/hooks/useChallenges.ts` | Modificar | Adicionar CRUD mutations |
| `src/components/layout/SidebarContent.tsx` | Modificar | Adicionar link para desafios |
| `src/App.tsx` | Modificar | Adicionar rota /admin/challenges |

---

## Detalhes de Implementacao

### 1. Migracao de Banco de Dados (RLS)

Atualizar a politica da tabela `challenges` para permitir que mentores tambem gerenciem:

```sql
-- Remover politica antiga de admin only
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;

-- Nova politica para admins E mentores
CREATE POLICY "Admins and mentors can manage challenges"
ON public.challenges
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'mentor'::app_role)
);
```

### 2. Nova Pagina AdminChallenges.tsx

Interface completa com:

**Header:**
- Titulo "Gerenciar Desafios" com icone de trofeu
- Botao "Novo Desafio" no canto direito

**Tabs de Status:**
- Ativos: Desafios em andamento
- Agendados: Desafios futuros (start_date > now)
- Encerrados: Desafios passados (status = 'ended')

**Grid de Cards:**
- Titulo do desafio
- Periodo (data inicio - data fim)
- Status badge (colorido)
- Contador de submissoes
- Botoes de acao (editar/excluir)

**Modal de Criacao/Edicao:**
- Titulo (obrigatorio)
- Descricao (obrigatorio)
- Regras (opcional, textarea)
- Data de Inicio (datepicker)
- Data de Fim (datepicker)
- Recompensa XP (input numerico)
- Badge de Recompensa (select, opcional)
- Status (active/scheduled/ended)

### 3. Hook useChallenges - Adicionar Mutations

```typescript
// Criar desafio
const createMutation = useMutation({
  mutationFn: async (data: CreateChallengeData) => {
    const { error } = await supabase
      .from("challenges")
      .insert(data);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
  }
});

// Atualizar desafio
const updateMutation = useMutation({
  mutationFn: async ({ id, data }) => {
    const { error } = await supabase
      .from("challenges")
      .update(data)
      .eq("id", id);
    if (error) throw error;
  }
});

// Excluir desafio
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from("challenges")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
});
```

### 4. Sidebar - Adicionar Link

No menu "Gerenciar", adicionar link para desafios (visivel para mentores e admins):

```tsx
<Link
  to="/admin/challenges"
  className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors", ...)}
>
  <Trophy className="h-4 w-4" />
  Desafios
</Link>
```

### 5. App.tsx - Nova Rota

```tsx
<Route
  path="/admin/challenges"
  element={
    <MentorRoute>
      <AdminChallenges />
    </MentorRoute>
  }
/>
```

---

## Interface do Modal de Criacao

```text
+----------------------------------------------------------+
|  [X]                                                      |
|  Novo Desafio                                             |
+----------------------------------------------------------+
|                                                          |
|  Titulo *                                                |
|  [______________________________________]                |
|                                                          |
|  Descricao *                                             |
|  [______________________________________]                |
|  [______________________________________]                |
|  [______________________________________]                |
|                                                          |
|  Regras (opcional)                                       |
|  [______________________________________]                |
|  [______________________________________]                |
|                                                          |
|  +------------------------+  +------------------------+  |
|  | Data de Inicio        |  | Data de Fim            |  |
|  | [dd/mm/aaaa] [📅]     |  | [dd/mm/aaaa] [📅]     |  |
|  +------------------------+  +------------------------+  |
|                                                          |
|  +------------------------+  +------------------------+  |
|  | Recompensa XP         |  | Status                 |  |
|  | [500]                 |  | [Ativo v]              |  |
|  +------------------------+  +------------------------+  |
|                                                          |
|  Badge de Recompensa (opcional)                          |
|  [Selecionar badge... v]                                |
|                                                          |
|  +------------------------------------------------------+|
|  |                  [ Criar Desafio ]                   ||
|  +------------------------------------------------------+|
+----------------------------------------------------------+
```

---

## Fluxo de Navegacao

```text
Mentor/Admin acessa sidebar
        |
        v
Clica em "Gerenciar" > "Desafios"
        |
        v
Ve lista de desafios existentes (ou vazia)
        |
        +--> Clicar "Novo Desafio" --> Modal de criacao
        |                                    |
        |                                    v
        |                           Preenche dados + salva
        |                                    |
        |                                    v
        |                           Desafio aparece na lista
        |                           + Arena atualizada
        |
        +--> Clicar "Editar" em card --> Modal de edicao
        |
        +--> Clicar "Excluir" --> Confirmacao --> Remove
```

---

## Cores e Status

| Status | Badge | Significado |
|--------|-------|-------------|
| active | Verde `bg-success` | Em andamento |
| scheduled | Azul `bg-blue-500` | Agendado para futuro |
| ended | Cinza `bg-muted` | Encerrado |

---

## Validacoes

1. **Titulo**: Obrigatorio, minimo 5 caracteres
2. **Descricao**: Obrigatoria, minimo 20 caracteres
3. **Data de Inicio**: Obrigatoria
4. **Data de Fim**: Obrigatoria, deve ser posterior a inicio
5. **XP**: Minimo 50, maximo 1000
6. **Status**: Automatico baseado nas datas, ou manual

---

## Secao Tecnica

### Estrutura do Componente AdminChallenges

```tsx
export default function AdminChallenges() {
  const [activeTab, setActiveTab] = useState("active");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rules: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    xp_reward: 100,
    status: "active",
  });

  return (
    <AppLayout>
      <Header />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="ended">Encerrados</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <ChallengeGrid challenges={activeChallenges} />
        </TabsContent>
        ...
      </Tabs>
      <CreateEditDialog />
    </AppLayout>
  );
}
```

### Interface de Tipos

```typescript
interface CreateChallengeData {
  title: string;
  description: string;
  rules?: string;
  start_date: string;
  end_date: string;
  xp_reward: number;
  badge_reward_id?: string;
  status: "active" | "scheduled" | "ended";
}
```

---

## Resultado Esperado

1. **Mentores podem criar desafios** - Acesso total ao CRUD
2. **Interface administrativa** - Pagina dedicada em /admin/challenges
3. **Navegacao integrada** - Link no menu Gerenciar da sidebar
4. **RLS atualizado** - Politicas de banco permitem mentor
5. **Arena populada** - Desafios criados aparecem na pagina publica
6. **Gestao de status** - Controle de ativos, agendados e encerrados

