

# Plano: Permitir Múltiplos Desafios Ativos Simultâneos

## Problema Identificado

Atualmente, quando um mentor vincula vários desafios a um objetivo:
- Apenas o **primeiro desafio** (order_index=0) é liberado como "ativo"
- Os demais ficam bloqueados até o anterior ser completado

O mentor precisa poder configurar **quantos desafios são liberados por vez** (ex: 2 ou 3 ativos simultaneamente).

---

## Solução Proposta

Adicionar um campo `active_slots` na tabela `objective_items` que define quantos desafios podem ficar ativos ao mesmo tempo.

---

## Mudanças Necessárias

### 1. Alterar Banco de Dados

| Tabela | Campo Novo | Tipo | Default | Descrição |
|--------|------------|------|---------|-----------|
| `objective_items` | `active_slots` | integer | 1 | Número de desafios ativos simultaneamente |

```text
SQL:
ALTER TABLE objective_items 
ADD COLUMN active_slots integer DEFAULT 1 NOT NULL;
```

---

### 2. Atualizar Interface do Admin (ObjectivesEditor)

No formulário de criar/editar objetivo, adicionar:

```text
+------------------------------------------+
| Desafios Ativos Simultâneos              |
| [1] [2] [3] [4] (botões de seleção)      |
| Quantos desafios podem estar ativos ao   |
| mesmo tempo para este objetivo.          |
+------------------------------------------+
```

**Comportamento:**
- Default: 1 (comportamento atual)
- Valores permitidos: 1 a 4
- Interface: botões tipo "toggle group"

---

### 3. Ajustar Lógica de Inicialização de Progresso

**Arquivo:** `src/hooks/useUserChallengeProgress.ts`

Atualmente (linha 149-155):
```typescript
const records = sortedChallenges.map((ch, idx) => ({
  status: idx === 0 ? "active" : "locked",  // Só o primeiro é ativo
  ...
}));
```

**Novo comportamento:**
```typescript
// Recebe activeSlots do objetivo
const records = sortedChallenges.map((ch, idx) => ({
  status: idx < activeSlots ? "active" : "locked",  // Primeiros N são ativos
  started_at: idx < activeSlots ? now : null,
  deadline: idx < activeSlots ? calculateDeadline(...) : null,
}));
```

---

### 4. Ajustar Lógica de Completar Desafio

**Arquivo:** `src/hooks/useUserChallengeProgress.ts` - `completeMutation`

Atualmente: quando um desafio é completado, o próximo `locked` vira `active`.

**Novo comportamento:**
- Contar quantos desafios estão `active` após a conclusão
- Se for menor que `active_slots`, liberar o próximo `locked`
- Isso mantém sempre N desafios ativos (quando disponíveis)

```text
Exemplo com active_slots=2:
1. Início: Desafio 1 (ativo), Desafio 2 (ativo), Desafio 3 (locked), Desafio 4 (locked)
2. Completa Desafio 1: Desafio 1 (completed), Desafio 2 (ativo), Desafio 3 (ativo), Desafio 4 (locked)
3. Completa Desafio 2: Desafio 1 (completed), Desafio 2 (completed), Desafio 3 (ativo), Desafio 4 (ativo)
```

---

### 5. Atualizar Interface do Aluno

**Arquivos:** 
- `src/components/challenges/ChallengeProgressSection.tsx`
- `src/components/challenges/YourChallengesBanner.tsx`

**Mudanças:**
- Mostrar **todos os desafios ativos** (não apenas o primeiro)
- Alterar de "activeChallenge" (singular) para "activeChallenges" (array)
- O banner pode mostrar grid de cards se houver mais de 1 ativo

---

## Fluxo Visual do Mentor

```text
┌─────────────────────────────────────────────────────────────────┐
│ Editar Objetivo: "Vender agentes de IA + Viralizar"            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Texto do Objetivo *                                             │
│ [Vender agentes de IA + Viralizar_________________]             │
│                                                                 │
│ Chave Única *                                                   │
│ [agentes_fechar_viralizar_combo___________________]             │
│                                                                 │
│ Tags                                                            │
│ [agentes, vendas, crescimento_____________________]             │
│                                                                 │
│ ┌──────────────────────────────────────────────────┐            │
│ │ Desafios Ativos Simultâneos                      │            │
│ │                                                  │            │
│ │    [1]   [●2]   [3]   [4]                        │ ◄── NOVO   │
│ │                                                  │            │
│ │ Quantos desafios podem estar ativos ao mesmo    │            │
│ │ tempo para alunos neste objetivo.               │            │
│ └──────────────────────────────────────────────────┘            │
│                                                                 │
│ [x] Requer Infra    [ ] É item de Infra                         │
│                                                                 │
│                         [Cancelar]  [Salvar]                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo Visual do Aluno (com 2 desafios ativos)

```text
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Seus Desafios Ativos                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ DESAFIO ATIVO        │  │ DESAFIO ATIVO        │             │
│  │ Criar agente básico  │  │ Fazer 1º venda       │             │
│  │                      │  │                      │             │
│  │ ⏱️ 2d 5h restantes   │  │ ⏱️ 3d 12h restantes  │             │
│  │ [Completar]          │  │ [Completar]          │             │
│  └──────────────────────┘  └──────────────────────┘             │
│                                                                 │
│  🔒 Próximos: Desafio 3, Desafio 4 (bloqueados)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| **Migração SQL** | Adicionar coluna `active_slots` |
| `src/hooks/useObjectives.ts` | Incluir `active_slots` na interface |
| `src/components/admin/ObjectivesEditor.tsx` | Adicionar campo de seleção de slots |
| `src/hooks/useUserChallengeProgress.ts` | Ajustar init e complete para respeitar slots |
| `src/components/challenges/ChallengeProgressSection.tsx` | Suportar múltiplos ativos |
| `src/components/challenges/YourChallengesBanner.tsx` | Mostrar grid de desafios ativos |

---

## Benefícios

1. **Flexibilidade para mentores**: configurar progressão mais rápida ou mais lenta
2. **Experiência do aluno**: pode trabalhar em paralelo em desafios complementares
3. **Retrocompatível**: default=1 mantém comportamento atual para objetivos existentes

