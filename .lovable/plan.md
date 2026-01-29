
# Plano: Redesign da Arena dos Genios

## Visao Geral

Vou redesenhar completamente a pagina de Desafios para seguir o estilo visual premium mostrado na imagem de referencia, com navegacao por abas, cards de submissao ricos com avatares e niveis, ranking interativo e secao de historico.

---

## Estrutura Visual do Novo Design

```text
+------------------------------------------------------------------+
|  [Trophy] Arena dos Genios                                        |
|  Participe de desafios semanais, mostre suas habilidades...      |
|                                                                   |
|  [Desafio Ativo] [Submissoes] [Ranking] [Historico]   <- TABS    |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  [Badge] DESAFIO DA SEMANA                                 |  |
|  |                                                            |  |
|  |  Crie um Agente de IA para Atendimento ao Cliente         |  |
|  |  Descricao do desafio...                                   |  |
|  |                                                            |  |
|  |  TEMPO RESTANTE    PARTICIPANTES    DIFICULDADE           |  |
|  |  03 | 14 | 27 | 45   47 inscritos   [***] Intermediario   |  |
|  |  DIAS HORAS MIN SEG                                        |  |
|  |                                                            |  |
|  |  [Gift] Premio: +500 XP + Badge "Mestre" + Destaque       |  |
|  |                                                            |  |
|  |  [Submeter Meu Projeto]  [Ver Regras Completas]           |  |
|  +------------------------------------------------------------+  |
|                                    Gradiente roxo/azul           |
+------------------------------------------------------------------+
|                                                                   |
|  [Grid] Submissoes da Comunidade           [Mais Votados v]      |
|  +------------------+  +------------------+  +------------------+ |
|  | [1o] Badge ouro  |  | [2o] Badge prata |  | [3o] Badge bronze| |
|  | [Placeholder]    |  | [Placeholder]    |  | [Placeholder]    | |
|  | Avatar | Nome    |  | Avatar | Nome    |  | Avatar | Nome    | |
|  | Nivel X          |  | Nivel X          |  | Nivel X          | |
|  | Titulo projeto   |  | Titulo projeto   |  | Titulo projeto   | |
|  | [Upvote 127]  2d |  | [Upvote 98]   3d |  | [Upvote 76]   4d | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
|                                                                   |
|  [Crown] Ranking do Desafio                                      |
|  +------------------------------------------------------------+  |
|  | [1] Avatar Maria Silva - Nivel 6 Mestre         127 votos  |  |
|  | [2] Avatar Joao Pedro - Nivel 5 Especialista     98 votos  |  |
|  | [3] Avatar Ana Costa - Nivel 4 Automatizador     76 votos  |  |
|  | [4] Avatar Lucas Mendes - Nivel 3 Praticante     54 votos  |  |
|  | [5] Avatar Carla Souza - Nivel 4 Automatizador   43 votos  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
|                                                                   |
|  [History] Desafios Anteriores                                   |
|  +-------------------+  +-------------------+                    |
|  | [Img] Semana 12   |  | [Img] Semana 11   |                    |
|  | Crie Campanha IA  |  | Automatize Fluxo  |                    |
|  | [Trophy] Pedro A. |  | [Trophy] Juliana  |                    |
|  +-------------------+  +-------------------+                    |
+------------------------------------------------------------------+
```

---

## Componentes a Criar/Modificar

### Arquivo Principal
| Arquivo | Acao |
|---------|------|
| `src/pages/Desafios.tsx` | Reescrever completamente |

---

## Detalhes de Implementacao

### 1. Header com Navegacao por Abas

- Titulo "Arena dos Genios" com icone de trofeu dourado
- Subtitulo descritivo
- Tabs: Desafio Ativo | Submissoes | Ranking | Historico
- Primeira aba (Desafio Ativo) selecionada por padrao com destaque amarelo/laranja

### 2. Card do Desafio Ativo (Hero Section)

Design Premium com:
- Gradiente de fundo roxo/azul (`from-primary via-blue-600 to-indigo-800`)
- Badge "DESAFIO DA SEMANA" no topo esquerdo (verde com texto branco)
- Titulo grande em branco
- Descricao em branco/translucido
- Secao de metricas em linha:
  - TEMPO RESTANTE: 4 blocos escuros com numeros grandes (dias/horas/min/seg)
  - PARTICIPANTES: Numero + "inscritos"
  - DIFICULDADE: Estrelas (1-3) + label (Iniciante/Intermediario/Avancado)
- Card de premio com icone de presente: XP + Badge + Destaque
- Dois botoes:
  - "Submeter Meu Projeto" (primario, amarelo)
  - "Ver Regras Completas" (outline)

### 3. Grid de Submissoes da Comunidade

Cards visuais com:
- Badge de posicao no canto superior esquerdo:
  - 1o lugar: Fundo dourado, coroa
  - 2o lugar: Fundo prata
  - 3o lugar: Fundo bronze
- Area de preview/placeholder (icone de robo)
- Footer do card:
  - Avatar circular + Nome + Nivel (ex: "Nivel 6 - Mestre")
  - Titulo do projeto
  - Botao de upvote (seta para cima + contador)
  - Data relativa ("ha 2 dias")
- Dropdown "Mais Votados" no header da secao

### 4. Ranking do Desafio

Lista vertical estilizada:
- Cada linha com:
  - Numero da posicao (1-5) com cores especiais para top 3
    - 1o: Fundo amarelo
    - 2o: Fundo cinza claro
    - 3o: Fundo bronze
  - Avatar do usuario
  - Nome + Nivel
  - Contador de votos (numero grande + "votos" pequeno)
