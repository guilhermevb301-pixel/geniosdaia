

# Plano: Multiplas Variacoes de Prompts por Estilo

## Resumo

Atualmente cada prompt tem apenas UM texto e pode ter varias imagens de exemplo separadas. Voce quer que cada prompt seja uma "colecao" de variacoes, onde cada variacao tem seu proprio texto + imagem, navegaveis como paginas.

---

## Exemplo Visual

```text
Estrutura Atual:
+-------------------+
| Prompt Card       |
+-------------------+
      |
      v
+-----------------------------------+
| Titulo: "Influencer Skincare"    |
| Prompt: [texto unico]            |
| Imagens: img1, img2, img3        | <- imagens separadas do texto
+-----------------------------------+

Nova Estrutura:
+-------------------+
| Prompt Card       |
+-------------------+
      |
      v
+-----------------------------------+
| Titulo: "Influencer Skincare"    |
|                                   |
| [1/3]  < Prompt 1 >  [>]         |
| [Texto do Prompt 1]              |
| [Imagem do Prompt 1]             |
|-----------------------------------|
| [2/3]  < Prompt 2 >  [>]         |
| [Texto do Prompt 2]              |
| [Imagem do Prompt 2]             |
|-----------------------------------|
| etc...                           |
+-----------------------------------+
```

---

## Estrutura de Dados

### Tabela Nova: prompt_variations

Uma tabela separada para armazenar as variacoes de cada prompt:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| prompt_id | UUID | FK para prompts.id |
| content | TEXT | Texto do prompt desta variacao |
| image_url | TEXT | Imagem desta variacao (opcional) |
| order_index | INT | Ordem de exibicao |
| created_at | TIMESTAMP | Data de criacao |

### Impacto na Tabela prompts

- Manter `content` como prompt principal/descricao geral (ou deixar vazio se usar variacoes)
- Manter `thumbnail_url` como capa do card no grid
- Remover dependencia de `example_images` (as imagens agora vem das variacoes)

---

## Interface do Usuario (Visualizacao)

Ao clicar no card, o modal tera navegacao de paginas:

```text
+----------------------------------------------+
|  [X]                                         |
|  Titulo do Estilo                            |
|----------------------------------------------|
|                                              |
|  Prompt 1:                                   |
|  +----------------------------------------+  |
|  | Vertical portrait of a [DESCREVA...]   |  |
|  | wearing a clean white fitted tank...   |  |
|  +----------------------------------------+  |
|                                              |
|  [Imagem gerada com este prompt]             |
|  +------------------------+                  |
|  |                        |                  |
|  |   (imagem)             |                  |
|  |                        |                  |
|  +------------------------+                  |
|                                              |
|  [Copiar Prompt 1]                           |
|                                              |
|----------------------------------------------|
|           < 1/3 >  (paginacao)               |
+----------------------------------------------+
```

Botoes de navegacao permitem ir para Prompt 2, Prompt 3, etc.

---

## Interface de Edicao (Admin)

No painel admin, ao criar/editar um prompt:

```text
Titulo: [Influencer Skincare Style]
Descricao: [Prompts para fotos de influencer...]
Imagem de Capa: [upload thumbnail]

Variacoes:
+------------------------------------------+
| Variacao 1                          [-]  |
| Prompt: [textarea com texto]             |
| Imagem: [upload/preview]                 |
+------------------------------------------+
+------------------------------------------+
| Variacao 2                          [-]  |
| Prompt: [textarea com texto]             |
| Imagem: [upload/preview]                 |
+------------------------------------------+
         [+ Adicionar Variacao]
```

---

## Migracao do Banco de Dados

### 1. Criar tabela prompt_variations

