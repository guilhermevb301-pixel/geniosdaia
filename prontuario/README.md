# Prontuário Digital — Dr. Mizael Cardoso 🦷

Prontuário odontológico completo, em verde, feito sob medida para o consultório do Dr. Mizael Cardoso.

## O que ele faz

- **Início** — saudação do dia, agenda de hoje com confirmação por WhatsApp, pendências, aniversariantes da semana, retornos atrasados e gráfico de atendimentos.
- **Pacientes** — busca por nome/telefone/CPF, 7 ordenações, filtros (alertas médicos, aniversariantes, retorno pendente, favoritos, etiquetas) e três visualizações: cartões, lista e **quadro por etapa** (arrastar e soltar: Avaliação → Orçamento → Em tratamento → Manutenção → Alta).
- **Prontuário do paciente**
  - Alertas de saúde em destaque (alergias, anticoagulante, gestante…) — aparecem também na agenda e ao abrir a ficha.
  - Avisos fixados (post-its coloridos com informações do paciente).
  - Anamnese com checklist, hábitos e ficha para assinatura.
  - **Odontograma interativo** (FDI, permanente/decídua/mista): cárie, restauração, provisória, selante, fratura por face; canal, coroa, implante, prótese, ausente e extração por dente; desfazer (Ctrl+Z), anotação por dente e "adicionar ao plano" em um clique.
  - Plano de tratamento/orçamento com status, desconto e progresso — concluir um procedimento registra a evolução automaticamente.
  - Evolução clínica em linha do tempo com modelos rápidos.
  - **Imagens e exames**: arrastar/colar/câmera, negatoscópio (negativo), zoom, brilho/contraste e comparação antes × depois.
  - Lembretes por paciente (aparecem no sino de notificações).
  - Financeiro com pagamentos, saldo, recibo e cobrança gentil por WhatsApp.
  - Documentos com cabeçalho do doutor: receituário (com aviso de alergia à penicilina), atestado, declaração, orçamento, anamnese e prontuário completo — imprimir ou salvar em PDF.
- **Agenda** semanal/diária com arrastar para remarcar, detecção de conflito e linha do "agora".
- **Lembretes**, **Financeiro** (faturamento mensal, formas de pagamento, saldos a receber) e **Configurações** (CRO, assinatura digitalizada, preços, etiquetas, mensagens do WhatsApp, PIN de bloqueio, tema escuro, backup).
- Busca global com **Ctrl + K**, **modo discreto** (desfoca nomes e telefones quando o paciente está olhando a tela) e tema claro/escuro.

## Onde ficam os dados

- **Supabase** (projeto `wubzprfmwsfvwvptywlf`): tabelas `patients`, `appointments`, `clinic_settings` e o bucket privado `prontuario` para imagens.
- Segurança por **RLS**: cada login só enxerga os próprios registros. O navegador usa apenas a chave pública *anon*.
- O app mantém um cache local e continua funcionando sem internet; as alterações são enviadas quando a conexão volta (o status aparece no topo: "Salvo na nuvem").

## Colocar no ar — automático (recomendado)

O script `scripts/publicar.mjs` faz tudo sozinho: build, banco de dados (tabelas, RLS, bucket, limite de 3 contas), publicação na Vercel como **mizaelprontuario.vercel.app**, configuração do login e conferência final. Nenhuma chave é impressa na tela.

Precisa de duas chaves de acesso (crie e guarde como variáveis de ambiente — nunca cole em chats):

| Variável | Onde criar |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) → *Generate new token* |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → *Create Token* (escopo: sua conta, sem expiração curta) |
| `DOCTOR_EMAIL` e `DOCTOR_PASSWORD` *(opcional)* | e-mail e senha iniciais do Dr. Mizael — se não informar, ele cria no site em “Primeiro acesso? Criar conta” |

```sh
cd prontuario
npm run publicar
```

Para atualizar o site depois de qualquer mudança no código, é só rodar `npm run publicar` de novo.

**Segurança:** as tabelas só respondem a usuários logados (RLS: cada conta vê apenas os próprios dados), as imagens ficam em bucket privado e o banco aceita no máximo **3 contas** — ninguém de fora consegue se cadastrar depois disso. A confirmação por e-mail fica desligada para o doutor entrar direto.

## Colocar no ar — manual (alternativa)

1. **Banco:** cole [`supabase/schema.sql`](./supabase/schema.sql) no [SQL Editor](https://supabase.com/dashboard/project/wubzprfmwsfvwvptywlf/sql/new) e clique em **Run**.
2. **Login:** em *Authentication → URL Configuration* use `https://mizaelprontuario.vercel.app` como Site URL e Redirect URL; em *Sign In / Providers → Email*, desligue *Confirm email*.
3. **Vercel:** em [vercel.com/new](https://vercel.com/new) importe o repositório, **Project Name** `mizaelprontuario`, **Root Directory** `prontuario`, **Deploy**.

> ⚠️ Nunca coloque a chave **service_role** no código ou na Vercel. Se ela foi compartilhada em algum lugar, gere uma nova no painel do Supabase (Project Settings → API Keys).

## Desenvolvimento

```sh
cd prontuario
npm install
npm run dev      # http://localhost:5174
npm run build    # gera dist/index.html (arquivo único)
```

Tecnologias: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Framer Motion + Supabase.

---
Feito com 💚 para o Dr. Mizael Cardoso.
