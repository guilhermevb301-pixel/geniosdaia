

# Plano: Sistema de Progressao de Desafios com Countdown e Ordem

## Resumo do Pedido

O usuario quer que:
1. Ao selecionar um objetivo, uma contagem regressiva apareca imediatamente
2. Ao completar um desafio, o proximo seja liberado automaticamente
3. O mentor possa definir a ordem obrigatoria de completar desafios (prerequisitos)

---

## Solucao Proposta

### 1. Nova Tabela: `user_challenge_progress`

Armazena o progresso de cada usuario nos desafios recomendados:

```text
+----------------------+--------------------------------------------+
| Coluna               | Descricao                                  |
+----------------------+--------------------------------------------+
| id                   | UUID primary key                           |
| user_id              | UUID (referencia auth.users)               |
| daily_challenge_id   | UUID (FK para daily_challenges)            |
| status               | enum: 'locked', 'active', 'completed'      |
| started_at           | timestamp - quando iniciou                 |
| completed_at         | timestamp - quando completou               |
| deadline             | timestamp - calculado a partir do tempo    |
| created_at           | timestamp                                  |
+----------------------+--------------------------------------------+
```

### 2. Nova Coluna em `objective_challenge_links`: order_index

Para permitir ordenacao dos desafios por objetivo:

```sql
ALTER TABLE objective_challenge_links
ADD COLUMN order_index integer DEFAULT 0;
```

Isso permite que o mentor defina: "primeiro complete X, depois Y, depois Z"

### 3. Logica de Progressao

Quando o usuario seleciona um objetivo:
1. Buscar todos os desafios vinculados a esse objetivo (ordenados por `order_index`)
2. O primeiro desafio fica com status `active` e deadline calculado
3. Os demais ficam com status `locked`

Quando o usuario clica em "Completei":
1. Atualiza o desafio para `completed` com `completed_at = now()`
2. Busca o proximo desafio bloqueado com menor `order_index`
3. Atualiza para `active` com novo deadline

### 4. Calculo do Deadline

Baseado no campo `estimated_minutes` e `estimated_time_unit`:

```typescript
function calculateDeadline(challenge: DailyChallenge): Date {
  const now = new Date();
  const value = challenge.estimated_minutes || 1;
  const unit = challenge.estimated_time_unit || 'minutes';
  
  switch (unit) {
    case 'minutes': return new Date(now.getTime() + value * 60 * 1000);
    case 'hours': return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'days': return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'weeks': return new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000);
  }
}
```

---

## Arquivos a Criar/Modificar

### Novos Arquivos
| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useUserChallengeProgress.ts` | Hook para gerenciar progresso do usuario |
| `src/components/challenges/ActiveChallengeCard.tsx` | Card com countdown e botao "Completei" |

### Arquivos a Modificar
| Arquivo | Mudancas |
|---------|----------|
| `src/components/admin/ChallengeLinkingModal.tsx` | Adicionar drag-and-drop ou campo de ordem |
| `src/hooks/useObjectiveChallengeLinks.ts` | Incluir order_index nas queries |
| `src/components/challenges/RecommendedChallenges.tsx` | Mostrar desafio ativo com countdown |
| `src/pages/Desafios.tsx` | Integrar o novo sistema de progressao |

---

## Interface do Usuario

### Para o Aluno (pagina /desafios)

```text
+----------------------------------------------------------+
| DESAFIO ATIVO                                            |
+----------------------------------------------------------+
|                                                          |
|  Crie seu primeiro Agente de IA                          |
|  Tempo restante: 2d 14h 32min                            |
|                                                          |
|  [Barra de progresso do countdown]                       |
|                                                          |
|  [ ] Escolher nicho do agente                            |
|  [ ] Configurar base de conhecimento                     |
|  [ ] Testar no WhatsApp                                  |
|                                                          |
|  [Completei Este Desafio]                                |
|                                                          |
+----------------------------------------------------------+

+----------------------------------------------------------+
| PROXIMOS DESAFIOS (bloqueados)                           |
+----------------------------------------------------------+
|  [LOCK] Configurar pagamentos no agente                  |
|  [LOCK] Escalar para 10 clientes                         |
+----------------------------------------------------------+
```

### Para o Mentor (modal de vincular desafios)

```text
+----------------------------------------------------------+
| Vincular Desafios ao Objetivo                            |
| "Vender primeiro projeto de Agente de IA"                |
+----------------------------------------------------------+
|                                                          |
|  Arraste para ordenar:                                   |
|                                                          |
|  1. [=] Crie seu primeiro Agente     [3 dias] [x]        |
|  2. [=] Configure pagamentos         [1 semana] [x]      |
|  3. [=] Escale para 10 clientes      [2 semanas] [x]     |
|                                                          |
|  Buscar: [________________________]                      |
|                                                          |
|  [ ] Outro desafio disponivel        [2 dias]            |
|  [ ] Mais um desafio                 [5 dias]            |
|                                                          |
|  [Cancelar]                      [Salvar Ordem]          |
+----------------------------------------------------------+
```

---

## Detalhes Tecnicos

### Migracao SQL

```sql
-- 1. Tabela de progresso do usuario
CREATE TABLE public.user_challenge_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  objective_item_id uuid REFERENCES objective_items(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, daily_challenge_id, objective_item_id)
);

-- 2. Adicionar ordem nos links
ALTER TABLE public.objective_challenge_links
ADD COLUMN order_index integer DEFAULT 0;

