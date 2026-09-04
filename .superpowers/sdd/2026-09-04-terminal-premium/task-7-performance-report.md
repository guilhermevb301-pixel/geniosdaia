# Tarefa 7 — performance, carrosséis, touch e links

Data: 2026-09-04

## Status

CONCLUÍDO

## Escopo entregue

- Todas as páginas de `src/App.tsx` passaram a usar `React.lazy`, com um único `Suspense` no nível das rotas e fallback discreto com `role="status"`. Rotas e guards existentes foram preservados.
- `/aulas` virou um chunk independente.
- O carrossel base agora remove os listeners `select` e `reInit` com os mesmos callbacks registrados.
- Setas e indicadores do `AnnouncementCarousel` usam alvos de toque de 44 px; o ponto interno permanece em 8 px.
- Somente a imagem do banner inicialmente visível recebe prioridade alta.
- O Dashboard preloads exclusivamente `banners[0]?.image_url`; se o primeiro slide não tiver imagem, nenhum slide posterior é antecipado.
- Somente as capas da primeira trilha visível de Aulas recebem prioridade/preload, limitadas às cinco capas potencialmente visíveis nessa trilha. Trilhas posteriores permanecem lazy.
- O botão `Desbloquear` do `ModuleCarousel` passou a ter 44 px de altura.
- As duas referências a `/perfil` foram removidas: o rodapé lateral exibe o nível sem navegação, e conquistas aponta para `/certificados` com a copy `Ver certificados`.
- O prefetch de `/aulas` agora grava a consulta em `["modules"]`, com o mesmo formato consumido pela página.

## TDD

### RED

A primeira bateria focada, antes das correções de produção, terminou com 7 arquivos falhando e 10 testes falhando. As falhas confirmaram:

- `/aulas` era renderizada sincronamente, sem fallback de rota;
- o listener `reInit` não era removido pelo carrossel base;
- setas, indicadores e `Desbloquear` tinham menos de 44 px;
- banners e todas as trilhas recebiam prioridade eager;
- o Dashboard enviava mais de uma imagem ao preload;
- `/perfil` permanecia nos dois componentes;
- o prefetch preenchia `["modules-with-sections"]`, não `["modules"]`.

Um teste integrado adicional de Aulas confirmou em RED que a segunda trilha também gerava imagem eager. O teste do efeito de atividade confirmou em RED a dependência ausente reportada pelo lint.

### GREEN

Testes focados finais:

```text
npm test -- src/test/app-lazy-routes.test.tsx \
  src/test/carousel-cleanup.test.tsx \
  src/test/announcement-carousel.test.tsx \
  src/test/dashboard-performance.test.tsx \
  src/test/module-library.test.tsx \
  src/test/aulas-image-priority.test.tsx \
  src/test/navigation-links.test.tsx \
  src/test/prefetch-routes.test.ts

Test Files  8 passed (8)
Tests       22 passed (22)
```

### Fix round 1

- O contrato de rotas foi centralizado em `APP_ROUTE_MANIFEST`, consumido diretamente por `App.tsx`, mantendo todos os imports de páginas via `React.lazy` e os guards reais por categoria.
- Os testes de rotas cobrem os 30 paths compartilhados e todas as categorias (`public`, `protected`, `admin`, `mentor` e `mentee`) sem substituir os guards por componentes identidade.
- Com até cinco banners, permanecem os dots com alvo de 44 px e ponto interno de 8 px. Acima disso, o carrossel troca os dots por um status compacto e acessível (`2 de 8`), mantendo a navegação pelas setas.
- O caso em que o primeiro banner não tem imagem agora garante que o Dashboard não antecipa a imagem do segundo slide.

Testes focados desta correção:

```text
npm test -- src/test/dashboard-performance.test.tsx \
  src/test/announcement-carousel.test.tsx \
  src/test/app-lazy-routes.test.tsx

Test Files  3 passed (3)
Tests       20 passed (20)
```

## Bundle

Medição reproduzida diretamente em worktrees isoladas dos commits indicados, usando o mesmo `node_modules`. `package.json` e `package-lock.json` são idênticos entre os dois hashes.

| Medida | Antes (`1453e0c`) | Depois (`6a650f6`) | Redução |
|---|---:|---:|---:|
| Chunk JavaScript inicial | 1.209,40 kB | 515,04 kB | 694,36 kB (57,41%) |
| Chunk inicial gzip | 336,72 kB | 154,47 kB | 182,25 kB (54,13%) |

