

# Plano: Corrigir Altura dos Banners no MacBook

## Problema Identificado

Na imagem enviada, os banners estão sendo cortados demais no MacBook. Isso acontece porque:

1. **Breakpoints Tailwind padrão:**
   - `sm`: 640px+
   - `md`: 768px+
   - `lg`: 1024px+

2. **Limites atuais muito restritivos:**
   - Desktop (lg+): usa altura configurada (400px) ✓
   - Tablet (sm - lg): máximo **280px** ← corta demais!
   - Mobile: máximo **200px**

3. **MacBook no limite:**
   Um MacBook de 13" pode ter área visível do navegador entre 900-1100px, caindo no breakpoint "tablet" e recebendo apenas 280px de altura quando deveria ter mais.

## Solucao Proposta

Ajustar a funcao `getResponsiveHeights` para:

1. **Adicionar breakpoint intermediario (md)** para laptops menores
2. **Aumentar os limites maximos** para tablet/laptop
3. **Usar proporcoes mais generosas**

### Novos Valores

| Breakpoint | Atual | Proposto |
|------------|-------|----------|
| Mobile (< sm) | 60%, max 200px | 55%, max 180px |
| Tablet (sm-md) | 75%, max 280px | 70%, max 280px |
| Laptop (md-lg) | - | 85%, max 350px |
| Desktop (lg+) | 100%, max 400px | 100%, max 400px |

### Mudanca de Codigo

```tsx
const getResponsiveHeights = (desktopHeight: number) => {
  const clampedDesktop = Math.max(120, Math.min(400, desktopHeight));
  
  // Mobile (< 640px): mais compacto
  const mobile = Math.max(100, Math.min(180, Math.round(clampedDesktop * 0.55)));
  
  // Tablet (640px - 767px): intermediario
  const tablet = Math.max(120, Math.min(280, Math.round(clampedDesktop * 0.70)));
  
  // Laptop (768px - 1023px): quase desktop - NOVO!
  const laptop = Math.max(160, Math.min(350, Math.round(clampedDesktop * 0.85)));
  
  return { mobile, tablet, laptop, desktop: clampedDesktop };
};
```

### Aplicacao no JSX

```tsx
<div 
  className="w-full h-[var(--h-mobile)] sm:h-[var(--h-tablet)] md:h-[var(--h-laptop)] lg:h-[var(--h-desktop)]"
>
```

## Resultado Visual

| Dispositivo | Altura Atual | Altura Nova |
|-------------|--------------|-------------|
| iPhone (375px) | 200px | 180px |
| iPad Mini (768px) | 280px | **340px** |
| MacBook 13" (1024px) | 280px (se < 1024) | **340px** |
| MacBook 13" (1280px) | 400px | 400px |
| Desktop (1440px+) | 400px | 400px |

## Arquivo a Modificar

- `src/components/dashboard/AnnouncementCarousel.tsx`
  - Adicionar variavel CSS `--h-laptop`
  - Usar breakpoint `md:` para laptops
  - Ajustar proporcoes na funcao `getResponsiveHeights`

