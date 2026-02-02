
# Plano: Remover Estrutura de Grupos dos Objetivos

## Situação Atual

O sistema possui duas tabelas:
- `objective_groups` - Grupos como "A) Quero vender sem viralizar", "B) Quero crescer", etc.
- `objective_items` - Objetivos individuais com `group_id` vinculando a um grupo

No admin, você vê os grupos com títulos (A, B, C) e os objetivos dentro deles.

## Mudança Solicitada

Eliminar a necessidade de grupos. Ter apenas uma lista simples de objetivos que você configura diretamente.

---

## Solução

### Opção Escolhida: Simplificar para Lista Plana (SEM grupos)

Tornar o `group_id` opcional no banco e modificar a UI para:
1. **Admin**: Lista plana de objetivos com CRUD simples
2. **Aluno**: Lista plana de checkboxes sem divisões

---

## Mudanças Necessárias

### 1. Banco de Dados
Tornar `group_id` opcional em `objective_items`:

```sql
ALTER TABLE public.objective_items 
ALTER COLUMN group_id DROP NOT NULL;
```

### 2. Admin - ObjectivesEditor.tsx
Transformar de estrutura com grupos para lista simples:

| Antes | Depois |
|-------|--------|
| Cards de grupos com itens aninhados | Lista única de objetivos |
| Botão "Novo Grupo" | Removido |
| Itens dentro de grupos | Itens na raiz |

Interface final:
- Header: "Gerenciar Objetivos" + botão "Novo Objetivo"
- Lista de cards de objetivo (um por linha)
- Cada card: label, key, tags, badges (Requer Infra, INFRA), botões de editar/excluir/vincular

### 3. Hook - useObjectives.ts
Simplificar para retornar lista plana de items:

```typescript
// Antes
objectiveGroups: ObjectiveGroup[] // grupos com items aninhados

// Depois  
objectives: ObjectiveItem[] // lista plana
```

### 4. UI do Aluno - ObjectivesModal.tsx e ObjectivesChecklist.tsx
Remover renderização de títulos de grupos:

```tsx
// Antes
{objectiveGroups.map((group) => (
  <div>
    <h4>{group.title}</h4>  {/* "A) Quero vender..." */}
    {group.items.map(item => ...)}
  </div>
))}

// Depois
{objectives.map((item) => (
  <div>...</div>  // Lista plana, sem títulos de grupo
))}
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| Migration SQL | Tornar `group_id` nullable |
| `src/hooks/useObjectives.ts` | Retornar `objectives` como lista plana, remover mutations de grupo |
| `src/components/admin/ObjectivesEditor.tsx` | Interface simplificada sem grupos |
| `src/components/challenges/ObjectivesModal.tsx` | Renderizar lista plana |
| `src/components/challenges/ObjectivesChecklist.tsx` | Renderizar lista plana |
| `src/components/challenges/ObjectivesSummary.tsx` | Usar lista plana |

---

## Interface do Admin (Nova)

```text
+--------------------------------------------------+
| Gerenciar Objetivos               [+ Novo Objetivo]
| Configure os objetivos disponíveis para alunos
+--------------------------------------------------+

+--------------------------------------------------+
| :: | Vender primeiro projeto de Agente | Requer Infra |
|    | vender_projeto | vendas, comercial |
|                                  [vincular] [editar] [excluir]
+--------------------------------------------------+

+--------------------------------------------------+
| :: | Viralizar nas redes | 
|    | viralizar | crescimento, redes |
|                                  [vincular] [editar] [excluir]
+--------------------------------------------------+

... mais objetivos ...
```

---

## Interface do Aluno (Modal)

Antes:
```text
A) Quero vender sem viralizar
  [ ] Vender primeiro projeto de Agente

B) Quero crescer (audiência)
  [ ] Viralizar nas redes
```

Depois:
```text
[ ] Vender primeiro projeto de Agente
[ ] Viralizar nas redes
[ ] Criar vídeos incríveis
... (lista simples sem divisões)
```

---

## Dados Existentes

Os objetivos existentes serão mantidos. A coluna `group_id` continuará preenchida para compatibilidade, mas não será mais exibida na UI.

---

## Resultado Esperado

1. Admin vê lista simples de objetivos para CRUD
2. Aluno vê lista simples de checkboxes sem divisões A/B/C
3. Todas as funcionalidades mantidas (vincular desafios, tags, requer infra)
