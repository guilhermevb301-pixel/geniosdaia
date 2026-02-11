

# Corrigir Bugs da Pagina de Aulas

## Problema Principal
Quando o usuario sai e volta para a pagina `/aulas`, os modulos somem e a pagina fica "desconfigurada" (sem modulos, sem fotos). Isso acontece porque:

1. **Sem estado de carregamento**: A pagina nao verifica se os dados estao carregando. Quando as queries ainda estao buscando dados, `modulesData` e `undefined`, que vira um array vazio, mostrando o estado "Sem modulos disponiveis" em vez de um loading spinner.

2. **Queries independentes sem sincronizacao**: A pagina faz 4 queries separadas (sections, modules, lessons, progress) e renderiza com base no que estiver disponivel no momento, causando flickers.

3. **Imagens nao reaparecem**: O componente `ImageWithSkeleton` usa estado interno (`isLoaded`, `hasError`). Quando o componente remonta, ele comeca do zero e pode falhar se a URL mudar levemente ou se houver problema de cache.

## Solucao

### 1. Adicionar estado de carregamento na pagina Aulas
- Verificar `isLoading` / `isPending` das queries de modules e lessons
- Mostrar um skeleton/spinner enquanto os dados carregam, em vez do estado vazio
- Isso evita o flash de "Sem modulos disponiveis"

### 2. Mostrar skeletons nos cards enquanto carregam
- Criar um componente `ModuleCardSkeleton` com a mesma estrutura visual do `ModuleCard`
- Exibir grid de skeletons durante o carregamento

### 3. Manter dados anteriores durante refetch
- Usar `placeholderData: keepPreviousData` nas queries para manter os dados antigos visiveis enquanto busca novos
- Isso elimina o "piscar" ao navegar de volta

## Detalhes Tecnicos

**Arquivos afetados:**

1. **`src/pages/Aulas.tsx`**
   - Extrair `isLoading` das queries de modules e lessons
   - Importar `keepPreviousData` do React Query e usar como `placeholderData`
   - Renderizar skeleton grid quando `isLoading` for true em vez do empty state
   - So mostrar empty state quando os dados carregaram E estao vazios

2. **`src/components/aulas/ModuleGrid.tsx`**
   - Aceitar prop `isLoading` opcional
   - Renderizar grid de skeletons quando `isLoading` for true

3. **`src/components/aulas/ModuleCardSkeleton.tsx`** (novo arquivo)
   - Componente skeleton com mesma estrutura do `ModuleCard` (AspectRatio 3/4, titulo, barra de progresso)

4. **`src/pages/ModuleLessons.tsx`**
   - Adicionar `keepPreviousData` nas queries de lessons e progress
   - Garantir que invalidacoes de cache (apos marcar aula completa) afetem tambem a query global de lessons

