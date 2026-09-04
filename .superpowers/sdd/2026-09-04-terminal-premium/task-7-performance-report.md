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
- O Dashboard preloads somente a primeira imagem relevante de banner.
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

## Bundle

Medição feita com `npm run build` antes e depois das mudanças, no mesmo checkout e com as mesmas dependências:

| Medida | Antes | Depois | Redução |
|---|---:|---:|---:|
| Chunk JavaScript inicial | 1.205,56 kB | 515,04 kB | 690,52 kB (57,28%) |
| Chunk inicial gzip | 336,67 kB | 154,47 kB | 182,20 kB (54,12%) |

Chunks de rota relevantes no build final:

- `Aulas`: 35,11 kB; 10,26 kB gzip.
- `Login`: 4,19 kB; 1,65 kB gzip.

O entrypoint final permanece ligeiramente acima do limite de aviso de 500 kB do Vite, mas caiu mais de 57% e as páginas deixaram de compor o bundle inicial.

## Verificações

- Testes focados: 8 arquivos, 22/22 testes.
- Suíte completa: 17 arquivos, 69/69 testes.
- Lint dos 18 arquivos TypeScript/TSX tocados: 0 erros e 0 warnings.
- TypeScript: `npx tsc --noEmit` concluído com código zero.
- Build: 2.769 módulos transformados e build concluído.
- Higiene: `git diff --check` sem erros e nenhuma referência restante a `/perfil` em `src`.

Avisos não bloqueantes permanecem na saída geral: flags futuras do React Router em testes preexistentes, `fetchPriority` no ambiente React 18/jsdom, base Browserslist desatualizada e o entrypoint final acima de 500 kB.

## Limites preservados

Nenhuma alteração foi feita em `Register`, `AcessoNegado`, `AuthContext`, `docs/` ou `supabase/.temp/`. As mudanças preexistentes em `supabase/.temp/cli-latest` e `supabase/.temp/linked-project.json` foram mantidas fora do escopo e do commit.

Mensagem do commit desta onda:

```text
fix(design): polish performance and mobile interactions
```