```sql
CREATE TABLE public.prompt_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.prompt_variations ENABLE ROW LEVEL SECURITY;

-- Politica: qualquer usuario autenticado pode ler
CREATE POLICY "Anyone can read prompt_variations"
  ON public.prompt_variations FOR SELECT
  USING (true);

-- Politica: mentores podem inserir/atualizar/deletar
CREATE POLICY "Mentors can manage prompt_variations"
  ON public.prompt_variations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'mentor')
    )
  );
```

### 2. Migrar dados existentes (opcional)

Se houver prompts com `content` preenchido, criar uma variacao inicial:

```sql
INSERT INTO public.prompt_variations (prompt_id, content, order_index)
SELECT id, content, 0 FROM public.prompts WHERE content IS NOT NULL;
```

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| Migracao SQL | Criar tabela `prompt_variations` com RLS |
| `src/pages/admin/AdminPrompts.tsx` | Adicionar UI para gerenciar variacoes |
| `src/components/prompts/PromptCard.tsx` | Adicionar navegacao entre variacoes |
| `src/pages/Prompts.tsx` | Buscar variacoes junto com prompts |
| `src/integrations/supabase/types.ts` | Auto-gerado apos migracao |

---

## Fluxo do Mentor

1. Criar novo prompt com titulo e thumbnail
2. Adicionar variacoes (cada uma com texto + imagem)
3. Reordenar variacoes se necessario
4. Salvar

---

## Fluxo do Usuario

1. Ver galeria de prompts (thumbnails)
2. Clicar em um prompt
3. Ver modal com primeira variacao
4. Navegar entre variacoes usando setas < >
5. Copiar o prompt da variacao desejada

---

## Secao Tecnica

### Query para buscar prompts com variacoes

```typescript
const { data } = await supabase
  .from("prompts")
  .select(`
    *,
    variations:prompt_variations(
      id, content, image_url, order_index
    )
  `)
  .order("created_at", { ascending: false });
```

### Componente de navegacao no modal

```tsx
const [currentIndex, setCurrentIndex] = useState(0);
const variations = prompt.variations || [];
const current = variations[currentIndex];

return (
  <div>
    {/* Conteudo da variacao atual */}
    <pre>{current?.content}</pre>
    {current?.image_url && <img src={current.image_url} />}
    
    {/* Navegacao */}
    <div className="flex justify-between">
      <Button 
        disabled={currentIndex === 0}
        onClick={() => setCurrentIndex(i => i - 1)}
      >
        Anterior
      </Button>
      <span>{currentIndex + 1} / {variations.length}</span>
      <Button 
        disabled={currentIndex === variations.length - 1}
        onClick={() => setCurrentIndex(i => i + 1)}
      >
        Proximo
      </Button>
    </div>
  </div>
);
```

### Componente de edicao de variacoes

```tsx
const [variations, setVariations] = useState<Variation[]>([]);

const addVariation = () => {
  setVariations([...variations, { content: "", image_url: null }]);
};

const removeVariation = (index: number) => {
  setVariations(variations.filter((_, i) => i !== index));
};

return (
  <div className="space-y-4">
    {variations.map((v, i) => (
      <div key={i} className="border rounded p-4">
        <div className="flex justify-between mb-2">
          <Label>Variacao {i + 1}</Label>
          <Button variant="ghost" size="icon" onClick={() => removeVariation(i)}>
            <X />
          </Button>
        </div>
        <Textarea
          value={v.content}
          onChange={(e) => updateVariation(i, "content", e.target.value)}
          placeholder="Texto do prompt..."
        />
        {/* Upload de imagem */}
      </div>
    ))}
    <Button variant="outline" onClick={addVariation}>
      <Plus /> Adicionar Variacao
    </Button>
  </div>
);
```

---

## Resultado Esperado

- Cada prompt pode ter multiplas variacoes (texto + imagem)
- Usuario navega entre variacoes no modal
- Mentor gerencia variacoes facilmente no admin
- Visual como as imagens de referencia que voce enviou: Prompt 1 + Imagem, Prompt 2 + Imagem, etc.

