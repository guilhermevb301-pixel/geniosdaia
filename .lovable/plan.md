

# Plano: Novo Formato para Modificador de Imagens

## Entendimento do Pedido

O "Modificador de Imagens" tem um formato diferente das outras categorias:

1. **Apenas mentores/admins podem criar e editar** - alunos só visualizam
2. **Sem imagens ou vídeos** - apenas texto
3. **Formato de lista agrupada**: Um título (ex: "🎨 Estilos de Imagem") com várias linhas de prompts em inglês + tradução em português

Exemplo de como deve aparecer:
```text
🎨 1. Estilos de Imagem (Image Styles)

change the style to cinematic realism → muda o estilo para realismo cinematográfico
change the style to editorial fashion photography → muda para estilo editorial de revista
change the style to soft pastel illustration → deixa a imagem com aparência de ilustração pastel suave
...
```

## Mudanças Necessárias

### 1. Novo Componente: ModifierCard

Criar um card específico para modificadores que:
- Mostra o título do grupo (ex: "🎨 Estilos de Imagem")
- Lista todas as variações como linhas copiáveis
- Cada linha mostra: `prompt em inglês → tradução`
- Botão de copiar individual em cada linha

```text
┌─────────────────────────────────────────────┐
│ 🎨 Estilos de Imagem (Image Styles)         │
├─────────────────────────────────────────────┤
│ change the style to cinematic realism    📋 │
│ → muda o estilo para realismo cinematográfico│
│─────────────────────────────────────────────│
│ change the style to editorial fashion    📋 │
│ → muda para estilo editorial de revista     │
│─────────────────────────────────────────────│
│ ...                                         │
└─────────────────────────────────────────────┘
```

### 2. Atualizar VariationEditor para Modificadores

Quando a categoria for "modifier":
- Esconder campos de upload de imagem/vídeo
- Cada variação tem apenas:
  - Campo para o prompt em inglês
  - Campo para a tradução em português

### 3. Atualizar Prompts.tsx

Renderizar `ModifierCard` ao invés de `PromptCard` quando `activeCategory?.value === "modifier"`.

### 4. Estrutura de Dados

Usar a estrutura existente de forma adaptada:
- `title`: Título do grupo (ex: "🎨 Estilos de Imagem")
- `description`: Descrição opcional
- `variations[]`: Cada item é uma linha
  - `content`: Prompt em inglês
  - `image_url`: Usar para guardar a tradução (reutilizando campo)
    - OU adicionar novo campo `translation` na tabela `prompt_variations`

**Recomendação**: Reutilizar o campo existente para evitar migration:
- `content` = prompt em inglês
- Usar formato: `prompt em inglês|||tradução` no content
- Ou usar `image_url` como campo de tradução (nome confuso mas funciona)

**Melhor opção**: Adicionar coluna `translation` na tabela `prompt_variations`

## Arquivos a Criar/Modificar

1. **`src/components/prompts/ModifierCard.tsx`** (NOVO)
   - Componente específico para exibir modificadores
   - Lista de prompts com tradução
   - Botão copiar individual

2. **`src/components/prompts/VariationEditor.tsx`** (MODIFICAR)
   - Quando `category === "modifier"`:
     - Esconder upload de imagem/vídeo
     - Adicionar campo de tradução
     - Layout simplificado

3. **`src/pages/Prompts.tsx`** (MODIFICAR)
   - Usar `ModifierCard` para categoria modifier
   - Remover botões de edição para alunos (apenas mentores veem)

4. **Migration** (OPCIONAL)
   - Adicionar coluna `translation` em `prompt_variations`
   - Ou usar abordagem sem migration

## Fluxo do Usuário

### Aluno:
1. Clica em "Modificador de Imagens" na sidebar
2. Vê lista de grupos (ex: "Estilos de Imagem", "Iluminação", etc.)
3. Cada grupo mostra várias linhas de prompts
4. Clica no ícone de copiar para copiar o prompt em inglês
5. **Não vê botões de editar/excluir**

### Mentor/Admin:
1. Pode ver botões de editar/excluir
2. Ao criar/editar, preenche título do grupo
3. Adiciona linhas com prompt + tradução
4. Não precisa fazer upload de imagens

## Visual Proposto

Para a página de Modificadores:

```text
┌───────────────────────────────────────────────────────┐
│  PROMPTS DE MODIFICADOR DE IMAGENS                    │
│  Prompts para modificar imagens existentes            │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🎨 Estilos de Imagem (Image Styles)      [✏️][🗑️] │
│  ├─────────────────────────────────────────────────┤ │
│  │ change the style to cinematic realism       [📋] │ │
│  │ → muda o estilo para realismo cinematográfico   │ │
│  │─────────────────────────────────────────────────│ │
│  │ change the style to editorial fashion       [📋] │ │
│  │ → muda para estilo editorial de revista         │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 💡 Iluminação (Lighting)                 [✏️][🗑️] │
│  ├─────────────────────────────────────────────────┤ │
│  │ add soft natural light from the left       [📋] │ │
│  │ → adiciona luz natural suave vindo da esquerda  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Implementação Técnica

### ModifierCard.tsx
```tsx
interface ModifierCardProps {
  prompt: Prompt;
  canManage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ModifierCard({ prompt, canManage, onEdit, onDelete }) {
  const variations = prompt.variations?.sort((a, b) => a.order_index - b.order_index);
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Prompt copiado!");
  };

  // Parse content - formato: "prompt em inglês" com tradução separada
  // Ou usar campo específico para tradução
  
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{prompt.title}</h3>
        {canManage && (
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
      <div className="divide-y">
        {variations?.map((v) => (
          <div key={v.id} className="p-3 flex items-start gap-3">
            <div className="flex-1">
              <p className="font-mono text-sm">{v.content}</p>
              {v.image_url && ( // Usando image_url como campo de tradução
                <p className="text-muted-foreground text-sm mt-1">
                  → {v.image_url}
                </p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleCopy(v.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

## Próximos Passos

1. Criar componente `ModifierCard.tsx`
2. Atualizar `VariationEditor.tsx` para esconder uploads quando modifier
3. Atualizar `Prompts.tsx` para usar ModifierCard
4. (Opcional) Adicionar coluna `translation` na tabela

