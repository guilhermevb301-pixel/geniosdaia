
## Objetivo
Consertar os banners para **não “sumirem”** e ficarem **realmente responsivos em celular e tablet**, tanto:
- no **Dashboard** (carrossel de banners)
- quanto no **/admin/banners** (tela de gerenciamento), que hoje fica ruim em telas pequenas

---

## Diagnóstico (o que está causando o problema)
### 1) Altura “responsiva” dos banners está aplicada de um jeito frágil
No `AnnouncementCarousel.tsx` a altura mobile é aplicada no container, e a “altura desktop” tenta ser aplicada via `<style>` em um elemento `absolute inset-0`:

```tsx
<div style={{ height: `${mobileHeight}px` }}>
  <style> @media (min-width: 768px) { [data-banner-id="..."] { height: ... } } </style>
  <div data-banner-id=... className="absolute inset-0"> ... </div>
</div>
```

Como o `data-banner-id` está com `absolute inset-0` (top/bottom/left/right), **a altura real fica amarrada ao pai** e esse override por `height` pode não ter efeito consistente. Isso pode gerar:
- altura errada no tablet/desktop
- “banner sumindo” (especialmente quando o Embla recalcula layout e reInit/select acontece)

### 2) No tablet (>=768px) vocês já entram no modo “half/third/full”
Hoje o `width_type` vira `md:basis-1/2` / `md:basis-1/3`. Em tablet isso costuma ficar apertado e com quebras estranhas. O ideal é:
- **celular e tablet:** 1 banner por vez (full)
- **desktop:** respeitar `width_type` (half/third/full)

### 3) Sem fallback de carregamento/erro, “some” durante load/erro de imagem
No carrossel vocês usam `<img loading="lazy">` direto. Se a imagem demora ou falha (ou o usuário muda rápido de slide), fica um “vazio”.
Já existe no projeto `ImageWithSkeleton` que resolve isso.

### 4) /admin/banners não está mobile-friendly
A tabela com várias colunas e o header `flex` não quebram bem em telas pequenas. Em celular/tablet, precisa:
- header empilhar (coluna) e botões com largura melhor
- tabela virar “lista de cards” ou ao menos `overflow-x-auto`

---

## Mudanças propostas (o que eu vou implementar)

### A) Consertar o carrossel (Dashboard)
Arquivo: `src/components/dashboard/AnnouncementCarousel.tsx`

1) **Remover o `<style>` por banner** e parar de depender de `absolute inset-0` para altura.
- Trocar por um container simples com altura controlada por **CSS variables** e classes responsivas.
- Exemplo de estratégia:
  - calcular 3 alturas: `mobileHeight`, `tabletHeight`, `desktopHeight` (o do banco)
  - aplicar via `style={{ "--h-mobile": "...px", "--h-tablet": "...px", "--h-desktop": "...px" } as CSSProperties }}`
  - usar classes:
    - `h-[var(--h-mobile)]`
    - `md:h-[var(--h-tablet)]`
    - `lg:h-[var(--h-desktop)]`

2) **No tablet, forçar full-width**
- Alterar `getWidthClass` para aplicar `width_type` só em `lg:` (desktop).
  - `full => lg:basis-full`
  - `half => lg:basis-1/2`
  - `third => lg:basis-1/3`
- Manter `basis-full` por padrão para mobile/tablet.

3) **Evitar “sumir” durante carregamento**
- Substituir `<img>` por `ImageWithSkeleton`:
  - `optimizedWidth` apropriado (ex.: 1200 para banners full)
  - skeleton garante que nunca fica “vazio”
- Adicionar fallback visual:
  - container sempre com `bg-gradient-to-br ${banner.gradient}` por trás
  - se imagem falhar, ainda aparece o gradiente

4) **Hover/scale só no desktop**
- Trocar `hover:scale-[1.02]` por algo como `lg:hover:scale-[1.02]` para não “pular” em touch.

5) **Ajustar botões anterior/próximo para tablet**
- Hoje está `hidden md:flex`. Tablet entra em md e pode ficar ruim.
- Trocar para `hidden lg:flex` (só desktop) ou manter mas ajustar posicionamento para não “apertar” o banner.
- Minha recomendação: **mostrar setas só em desktop (lg)** e deixar swipe no mobile/tablet.

---

### B) Melhorar responsividade do /admin/banners (tela atual do usuário)
Arquivo: `src/pages/admin/AdminBanners.tsx`

1) **Header responsivo**
- Trocar:
  - `flex items-center justify-between`
- Por:
  - `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
- Botão “Novo Banner” ficar `w-full sm:w-auto` para celular.

2) **Tabela responsiva**
Implementar um layout duplo:
- **Desktop (md/lg):** mantém tabela.
- **Mobile/tablet:** troca por **lista de cards** (um banner por card) mostrando:
  - preview (thumbnail)
  - ordem
  - link de destino
  - ativo (switch)
  - ações (editar/excluir)

Isso evita o “horrível” de colunas esmagadas e texto truncado.

(Alternativa mais simples, se você preferir: manter tabela e colocar em `overflow-x-auto`, mas a UX fica pior do que cards.)

3) **Modal responsivo**
- `DialogContent` ocupar melhor o mobile:
  - `w-[calc(100vw-2rem)] sm:max-w-lg`
- O bloco `grid grid-cols-2` (altura/largura) virar:
  - `grid grid-cols-1 sm:grid-cols-2`
- Botões “Trocar imagem / Remover” virarem:
  - `flex flex-col sm:flex-row gap-2` para não estourar.

4) **Validação amigável do Link de Destino**
Sem mudar banco, apenas UX:
- Se não começar com `/` e não começar com `http`, mostrar aviso e/ou auto-corrigir sugerindo `/`.
- Isso reduz links inválidos como `"270"` que hoje passam e podem levar o usuário para rota errada.

---

## Critérios de aceite (como vamos considerar “consertado”)
1) No **celular**:
- banner ocupa largura toda
- altura fica proporcional e não gigante
- nunca fica “em branco” (tem skeleton/gradiente enquanto carrega)
- swipe funciona bem

2) No **tablet**:
- continua 1 banner por vez (full)
- sem cortes estranhos e sem “sumir”

3) No **desktop**:
- respeita `width_type` (half/third/full)
- setas (prev/next) aparecem e não atrapalham

4) Em **/admin/banners**:
- layout não quebra em telas pequenas
- lista de banners fica fácil de operar (editar/ativar/excluir) no celular/tablet

---

## Arquivos que serão modificados
- `src/components/dashboard/AnnouncementCarousel.tsx`
- `src/pages/admin/AdminBanners.tsx`

---

## Riscos / Observações
- Banners com `height=400` são altos; no mobile vamos **aplicar clamp** (um limite) para não ficar exagerado.
- Vou manter compatibilidade total com os dados atuais do banco (sem migração).

