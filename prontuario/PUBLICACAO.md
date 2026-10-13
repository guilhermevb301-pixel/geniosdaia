# Publicação do Prontuário Dr. Mizael

**Status:** não publicado — **rede bloqueada**.

## O que aconteceu (29/09/2026)

1. Teste de rede (passo 1):
   - `https://api.supabase.com/v1/projects` → código `000` (proxy respondeu 403 ao CONNECT)
   - `https://api.vercel.com/v2/user` → código `000` (proxy respondeu 403 ao CONNECT)
   - O proxy de saída do ambiente de nuvem nega esses hosts por política de rede do ambiente.
2. Como a rede estava bloqueada, `npm run publicar` **não foi executado**, conforme a instrução.
3. Verificações (usuário temporário, gravar/ler paciente, RLS anon, site 200 com "Dr. Mizael"): **não realizadas**, pois dependem das APIs acima.
4. Nenhuma alteração foi feita no script nem no schema.

## URL final

Nenhuma. A meta era `https://mizaelprontuario.vercel.app`.

## Como destravar

Nas configurações do ambiente de nuvem do Claude Code (menu do ambiente na barra de título da sessão → Edit → Network access), escolha um nível de acesso mais amplo ou adicione aos domínios permitidos:

- `api.supabase.com`
- `*.supabase.co` (para a verificação via REST/Auth do projeto)
- `api.vercel.com`
- `*.vercel.app` (para conferir o site)

Depois, rode de novo em uma sessão nova: `cd prontuario && SUPABASE_ACCESS_TOKEN=... VERCEL_TOKEN=... npm run publicar`
(ou rode esse comando localmente no seu computador, que não tem esse bloqueio).

Documentação dos níveis de acesso: https://code.claude.com/docs/en/claude-code-on-the-web
