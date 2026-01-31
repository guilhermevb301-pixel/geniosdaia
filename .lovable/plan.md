
# Plano: Checklist Multi-Selecao com Dependencias Automaticas

## Resumo

Adicionar um checklist interativo de objetivos na aba "Desafio Ativo" da pagina `/desafios`. O checklist tera grupos tematicos, dependencias automaticas (ex: marcar "Criar Agente" obriga marcar "Infra do Agente"), e salvamento no perfil do usuario. Abaixo do checklist, mostrara "Desafios Recomendados Para Voce" filtrados pelos objetivos selecionados.

---

## Estrutura do Checklist

```text
+------------------------------------------+
|  DEFINA SEUS OBJETIVOS                   |
+------------------------------------------+
|                                          |
|  A) Quero construir meu Agente (produto) |
|  [ ] Criar meu 1o Agente de IA do zero   |
|                                          |
|  B) Quero vender (dinheiro)              |
|  [ ] Vender primeiro projeto de Agente   |
|  [ ] Fechar clientes para Agentes        |
|  [ ] Vender + Fechar clientes (combo)    |
|  [ ] Criar proposta que vende            |
|                                          |
|  C) Quero crescer (audiencia)            |
|  [ ] Viralizar nas redes                 |
|  [ ] Criar conteudo que vende            |
|  [ ] Criar Agentes + Viralizar (combo)   |
|  [ ] Criar Agentes + Fechar + Viralizar  |
|                                          |
|  D) Infra obrigatoria (pre-requisito)    |
|  [x] Infra do Agente (OBRIGATORIO)       |  <- auto-marcado se A ou combos de C
|                                          |
|  E) Ativos criativos                     |
|  [ ] Criar videos incriveis              |
|  [ ] Criar videos + Viralizar (combo)    |
|  [ ] Criar fotos profissionais           |
|  [ ] Fotos + portfolio pra vender        |
|                                          |
+------------------------------------------+
|  DESAFIOS RECOMENDADOS PARA VOCE         |
+------------------------------------------+
|  [Card Desafio 1] [Card Desafio 2] ...   |
|  OU                                      |
|  "Marque seus objetivos acima para ver   |
|   desafios personalizados"               |
+------------------------------------------+
```

---

## Logica de Dependencias

| Quando o usuario marca... | Acao automatica |
|---------------------------|-----------------|
| "Criar meu 1o Agente de IA do zero" (grupo A) | Auto-marca "Infra do Agente" (grupo D) e bloqueia desmarcacao |
| "Criar Agentes + Viralizar (combo)" (grupo C) | Auto-marca "Infra do Agente" (grupo D) e bloqueia desmarcacao |
| "Criar Agentes + Fechar + Viralizar (combo completo)" (grupo C) | Auto-marca "Infra do Agente" (grupo D) e bloqueia desmarcacao |
| Qualquer item de "Quero vender" (grupo B) | Mostra badge de sugestao: "Recomendamos: Criar proposta que vende" |

---

## Armazenamento

- Os objetivos serao salvos no campo `goals.selected_objectives` do `user_profiles` como array de strings
- Exemplo: `["criar_agente", "infra_agente", "vender_projeto"]`
- Ao carregar a pagina, restaura as marcacoes salvas

---

## Filtragem de Desafios

Cada objetivo tera tags associadas para filtrar os desafios:

| Objetivo | Tags para filtrar |
|----------|-------------------|
| Criar Agente | agentes, n8n, automacao |
| Vender projeto | vendas, comercial, propostas |
| Fechar clientes | prospecao, clientes, vendas |
| Criar proposta | propostas, comercial |
| Viralizar | crescimento, redes, marketing |
| Criar conteudo que vende | conteudo, marketing, vendas |
| Criar videos | videos, producao |
| Criar fotos | fotos, producao |
| Infra do Agente | infra, n8n, vps, baserow |

