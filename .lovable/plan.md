
# Plano: Melhorar Banners e Upload de Vídeo MP4

## O Que Será Feito

### 1. Upload de Vídeo MP4 no Admin de Prompts
Adicionar campo para mentor fazer upload de vídeos MP4 do computador

### 2. Melhorar Contraste dos Títulos nos Banners
Aplicar estilo similar ao Pressel Lab com melhor legibilidade

---

## Problema Atual

### Banners
- Títulos brancos simples sem destaque
- Overlay muito sutil (apenas `bg-black/20`)
- Fonte pequena sem sombra

### Upload de Vídeo
- O formulário admin não tem campo para upload de vídeo
- Existe a coluna `example_video_url` mas sem input para preencher

---

## Solução 1: Melhorar Contraste dos Banners

Baseado no Pressel Lab, aplicar:

| Elemento | Atual | Novo (Estilo Pressel) |
|----------|-------|----------------------|
| Overlay | `bg-black/20` | `bg-gradient-to-r from-black/60 via-black/40 to-transparent` |
| Título | `text-lg font-bold` | `text-xl md:text-2xl font-bold drop-shadow-lg` |
| Subtítulo | `text-sm text-white/80` | `text-sm font-medium drop-shadow-md text-white/90` |
| Botão | Semi-transparente | Cor sólida vibrante (laranja/amarelo como Pressel) |

### Estilo Visual de Referência

```text
+------------------------------------------------------------------+
|  [IMAGEM DE FUNDO]                                               |
|                                                                  |
|  ██████████████████                                              |
|  █ Torne-se        █                    ┌────────────────────┐   |
|  █ um parceiro     █  Texto com         │ Ajude outros       │   |
|  █ Pressel App.    █  highlight de      │ afiliados a acabar │   |
|  ██████████████████   fundo escuro      │ com esse pesadelo  │   |
|                                         └────────────────────┘   |
|                                                                  |
|  ┌──────────────────────┐                                        |
|  │ ENVIAR SOLICITAÇÃO   │  <- Botão com cor vibrante             |
|  └──────────────────────┘                                        |
+------------------------------------------------------------------+
```

### Código do Componente Atualizado

```tsx
// AnnouncementCarousel.tsx

// Overlay com gradiente horizontal (escuro à esquerda, claro à direita)
<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

// Título com shadow e tamanho maior
<h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
  {banner.title}
</h3>

// Subtítulo com melhor contraste
<p className="text-sm text-white/90 mt-1 line-clamp-2 drop-shadow-md">
  {banner.subtitle}
</p>

// Botão com cor vibrante (laranja/amarelo como Pressel)
<Button
  size="sm"
  className="w-fit bg-amber-500 hover:bg-amber-600 text-white font-semibold border-0"
>
```

---

## Solução 2: Upload de Vídeo MP4 no Admin

Adicionar seção de upload de vídeo no formulário de criação/edição de prompts.

### Campos a Adicionar

| Campo | Descrição |
|-------|-----------|
| `videoFile` | Estado local para arquivo selecionado |
| `videoPreview` | URL temporária para preview |
| Input file | Aceita `video/mp4` |
| Preview player | Mostra vídeo antes de salvar |

### Fluxo de Upload

1. Mentor clica em "Adicionar vídeo de exemplo"
2. Seleciona arquivo MP4 do computador
3. Vê preview do vídeo antes de salvar
4. Ao salvar, vídeo é enviado ao Storage
5. URL é salva em `example_video_url`

### Interface no Formulário

```text
+----------------------------------------------------------+
|  Vídeo de Exemplo                                        |
+----------------------------------------------------------+
|                                                          |
|  [ Área de Upload ]                                      |
|  ┌──────────────────────────────────────────────────┐    |
|  │                                                  │    |
|  │       📹 Clique para adicionar vídeo MP4        │    |
|  │                                                  │    |
|  └──────────────────────────────────────────────────┘    |
|                                                          |
|  OU                                                      |
|                                                          |
|  [ URL externa do vídeo: ______________________ ]        |
|                                                          |
+----------------------------------------------------------+
```

### Validação de Arquivo

```typescript
// Aceitar apenas MP4
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

function validateVideoFile(file: File) {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: "Apenas arquivos MP4 são permitidos" };
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: "O vídeo deve ter no máximo 100MB" };
  }
  return { valid: true };
}
```

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/components/dashboard/AnnouncementCarousel.tsx` | Melhorar overlay, sombras, fonte e cor do botão |
| `src/pages/admin/AdminPrompts.tsx` | Adicionar campo de upload de vídeo MP4 |
| `src/lib/fileValidation.ts` | Adicionar validação para arquivos de vídeo |

---

## Detalhes Técnicos

### Upload para Storage

O upload de vídeo usará o mesmo bucket `prompts` que já existe:

```typescript
const uploadVideo = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("prompts")
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("prompts")
    .getPublicUrl(fileName);
    
  return urlData.publicUrl;
};
```

### Salvando no Banco

```typescript
// Na mutation de create/update:
const { error } = await supabase
  .from("prompts")
  .update({
    // ...outros campos
    example_video_url: videoUrl,
  })
  .eq("id", promptId);
```

---

## Resultado Esperado

### Banners do Dashboard
- Títulos grandes e legíveis como no Pressel Lab
- Gradiente escuro que melhora contraste
- Sombra de texto para destaque
- Botão vibrante (amarelo/laranja)

### Admin de Prompts
- Mentor pode fazer upload de vídeo MP4 do computador
- Preview do vídeo antes de salvar
- Opção de URL externa como fallback
- Vídeo aparece no modal do prompt para usuários

---

## Critérios de Aceite

1. Títulos dos banners visíveis e com bom contraste
2. Botões dos banners com cor vibrante
3. Campo de upload de vídeo MP4 no admin de prompts
4. Preview do vídeo antes de salvar
5. Vídeos salvos corretamente no Storage
6. Download de vídeo funcionando para usuários
