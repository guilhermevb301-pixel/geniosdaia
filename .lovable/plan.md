
# Plano: Sistema Perfeito de Objetivos e Ordem de Desafios

## Problemas Identificados

### Problema 1: Modal mostra apenas 3 objetivos
O banco de dados tem 6 objetivos, mas o modal esta limitando a visualizacao. O problema esta no `max-h-[400px]` do ScrollArea que pode estar cortando items, e pode haver problema no scroll em dispositivos moveis.

### Problema 2: Ordem dos desafios invertida
Ao analisar a tabela `objective_challenge_links`, encontrei a seguinte inconsistencia para o objetivo "Criar videos incriveis":
- Desafio inicial (is_initial_active=true): `order_index: 4`
- Desafios de sequencia: `order_index: 0, 1, 2, 3`

Isso causa confusao no sistema porque a ordenacao por `order_index` coloca o desafio inicial por ultimo, quando deveria estar primeiro.

### Problema 3: Remocao de objetivos
Quando o aluno desmarca um objetivo, o progresso antigo permanece no banco, causando inconsistencias quando ele seleciona novamente.

## Solucao em 3 Partes

### Parte 1: Corrigir Modal de Objetivos

Melhorias no `ObjectivesModal.tsx`:
- Remover ou aumentar limite de altura do ScrollArea
- Adicionar scroll suave em mobile
- Garantir que todos os objetivos aparecem

```tsx
// Antes:
<ScrollArea className="flex-1 max-h-[400px] pr-4 -mr-4">

// Depois:
<ScrollArea className="flex-1 max-h-[60vh] pr-4 -mr-4">
```

### Parte 2: Corrigir Ordenacao de Desafios

O problema raiz esta na forma como os links estao salvos. A correcao envolve:

1. **Na inicializacao** (`useUserChallengeProgress.ts`):
   - Ja ordena por `order_index` - OK
   - O problema e que os dados no banco estao invertidos

2. **No sync** (`useSyncChallengeProgress.ts`):
   - Respeitar o `order_index` correto
   - O desafio com `is_initial_active=true` deve ter `order_index` menor

3. **Correcao de dados no banco**:
   - Atualizar os `order_index` dos links para refletir a ordem correta
   - Desafios iniciais devem ter `order_index` 0
   - Sequencias seguem 1, 2, 3...

A logica atual ordena por `order_index`, mas o importante e o fluxo de `predecessor_challenge_id`. A ordem de exibicao deve seguir a cadeia de predecessores, nao o index numerico.

**Nova logica proposta**:
Em vez de ordenar puramente por `order_index`, construir a arvore de dependencias baseada em `predecessor_challenge_id`:
1. Desafios sem predecessor = iniciais
2. Para cada inicial, seguir a cadeia de quem o aponta como predecessor

### Parte 3: Limpeza ao Remover Objetivo

No `Desafios.tsx`, quando o usuario desmarca um objetivo no modal, chamar `clearProgress` para esse objetivo antes de salvar:

```typescript
const handleObjectivesChange = useCallback((objectives: string[]) => {
  // Encontrar objetivos removidos
  const removedObjectives = selectedObjectives.filter(
    (o) => !objectives.includes(o)
  );
  
  // Limpar progresso dos objetivos removidos
  const objectiveItemsToRemove = objectivesData
    .filter((item) => removedObjectives.includes(item.objective_key))
    .map((item) => item.id);
  
  objectiveItemsToRemove.forEach((itemId) => {
    clearProgress(itemId);
  });
  
  // Salvar novos objetivos
  setSelectedObjectives(objectives);
  // ... debounce save
}, [selectedObjectives, objectivesData, clearProgress]);
```

## Arquivos a Modificar

1. **`src/components/challenges/ObjectivesModal.tsx`**
   - Aumentar altura maxima do ScrollArea
   - Melhorar UX mobile

2. **`src/hooks/useChallengeProgressData.ts`**
   - Construir arvore de desafios baseada em predecessores
   - Garantir ordem correta de exibicao

3. **`src/pages/Desafios.tsx`**
   - Importar `clearProgress` do hook
   - Implementar limpeza ao desmarcar objetivos

4. **Correcao de dados no banco**
   - Atualizar `order_index` dos links existentes para consistencia

## Nova Logica de Ordenacao por Predecessores

```typescript
// Construir ordem correta baseada em predecessores
function buildChallengeOrder(links: ChallengeLink[]) {
  const result: string[] = [];
  const processedIds = new Set<string>();
  
  // 1. Encontrar todos os iniciais (sem predecessor ou is_initial_active)
  const initials = links.filter(
    (l) => l.isInitialActive || l.predecessorChallengeId === null
  );
  
  // Adicionar iniciais primeiro
  initials.forEach((initial) => {
    if (!processedIds.has(initial.challengeId)) {
      result.push(initial.challengeId);
      processedIds.add(initial.challengeId);
      
      // Seguir cadeia de sucessores
      let current = initial.challengeId;
      while (true) {
        const successor = links.find(
          (l) => l.predecessorChallengeId === current && !processedIds.has(l.challengeId)
        );
        if (!successor) break;
        result.push(successor.challengeId);
        processedIds.add(successor.challengeId);
        current = successor.challengeId;
      }
    }
  });
  
  return result;
}
```

## Fluxo de Usuario Esperado

1. Aluno abre /desafios
2. Modal de objetivos mostra TODOS os 6 objetivos (scroll funcional)
3. Aluno marca/desmarca objetivos livremente
4. Ao desmarcar, progresso antigo e limpo
5. Desafios aparecem na ordem correta: inicial -> sequencia
6. Completar um desafio desbloqueia seu sucessor direto