- Top 3 com destaque visual
- Linhas alternadas com fundo sutil

### 5. Desafios Anteriores

Grid 2x2 de cards historicos:
- Thumbnail placeholder a esquerda
- Badge "Semana X" no topo
- Titulo do desafio
- Icone de trofeu + "Vencedor: Nome"

### 6. Modal de Submissao Melhorado

- Area de upload drag-and-drop com borda tracejada
- Icone de upload centralizado
- Texto "Arraste seu arquivo ou clique para selecionar"
- Campos:
  - Titulo do Projeto (obrigatorio)
  - Descricao (textarea)
  - Link (opcional)
- Botao "Enviar Submissao"

---

## Cores e Estilos

| Elemento | Cor/Estilo |
|----------|------------|
| Badge posicao 1o | `bg-amber-500 text-amber-950` |
| Badge posicao 2o | `bg-gray-400 text-gray-900` |
| Badge posicao 3o | `bg-amber-700 text-amber-100` |
| Tab ativa | `bg-amber-500 text-amber-950` |
| Hero gradient | `bg-gradient-to-br from-primary via-blue-600 to-indigo-800` |
| Badge desafio | `bg-green-600 text-white` |
| Botao submeter | `bg-accent text-accent-foreground` |
| Upvote button | `bg-primary/20 hover:bg-primary/40` |

---

## Dados Necessarios

Para tornar a interface funcional, precisamos:

1. **Contador de participantes**: Query para contar submissoes no desafio ativo
2. **Avatar e nivel dos usuarios**: Join com user_xp e profiles (se existir)
3. **Data relativa**: Funcao para formatar "ha X dias"

### Atualizacao do Hook useChallenges

Adicionar fetch de submissoes com dados do usuario:
```typescript
// Buscar submissoes com dados do autor
const fetchSubmissionsWithUsers = async (challengeId: string) => {
  const { data, error } = await supabase
    .from("challenge_submissions")
    .select(`
      *,
      user_xp!inner(total_xp, current_level)
    `)
    .eq("challenge_id", challengeId)
    .order("votes_count", { ascending: false });
  
  // Processar e retornar com nivel calculado
};
```

---

## Fluxo de Navegacao

```text
Usuario entra em /desafios
        |
        v
[Carrega desafio ativo + submissoes]
        |
        v
Tab "Desafio Ativo" selecionada por padrao
        |
        +--> Clicar em "Submissoes" --> Mostra apenas grid de submissoes
        |
        +--> Clicar em "Ranking" --> Mostra apenas ranking
        |
        +--> Clicar em "Historico" --> Mostra desafios passados
        |
        +--> Clicar "Submeter Meu Projeto" --> Abre modal
        |
        +--> Clicar em upvote --> Atualiza contagem
```

---

## Responsividade

| Breakpoint | Grid Submissoes | Ranking |
|------------|-----------------|---------|
| Mobile     | 1 coluna        | Lista simples |
| Tablet     | 2 colunas       | Lista com avatares |
| Desktop    | 3 colunas       | Lista completa |

---

## Animacoes

- Tabs: Transicao suave ao mudar de aba
- Upvote: Scale up sutil ao clicar
- Cards: Hover com sombra e leve elevacao
- Countdown: Numeros pulsando a cada segundo
- Modal: Fade in/slide up ao abrir

---

## Secao Tecnica

### Estrutura de Componentes Internos

```tsx
// Estrutura principal
export default function Desafios() {
  return (
    <AppLayout>
      <PageHeader />
      <Tabs defaultValue="active">
        <TabsList />
        <TabsContent value="active">
          <ActiveChallengeHero />
          <CommunitySubmissions />
          <ChallengeRanking />
          <PastChallenges />
        </TabsContent>
        <TabsContent value="submissions">
          <CommunitySubmissions />
        </TabsContent>
        <TabsContent value="ranking">
          <ChallengeRanking />
        </TabsContent>
        <TabsContent value="history">
          <PastChallenges />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
```

### Componentes Internos

| Componente | Responsabilidade |
|------------|------------------|
| `PageHeader` | Titulo + subtitulo |
| `ActiveChallengeHero` | Card do desafio ativo com countdown |
| `CommunitySubmissions` | Grid de cards de submissoes |
| `SubmissionCard` | Card individual com avatar, nivel, votos |
| `ChallengeRanking` | Lista do top 5 |
| `RankingRow` | Linha individual do ranking |
| `PastChallenges` | Grid de desafios anteriores |
| `PastChallengeCard` | Card historico com vencedor |
| `SubmitModal` | Modal de envio de projeto |

### Funcao de Data Relativa

```typescript
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ha 1 dia";
  return `Ha ${diffDays} dias`;
}
```

### Badges de Posicao

```tsx
function PositionBadge({ position }: { position: number }) {
  const styles = {
    1: "bg-amber-500 text-amber-950",
    2: "bg-gray-400 text-gray-900",
    3: "bg-amber-700 text-amber-100",
  };
  
  return (
    <div className={cn("px-2 py-1 rounded-md font-bold", styles[position])}>
      {position === 1 && <Crown className="h-3 w-3 inline mr-1" />}
      {position}o
    </div>
  );
}
```

---

## Resultado Esperado

1. **Visual Premium**: Design escuro com destaques amarelos/dourados
2. **Navegacao Intuitiva**: Tabs para alternar entre secoes
3. **Cards Ricos**: Avatares, niveis e badges de posicao
4. **Ranking Visual**: Top 3 com cores especiais
5. **Countdown Animado**: Timer em tempo real
6. **Interatividade**: Upvotes com feedback visual
7. **Historico Organizado**: Desafios passados com vencedores