-- 3. RLS policies
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" 
ON public.user_challenge_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
ON public.user_challenge_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON public.user_challenge_progress FOR UPDATE 
USING (auth.uid() = user_id);
```

### Hook useUserChallengeProgress

```typescript
export function useUserChallengeProgress(objectiveItemId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar progresso do usuario
  const { data: progress = [] } = useQuery({
    queryKey: ["userChallengeProgress", user?.id, objectiveItemId],
    queryFn: async () => {
      const query = supabase
        .from("user_challenge_progress")
        .select("*, daily_challenges(*)")
        .eq("user_id", user.id);
      
      if (objectiveItemId) {
        query.eq("objective_item_id", objectiveItemId);
      }
      
      const { data, error } = await query.order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Iniciar progresso quando objetivo e selecionado
  const initProgressMutation = useMutation({
    mutationFn: async ({ 
      objectiveItemId, 
      challenges 
    }: { 
      objectiveItemId: string; 
      challenges: Array<{ id: string; estimated_minutes: number; estimated_time_unit: string }> 
    }) => {
      // Primeiro desafio fica ativo com deadline
      const records = challenges.map((ch, idx) => ({
        user_id: user.id,
        daily_challenge_id: ch.id,
        objective_item_id: objectiveItemId,
        status: idx === 0 ? 'active' : 'locked',
        started_at: idx === 0 ? new Date().toISOString() : null,
        deadline: idx === 0 ? calculateDeadline(ch) : null,
      }));
      
      await supabase.from("user_challenge_progress").upsert(records);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
    },
  });

  // Marcar desafio como completo e liberar proximo
  const completeMutation = useMutation({
    mutationFn: async (progressId: string) => {
      // Buscar o registro atual
      const { data: current } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("id", progressId)
        .single();
      
      // Marcar como completo
      await supabase
        .from("user_challenge_progress")
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq("id", progressId);
      
      // Buscar proximo bloqueado
      const { data: nextLocked } = await supabase
        .from("user_challenge_progress")
        .select("*, objective_challenge_links!inner(order_index)")
        .eq("user_id", user.id)
        .eq("objective_item_id", current.objective_item_id)
        .eq("status", "locked")
        .order("objective_challenge_links.order_index")
        .limit(1)
        .maybeSingle();
      
      if (nextLocked) {
        // Ativar proximo
        const { data: challenge } = await supabase
          .from("daily_challenges")
          .select("*")
          .eq("id", nextLocked.daily_challenge_id)
          .single();
        
        await supabase
          .from("user_challenge_progress")
          .update({
            status: 'active',
            started_at: new Date().toISOString(),
            deadline: calculateDeadline(challenge),
          })
          .eq("id", nextLocked.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
      toast.success("Parabens! Desafio completado!");
    },
  });

  return {
    progress,
    activeChallenge: progress.find(p => p.status === 'active'),
    completedChallenges: progress.filter(p => p.status === 'completed'),
    lockedChallenges: progress.filter(p => p.status === 'locked'),
    initProgress: initProgressMutation.mutate,
    completeChallenge: completeMutation.mutate,
  };
}
```

### Componente ActiveChallengeCard

```typescript
function ActiveChallengeCard({ 
  progress, 
  challenge,
  onComplete 
}: { 
  progress: UserChallengeProgress;
  challenge: DailyChallenge;
  onComplete: () => void;
}) {
  // Countdown em tempo real
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft(progress.deadline)
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(progress.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [progress.deadline]);
  
  const percentRemaining = calculatePercentRemaining(
    progress.started_at, 
    progress.deadline
  );

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
      <CardHeader>
        <Badge>DESAFIO ATIVO</Badge>
        <CardTitle>{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Countdown */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-bold text-xl">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}min
          </span>
        </div>
        
        {/* Progress bar */}
        <Progress value={percentRemaining} className="mb-4" />
        
        {/* Checklist */}
        <div className="space-y-2 mb-4">
          {challenge.checklist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Checkbox />
              <span>{item}</span>
            </div>
          ))}
        </div>
        
        {/* Complete button */}
        <Button onClick={onComplete} className="w-full">
          <CheckCircle className="mr-2" />
          Completei Este Desafio
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Fluxo Completo

### Fluxo do Aluno

1. Acessa `/desafios` e marca objetivo "Vender primeiro projeto"
2. Sistema busca desafios vinculados (ordenados) e cria registros de progresso
3. Primeiro desafio aparece como "ATIVO" com countdown de 3 dias
4. Aluno trabalha no desafio, marca itens do checklist
5. Clica em "Completei Este Desafio"
6. Sistema marca como completo e libera o proximo
7. Novo countdown inicia para o proximo desafio

### Fluxo do Mentor

1. Acessa `/admin/challenges` > aba "Objetivos"
2. Clica no botao de link em um objetivo
3. No modal, seleciona os desafios e arrasta para ordenar
4. Salva - os desafios ficam vinculados com `order_index` correto
5. Quando alunos selecionam esse objetivo, recebem os desafios na ordem definida

---

## Criterios de Aceite

- [ ] Countdown aparece ao selecionar objetivo
- [ ] Tempo calculado corretamente (dias, semanas, etc)
- [ ] Botao "Completei" marca desafio e libera proximo
- [ ] Desafios bloqueados aparecem com cadeado
- [ ] Mentor pode ordenar desafios no modal de vinculos
- [ ] Ordem e respeitada ao liberar desafios
- [ ] Progresso e salvo por usuario (persistente)
- [ ] Toast de sucesso ao completar

