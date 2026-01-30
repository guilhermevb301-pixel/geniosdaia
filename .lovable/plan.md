
# Plano: Download de Videos no Banco de Prompts

## Problema Identificado

Atualmente, os videos de exemplo no Banco de Prompts sao exibidos mas **nao podem ser baixados**. O componente `PromptCard.tsx` mostra o video com uma tag `<video>` (linhas 232-240), porem nao oferece opcao de download.

Alem disso, o sistema de variacoes so suporta imagens - nao ha campo para video nas variacoes.

---

## Solucao Proposta

### Parte 1: Adicionar Botao de Download (Rapido)

Adicionar um botao de download ao lado do video de exemplo no `PromptCard.tsx`:

```text
+----------------------------------+
|  Video de exemplo                |
|  +----------------------------+  |
|  |                            |  |
|  |   [Player de Video]        |  |
|  |                            |  |
|  +----------------------------+  |
|  [Baixar Video]  <-- NOVO        |
+----------------------------------+
```

### Parte 2: Suporte a Video nas Variacoes (Opcional)

Estender a tabela `prompt_variations` para incluir campo de video:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| video_url | text | URL do video da variacao |

---

## Implementacao Tecnica

### Arquivo: `src/components/prompts/PromptCard.tsx`

Adicionar botao de download apos a tag `<video>`:

```tsx
{/* Video de exemplo */}
{prompt.example_video_url && (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-muted-foreground">Video de exemplo</h4>
    <video
      src={prompt.example_video_url}
      controls
      className="w-full rounded-lg"
    />
    {/* NOVO: Botao de download */}
    <a
      href={prompt.example_video_url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
    >
      <Download className="h-4 w-4" />
      Baixar video
    </a>
  </div>
)}
```

### Importante: Download de Arquivos do Supabase Storage

Para que o download funcione corretamente com arquivos do Supabase Storage, pode ser necessario usar uma abordagem com `fetch` + `Blob`:

```tsx
const handleDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    
    toast.success("Download iniciado!");
  } catch (error) {
    toast.error("Erro ao baixar video");
  }
};
```

---

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/prompts/PromptCard.tsx` | Adicionar botao de download + funcao de download |

---

## Resultado Esperado

- Usuario mentor consegue baixar videos de exemplo com um clique
- Download funciona mesmo com arquivos do Supabase Storage
- Feedback visual (toast) ao iniciar download

---

## Extensao Futura (Opcional)

Se desejar suporte completo a videos nas variacoes (nao apenas no campo legado `example_video_url`):

1. Migracao SQL para adicionar `video_url` em `prompt_variations`
2. Atualizar `VariationEditor.tsx` para permitir upload de video
3. Atualizar `PromptCard.tsx` para exibir/baixar video de cada variacao

Deseja que eu implemente essa extensao tambem?