Os desafios personalizados (da tabela `daily_challenges`) serao filtrados por estas tags.

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/Desafios.tsx` | Adicionar novo componente `ObjectivesChecklist` na aba "Desafio Ativo", acima de `PersonalizedChallengesSection`. Adicionar secao "Desafios Recomendados Para Voce" |
| `src/hooks/useUserProfile.ts` | Expandir tipo `goals` para incluir `selected_objectives: string[]` |

---

## Novo Componente: ObjectivesChecklist

```tsx
// Estrutura de dados para os objetivos
const OBJECTIVES = {
  grupo_a: {
    title: "A) Quero construir meu Agente (produto)",
    items: [
      { id: "criar_agente", label: "Criar meu 1o Agente de IA do zero (rodando)", requiresInfra: true }
    ]
  },
  grupo_b: {
    title: "B) Quero vender (dinheiro)",
    items: [
      { id: "vender_projeto", label: "Vender primeiro projeto de Agente de IA" },
      { id: "fechar_clientes", label: "Fechar clientes para Agentes" },
      { id: "vender_fechar_combo", label: "Vender + Fechar clientes (combo)" },
      { id: "criar_proposta", label: "Criar proposta que vende (1 pagina + 3 pacotes)" }
    ],
    suggestProposal: true
  },
  // ... outros grupos
}
```

---

## Fluxo de Usuario

1. Usuario acessa `/desafios`
2. Na aba "Desafio Ativo", ve primeiro o card do Desafio da Semana (existente)
3. Abaixo, ve o novo checklist "Defina Seus Objetivos"
4. Marca opcoes - se marcar algo que requer Infra, auto-marca e bloqueia
5. Escolhas sao salvas automaticamente (debounce de 500ms)
6. Abaixo do checklist, ve "Desafios Recomendados Para Voce" filtrados
7. Se nenhum objetivo marcado, ve estado vazio com instrucao

---

## Detalhes Tecnicos

### 1. Estado local e persistencia

```tsx
const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

// Ao carregar, restaura do profile.goals.selected_objectives
useEffect(() => {
  if (profile?.goals?.selected_objectives) {
    setSelectedObjectives(profile.goals.selected_objectives);
  }
}, [profile]);

// Ao mudar, salva com debounce
useEffect(() => {
  const timer = setTimeout(() => {
    updateProfile({
      goals: {
        ...profile?.goals,
        selected_objectives: selectedObjectives
      }
    });
  }, 500);
  return () => clearTimeout(timer);
}, [selectedObjectives]);
```

### 2. Logica de dependencias

```tsx
const INFRA_REQUIRED_BY = ["criar_agente", "agentes_viralizar_combo", "agentes_fechar_viralizar_combo"];

const toggleObjective = (id: string) => {
  setSelectedObjectives(prev => {
    let newSelection = prev.includes(id)
      ? prev.filter(o => o !== id)
      : [...prev, id];

    // Se marcou algo que requer infra, adiciona infra
    if (INFRA_REQUIRED_BY.includes(id) && !prev.includes(id)) {
      if (!newSelection.includes("infra_agente")) {
        newSelection.push("infra_agente");
      }
    }

    // Se desmarcou tudo que requer infra, libera infra para desmarcacao
    // (a infra so pode ser desmarcada se nenhum item que requer estiver marcado)

    return newSelection;
  });
};

const isInfraLocked = selectedObjectives.some(o => INFRA_REQUIRED_BY.includes(o));
```

### 3. Sugestao de proposta (grupo B)

```tsx
const showProposalSuggestion = 
  selectedObjectives.some(o => ["vender_projeto", "fechar_clientes", "vender_fechar_combo"].includes(o)) &&
  !selectedObjectives.includes("criar_proposta");
```

### 4. Filtragem de desafios

```tsx
const OBJECTIVE_TAGS: Record<string, string[]> = {
  criar_agente: ["agentes", "n8n", "automacao"],
  vender_projeto: ["vendas", "comercial", "propostas"],
  // ...
};

const relevantTags = selectedObjectives.flatMap(o => OBJECTIVE_TAGS[o] || []);
const filteredChallenges = dailyChallenges.filter(c => 
  relevantTags.some(tag => c.track?.includes(tag) || c.title?.toLowerCase().includes(tag))
);
```

---

## Resumo Visual

A aba "Desafio Ativo" tera esta ordem:

1. **Desafio da Semana** (card hero existente)
2. **Defina Seus Objetivos** (NOVO - checklist com grupos A-E)
3. **Desafios Recomendados Para Voce** (NOVO - lista filtrada)
4. ~~Seu Desafio Personalizado (Hoje)~~ (sera substituido pelos recomendados)
5. ~~Bonus da Semana~~ (sera substituido pelos recomendados)
6. **Submissoes da Comunidade** (existente)
7. **Ranking do Desafio** (existente)

---

## Criterios de Aceite

- [x] Checklist multi-selecao com 5 grupos (A-E)
- [x] Dependencia: marcar Agente/combos auto-marca Infra e bloqueia desmarcacao
- [x] Sugestao visual ao marcar itens de venda (recomenda proposta)
- [x] Salvamento automatico no campo `goals.selected_objectives`
- [x] Restauracao das marcacoes ao recarregar pagina
- [x] Secao "Desafios Recomendados" filtra por tags dos objetivos
- [x] Estado vazio quando nenhum objetivo marcado
- [x] Layout dark mantido, visual consistente
- [x] Tudo em PT-BR
