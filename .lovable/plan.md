
# Plano: Filtrar Prompts por Categoria na Sidebar

## Entendimento

Quando o usuario clica em uma subcategoria na sidebar (Imagens, Videos, Modificador), a pagina deve mostrar **somente** os prompts dessa categoria, sem mostrar as outras secoes em accordion.

## Mudanca Proposta

### Comportamento Atual
- `/prompts?category=image` → Mostra TODAS as categorias em accordion, com "Imagens" expandido

### Novo Comportamento  
- `/prompts?category=image` → Mostra **APENAS** os prompts de Imagens
- `/prompts?category=video` → Mostra **APENAS** os prompts de Videos
- `/prompts?category=modifier` → Mostra **APENAS** os prompts de Modificador
- `/prompts` (sem parametro) → Mostra todas as categorias em accordion (comportamento atual)

## Implementacao

**Arquivo:** `src/pages/Prompts.tsx`

### Logica de Filtragem

```tsx
// Se tem categoria na URL, filtrar para mostrar apenas essa
const filteredCategories = useMemo(() => {
  if (categoryParam && categories.some(c => c.value === categoryParam)) {
    return categories.filter(c => c.value === categoryParam);
  }
  return categories; // Sem filtro, mostra todas
}, [categoryParam]);

// Agrupar prompts usando categorias filtradas
const groupedPrompts = useMemo(() => {
  return filteredCategories.map((cat) => ({
    ...cat,
    prompts: prompts?.filter(
      (p) =>
        p.category === cat.value &&
        (searchQuery === "" || matchesSearch(p, searchQuery))
    ) || [],
  }));
}, [prompts, searchQuery, filteredCategories]);
```

### Titulo Dinamico

Quando uma categoria especifica esta selecionada, mostrar o nome dela no header:

```tsx
// Encontrar categoria ativa
const activeCategory = categoryParam 
  ? categories.find(c => c.value === categoryParam)
  : null;

// No header
<h1 className="text-2xl font-bold text-foreground">
  {activeCategory ? `Prompts de ${activeCategory.label}` : "Banco de Prompts"}
</h1>
```

### Accordion Sempre Aberto

Quando ha apenas uma categoria, manter o accordion aberto por padrao:

```tsx
const defaultOpenCategories = useMemo(() => {
  // Se esta filtrando por categoria, abrir ela
  if (categoryParam && categories.some(c => c.value === categoryParam)) {
    return [categoryParam];
  }
  // Caso contrario, abrir todas que tem prompts
  return groupedPrompts.filter((g) => g.prompts.length > 0).map((g) => g.value);
}, [categoryParam, groupedPrompts]);
```

## Resultado Visual

### Antes (clicando em Imagens):
```text
BANCO DE PROMPTS

v Imagens (12)      <- Expandido
  [cards...]
> Videos (5)        <- Fechado mas visivel  
> Modificador (3)   <- Fechado mas visivel
```

### Depois (clicando em Imagens):
```text
PROMPTS DE IMAGENS

v Imagens (12)      <- Unica categoria, expandida
  [cards...]
```

## Arquivo a Modificar

- `src/pages/Prompts.tsx`
  - Adicionar `filteredCategories` baseado no `categoryParam`
  - Atualizar `groupedPrompts` para usar `filteredCategories`
  - Titulo dinamico baseado na categoria ativa
  - Botao "Novo Prompt" usa categoria ativa como default