### Reprodução do bundle

Comandos executados a partir do repositório `/Users/guilhermefvb/Documents/CLAUDE/geniosdaia-app`:

```bash
git diff --quiet 1453e0c 6a650f6 -- package.json package-lock.json

git worktree add --detach /tmp/geniosdaia-task7-1453e0c 1453e0c
cd /tmp/geniosdaia-task7-1453e0c
ln -s /Users/guilhermefvb/Documents/CLAUDE/geniosdaia-app/node_modules node_modules
npm run build

cd /Users/guilhermefvb/Documents/CLAUDE/geniosdaia-app
git worktree add --detach /tmp/geniosdaia-task7-6a650f6 6a650f6
cd /tmp/geniosdaia-task7-6a650f6
ln -s /Users/guilhermefvb/Documents/CLAUDE/geniosdaia-app/node_modules node_modules
npm run build

cd /Users/guilhermefvb/Documents/CLAUDE/geniosdaia-app
git worktree remove --force /tmp/geniosdaia-task7-1453e0c
git worktree remove --force /tmp/geniosdaia-task7-6a650f6
```

Saídas verificadas:

```text
1453e0c  dist/assets/index-C_VvaHVu.js  1,209.40 kB | gzip: 336.72 kB
6a650f6  dist/assets/index-DB-yPlCd.js    515.04 kB | gzip: 154.47 kB
```

Chunks de rota relevantes no build final:

- `Aulas`: 35,11 kB; 10,26 kB gzip.
- `Login`: 4,19 kB; 1,65 kB gzip.

O entrypoint final permanece ligeiramente acima do limite de aviso de 500 kB do Vite, mas caiu mais de 57% e as páginas deixaram de compor o bundle inicial.

O build da correção round 1, após centralizar o manifesto de 30 rotas, gerou entrypoint de 516,13 kB / 154,93 kB gzip. `/aulas` permaneceu isolada em 35,11 kB / 10,25 kB gzip. A tabela acima preserva a medição reproduzível antes/depois da implementação original de lazy loading solicitada para a Tarefa 7.

## Verificações

- Testes focados: 8 arquivos, 30/30 testes.
- Suíte completa: 17 arquivos, 79/79 testes.
- Lint dos 7 arquivos TypeScript/TSX tocados nesta correção: 0 erros e 0 warnings.
- Lint global executado: 10 erros e 12 warnings preexistentes fora do escopo, incluindo `command.tsx`, `textarea.tsx`, páginas admin e `tailwind.config.ts`.
- TypeScript: `npx tsc --noEmit` concluído com código zero.
- Build: 2.770 módulos transformados e build concluído.
- Higiene: `git diff --check` sem erros e nenhuma referência restante a `/perfil` em `src`.

Avisos não bloqueantes permanecem na saída geral: flags futuras do React Router em testes preexistentes, base Browserslist desatualizada e o entrypoint final acima de 500 kB.

### Fix round 2 final

- `ImageWithSkeleton` passou a emitir o atributo DOM lowercase `fetchpriority`, preservando os valores `high` para imagens prioritárias e `auto` para as demais.
- Os testes de prioridade (`aulas-image-priority`, `module-library` e `announcement-carousel`) passaram 16/16 sem o warning de propriedade desconhecida que o React 18 emitia para `fetchPriority`.
- Nenhum teste precisou ser alterado para esta correção.
- Bateria focada completa da Tarefa 7: 8 arquivos e 30/30 testes aprovados, sem warning de `fetchPriority`.
- Suíte completa: 17 arquivos e 79/79 testes aprovados.
- Lint de `src/components/ui/image-with-skeleton.tsx`: 0 erros e 0 warnings.
- Build do HEAD: 2.770 módulos transformados; entrypoint de 516,13 kB / 154,94 kB gzip e chunk `Aulas` de 35,11 kB / 10,25 kB gzip.

## Limites preservados

Nenhuma alteração foi feita em `Register`, `AcessoNegado`, `AuthContext`, `docs/` ou `supabase/.temp/`. As mudanças preexistentes em `supabase/.temp/cli-latest` e `supabase/.temp/linked-project.json` foram mantidas fora do escopo e do commit.

Mensagem do commit original:

```text
fix(design): polish performance and mobile interactions
```

Mensagem do commit da correção:

```text
fix(design): harden lazy routes and compact carousel status
```
