
# Plano: Correcoes na Visualizacao e Upload de Prompts

## Problemas Identificados

1. **Visualizacao mostrando informacoes demais**: Card de admin mostra titulo + descricao + tags. Deve mostrar apenas o titulo.

2. **Video de exemplo e URL, nao upload**: O sistema usa campo de URL para video. Usuario quer fazer upload de arquivo de video do computador, igual ao upload de imagens.

3. **Imagens cortadas ao visualizar**: O modal de visualizacao de imagem usa `object-cover` que corta a imagem. Deve usar `object-contain` para mostrar imagem completa.

---

## Mudancas Necessarias

### 1. Simplificar Card de Admin (AdminPrompts.tsx)

**Remover do card**:
- Descricao do prompt
- Tags

**Manter no card**:
- Thumbnail/placeholder
- Titulo
- Botoes de editar/excluir

```
ANTES                          DEPOIS
+-------------------+          +-------------------+
| [Thumbnail]       |          | [Thumbnail]       |
| Titulo            |          | Titulo            |
| Descricao...      |          +-------------------+
| #tag #tag #tag    |
+-------------------+
```

### 2. Upload de Video de Exemplo

**Alteracoes**:
- Adicionar estado para arquivo de video (`exampleVideoFile`)
- Adicionar preview de video
- Adicionar ref para input de video (`exampleVideoInputRef`)
- Criar funcao de upload de video para storage
- Substituir campo de URL por area de upload similar a imagens

**Interface do formulario**:

```
Exemplos (opcional)
--------------------
Imagens de Exemplo (max. 6)
[img] [img] [+]

Video de Exemplo
+---------------------------+
|   [Preview do video]      |
|   ou                      |
|   [Upload de video]       |
+---------------------------+
```

**Formatos aceitos**: MP4, WebM, MOV

### 3. Corrigir Visualizacao de Imagens

**No PromptCard.tsx**:
- Trocar `object-cover` por `object-contain` no modal de imagem ampliada
- Garantir que imagem nao seja cortada
- Manter proporcao original da imagem
- Ajustar DialogContent para centralizar corretamente

**Codigo corrigido**:
```tsx
<Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
  <DialogContent className="max-w-4xl p-4 flex items-center justify-center">
    {selectedImage && (
      <img
        src={selectedImage}
        alt="Exemplo ampliado"
        className="max-w-full max-h-[80vh] object-contain rounded-lg"
      />
    )}
  </DialogContent>
</Dialog>
```

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/admin/AdminPrompts.tsx` | Remover descricao/tags do card, trocar URL por upload de video |
| `src/components/prompts/PromptCard.tsx` | Corrigir visualizacao de imagem ampliada, exibir video corretamente |

---

## Fluxo de Upload de Video

1. Usuario clica na area de upload de video
2. Seleciona arquivo MP4/WebM do computador
3. Preview do video aparece na area
4. Ao salvar, video e enviado para Supabase Storage (pasta `videos/`)
5. URL publica e salva no campo `example_video_url`

---

## Secao Tecnica

### Novos Estados para Video

```tsx
const [exampleVideoFile, setExampleVideoFile] = useState<File | null>(null);
const [exampleVideoPreview, setExampleVideoPreview] = useState<string>("");
const exampleVideoInputRef = useRef<HTMLInputElement>(null);
```

### Funcao de Upload de Video

```tsx
const handleExampleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setExampleVideoFile(file);
    setExampleVideoPreview(URL.createObjectURL(file));
  }
};
```

### Modificacao na Mutation

No `createMutation` e `updateMutation`, adicionar:

```tsx
let videoUrl: string | null = null;
if (exampleVideoFile) {
  videoUrl = await uploadFile(exampleVideoFile, "videos");
}
// usar videoUrl em example_video_url
```

### Visualizacao de Video no PromptCard

Se houver video, mostrar player nativo:

```tsx
{prompt.example_video_url && (
  <video
    src={prompt.example_video_url}
    controls
    className="w-full rounded-lg"
  />
)}
```
