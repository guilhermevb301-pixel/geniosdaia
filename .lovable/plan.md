# Plano: Centralizar Edição da Arena em /admin/challenges

## Status: ✅ IMPLEMENTADO

## Resumo

Toda a funcionalidade de edição (objetivos + desafios recomendados) foi movida para `/admin/challenges` com 3 abas: Desafios Semanais, Objetivos, e Desafios Recomendados. Os botões de edição foram removidos da página `/desafios`.

---

## Arquivos Criados/Modificados

| Arquivo | Status |
|---------|--------|
| `src/pages/admin/AdminChallenges.tsx` | ✅ Reestruturado com 3 abas |
| `src/hooks/useDailyChallengesAdmin.ts` | ✅ Criado - CRUD para daily_challenges |
| `src/components/admin/ObjectivesEditor.tsx` | ✅ Criado - Editor inline de objetivos |
| `src/components/admin/DailyChallengesEditor.tsx` | ✅ Criado - CRUD de desafios recomendados |
| `src/components/challenges/ObjectivesChecklist.tsx` | ✅ Removido botão de edição |
| `src/components/challenges/RecommendedChallenges.tsx` | ✅ Removido link de gerenciar |

---

## Critérios de Aceite

- [x] `/admin/challenges` tem 3 abas: Desafios Semanais, Objetivos, Desafios Recomendados
- [x] Aba Objetivos permite CRUD de grupos e itens (inline, não modal)
- [x] Aba Desafios Recomendados permite CRUD de daily_challenges
- [x] Página `/desafios` não tem botões de edição para ninguém
- [x] Membros só visualizam e marcam objetivos
- [x] Mudanças feitas no admin refletem para todos os usuários
- [x] Tudo persistente no banco de dados
- [x] Visual dark consistente com design atual
