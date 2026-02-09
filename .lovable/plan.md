
# Plano: Corrigir Desafios Nao Aparecendo + Logica de Inicializacao

## Problema Identificado

Ao investigar o banco de dados, encontrei a causa raiz:

**Objetivo "Vender primeiro projeto de Agente de IA"** (`fcfc4409`):
- Tem 3 desafios vinculados
- TODOS os links tem `is_initial_active: false` e `predecessor_challenge_id: null`
- Resultado: todos os 3 registros de progresso ficaram com status `locked`
- Nenhum desafio ativo aparece para o aluno

### Por que isso acontece?

Existem **dois lugares** que tentam inicializar o progresso:

1. **`useChallengeProgressData.ts`** (hook principal) - tem toda a logica correta com `is_initial_active` e `activeSlots`
2. **`ChallengeProgressSection.tsx`** (componente) - tem logica duplicada SEM `is_initial_active` e SEM `activeSlots`

Quando nenhum link tem `is_initial_active: true`, o sistema deveria ativar o primeiro desafio automaticamente (fallback `idx < activeSlots`). Mas a logica duplicada e condição de corrida entre os dois useEffects causa inconsistencia.

Alem disso, **nao existe logica de recuperacao**: se por qualquer motivo todos os desafios ficaram locked (como aconteceu), o sistema nao tenta corrigir.

## Solucao

### 1. Remover logica de init duplicada do `ChallengeProgressSection`

O componente `ChallengeProgressSection` nao deveria inicializar progresso - isso ja e feito pelo `useChallengeProgressData`. Remover o useEffect de init e simplificar o componente.

### 2. Adicionar logica de recuperacao no `useChallengeProgressData`

Depois do sync, verificar se existe progresso mas NENHUM desafio esta ativo ou completado. Se sim, ativar automaticamente o primeiro desafio (ou os marcados como iniciais).

```text
FLUXO CORRIGIDO:
1. Aluno seleciona objetivo
2. useChallengeProgressData verifica se existe progresso
   - Nao existe -> initProgress (com is_initial_active + activeSlots)
   - Existe mas nenhum ativo/completado -> RECUPERAR (ativar primeiro)
   - Existe com orphans/missing -> sync
   - Existe normal -> ok
3. ChallengeProgressSection apenas MOSTRA o progresso
```

### 3. Garantir que `initProgress` sempre ativa pelo menos 1 desafio

No caso onde `hasExplicitInitialActive` e false E `activeSlots >= 1`, o primeiro desafio deve sempre ser ativado. Adicionar validacao extra.

## Arquivos a Modificar

### 1. `src/components/challenges/ChallengeProgressSection.tsx`
- Remover useEffect de inicializacao (linhas 63-106)
- Manter apenas a renderizacao do progresso
- Componente fica mais simples e sem efeitos colaterais

### 2. `src/hooks/useChallengeProgressData.ts`
- Adicionar logica de recuperacao apos sync:
  ```
  Se existingProgress.length > 0
  E nenhum tem status "active" ou "completed"
  -> Ativar o primeiro desafio (ou os marcados como iniciais)
  ```
- Garantir que o fallback `idx < activeSlots` funcione corretamente

### 3. `src/hooks/useUserChallengeProgress.ts`
- No `initProgress`, adicionar validacao: se nenhum registro ficou como "active" apos o mapeamento, forcar o primeiro como active
- Garantir que `restartChallenge` funciona (ja esta implementado)

## Detalhe Tecnico da Recuperacao

```tsx
// Em useChallengeProgressData, apos o bloco de sync:

// Recovery: se todos estao locked, ativar o primeiro
const hasActiveOrCompleted = existingProgress.some(
  (p) => p.status === "active" || p.status === "completed"
);

if (!hasActiveOrCompleted && existingProgress.length > 0) {
  // Determinar qual ativar
  const initialLinks = linkedChallenges.filter(l => l.isInitialActive);
  const toActivate = initialLinks.length > 0 
    ? initialLinks 
    : [linkedChallenges[0]]; // fallback: primeiro da lista
  
  // Ativar via update no banco
  for (const link of toActivate.slice(0, objective.active_slots || 1)) {
    const progressRecord = existingProgress.find(
      p => p.daily_challenge_id === link.challengeId
    );
    if (progressRecord) {
      await supabase.from("user_challenge_progress")
        .update({
          status: "active",
          started_at: now,
          deadline: calculateDeadline(...)
        })
        .eq("id", progressRecord.id);
    }
  }
}
```

## Resultado Esperado

1. Ao selecionar um objetivo, pelo menos 1 desafio fica ativo imediatamente
2. O desafio ativo aparece no banner com contagem regressiva
3. Botao de reiniciar funciona quando o tempo expira
4. Se o mentor nao marcou nenhum como "inicial", o sistema ativa o primeiro automaticamente
5. Se houver inconsistencia (todos locked), o sistema recupera sozinho
