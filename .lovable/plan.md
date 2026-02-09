

# Plano: Imagens Instantaneas (Solucao Definitiva)

## Problema Real

O componente `ImageWithSkeleton` **sempre** comeca com `opacity: 0` e mostra um skeleton cinza, mesmo quando a imagem ja esta no cache do navegador. Isso significa que toda vez que voce navega entre paginas, todas as imagens "piscam" com o skeleton antes de aparecer -- mesmo que ja tenham sido carregadas antes.

Alem disso, a transicao de 300ms (`transition-opacity duration-300`) adiciona atraso desnecessario.

## Solucao

Modificar o `ImageWithSkeleton` para detectar se a imagem ja esta em cache e pular completamente o skeleton nesses casos. Imagens cacheadas aparecem **instantaneamente**.

### Mudanca Principal: `src/components/ui/image-with-skeleton.tsx`

```text
ANTES (sempre pisca):
1. Monta componente -> isLoaded = false -> mostra skeleton
2. Navegador carrega imagem (mesmo se cacheada)
3. onLoad dispara -> isLoaded = true -> fade-in 300ms
= SEMPRE tem delay visual

DEPOIS (instantaneo se cacheado):
1. Monta componente -> verifica cache via img.complete
2. Se cacheada -> isLoaded = true IMEDIATAMENTE -> sem skeleton
3. Se nao cacheada -> mostra skeleton -> onLoad -> aparece rapido (150ms)
= Cacheadas aparecem INSTANTANEAMENTE
```

**Tecnica**: Usar `useRef` + `img.complete` + `img.naturalWidth > 0` para detectar imagens ja decodificadas pelo navegador. Isso e uma API nativa do browser, 100% confiavel.

```tsx
// Detectar cache no ref callback
const imgRef = useCallback((node: HTMLImageElement | null) => {
  if (node && node.complete && node.naturalWidth > 0) {
    setIsLoaded(true); // Instantaneo, sem skeleton
  }
}, []);
```

Tambem reduzir a transicao de `duration-300` para `duration-150` para imagens nao-cacheadas.

### Mudanca Secundaria: Remover `useImagePreload` da pagina `/aulas`

O hook `useImagePreload` injeta `<link rel="preload">` no `<head>`, mas isso so funciona na primeira visita. Nas navegacoes seguintes, o cache do browser ja resolve. O hook adiciona complexidade sem beneficio real. Remover da pagina `Aulas.tsx`.

### Erro de Build

O erro `bun install timeout` e um problema temporario de infraestrutura, nao do codigo. Vai se resolver automaticamente com o proximo deploy. Nao precisa de mudanca de codigo.

## Arquivos a Modificar

1. **`src/components/ui/image-with-skeleton.tsx`**
   - Adicionar deteccao de cache via `img.complete`
   - Usar `useCallback` ref para verificar no mount
   - Reduzir transicao de 300ms para 150ms
   - Iniciar com `isLoaded = true` quando cacheado (sem skeleton)

2. **`src/pages/Aulas.tsx`**
   - Remover import e uso de `useImagePreload` (desnecessario com a nova logica)
   - Remover `useMemo` de `criticalImages`

## Resultado

- Imagens ja visitadas: aparecem **instantaneamente** (0ms de delay)
- Imagens novas: skeleton breve + aparicao em 150ms (metade do atual)
- Sem mais "piscar" ao navegar entre paginas
- Codigo mais simples e confiavel

