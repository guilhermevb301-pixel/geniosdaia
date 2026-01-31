
# Plano: Corrigir Selecao de Desafios e Adicionar Tempo Flexivel

## Problemas Identificados

### 1. Checkbox nao funciona no modal de vincular desafios
Analisando a imagem e o codigo, o modal `ChallengeLinkingModal` esta aparecendo corretamente, mas os checkboxes nao estao respondendo aos cliques. Possivel causa:
- O componente Checkbox do Radix UI pode ter problemas com propagacao de eventos quando usado dentro de um elemento clicavel
- Conflito entre o `onClick` do container e o `onCheckedChange` do Checkbox

### 2. Tempo estimado so suporta minutos
O campo `estimated_minutes` e um INTEGER que so aceita minutos. Para desafios que demoram dias, semanas ou meses, precisamos de uma estrutura mais flexivel.

---

## Solucao Proposta

### Parte 1: Corrigir a Interacao do Checkbox

No `ChallengeLinkingModal.tsx`, modificar a estrutura para garantir que os cliques funcionem:

**Antes (problematico):**
```tsx
<div onClick={() => toggleChallenge(challenge.id)}>
  <Checkbox 
    checked={...}
    onCheckedChange={() => toggleChallenge(challenge.id)}
  />
</div>
```

**Depois (corrigido):**
```tsx
<div onClick={() => toggleChallenge(challenge.id)}>
  <Checkbox 
    checked={...}
    onCheckedChange={() => toggleChallenge(challenge.id)}
    onClick={(e) => e.stopPropagation()} // Evitar dupla execucao
  />
</div>
```

Alem disso, adicionar `pointer-events-none` ao checkbox para deixar o container ser o unico responsavel pelo clique, ou usar apenas um dos dois metodos de clique.

### Parte 2: Tempo Estimado Flexivel

Alterar o campo de tempo para suportar diferentes unidades (minutos, horas, dias, semanas).

**Mudancas no Banco de Dados:**

Adicionar nova coluna para armazenar a unidade de tempo:

```sql
ALTER TABLE daily_challenges 
ADD COLUMN estimated_time_unit text DEFAULT 'minutes';
-- Valores possiveis: 'minutes', 'hours', 'days', 'weeks'
```

**Mudancas na Interface:**

Substituir o campo unico de minutos por dois campos:

```text
+---------------------------+
| Tempo Estimado            |
| [  3  ] [  Dias     v  ]  |
+---------------------------+
```

**Componente de edicao modificado:**

```tsx
<div className="grid grid-cols-2 gap-2">
  <div className="space-y-2">
    <Label>Quantidade</Label>
    <Input
      type="number"
      value={formData.estimated_time_value}
      onChange={(e) => setFormData({
        ...formData, 
        estimated_time_value: parseInt(e.target.value)
      })}
    />
  </div>
  <div className="space-y-2">
    <Label>Unidade</Label>
    <Select
      value={formData.estimated_time_unit}
      onValueChange={(value) => setFormData({
        ...formData, 
        estimated_time_unit: value
      })}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="minutes">Minutos</SelectItem>
        <SelectItem value="hours">Horas</SelectItem>
        <SelectItem value="days">Dias</SelectItem>
        <SelectItem value="weeks">Semanas</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

**Exibicao formatada:**

```tsx
function formatEstimatedTime(value: number, unit: string) {
  const labels = {
    minutes: { singular: 'minuto', plural: 'minutos', short: 'min' },
    hours: { singular: 'hora', plural: 'horas', short: 'h' },
    days: { singular: 'dia', plural: 'dias', short: 'd' },
    weeks: { singular: 'semana', plural: 'semanas', short: 'sem' },
  };
  const label = labels[unit] || labels.minutes;
  return `${value} ${value === 1 ? label.singular : label.plural}`;
}

