

# Plano: Vincular Desafios Diretamente aos Objetivos

## Resumo

Adicionar a possibilidade de vincular desafios recomendados diretamente a cada objetivo do checklist. Quando o mentor editar um objetivo (na aba Objetivos), podera selecionar quais desafios da tabela `daily_challenges` aparecem quando o aluno marcar aquele objetivo.

---

## Abordagem Escolhida

Criar uma tabela de relacionamento **muitos-para-muitos** entre objetivos e desafios. Isso permite:
- Um objetivo ter varios desafios vinculados
- Um desafio aparecer em varios objetivos
- Controle total sobre quais desafios aparecem para cada objetivo

---

## Estrutura de Dados

### Nova Tabela: `objective_challenge_links`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | PK |
| objective_item_id | uuid | FK para objective_items |
| daily_challenge_id | uuid | FK para daily_challenges |
| created_at | timestamp | Data de criacao |

Constraint UNIQUE em (objective_item_id, daily_challenge_id).

---

## Fluxo de Edicao para Mentor

Na aba **Objetivos** em `/admin/challenges`:

```text
+------------------------------------------+
|  A) Quero construir meu Agente           |
+------------------------------------------+
|  [ Criar meu 1o Agente de IA do zero ]   |
|  Tags: agentes, n8n                      |
|  Desafios: [Ver/Editar Desafios]         |  <- NOVO
|                                          |
|  [Editar] [Excluir]                      |
+------------------------------------------+
```

Ao clicar em "Ver/Editar Desafios", abre um modal com:
- Lista de todos os desafios disponiveis (da tabela `daily_challenges`)
- Checkboxes para selecionar quais desafios estao vinculados a este objetivo
- Busca/filtro por titulo ou trilha

---

## Alteracoes no Editor de Objetivos

No modal de edicao de item (`ObjectivesEditor.tsx`), adicionar:

1. Nova secao "Desafios Vinculados"
2. Lista com checkboxes dos desafios disponiveis
3. Contador de desafios selecionados
4. Filtro por titulo/trilha

```tsx
{/* Nova secao no modal de item */}
<div className="space-y-2">
  <Label>Desafios Vinculados</Label>
  <p className="text-xs text-muted-foreground">
    Selecione quais desafios aparecem quando este objetivo for marcado
  </p>
  <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
    {allChallenges.map(challenge => (
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={linkedChallengeIds.includes(challenge.id)}
          onCheckedChange={() => toggleChallengeLink(challenge.id)}
        />
        <span>{challenge.title}</span>
        <Badge>{challenge.track}</Badge>
      </div>
    ))}
  </div>
</div>
```

---

## Alteracoes na Logica de Recomendacao

No componente `RecommendedChallenges.tsx`:

**Antes**: Filtra por matching de tags
**Depois**: Busca desafios vinculados via tabela de relacionamento

```tsx
// Nova query
const { data: linkedChallenges } = useQuery({
  queryKey: ["linkedChallenges", selectedObjectives],
  queryFn: async () => {
    if (selectedObjectives.length === 0) return [];
    
    // Buscar IDs dos objective_items pelos objective_keys
    const { data: items } = await supabase
      .from("objective_items")
      .select("id")
      .in("objective_key", selectedObjectives);
    
    const itemIds = items?.map(i => i.id) || [];
    
    // Buscar links e desafios
    const { data: links } = await supabase
      .from("objective_challenge_links")
      .select("daily_challenge_id")
      .in("objective_item_id", itemIds);
    
    const challengeIds = [...new Set(links?.map(l => l.daily_challenge_id) || [])];
    
    const { data: challenges } = await supabase
      .from("daily_challenges")
      .select("*")
      .in("id", challengeIds);
    
    return challenges || [];
  },
});
```

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| Nova migracao SQL | Criar tabela `objective_challenge_links` |
| `src/components/admin/ObjectivesEditor.tsx` | Adicionar secao de vincular desafios no modal de item |
| `src/components/challenges/RecommendedChallenges.tsx` | Alterar logica para buscar desafios vinculados |
| `src/hooks/useObjectives.ts` | Adicionar funcoes para gerenciar links |

---

## Nova Tabela SQL

```sql
CREATE TABLE public.objective_challenge_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_item_id uuid NOT NULL REFERENCES objective_items(id) ON DELETE CASCADE,
  daily_challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(objective_item_id, daily_challenge_id)
);

-- RLS
ALTER TABLE objective_challenge_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read objective_challenge_links"
ON objective_challenge_links FOR SELECT USING (true);

CREATE POLICY "Mentors and admins can manage objective_challenge_links"
ON objective_challenge_links FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));
```

---

## Fluxo de Usuario (Mentor)

1. Mentor acessa `/admin/challenges` > aba "Objetivos"
2. Clica para editar um objetivo (ex: "Criar meu 1o Agente de IA")
3. No modal de edicao, ve nova secao "Desafios Vinculados"
4. Marca os checkboxes dos desafios que devem aparecer para este objetivo
5. Salva - os links sao persistidos na tabela `objective_challenge_links`
6. Mudancas refletem imediatamente para os alunos

---

## Fluxo de Usuario (Aluno)

1. Aluno acessa `/desafios`
2. Marca objetivo "Criar meu 1o Agente de IA"
3. Secao "Desafios Recomendados Para Voce" mostra **exatamente** os desafios que o mentor vinculou a este objetivo
4. Se marcar multiplos objetivos, ve a uniao de todos os desafios vinculados

---

## Compatibilidade

- Sistema continua funcionando com tags como fallback se nao houver links configurados
- Mentor pode usar so tags, so links, ou ambos
- Links tem prioridade sobre tags na filtragem

---

## Interface do Modal de Edicao

```text
+--------------------------------------------+
|  Editar Item                               |
+--------------------------------------------+
|  Texto do Objetivo *                       |
|  [Criar meu 1o Agente de IA do zero    ]   |
|                                            |
|  Chave Unica *                             |
|  [criar_agente                         ]   |
|                                            |
|  Tags (para filtrar desafios)              |
|  [agentes, n8n, automacao              ]   |
|                                            |
|  Desafios Vinculados (3 selecionados)      |
|  +--------------------------------------+  |
|  | [x] Construa seu 1o Agente - agentes |  |
|  | [x] Configure n8n do zero - n8n      |  |
|  | [ ] Crie vídeo de 1min - videos      |  |
|  | [x] Deploy no Railway - infra        |  |
|  +--------------------------------------+  |
|                                            |
|  [ ] Requer Infra    [ ] E item de Infra   |
|                                            |
|  [Cancelar]                    [Salvar]    |
+--------------------------------------------+
```

---

## Criterios de Aceite

- [ ] Nova tabela `objective_challenge_links` criada
- [ ] Modal de edicao de objetivo tem secao "Desafios Vinculados"
- [ ] Mentor pode selecionar multiplos desafios para cada objetivo
- [ ] Links sao salvos ao clicar em Salvar
- [ ] `RecommendedChallenges` busca desafios vinculados
- [ ] Aluno ve desafios corretos ao marcar objetivos
- [ ] Tudo persistente no banco de dados

