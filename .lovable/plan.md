

# Plano: Remover "Desafios Recomendados Para Você"

## Problema

A seção "Desafios Recomendados Para Você" mostra todos os desafios vinculados aos objetivos do aluno de uma só vez, permitindo que ele veja tudo antes de completar os anteriores.

O sistema correto (já implementado) é a **progressão sequencial**:
- Apenas o desafio ativo é mostrado no `YourChallengesBanner`
- Os desafios bloqueados aparecem em `ChallengeProgressSection`
- Só libera o próximo quando o anterior é completado

## Solução

Remover a renderização do componente `RecommendedChallenges` da página `/desafios`.

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Desafios.tsx` | Remover importação e uso do `RecommendedChallenges` |

## Código a Remover

```tsx
// Linha 24 - remover importação
import { RecommendedChallenges } from "@/components/challenges/RecommendedChallenges";

// Linhas 731-735 - remover componente
<RecommendedChallenges 
  selectedObjectives={selectedObjectives}
  allChallenges={allDailyChallenges}
/>
```

## Fluxo Após a Mudança

1. Aluno seleciona objetivos no modal
2. Sistema inicializa progresso sequencial (primeiro desafio fica ativo)
3. `YourChallengesBanner` mostra o desafio ativo com timer
4. `ChallengeProgressSection` mostra desafios bloqueados com cadeado
5. Aluno completa → próximo desbloqueia automaticamente
6. **Nenhuma lista de "todos os desafios" é mostrada**

## Componente RecommendedChallenges

O arquivo `src/components/challenges/RecommendedChallenges.tsx` pode ser mantido no projeto (não precisa deletar) caso queira usar futuramente, ou pode ser removido para limpar o código.

## Resultado

- Aluno vê apenas o desafio ativo atual
- Desafios futuros aparecem como bloqueados (com cadeado)
- Progressão 100% sequencial, sem "spoilers"