// Uso: "3 dias", "1 semana", "45 minutos"
```

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| Nova migracao SQL | Adicionar coluna `estimated_time_unit` |
| `src/components/admin/ChallengeLinkingModal.tsx` | Corrigir evento de clique do checkbox |
| `src/components/admin/DailyChallengesEditor.tsx` | Adicionar seletor de unidade de tempo |
| `src/hooks/useDailyChallengesAdmin.ts` | Atualizar interface para incluir unidade |
| `src/hooks/useDailyChallenges.ts` | Atualizar tipo DailyChallenge |
| `src/components/challenges/PersonalizedChallengeCard.tsx` | Formatar exibicao do tempo |
| `src/components/challenges/RecommendedChallenges.tsx` | Formatar exibicao do tempo |

---

## Detalhes Tecnicos

### Migracao SQL

```sql
-- Adicionar coluna para unidade de tempo
ALTER TABLE public.daily_challenges 
ADD COLUMN estimated_time_unit text DEFAULT 'minutes';

-- Adicionar constraint para valores validos
ALTER TABLE public.daily_challenges 
ADD CONSTRAINT valid_time_unit 
CHECK (estimated_time_unit IN ('minutes', 'hours', 'days', 'weeks'));
```

### Funcao de Formatacao (utils)

Criar em `src/lib/utils.ts` ou novo arquivo `src/lib/time.ts`:

```tsx
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export function formatEstimatedTime(
  value: number | null, 
  unit: TimeUnit = 'minutes'
): string {
  if (!value) return '';
  
  const labels: Record<TimeUnit, { singular: string; plural: string; short: string }> = {
    minutes: { singular: 'minuto', plural: 'minutos', short: 'min' },
    hours: { singular: 'hora', plural: 'horas', short: 'h' },
    days: { singular: 'dia', plural: 'dias', short: 'd' },
    weeks: { singular: 'semana', plural: 'semanas', short: 'sem' },
  };
  
  const label = labels[unit];
  return `${value} ${value === 1 ? label.singular : label.plural}`;
}

export function formatEstimatedTimeShort(
  value: number | null, 
  unit: TimeUnit = 'minutes'
): string {
  if (!value) return '';
  
  const shorts: Record<TimeUnit, string> = {
    minutes: 'min',
    hours: 'h',
    days: 'd',
    weeks: 'sem',
  };
  
  return `${value}${shorts[unit]}`;
}
```

### Atualizacao da Interface DailyChallenge

```tsx
export interface DailyChallenge {
  id: string;
  track: Track;
  difficulty: string;
  title: string;
  objective: string;
  steps: string[];
  deliverable: string;
  checklist: string[];
  estimated_minutes: number | null; // Manter para compatibilidade
  estimated_time_unit: 'minutes' | 'hours' | 'days' | 'weeks';
  is_bonus: boolean;
  created_at: string;
}
```

---

## Correcao do ChallengeLinkingModal

Remover o conflito de eventos:

```tsx
{filteredChallenges.map((challenge) => (
  <label
    key={challenge.id}
    className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
      selectedIds.includes(challenge.id) ? "bg-primary/5" : ""
    }`}
    htmlFor={`challenge-${challenge.id}`}
  >
    <Checkbox
      id={`challenge-${challenge.id}`}
      checked={selectedIds.includes(challenge.id)}
      onCheckedChange={() => toggleChallenge(challenge.id)}
      className="mt-1"
    />
    <div className="flex-1 min-w-0">
      {/* ... conteudo do card ... */}
    </div>
  </label>
))}
```

Usar `<label>` como container garante que o clique em qualquer lugar acione o checkbox corretamente.

---

## Fluxo de Usuario

1. Mentor acessa `/admin/challenges` > aba "Objetivos"
2. Clica no icone de link ou no badge de desafios
3. Modal abre mostrando todos os desafios
4. **Clica no checkbox ou em qualquer lugar da linha** - agora funciona!
5. Seleciona os desafios desejados
6. Salva os vinculos

Para editar tempo:
1. Mentor acessa aba "Desafios Recomendados"
2. Edita um desafio existente ou cria novo
3. Define tempo estimado como "3" e unidade como "Dias"
4. Salva - o tempo e persistido como `estimated_minutes: 3, estimated_time_unit: 'days'`
5. Alunos veem "3 dias" na interface

---

## Criterios de Aceite

- [ ] Checkbox no modal de vincular desafios funciona ao clicar
- [ ] Clicar em qualquer parte da linha marca o checkbox
- [ ] Campo de tempo tem seletor de unidade (minutos, horas, dias, semanas)
- [ ] Tempo e exibido formatado corretamente ("3 dias", "2 semanas")
- [ ] Dados sao salvos corretamente no banco
- [ ] Compatibilidade com dados existentes (minutos como padrao)
