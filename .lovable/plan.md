

# Plano: Corrigir Checkboxes e Adicionar Reiniciar Desafio

## Problemas Identificados

### 1. Checkboxes não funcionam no modal de objetivos
O modal de seleção de objetivos (`ObjectivesModal.tsx`) tem um conflito de eventos:
- O `<label>` captura o click via `onClick` e chama `toggleObjective`
- O `Checkbox` tem `pointer-events-none` para evitar double-click
- Porém, o Radix Checkbox espera controlar o estado via `onCheckedChange`
- Resultado: cliques não registram consistentemente

### 2. Sem opção de reiniciar quando tempo esgota
O card de desafio ativo (`ActiveChallengeCard.tsx`) mostra "Tempo esgotado!" quando o prazo expira, mas:
- Não oferece botão para reiniciar o desafio
- O usuário fica "preso" sem poder continuar

---

## Solução 1: Corrigir Checkboxes no Modal

Mudar a estratégia de interação para usar apenas o `onCheckedChange` do Checkbox:

| Antes | Depois |
|-------|--------|
| `<label onClick={...}>` + `Checkbox pointer-events-none` | `<div>` sem onClick + `Checkbox onCheckedChange={...}` |

O label continua fazendo a row inteira clicável via `htmlFor`, mas a lógica de toggle fica no `onCheckedChange` do próprio Checkbox.

### Código Atualizado

```tsx
// ObjectivesModal.tsx - linha 117-164
<div
  key={item.id}
  className={cn(
    "flex items-center gap-3 p-4 rounded-lg transition-all cursor-pointer",
    isChecked
      ? "bg-primary/10 border border-primary/30"
      : "bg-muted/30 border border-transparent hover:bg-muted/50",
    isLocked && "cursor-not-allowed opacity-70"
  )}
  onClick={() => {
    if (!isLocked) toggleObjective(item);
  }}
>
  <Checkbox
    id={`modal-${item.objective_key}`}
    checked={isChecked}
    disabled={isLocked}
    onCheckedChange={() => {
      if (!isLocked) toggleObjective(item);
    }}
    onClick={(e) => e.stopPropagation()} // Evita double toggle
  />
  {/* ... resto do conteúdo */}
</div>
```

---

## Solução 2: Adicionar Botão de Reiniciar Desafio

Quando o tempo expira, mostrar um botão "Reiniciar Desafio" que:
- Reseta o `started_at` para agora
- Calcula novo `deadline` baseado na duração estimada
- Mantém o status como `active`

### Hook: Nova mutation `restartChallenge`

```typescript
// useUserChallengeProgress.ts - nova mutation

const restartMutation = useMutation({
  mutationFn: async (progressId: string) => {
    // Buscar o progresso atual com dados do desafio
    const { data: current, error: fetchError } = await supabase
      .from("user_challenge_progress")
      .select(`*, daily_challenges (*)`)
      .eq("id", progressId)
      .single();

    if (fetchError) throw fetchError;

    const challenge = current.daily_challenges;
    const now = new Date().toISOString();

    // Atualizar com novo deadline
    const { error } = await supabase
      .from("user_challenge_progress")
      .update({
        started_at: now,
        deadline: calculateDeadline(
          challenge?.estimated_minutes || 30,
          challenge?.estimated_time_unit || "minutes"
        ),
      })
      .eq("id", progressId);

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
    toast.success("Desafio reiniciado! ⏱️");
  },
});
```

### UI: Botão de Reiniciar

```tsx
// ActiveChallengeCard.tsx - quando tempo expira

{timeLeft.expired && (
  <Button
    onClick={onRestart}
    variant="outline"
    className="w-full border-amber-500 text-amber-500 hover:bg-amber-500/10"
  >
    <RotateCcw className="mr-2 h-5 w-5" />
    Reiniciar Desafio
  </Button>
)}
```

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/components/challenges/ObjectivesModal.tsx` | Corrigir handling de click para checkboxes |
| `src/hooks/useUserChallengeProgress.ts` | Adicionar mutation `restartChallenge` |
| `src/components/challenges/ActiveChallengeCard.tsx` | Adicionar botão de reiniciar + nova prop `onRestart` |
| `src/hooks/useChallengeProgressData.ts` | Expor `restartChallenge` |
| `src/components/challenges/YourChallengesBanner.tsx` | Passar `onRestart` para o card |

---

## Interface Atualizada do ActiveChallengeCard

```typescript
interface ActiveChallengeCardProps {
  progress: UserChallengeProgress;
  challenge: DailyChallenge;
  onComplete: () => void;
  onRestart: () => void; // NOVO
  isCompleting?: boolean;
  isRestarting?: boolean; // NOVO
}
```

---

## Fluxo do Usuário

### Checkboxes Corrigidos
1. Usuário abre modal de objetivos
2. Clica em qualquer lugar da linha do objetivo
3. Checkbox marca/desmarca corretamente
4. Estado atualiza imediatamente

### Reiniciar Desafio
1. Tempo do desafio expira
2. Card mostra "Tempo esgotado!" em vermelho
3. Aparece botão "Reiniciar Desafio"
4. Usuário clica no botão
5. Timer reinicia com novo deadline
6. Usuário pode tentar novamente

---

## Resultado Esperado

1. Checkboxes funcionam corretamente no modal de objetivos
2. Quando tempo expira, usuário pode reiniciar o desafio
3. O progresso do checklist local é resetado ao reiniciar
4. Toast de confirmação ao reiniciar

---

## Critérios de Aceite

1. Marcar/desmarcar objetivos funciona em toda a área clicável
2. Objetivos selecionados persistem corretamente
3. Botão de reiniciar aparece quando tempo expira
4. Reiniciar atualiza `started_at` e `deadline` no banco
5. Timer começa a contar novamente após reiniciar

