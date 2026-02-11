

# Corrigir Upload de Video Travando

## Problema Identificado
O upload de videos grandes (centenas de MB ate 1GB) usa o metodo `supabase.storage.upload()` padrao, que nao e ideal para arquivos grandes. Para arquivos acima de ~6MB, o Supabase recomenda usar **uploads resumiveis (TUS protocol)**, que:
- Enviam o arquivo em pedacos (chunks)
- Permitem retomar uploads interrompidos
- Fornecem progresso real do envio

Alem disso, o codigo atual nao mostra nenhum progresso percentual durante o upload, fazendo parecer que travou.

## Solucao

### 1. Trocar para upload em chunks com progresso
- Substituir `supabase.storage.upload()` por `supabase.storage.uploadToSignedUrl()` ou usar o metodo de upload com chunks manual
- Como alternativa mais simples e compativel: fazer o upload usando `XMLHttpRequest` direto para a API de storage do Supabase, o que permite rastrear progresso via `onprogress`

### 2. Adicionar barra de progresso visual
- Mostrar percentual de upload durante o envio (ex: "Enviando video... 45%")
- Usar o componente `Progress` ja existente no projeto

### 3. Melhorar tratamento de erros
- Adicionar timeout e retry para uploads que falham
- Mostrar mensagem clara se o upload falhar

## Detalhes Tecnicos

**Arquivo afetado:** `src/pages/admin/AdminLessons.tsx`

**Mudancas:**
- Adicionar estado `uploadProgress` (0-100)
- Substituir `supabase.storage.upload()` por upload via `XMLHttpRequest` ou `fetch` com `ReadableStream` para rastrear progresso
- Na pratica, usar `XMLHttpRequest` para a URL do storage do Supabase com o token de autorizacao, pois permite `upload.onprogress`
- Exibir barra de progresso no botao/dialog durante upload
- Criar uma `signedUploadUrl` via `supabase.storage.createSignedUploadUrl()` para fazer upload seguro com progresso

**Fluxo:**
1. Gerar URL de upload assinada via `createSignedUploadUrl`
2. Fazer upload usando `XMLHttpRequest` com evento `progress`
3. Atualizar barra de progresso em tempo real
4. Ao completar, obter URL publica e salvar a aula

