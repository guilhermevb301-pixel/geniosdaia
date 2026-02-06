
# Plano: Permitir que o Mentor Escolha Quais Desafios Ficam Ativos Simultaneamente

## Problema Identificado

Atualmente, quando o mentor configura `active_slots = 2` (ou mais), o sistema libera automaticamente os **primeiros N desafios** baseado na ordem (`order_index`).

O mentor quer poder **selecionar especificamente quais desafios** vão estar ativos ao mesmo tempo, independente da ordem na lista.

---

## Solução Proposta

Adicionar um campo `is_initial_active` na tabela `objective_challenge_links` que indica se aquele desafio deve iniciar como ativo quando o aluno selecionar o objetivo.

---

## Mudanças Necessárias

### 1. Alterar Banco de Dados

| Tabela | Campo Novo | Tipo | Default | Descricao |
|--------|------------|------|---------|-----------|
| `objective_challenge_links` | `is_initial_active` | boolean | false | Indica se o desafio inicia como ativo |

```text
SQL:
ALTER TABLE public.objective_challenge_links 
ADD COLUMN is_initial_active boolean DEFAULT false NOT NULL;
```

---

### 2. Atualizar Interface do ChallengeLinkingModal

No modal de vinculacao de desafios, adicionar checkbox para marcar quais desafios devem iniciar como ativos:

```text
+---------------------------------------------------------------+
| Ordem de liberacao (3)                                        |
+---------------------------------------------------------------+
|  [*] 1  Criar agente basico          [^] [v] [x]              |
|      2  Integrar com WhatsApp        [^] [v] [x]              |
|  [*] 3  Fazer primeira venda         [^] [v] [x]              |
+---------------------------------------------------------------+
| [*] = Checkbox "Iniciar Ativo"                                |
| Selecione ate 4 desafios para iniciar ativos                  |
+---------------------------------------------------------------+
```

**Comportamento:**
- Checkbox ao lado de cada desafio vinculado
- O numero maximo de selecoes = `active_slots` do objetivo
- Se nenhum for marcado, o primeiro da lista e ativado (comportamento padrao)
- Validacao: nao permitir mais selecoes que `active_slots`

---

### 3. Atualizar Hook useObjectiveChallengeLinks

- Incluir `is_initial_active` na interface
- Salvar o campo ao vincular desafios
- Atualizar queries para retornar o novo campo

---

### 4. Ajustar Logica de Inicializacao de Progresso

**Arquivo:** `src/hooks/useUserChallengeProgress.ts`

Atualmente:
```typescript
// Ativa os primeiros N baseado em order_index
const records = sortedChallenges.map((ch, idx) => ({
  status: idx < activeSlots ? "active" : "locked",
}));
```

Novo comportamento:
```typescript
// Verifica quais desafios estao marcados como is_initial_active
const records = sortedChallenges.map((ch) => ({
  status: ch.is_initial_active ? "active" : "locked",
  started_at: ch.is_initial_active ? now : null,
  deadline: ch.is_initial_active ? calculateDeadline(...) : null,
}));
```

---

### 5. Atualizar useChallengeProgressData

Passar o campo `is_initial_active` para a mutacao de inicializacao.

---

## Fluxo Visual do Mentor

```text
+---------------------------------------------------------------+
| Vincular Desafios ao Objetivo                                 |
| "Vender agentes de IA + Viralizar" (2 ativos simultaneos)     |
+---------------------------------------------------------------+
|                                                               |
| Ordem de liberacao (4 desafios)                               |
| +---------------------------------------------------------+   |
| | [x] 1 | Criar agente basico           | 2 dias | [^][v]|   |
| | [ ] 2 | Configurar WhatsApp           | 1 dia  | [^][v]|   |
| | [x] 3 | Fazer primeira venda          | 3 dias | [^][v]|   |
| | [ ] 4 | Escalar para 10 clientes      | 1 sem  | [^][v]|   |
| +---------------------------------------------------------+   |
|                                                               |
| * Checkbox [x] = Desafio inicia ativo                         |
| * Voce pode selecionar ate 2 desafios (active_slots)          |
|                                                               |
| [Cancelar]                                    [Salvar (4)]    |
+---------------------------------------------------------------+
```

---

## Logica de Validacao

1. **Maximo de selecoes**: O numero de desafios marcados como "inicial ativo" nao pode exceder `active_slots` do objetivo
2. **Fallback**: Se nenhum desafio for marcado, o primeiro da lista (menor `order_index`) e ativado automaticamente
3. **Interface**: Desabilitar checkboxes adicionais quando o limite for atingido

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| **Migracao SQL** | Adicionar coluna `is_initial_active` |
| `src/hooks/useObjectiveChallengeLinks.ts` | Incluir campo na interface e salvar |
| `src/components/admin/ChallengeLinkingModal.tsx` | Adicionar checkboxes de selecao inicial |
| `src/hooks/useUserChallengeProgress.ts` | Usar `is_initial_active` ao inicializar |
| `src/hooks/useChallengeProgressData.ts` | Passar campo para inicializacao |

---

## Beneficios

1. **Flexibilidade total**: Mentor escolhe exatamente quais desafios rodam em paralelo
2. **Contexto pedagogico**: Pode selecionar desafios complementares que fazem sentido juntos
3. **Retrocompatibilidade**: Objetivos sem selecao usam o primeiro desafio automaticamente
