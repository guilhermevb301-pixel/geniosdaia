# Plano: Vincular Desafios aos Objetivos

## Status: ✅ CONCLUÍDO

## Resumo

Implementada a funcionalidade de vincular desafios recomendados diretamente a cada objetivo do checklist. Mentores podem selecionar quais desafios aparecem para cada objetivo.

---

## ✅ Implementado

### Nova Tabela: `objective_challenge_links`
- Relacionamento many-to-many entre objetivos e desafios
- RLS configurado para leitura pública e gestão por mentors/admins

### Arquivos Criados
- `src/hooks/useObjectiveChallengeLinks.ts` - Hook para gerenciar links

### Arquivos Modificados
- `src/components/admin/ObjectivesEditor.tsx` - Seção de desafios vinculados no modal
- `src/components/challenges/RecommendedChallenges.tsx` - Filtragem por links

---

## Fluxo de Uso

1. Mentor acessa `/admin/challenges` > aba "Objetivos"
2. Clica para editar um objetivo existente
3. No modal, vê seção "Desafios Vinculados" com checkboxes
4. Seleciona os desafios que devem aparecer
5. Salva - links são persistidos no banco
6. Alunos veem desafios corretos ao marcar objetivos

---

## Critérios de Aceite

- [x] Nova tabela `objective_challenge_links` criada
- [x] Modal de edição tem seção "Desafios Vinculados"
- [x] Mentor pode selecionar múltiplos desafios
- [x] Links são salvos ao clicar em Salvar
- [x] `RecommendedChallenges` busca desafios vinculados
- [x] Fallback para tags se não houver links
- [x] Tudo persistente no banco de dados
