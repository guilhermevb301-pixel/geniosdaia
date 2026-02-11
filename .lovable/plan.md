

# Plano: Suporte a Upload Direto de Video nas Aulas

## Situacao Atual
- O componente `VideoPlayer.tsx` so aceita URLs do YouTube (extrai o ID do video e usa iframe embed)
- Upload de video MP4 ja existe para variações de prompts (categoria "video"), com validacao de ate 100MB
- O bucket `prompts` no storage ja esta configurado

## O que seria feito

### 1. Criar bucket de storage para videos de aulas
- Criar bucket `lesson-videos` no storage para armazenar videos MP4
- Configurar politicas de acesso (mentores podem fazer upload, alunos podem visualizar)

### 2. Atualizar o VideoPlayer para aceitar videos MP4 diretos
- Alem de URLs do YouTube, detectar URLs de video direto (MP4)
- Usar tag `<video>` nativa com controles para videos hospedados no storage
- Manter compatibilidade com YouTube (nenhuma aula existente quebra)

### 3. Adicionar campo de upload no admin de aulas
- No editor de aulas (`AdminLessons.tsx`), adicionar opcao de upload de video MP4
- Reutilizar a validacao existente (`validateVideoFile`) com limite de 100MB
- Mentor escolhe entre: colar link do YouTube OU fazer upload de MP4

## Alternativa mais simples
Se voce so quer uma forma rapida de hospedar videos sem YouTube, posso apenas permitir que voce cole **qualquer link de video** (nao apenas YouTube) e o player reproduza com tag `<video>` nativa. Assim voce poderia usar links diretos de qualquer hospedagem.

## Detalhes Tecnicos

**Arquivos afetados:**
- `src/components/aulas/VideoPlayer.tsx` — adicionar suporte a MP4 direto
- `src/pages/admin/AdminLessons.tsx` — adicionar campo de upload
- Nova migracao SQL — criar bucket `lesson-videos` com RLS

**Limite de upload:** 100MB por video (mesmo limite ja usado nos prompts)

