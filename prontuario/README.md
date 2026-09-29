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

## Colocar no ar (passo a passo)

### 1. Banco de dados (uma vez só)
1. Abra o [SQL Editor do Supabase](https://supabase.com/dashboard/project/wubzprfmwsfvwvptywlf/sql/new).
2. Cole todo o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**.
   (Se esquecer, o próprio app mostra essa tela com botão "Copiar SQL" depois do primeiro login.)

### 2. Login do doutor
- Em **Authentication → Users → Add user**, crie o usuário do Dr. Mizael (e-mail + senha) marcando **Auto Confirm User**.
- Depois, em **Authentication → Sign In / Providers**, desative **Allow new users to sign up** para ninguém mais criar conta.
- Em **Authentication → URL Configuration**, coloque `https://mizaelprontuario.vercel.app` em **Site URL** e em **Redirect URLs** (necessário para "Esqueci minha senha").

### 3. Vercel → `mizaelprontuario.vercel.app`
1. Em [vercel.com/new](https://vercel.com/new), importe o repositório `geniosdaia`.
2. **Project Name:** `mizaelprontuario` (é isso que gera o endereço `mizaelprontuario.vercel.app`).
3. **Root Directory:** `prontuario` (Framework: Vite — já detectado pelo `vercel.json`).
4. Clique em **Deploy**. Não precisa de variáveis de ambiente (a URL e a chave pública já estão no código; se quiser, pode sobrescrever com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

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
