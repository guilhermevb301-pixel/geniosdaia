# Design: Fix do webhook Kiwify, bugs de acesso/login e carrossel de módulos

Data: 2026-09-02
Repositório: geniosdaia-app (área de membros membrosgenios.com)
Branch base: `codex/kiwify-webhook-access-fix-2026-09-02` (correção parcial já existente, reaproveitada)

## Fora de escopo neste ciclo

Identidade visual (tema verde #34d399, sidebar, botões, login) está sendo definida
separadamente pelo usuário com apoio de outra ferramenta. Fica pendente de uma
spec/PR futuro. Este documento cobre apenas: (1) webhook Kiwify, (2) bugs de
acesso/login, (3) carrossel de módulos em Aulas.

## Contexto

A área de membros usa React+Vite+TS+Tailwind+shadcn/ui, Supabase (Postgres +
Auth + Edge Functions) e é publicada na Vercel. Compras acontecem na Kiwify,
que dispara um webhook por produto (uma URL por produto, com `?product=<slug>`)
para uma Edge Function Supabase (`supabase/functions/kiwify-webhook`), responsável
por criar o usuário no Supabase Auth e liberar acesso.

Uma branch (`codex/kiwify-webhook-access-fix-2026-09-02`) já corrigiu o bug
original (Kiwify manda `webhook_event_type: "order_approved"`, o código antigo
só reconhecia `compra_aprovada`) e implementou: senha padrão `123456`,
distinção genios-ia (libera tudo) vs produto avulso (libera só ele), não
resetar senha de usuário existente, e revogação em reembolso/chargeback/
cancelamento. A investigação para este design encontrou bugs adicionais nessa
correção parcial e dois furos de acesso não relacionados ao webhook.

## 1. Webhook Kiwify — correções sobre a branch parcial

Arquivos: `supabase/functions/kiwify-webhook/{index.ts,kiwify.ts}`,
`supabase/functions/_shared/products.ts` (novo), `supabase/migrations/`
(nova migration), `src/test/kiwify-webhook.test.ts`.

### 1.1 Revogação parcial indevida (bug de dados)

**Problema:** `revokeProducts` reusa `getProductSlugsToGrant(productSlug)`. Se
o pedido revogado é `genios-ia`, isso expande para os 7 slugs e apaga da
`user_products` produtos avulsos comprados em pedidos separados e não
relacionados ao reembolso.

**Correção:** migration aditiva em `user_products`:

```sql
alter table public.user_products
  add column granted_by_product text;

update public.user_products
  set granted_by_product = product_slug
  where granted_by_product is null;

alter table public.user_products
  alter column granted_by_product set not null;
```

`grantProducts` passa a gravar `granted_by_product = productSlug` (o produto
do pedido que originou a concessão, não o slug concedido individualmente).
`revokeProducts` deleta por `granted_by_product = productSlug`, não mais
recalculando com `getProductSlugsToGrant`. Efeito: reembolsar "genios-ia"
remove só as linhas que foram concedidas por aquele pedido; produtos avulsos
comprados à parte permanecem intactos.

### 1.2 Fail-open na verificação de assinatura (falha de segurança)

**Problema:** se `KIWIFY_WEBHOOK_TOKEN` não está configurado,
`verifyKiwifySignature` retorna `{ ok: true, skipped: true }` — qualquer
chamador pode se autoconceder acesso sem assinatura válida.

**Correção:** sem o secret configurado, a function responde `500` com corpo
de erro explicando a causa (não silenciosamente aceitar). Documentar em
`supabase/functions/kiwify-webhook/README.md` o comando
`supabase secrets set KIWIFY_WEBHOOK_TOKEN=...` e os demais secrets
necessários (`EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`).
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` são injetados automaticamente pela
plataforma e não precisam ser setados manualmente.

### 1.3 Fallback perigoso do parâmetro `product` (fail-open na pior direção)

**Problema:** `url.searchParams.get("product") || "genios-ia"` — se a URL do
webhook estiver mal configurada no painel Kiwify para qualquer produto avulso
(parâmetro ausente ou nome errado), o fallback libera *todos* os produtos.

**Correção:** sem `product` presente e reconhecido em `VALID_PRODUCTS`, a
function responde `400` (rejeita) em vez de assumir `genios-ia`.

### 1.4 Erro de rede no WhatsApp derruba o webhook inteiro (regressão)

**Problema:** `sendWhatsAppWithEmail` não tem try/catch ao redor do `fetch`.
Uma falha de rede/instância Evolution fora do ar propaga uma exceção que cai
no catch genérico e retorna `500` para a Kiwify — mesmo que
`createAuthUserIfNeeded`/`authorizeBuyer`/`grantProducts` já tenham sido
concluídos com sucesso antes dessa chamada.

**Correção:** envolver a chamada de WhatsApp em try/catch próprio que só loga
o erro (`console.error`) sem interromper o fluxo; a resposta de sucesso
(`{ ok: true, action: "granted" }`) deve refletir o estado real de
provisionamento de acesso, não o de uma notificação best-effort.

### 1.5 Checagem de "usuário já existe" frágil (regex sobre mensagem de erro)

**Problema:** `isAlreadyRegisteredError` casa regex contra o texto da mensagem
de erro do Supabase Auth — quebra silenciosamente se o texto mudar.

**Correção:** antes de chamar `createUser`, buscar o usuário por email (via
Admin API, paginando `listUsers` ou equivalente disponível na versão do SDK)
e decidir criar vs. pular com base nisso, em vez de inferir pelo texto do
erro depois de tentar criar.

### 1.6 `VALID_PRODUCTS` duplicado em 3 lugares

**Correção neste ciclo:** criar `supabase/functions/_shared/products.ts` como
fonte única para as duas Edge Functions (`kiwify-webhook`, `admin-create-user`),
importado via caminho relativo (padrão suportado em Deno/Supabase Functions).
`src/hooks/useUserProducts.ts` (frontend) mantém sua própria lista — unificação
completa exigiria uma tabela `products` no banco, considerada fora de escopo
agora; deixamos um comentário no hook apontando para o arquivo compartilhado
como fonte de verdade a manter sincronizada manualmente.

### 1.7 Fora de escopo / não fazemos neste ciclo

- Não inventamos nem validamos contra produção o esquema real de assinatura
  HMAC da Kiwify (implementado na branch parcial como HMAC-SHA1) — fica como
  ponto de validação manual do usuário com um payload real de teste.
- Não disparamos webhook real contra Kiwify/Supabase de produção.
- Não tratamos eventos de assinatura recorrente (`subscription_renewed`,
  etc.) — não há produto recorrente conhecido hoje.

### 1.8 Testes

Adicionar casos ao `src/test/kiwify-webhook.test.ts` (ou novo arquivo) para:
revogação por `granted_by_product` não afeta produtos de outra origem;
`product` ausente/inválido na URL é rejeitado (400); assinatura ausente com
secret configurado é rejeitada; secret não configurado é fail-closed (500);
falha simulada no fetch do WhatsApp não impede a resposta de sucesso do
provisionamento de acesso.

## 2. Bugs de acesso/login (frontend)

Arquivos: `src/pages/ModuleLessons.tsx`, `src/pages/AcessoNegado.tsx`,
`src/pages/ForgotPassword.tsx`, novo `src/pages/ResetPassword.tsx`,
`src/App.tsx` (rota nova).

### 2.1 Furo: `/aulas/:moduleId` não valida produto (achado crítico)

**Problema:** `ProtectedRoute` só verifica "é comprador de algum produto"
(`compradores_autorizados`). O bloqueio por produto específico só existe
visualmente na listagem (`Aulas.tsx`/`ModuleCard.tsx`); a rota do módulo em si
não checa `module_sections.product_slug`. Resultado: quem comprou um produto
avulso de R$27 acessa por URL direta o conteúdo de um módulo de R$997.

**Correção:** `ModuleLessons.tsx` passa a buscar a seção do módulo (via
`modules.section_id → module_sections`), obter `product_slug`, e checar
`hasProduct(product_slug)` de `useUserProducts`. Sem acesso, redireciona para
`/acesso-negado` passando o slug do produto faltante (via `state` do
`useNavigate`/`<Navigate>`), antes de renderizar qualquer conteúdo do módulo
(incluindo a query de `lessons`, que não deve nem disparar).

### 2.2 `/acesso-negado`: checkout placeholder + logout forçado

**Problema:** URL de checkout hardcoded (`pay.kiwify.com.br/seu-produto`,
TODO explícito) e `signOut()` incondicional no `useEffect` de montagem —
desloga mesmo quando o usuário só está sem *um* produto específico.

**Correção:** a página recebe o produto faltante via `state` de navegação
(fallback: nenhum produto específico → mensagem genérica de "sem acesso").
Usa a mesma lista de produtos/links reais já usada em `MeusProdutos.tsx` para
montar o CTA de compra do produto certo. Remove o `signOut()` automático;
adiciona um link para áreas que o usuário já acessa (`/dashboard` ou
`/meus-produtos`) e um botão de logout manual opcional.

### 2.3 Fluxo "esqueci a senha" incompleto

**Problema:** `ForgotPassword.tsx` dispara `resetPasswordForEmail` com
`redirectTo: /login`, mas não existe nenhuma página que trate o token de
recovery e permita definir nova senha — o link do email cai em `/login`
comum, sem ação possível.

**Correção:** nova página `src/pages/ResetPassword.tsx`, rota
`/reset-password`, que lê a sessão de recovery que o Supabase estabelece a
partir do link do email e chama `supabase.auth.updateUser({ password })` num
form simples (senha + confirmação). `ForgotPassword.tsx` passa a apontar
`redirectTo` para essa rota e a normalizar o email (`trim().toLowerCase()`)
antes de chamar `resetPasswordForEmail` — hoje é o único ponto de entrada de
credenciais sem essa normalização.

### 2.4 Validação de login com senha padrão

Confirmar manualmente (sem migration/código novo) que um usuário criado pelo
webhook com senha `123456` consegue logar — a normalização já existe em
`AuthContext.signIn`. Faz parte da checklist de validação local, não é uma
mudança de código.

## 3. Carrossel de módulos em Aulas

Arquivos: `src/components/aulas/ModuleGrid.tsx` (substituído por trilhas),
`src/components/aulas/ModuleCard.tsx` (redimensionado).

**Problema:** módulos hoje em grid fixo (`grid-cols-2..5`), cards grandes
(`AspectRatio 3/4` + paddings generosos), ocupando muita altura de tela.

**Correção:** uma trilha horizontal por `module_sections`, usando o
`Carousel`/`CarouselPrevious`/`CarouselNext` do shadcn (Embla, já usado no
projeto em `AnnouncementCarousel`), com:
- Setas de navegação visíveis no desktop, ocultas/substituídas por swipe no
  mobile (comportamento nativo do Embla).
- `CarouselItem` com `basis` responsivo (ex.: `basis-[42%]` no mobile,
  `basis-1/4` a `basis-1/5` em telas largas) para mostrar mais cards por
  linha sem esticar a altura.
- `ModuleCard` redimensionado: `AspectRatio` menor e paddings reduzidos,
  mantendo progresso (`Progress`) e overlay de cadeado para módulos sem
  acesso.
- `ModuleAccordion.tsx` (código morto, sem uso hoje) não é tocado — fica
  registrado aqui como achado, não como parte do escopo.

### 3.1 Testes/validação

Sem suíte de testes de UI automatizada no projeto para este componente — a
validação é manual: rodar local, checar `/aulas` em desktop (mais cards por
linha, menos altura) e mobile (swipe funcional, sem overflow horizontal da
página).

## Ordem de implementação sugerida

1. Migration `granted_by_product` + correções do webhook (1.1–1.6) + testes (1.8).
2. Fix de acesso `/aulas/:moduleId` + `/acesso-negado` (2.1–2.2) — depende de
   `useUserProducts`/`module_sections`, não depende do webhook.
3. Fluxo de reset de senha (2.3) — independente das anteriores.
4. Carrossel de módulos (3) — independente das anteriores, puramente UI.

## Validação final (checklist do usuário)

- `npm run test`, `npm run lint`, `npm run build`.
- Rodar local (`npm run dev`) e conferir `/login`, `/aulas`, `/aulas/:moduleId`
  (com e sem acesso ao produto), `/meus-produtos`, `/acesso-negado`,
  `/forgot-password` → `/reset-password`.
- Não disparar webhook real contra Kiwify/Supabase de produção sem
  confirmação explícita e email de teste.
- PR aberto no GitHub com link para revisão do usuário.
