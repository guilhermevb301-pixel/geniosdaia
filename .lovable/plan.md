
# Plano: Melhorar Interface de Sucessão de Desafios

## Contexto Atual

O sistema atual ja possui a estrutura necessaria:
- Campo `is_initial_active` para marcar quais desafios iniciam ativos
- Campo `predecessor_challenge_id` para definir qual desafio deve ser completado antes
- Logica de desbloqueio quando um desafio e completado

Porem a interface pode ficar mais intuitiva para que o mentor entenda claramente o fluxo de progressao.

## Melhorias Propostas

### 1. Reorganizar Visual do Modal

**Secao "Desafios Iniciais" separada:**
- Mostrar claramente quais desafios comecam ativos
- Usar cards destacados com borda colorida para os iniciais
- Indicar visualmente a quantidade de slots disponiveis vs usados

**Secao "Fluxo de Liberacao":**
- Para cada desafio nao-inicial, mostrar de forma clara:
  - "Quando [Desafio X] for completado, libera [este desafio]"
- Usar setas visuais ou conexoes para ilustrar o fluxo

### 2. Melhorar Selector de Predecessor

Atualmente o dropdown mostra "Nenhum (sera bloqueado)". Melhorias:

- Renomear para **"Libera quando completar:"**
- Mostrar preview do titulo do predecessor selecionado
- Adicionar opcao de selecionar **multiplos predecessores** (AND logico - so libera quando todos forem completados)

### 3. Adicionar Visualizacao do Fluxo

Incluir um pequeno diagrama ou lista resumida mostrando:
```text
INICIO
  |
  +-- Desafio A (ativo)
  |     |
  |     +-- Desafio C (libera apos A)
  |
  +-- Desafio B (ativo)
        |
        +-- Desafio D (libera apos B)
              |
              +-- Desafio E (libera apos D)
```

### 4. Validacoes e Alertas

- Alertar se um desafio nao-inicial nao tem predecessor definido
- Alertar se ha desafios "orfaos" (sem caminho para serem desbloqueados)
- Mostrar aviso se mais desafios estao marcados como iniciais do que os slots permitem

## Detalhes Tecnicos

### Arquivos a Modificar

1. **`src/components/admin/ChallengeLinkingModal.tsx`**
   - Separar visualmente desafios iniciais dos demais
   - Adicionar indicador de slots (ex: "2/2 slots usados")
   - Melhorar labels do dropdown de predecessor
   - Adicionar preview do fluxo de liberacao

2. **Opcional: Criar componente `ChallengeFlowPreview.tsx`**
   - Componente para visualizar a arvore de dependencias
   - Mostra quais desafios sao desbloqueados por quais

### Alteracoes no Modal

```text
+--------------------------------------------------+
| Vincular Desafios ao Objetivo                    |
| [Objetivo Label]                                 |
+--------------------------------------------------+
|                                                  |
| DESAFIOS INICIAIS (ativos no inicio)            |
| [2/2 slots usados]                              |
|                                                  |
| [====Desafio A====] [remover]                   |
| [====Desafio B====] [remover]                   |
|                                                  |
| [+ Adicionar desafio inicial]                   |
+--------------------------------------------------+
|                                                  |
| SEQUENCIA DE LIBERACAO                          |
|                                                  |
| [Desafio C]                                     |
|   Libera quando: [Desafio A v]                  |
|                                                  |
| [Desafio D]                                     |
|   Libera quando: [Desafio B v]                  |
|                                                  |
| [+ Adicionar desafio a sequencia]               |
+--------------------------------------------------+
|                                                  |
| PREVIEW DO FLUXO:                               |
| A ---> C                                        |
| B ---> D                                        |
|                                                  |
+--------------------------------------------------+
|                           [Cancelar] [Salvar]   |
+--------------------------------------------------+
```

### Logica de Validacao

Antes de salvar, verificar:
1. Todos desafios nao-iniciais tem predecessor definido
2. Nao ha ciclos de dependencia
3. Numero de iniciais nao excede `active_slots`

## Beneficios

- Mentor entende visualmente o fluxo de progressao
- Reducao de erros de configuracao
- Interface mais intuitiva para gerenciar desafios simultaneos

## Esforco Estimado

- Modificacao principal no `ChallengeLinkingModal.tsx`
- Nao requer alteracoes no banco de dados
- Tempo estimado: implementacao media
