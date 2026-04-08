

# Plano: Controle de Acesso por Compradores Autorizados (Kiwify)

## Antes de começar

Preciso saber: **qual é a URL da página de compra na Kiwify** para o botão "Comprar agora"? (ex: `https://pay.kiwify.com.br/seu-produto`)

Vou prosseguir com um placeholder que você poderá substituir depois.

---

## Visão geral

O sistema vai funcionar assim:

```text
Kiwify (compra) → Webhook → compradores_autorizados (INSERT email)
Kiwify (reembolso) → Webhook → compradores_autorizados (DELETE email)

Usuário faz login → Verifica email na tabela → Acesso liberado ou bloqueado
```

---

## Etapas

### 1. Criar tabela `compradores_autorizados`

Migration SQL:
- `id` uuid PK
- `email` text unique not null
- `created_at` timestamptz default now()
- RLS: SELECT para authenticated (verificar próprio email), ALL para admins/mentors gerenciarem
- Policy pública de SELECT restrita ao próprio email para a verificação funcionar

### 2. Criar Edge Function `kiwify-webhook`

- Recebe POST sem JWT (webhook externo)
- Lê `event` e `customer.email` do body
- `compra_aprovada` → INSERT email (on conflict do nothing)
- `compra_reembolsada`, `chargeback`, `subscription_canceled` → DELETE por email
- Retorna 200 sempre
- CORS headers incluídos
- Usa service role key para bypass de RLS

### 3. Criar hook `useIsAuthorizedBuyer`

- Query na tabela `compradores_autorizados` filtrando pelo email do usuário autenticado
- Retorna `{ isAuthorized, loading }`

### 4. Atualizar `ProtectedRoute`

- Após confirmar que o usuário está logado, verificar `useIsAuthorizedBuyer`
- Admins e mentors passam direto (bypass da verificação)
- Se não autorizado → redirecionar para `/acesso-negado`

### 5. Criar página `/acesso-negado`

- Mensagem: "Você ainda não tem acesso. Adquira o produto para continuar."
- Botão "Comprar agora" com link para a URL da Kiwify
- Faz logout automático ao montar a página
- Rota pública (não protegida)

### 6. Registrar rota no App.tsx

- Adicionar `/acesso-negado` como rota pública

---

## Detalhes técnicos

- A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` (já configurado) para fazer INSERT/DELETE sem RLS
- Admins/mentors não são bloqueados mesmo sem compra (bypass via `has_role`)
- A tabela precisa de uma policy que permita SELECT para authenticated users verificarem seu próprio email

