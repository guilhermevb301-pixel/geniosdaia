
# Plano: Accordion de Banco de Prompts na Sidebar

## Entendimento do Pedido

O usuário quer que o item "Banco de Prompts" na sidebar seja um menu expansivel (como o "Gerenciar") que ao clicar mostra 3 subcategorias:
- Imagens
- Videos  
- Modificador de Imagens

Cada subcategoria leva para a mesma pagina `/prompts`, mas com a categoria pre-selecionada.

## Arquitetura Proposta

### Rotas
Usaremos query params para filtrar a categoria:
- `/prompts` - Mostra todas as categorias
- `/prompts?category=image` - Expande automaticamente "Imagens"
- `/prompts?category=video` - Expande automaticamente "Videos"  
- `/prompts?category=modifier` - Expande automaticamente "Modificador de Imagens"

### Estrutura Visual na Sidebar
```text
Templates
v Banco de Prompts    <- Clicavel, expande submenu
  > Imagens           <- Link para /prompts?category=image
  > Videos            <- Link para /prompts?category=video
  > Modificador       <- Link para /prompts?category=modifier
Meus GPTs
Eventos
Desafios
```

## Detalhes Tecnicos

### Parte 1: Modificar SidebarContent.tsx

1. Remover "Banco de Prompts" da lista `tools`
2. Adicionar um Collapsible para "Banco de Prompts" similar ao "Gerenciar"
3. Adicionar subcategorias como links para `/prompts?category=xxx`
4. Manter estado de expansao quando estiver na rota `/prompts`

```tsx
// Novas subcategorias do Banco de Prompts
const promptCategories = [
  { label: "Imagens", value: "image", icon: Image },
  { label: "Vídeos", value: "video", icon: Video },
  { label: "Modificador de Imagens", value: "modifier", icon: Wand2 },
];

// Estado para controlar expansao
const [promptsOpen, setPromptsOpen] = useState(
  location.pathname.startsWith("/prompts")
);

// Verificar se subcategoria esta ativa
const isPromptCategoryActive = (category: string) => {
  const params = new URLSearchParams(location.search);
  return location.pathname === "/prompts" && params.get("category") === category;
};

// Renderizar
<Collapsible open={promptsOpen} onOpenChange={setPromptsOpen}>
  <CollapsibleTrigger className="w-full">
    <div className="flex items-center justify-between ...">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-amber-400" />
        <span>Banco de Prompts</span>
      </div>
      <ChevronDown className={cn("h-4 w-4", promptsOpen && "rotate-180")} />
    </div>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="ml-4 mt-1 space-y-1 border-l-2 border-amber-400/30 pl-4">
      {promptCategories.map((cat) => (
        <Link
          key={cat.value}
          to={`/prompts?category=${cat.value}`}
          onClick={handleClick}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            isPromptCategoryActive(cat.value)
              ? "text-amber-400 bg-amber-400/10"
              : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-muted"
          )}
        >
          <cat.icon className="h-4 w-4" />
          {cat.label}
        </Link>
      ))}
    </div>
  </CollapsibleContent>
</Collapsible>
```

### Parte 2: Modificar Prompts.tsx

1. Ler o query param `category` da URL
2. Se existir, abrir apenas essa categoria no accordion
3. Se nao existir, manter comportamento atual (todas abertas)

```tsx
import { useSearchParams } from "react-router-dom";

const [searchParams] = useSearchParams();
const categoryParam = searchParams.get("category") as PromptCategory | null;

// Definir quais categorias abrir por padrao
const defaultOpenCategories = useMemo(() => {
  if (categoryParam && categories.some(c => c.value === categoryParam)) {
    return [categoryParam];
  }
  // Fallback: abrir categorias com prompts
  return groupedPrompts.filter((g) => g.prompts.length > 0).map((g) => g.value);
}, [categoryParam, groupedPrompts]);
```

## Arquivos a Modificar

1. **`src/components/layout/SidebarContent.tsx`**
   - Remover "Banco de Prompts" da lista tools
   - Adicionar Collapsible com subcategorias
   - Importar icones Video e Wand2
   - Adicionar estado promptsOpen

2. **`src/pages/Prompts.tsx`**
   - Importar useSearchParams
   - Ler parametro category da URL
   - Ajustar defaultOpenCategories baseado no parametro

## Fluxo do Usuario

1. Usuario ve "Banco de Prompts" na sidebar com seta de expansao
2. Clica para expandir e ve 3 subcategorias
3. Clica em "Imagens" -> vai para /prompts?category=image
4. A pagina abre com apenas a secao "Imagens" expandida
5. Na sidebar, "Imagens" fica destacado mostrando que esta ativo

## Beneficios

- Navegacao mais intuitiva diretamente da sidebar
- Usuario sabe quais tipos de prompts existem antes de entrar na pagina
- Acesso rapido a categoria especifica
- Consistente com o padrao do menu "Gerenciar" que ja existe
