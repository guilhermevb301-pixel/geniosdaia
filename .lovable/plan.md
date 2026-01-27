

# Plano: Seletor de Ponto Focal com Arrastar (Drag)

## Resumo

Substituir o grid de 9 botoes por uma interacao de arrastar (drag) na propria imagem. O mentor clica e arrasta sobre a imagem de preview para definir exatamente qual parte deve ficar visivel no card.

---

## Como Vai Funcionar

```text
+----------------------------------+
|                                  |
|    [Imagem de Preview]           |
|         +----+                   |
|         | X  |  <-- Marcador     |
|         +----+     arrastavel    |
|                                  |
+----------------------------------+
    Clique e arraste para ajustar
```

1. O mentor faz upload da imagem
2. Um marcador (crosshair/circulo) aparece sobre a imagem
3. O mentor clica e arrasta o marcador para a posicao desejada
4. O valor do foco e salvo como porcentagem (ex: "35% 70%")
5. O preview simula como ficara no grid

---

## Mudanca no Armazenamento

**Antes:** Valores como `"top left"`, `"center"`, `"bottom right"`

**Depois:** Valores em porcentagem como `"25% 50%"`, `"0% 100%"`, `"50% 50%"`

Isso permite precisao de pixel. O CSS `object-position` aceita valores em porcentagem nativamente.

---

## Componente FocalPointSelector

Criar um componente reutilizavel que:

1. Exibe a imagem em tamanho maior
2. Mostra um marcador circular na posicao atual
3. Captura eventos de mouse (mousedown, mousemove, mouseup)
4. Calcula a posicao relativa do click como porcentagem
5. Atualiza o estado em tempo real

```tsx
interface FocalPointSelectorProps {
  imageUrl: string;
  value: string; // "50% 50%" format
  onChange: (value: string) => void;
}
```

---

## Interacao do Usuario

| Acao | Resultado |
|------|-----------|
| Click na imagem | Move o ponto focal para essa posicao |
| Arrastar (drag) | Move o ponto focal continuamente |
| Soltar mouse | Finaliza o ajuste |

O marcador segue o mouse enquanto arrasta, dando feedback visual imediato.

---

## Preview Simulado

Abaixo do seletor, mostrar um mini-preview de como a imagem ficara no card:

```text
Ponto Focal:
+----------------------------------+
|                                  |
|    [Imagem grande com marcador]  |
|              O                   |
|                                  |
+----------------------------------+
    Clique e arraste para ajustar

Preview no Card:
+------------+
|   Corte    |
|  aplicado  |
+------------+
```

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/admin/AdminPrompts.tsx` | Substituir grid de botoes pelo componente de drag |
| `src/components/prompts/PromptCard.tsx` | Ja suporta valores em porcentagem (nenhuma mudanca) |

---

## Implementacao Detalhada

### 1. Estado do Componente

```tsx
const [isDragging, setIsDragging] = useState(false);
const imageContainerRef = useRef<HTMLDivElement>(null);

// Converter "50% 50%" para {x: 50, y: 50}
const parsePosition = (value: string) => {
  const [x, y] = value.split(' ').map(v => parseFloat(v));
  return { x: x || 50, y: y || 50 };
};
```

### 2. Handlers de Mouse

```tsx
const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  updatePosition(e);
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return;
  updatePosition(e);
};

const handleMouseUp = () => {
  setIsDragging(false);
};

const updatePosition = (e: React.MouseEvent) => {
  const rect = imageContainerRef.current?.getBoundingClientRect();
  if (!rect) return;
  
  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
  
  setThumbnailFocus(`${x.toFixed(0)}% ${y.toFixed(0)}%`);
};
```

### 3. Marcador Visual

```tsx
<div 
  className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg pointer-events-none"
  style={{
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 0 2px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
  }}
>
  <div className="absolute inset-1 bg-white/50 rounded-full" />
</div>
```

### 4. Cursor e Feedback

- Cursor `crosshair` ao passar sobre a imagem
- Cursor `grabbing` durante o arrasto
- Marcador pulsa levemente ao arrastar

---

## Secao Tecnica

### Compatibilidade com Valores Existentes

O sistema precisa ser compativel com os valores antigos ("center", "top left", etc). Ao carregar um prompt antigo:

```tsx
const normalizePosition = (value: string): string => {
  const presets: Record<string, string> = {
    'top left': '0% 0%',
    'top center': '50% 0%',
    'top right': '100% 0%',
    'center left': '0% 50%',
    'center': '50% 50%',
    'center right': '100% 50%',
    'bottom left': '0% 100%',
    'bottom center': '50% 100%',
    'bottom right': '100% 100%',
  };
  return presets[value] || value;
};
```

### Touch Support (Mobile)

Adicionar suporte para toque em dispositivos moveis:

```tsx
onTouchStart={(e) => handleTouchStart(e)}
onTouchMove={(e) => handleTouchMove(e)}
onTouchEnd={() => setIsDragging(false)}
```

---

## Resultado Esperado

- Interface mais intuitiva e precisa
- Mentor pode posicionar o foco em qualquer ponto da imagem
- Feedback visual imediato do resultado
- Compativel com valores existentes no banco de dados

