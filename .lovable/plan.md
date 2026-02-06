
# Plano: Controle Explícito de Desafios Iniciais e Sequenciais

## Problema Atual

Quando o mentor adiciona um desafio, o sistema automaticamente decide se será "inicial" ou "sequencial" baseado nos slots disponíveis. Isso impede configurações flexíveis como:
- Começar com 1 desafio e depois liberar 2 simultaneamente
- Escolher manualmente quais desafios específicos aparecem primeiro

## Solução Proposta

Dar ao mentor controle total sobre onde adicionar cada desafio, permitindo escolher explicitamente se vai para a seção "Inicial" ou "Sequencial".

### Mudanças na Interface

**Lista de busca com botões de ação separados:**

Em vez de um clique único que decide automaticamente, cada desafio na lista terá dois botões:
- **"Inicial"** - Adiciona como desafio ativo desde o início
- **"Sequência"** - Adiciona como desafio que será liberado após completar outro

**Comportamento:**
- Botão "Inicial" fica desabilitado (cinza) quando os slots estiverem cheios
- Botão "Sequência" sempre disponível
- O mentor escolhe explicitamente onde colocar cada desafio

### Fluxo de Exemplo

Configuração desejada: Começa com 1, depois libera 2 simultaneamente

```text
DESAFIOS INICIAIS (1/2 slots)
  └─ Desafio A [ativo no início]

SEQUÊNCIA DE LIBERAÇÃO
  └─ Desafio B → Libera quando: Desafio A
  └─ Desafio C → Libera quando: Desafio A

PREVIEW DO FLUXO:
  A (início) → B
  A (início) → C
```

Quando o aluno completar A, tanto B quanto C são liberados simultaneamente!

## Detalhes Técnicos

### Arquivos a Modificar

1. **`src/components/admin/challenge-linking/ChallengeSearchList.tsx`**
   - Substituir clique único por dois botões: "Inicial" e "Sequência"
   - Passar prop para indicar se slots estão cheios (desabilitar botão Inicial)
   - Atualizar callback para passar o tipo escolhido

2. **`src/components/admin/ChallengeLinkingModal.tsx`**
   - Atualizar chamada do ChallengeSearchList com nova prop
   - Remover lógica automática de decisão
   - Atualizar texto de instrução para refletir novo comportamento

### Mudança Visual

De:
```text
[checkbox] Desafio X
           [clique para adicionar]
```

Para:
```text
[Desafio X]
           [+ Inicial] [+ Sequência]
```

## Benefícios

- Mentor tem controle total sobre a progressão
- Permite configurar múltiplos desafios liberados simultaneamente após completar um
- Interface mais clara sobre o que cada ação faz
- Flexibilidade para qualquer configuração de fluxo

## Esforço

- Modificação em 2 arquivos
- Sem alterações no banco de dados
- Implementação rápida
