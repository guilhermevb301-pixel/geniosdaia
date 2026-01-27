
# Plano: Corrigir Widget de Suporte

## Problemas Identificados

1. **Posicionamento errado**: O widget está posicionado à direita da sidebar (`left-[calc(16rem+1rem)]`), mas deveria estar **dentro da sidebar** no rodapé, como mostra a imagem de referência
2. **Cor verde não aparece**: A cor `success` está definida no CSS (`--success: 160 100% 38%`), mas **não está mapeada no tailwind.config.ts**, então `bg-success` não funciona

---

## Solução

### 1. Adicionar cor `success` ao Tailwind Config

**Arquivo:** `tailwind.config.ts`

Adicionar o mapeamento da cor success na seção de cores:

```typescript
colors: {
  // ... cores existentes ...
  success: {
    DEFAULT: 'hsl(var(--success))',
    foreground: 'hsl(var(--success-foreground))'
  },
  // ...
}
```

---

### 2. Mover o Widget para Dentro da Sidebar

**Arquivo:** `src/components/layout/AppSidebar.tsx`

Ao invés de ter o widget como componente flutuante separado, incorporá-lo diretamente no footer da sidebar, substituindo o link de "Suporte" atual pelo card de WhatsApp.

O footer da sidebar (linhas 248-257) será atualizado para incluir:
- Título "Precisa de Ajuda?"
- Subtexto "Entre em contato conosco pelo nosso suporte"
- Botão verde "Falar no WhatsApp" com o número correto

---

### 3. Remover Widget Flutuante do Layout

**Arquivo:** `src/components/layout/AppLayout.tsx`

Remover a importação e uso do `<SupportWidget />` já que ele agora estará dentro da sidebar.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `tailwind.config.ts` | Adicionar cor `success` |
| `src/components/layout/AppSidebar.tsx` | Substituir footer por card de suporte WhatsApp |
| `src/components/layout/AppLayout.tsx` | Remover `<SupportWidget />` |

---

## Resultado Visual Esperado

O widget ficará exatamente como na imagem de referência:
- Posicionado no canto inferior esquerdo, dentro da sidebar
- Card com fundo escuro e borda sutil
- Título "Precisa de Ajuda?"
- Subtexto descritivo
- Botão verde com ícone de WhatsApp e texto "Falar no WhatsApp"
