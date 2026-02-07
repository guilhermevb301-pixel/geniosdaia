
# Plano: Banco de Prompts com Accordion e Sessoes Dinamicas

## Resumo da Mudanca

Transformar a pagina `/prompts` de um layout com abas (Tabs) para um layout com acordeoes (Accordion), onde cada secao pode ser expandida/recolhida. Alem disso, adicionar uma nova categoria "Modificador de Imagens" e permitir que mentores gerenciem prompts e secoes diretamente na pagina.

## Arquitetura Proposta

### Estrutura Visual
```text
BANCO DE PROMPTS
[Buscar prompts...]

v Imagens                    <- Accordion aberto
  [Grid de cards de prompts de imagem]

> Videos                     <- Accordion fechado

> Modificador de Imagens     <- Nova secao

[+ Adicionar Secao] (apenas para mentores)
```

### Nova Categoria no Banco de Dados

A tabela `prompts` usa a coluna `category` (text) para filtrar. Atualmente tem: `video`, `image`. Vamos adicionar `modifier` para "Modificador de Imagens".

Nao e necessario alterar o schema pois `category` ja e um campo texto livre.

## Detalhes Tecnicos

### Parte 1: Nova Pagina com Accordion

**Arquivo:** `src/pages/Prompts.tsx`

Substituir o componente `Tabs` por `Accordion` do Radix UI:

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Categorias disponiveis
const categories = [
  { value: "image", label: "Imagens", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "modifier", label: "Modificador de Imagens", icon: Wand2 }, // Nova!
];

// Agrupar prompts por categoria
const groupedPrompts = useMemo(() => {
  return categories.map(cat => ({
    ...cat,
    prompts: prompts?.filter(p => 
      p.category === cat.value &&
      (searchQuery === "" || matchesSearch(p, searchQuery))
    ) || []
  }));
}, [prompts, searchQuery]);

// Renderizar
<Accordion type="multiple" defaultValue={["image"]}>
  {groupedPrompts.map((group) => (
    <AccordionItem key={group.value} value={group.value}>
      <AccordionTrigger className="flex items-center gap-2">
        <group.icon className="h-5 w-5" />
        {group.label} ({group.prompts.length})
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### Parte 2: Permitir Mentores Gerenciarem Prompts

Atualmente apenas admins podem gerenciar prompts via `/admin/prompts`. Precisamos:

1. **Atualizar RLS** para permitir mentores:
   - A tabela `prompts` tem RLS que permite apenas `admin`. Precisamos adicionar `mentor`.

2. **Adicionar botoes de edicao inline** na pagina `/prompts`:
   - Detectar se o usuario e mentor ou admin usando `useIsMentor()` e `useIsAdmin()`
   - Mostrar botao "+" para novo prompt
   - Mostrar botoes de editar/excluir em cada card

```tsx
const { isMentor } = useIsMentor();
const { isAdmin } = useIsAdmin();
const canManage = isMentor || isAdmin;

// No header
{canManage && (
  <Button onClick={() => setShowNewPromptModal(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Novo Prompt
  </Button>
)}

// Em cada card
{canManage && (
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
    <Button size="icon" variant="secondary" onClick={() => openEdit(prompt)}>
      <Pencil className="h-4 w-4" />
    </Button>
  </div>
)}
```

### Parte 3: Migracao do Banco de Dados

Adicionar permissao para mentores gerenciarem prompts:

```sql
-- Atualizar RLS para prompts
DROP POLICY IF EXISTS "Admins can manage prompts" ON prompts;
CREATE POLICY "Admins and mentors can manage prompts"
ON prompts FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'mentor'));

-- Atualizar RLS para prompt_variations
DROP POLICY IF EXISTS "Admins and mentors can manage prompt_variations" ON prompt_variations;
-- (ja existe, verificar se esta correto)
```

### Parte 4: Componente de Edicao Inline

Reutilizar o modal de edicao existente em `AdminPrompts.tsx` como componente compartilhado:

**Novo arquivo:** `src/components/prompts/PromptEditorModal.tsx`

Extrair a logica do dialog de criar/editar do `AdminPrompts.tsx` para um componente reutilizavel que pode ser usado tanto em `/admin/prompts` quanto em `/prompts`.

## Arquivos a Modificar

1. **`src/pages/Prompts.tsx`** (modificar)
   - Substituir Tabs por Accordion
   - Adicionar nova categoria "modifier" 
   - Adicionar botoes de gerenciamento para mentores
   - Integrar modal de edicao

2. **`src/components/prompts/PromptEditorModal.tsx`** (novo)
   - Extrair logica de criar/editar do AdminPrompts
   - Componente reutilizavel com props para criar/editar

3. **`src/pages/admin/AdminPrompts.tsx`** (modificar)
   - Adicionar categoria "modifier" nas abas
   - Usar novo componente PromptEditorModal

4. **Migracao SQL** (nova)
   - Atualizar RLS de `prompts` para incluir mentores

## Fluxo do Usuario

### Aluno
1. Abre `/prompts`
2. Ve 3 secoes em accordion: Imagens, Videos, Modificador de Imagens
3. Clica em uma secao para expandir
4. Ve os cards de prompts
5. Clica em um card para ver detalhes e copiar

### Mentor
1. Abre `/prompts`
2. Ve as mesmas secoes + botao "Novo Prompt"
3. Ao passar mouse sobre um card, ve botoes de editar/excluir
4. Pode criar, editar e excluir prompts diretamente na pagina

## Interface Visual do Accordion

```text
+------------------------------------------+
| Banco de Prompts                         |
| Prompts prontos para usar com IAs        |
|                                          |
| [Buscar prompts...] [+ Novo Prompt]      |
+------------------------------------------+
|                                          |
| v Imagens (12)                           |
|   +--------+ +--------+ +--------+       |
|   |  Card  | |  Card  | |  Card  |       |
|   +--------+ +--------+ +--------+       |
|   +--------+ +--------+ +--------+       |
|   |  Card  | |  Card  | |  Card  |       |
|   +--------+ +--------+ +--------+       |
|                                          |
| > Videos (5)                             |
|                                          |
| > Modificador de Imagens (3)             |
|                                          |
+------------------------------------------+
```

## Beneficios

- Layout mais organizado e expansivel
- Mentores podem gerenciar prompts sem acessar area admin
- Nova categoria para modificadores de imagem
- Menos clicks para ver conteudo (accordion permite multiplos abertos)
- Busca global funciona em todas as secoes
