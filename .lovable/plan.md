

# Plano: Reiniciar Desafios e Objetivos Livremente

## O que o aluno precisa conseguir fazer

1. **Reiniciar um desafio individual** (ja funciona - botao aparece quando o tempo expira)
2. **Reiniciar um desafio a qualquer momento** (NOVO - mesmo antes do tempo expirar)
3. **Resetar todo o progresso de um objetivo** (NOVO - recomecar do zero)
4. **Trocar objetivos sem problemas** (ja funciona parcialmente, mas precisa ser mais robusto)

## Mudancas

### 1. Botao "Reiniciar" sempre visivel no desafio ativo

Atualmente o botao de reiniciar so aparece quando o tempo expira. O aluno deve poder reiniciar a qualquer momento.

**Arquivo: `src/components/challenges/YourChallengesBanner.tsx`**
- No `ActiveChallengeItem`, mostrar o botao "Reiniciar" sempre (nao apenas quando expirado)
- Layout: botao "Completar" principal + botao "Reiniciar" secundario ao lado
- Quando expirado: botao "Reiniciar" fica em destaque (como hoje) e "Completar" desaparece

### 2. Botao "Recomecar Objetivo" no ObjectivesSummary

Adicionar opcao de resetar todo o progresso de um objetivo especifico sem precisar desmarcar e remarcar.

**Arquivo: `src/components/challenges/ObjectivesSummary.tsx`**
- Adicionar um botao/icone de reset ao lado de cada objetivo no resumo
- Ao clicar, exibir um `AlertDialog` de confirmacao: "Tem certeza? Todo o progresso deste objetivo sera reiniciado."
- Ao confirmar: chamar `clearProgress(objectiveItemId)` e depois re-inicializar via invalidacao de cache (o hook `useChallengeProgressData` cuida de re-criar o progresso automaticamente)

**Arquivo: `src/pages/Desafios.tsx`**
- Passar `clearProgress` e `objectivesData` como props para o `ObjectivesSummary`
- Ou criar um callback `onResetObjective` que faz o clear e deixa o sistema re-inicializar

### 3. Troca de objetivos inteligente

O fluxo atual ja limpa o progresso ao desmarcar um objetivo (`handleObjectivesChange`). Mas precisa garantir que:
- Ao marcar um novo objetivo, o progresso e criado imediatamente (ja funciona via `useChallengeProgressData`)
- Ao desmarcar, o progresso e removido completamente (ja funciona via `clearProgress`)
- Nao ha estado "travado" apos a troca

Isso ja esta implementado. Apenas precisamos garantir que o `clearProgress` invalida corretamente o cache.

## Detalhes Tecnicos

### ActiveChallengeItem - Layout dos botoes

```text
ANTES (tempo NAO expirado):
  [====== Completar Desafio ======]

ANTES (tempo expirado):
  [====== Reiniciar Desafio ======]

DEPOIS (tempo NAO expirado):
  [==== Completar ====] [Reiniciar]

DEPOIS (tempo expirado):
  [====== Reiniciar Desafio ======]
```

### ObjectivesSummary - Reset por objetivo

```text
[Seus Objetivos (2)]                    [Editar]
  [Vender primeiro projeto IA]  [icone reset]
  [Criar agente funcional]      [icone reset]
```

Ao clicar no icone de reset:
1. AlertDialog: "Reiniciar objetivo? Todo seu progresso sera apagado e os desafios voltarao ao inicio."
2. Confirmar -> `clearProgress(objectiveItemId)`
3. O `useChallengeProgressData` detecta que nao ha progresso e re-inicializa automaticamente

### Arquivos a modificar

1. **`src/components/challenges/YourChallengesBanner.tsx`** - Botao reiniciar sempre visivel
2. **`src/components/challenges/ObjectivesSummary.tsx`** - Botao reset por objetivo + AlertDialog
3. **`src/pages/Desafios.tsx`** - Passar callback `onResetObjective` para ObjectivesSummary

