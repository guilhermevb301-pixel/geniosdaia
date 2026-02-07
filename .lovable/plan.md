
# Plano: Correções na Arena dos Gênios

## Problemas Identificados

### 1. Desafios Bloqueados Visíveis (Spoilers)
A página `/desafios` mostra os cards completos dos desafios bloqueados, incluindo título, objetivo, dificuldade e tempo estimado. O usuário quer que os próximos desafios fiquem ocultos até serem liberados.

### 2. Bug ao Completar Desafios
O sistema atual busca o predecessor na tabela `objective_challenge_links` pelo `daily_challenge_id` do desafio completado. Quando há dois desafios simultâneos, ambos podem ter sucessores diferentes configurados e o sistema precisa respeitar cada caminho de desbloqueio independentemente.

### 3. Dados Órfãos no Progresso
Existem registros de progresso do usuário (`user_challenge_progress`) para desafios que não estão mais vinculados ao objetivo (`objective_challenge_links`). Isso causa comportamento inesperado.

## Solução Proposta

### Parte 1: Ocultar Desafios Bloqueados

Modificar `ChallengeProgressSection.tsx` para NÃO renderizar os cards individuais de desafios bloqueados. Mostrar apenas:
- Uma contagem discreta: "Você tem X desafios pendentes"
- Nenhum detalhe sobre título ou conteúdo

Antes:
```text
PRÓXIMOS DESAFIOS
[Card com título, objetivo, dificuldade]
[Card com título, objetivo, dificuldade]
+2 desafios bloqueados
```

Depois:
```text
PRÓXIMO PASSO
Você tem 4 desafios pendentes nesta trilha.
Complete os desafios ativos para desbloquear os próximos!
```

### Parte 2: Corrigir Lógica de Conclusão

A lógica atual em `useUserChallengeProgress.ts` já está correta para buscar sucessores:
```typescript
const { data: successorLinks } = await supabase
  .from("objective_challenge_links")
  .select("daily_challenge_id")
  .eq("objective_item_id", current.objective_item_id)
  .eq("predecessor_challenge_id", current.daily_challenge_id);
```

O problema é que o código não está sendo executado corretamente. Verificações necessárias:
1. Garantir que `current.daily_challenge_id` existe e está correto
2. Verificar se os sucessores existem na tabela de links
3. Garantir que os registros de progresso para os sucessores existem

### Parte 3: Limpar Dados Inconsistentes

Criar funcionalidade para sincronizar o progresso do usuário com os links atuais:
- Quando um desafio no progresso não existe mais nos links, removê-lo
- Quando um novo desafio é adicionado aos links, criar o registro de progresso

## Detalhes Técnicos

### Arquivos a Modificar

1. **`src/components/challenges/ChallengeProgressSection.tsx`**
   - Remover seção de LockedChallengeCard
   - Substituir por mensagem simples de contagem
   - Manter card de "Desafios Completados" (pode mostrar histórico)

2. **`src/hooks/useUserChallengeProgress.ts`**
   - Adicionar logs de debug na mutation de complete (temporário)
   - Melhorar tratamento de erro
   - Garantir refetch após conclusão

3. **`src/hooks/useChallengeProgressData.ts`**
   - Adicionar lógica para sincronizar progresso com links
   - Remover registros de progresso órfãos (desafios removidos dos links)
   - Adicionar registros faltantes (desafios novos nos links)

### Nova Lógica de Sincronização

```typescript
// Em useChallengeProgressData ou useEffect dedicado
// Quando os links mudam, sincronizar o progresso:

// 1. Encontrar desafios no progresso que não existem nos links
const orphanProgress = progress.filter(p => 
  !linkedChallenges.some(l => l.challengeId === p.daily_challenge_id)
);
// Deletar orphans

// 2. Encontrar desafios nos links que não existem no progresso
const missingChallenges = linkedChallenges.filter(l =>
  !progress.some(p => p.daily_challenge_id === l.challengeId)
);
// Criar registros faltantes
```

### Interface Simplificada para Bloqueados

```tsx
{/* Em vez de cards detalhados */}
{lockedChallenges.length > 0 && (
  <Card className="border-dashed border-border/50">
    <CardContent className="py-6 text-center">
      <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">
        Você tem <strong>{lockedChallenges.length}</strong> desafio
        {lockedChallenges.length !== 1 && "s"} pendente
        {lockedChallenges.length !== 1 && "s"} nesta trilha.
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Complete os desafios ativos para desbloquear os próximos!
      </p>
    </CardContent>
  </Card>
)}
```

## Benefícios

- Sem spoilers: alunos não veem os desafios futuros
- Sistema mais robusto: sincronização automática entre links e progresso
- Correção do bug de conclusão: garantir desbloqueio correto dos sucessores
- Dados limpos: remoção de registros órfãos

## Esforço Estimado

- 3 arquivos a modificar
- Sem alterações no banco de dados
- Implementação média
