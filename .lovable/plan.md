
# Plano: Atualizar Número de WhatsApp para Suporte

## Resumo

Atualizar o número de WhatsApp de suporte em dois lugares:
1. **Widget flutuante** no canto inferior direito (SupportWidget)
2. **Card "Abrir Chamado"** na página de mentoria dos alunos (QuickAccessCards)

---

## Mudanças Necessárias

### 1. Arquivo: `src/components/SupportWidget.tsx`

Alterar o número de WhatsApp de `5511999999999` para `5571981939047`:

```typescript
// Antes
const whatsappNumber = "5511999999999";

// Depois  
const whatsappNumber = "5571981939047";
```

---

### 2. Arquivo: `src/components/mentoria/QuickAccessCards.tsx`

Alterar a constante `SUPPORT_WHATSAPP` de `5511999999999` para `5571981939047`:

```typescript
// Antes
const SUPPORT_WHATSAPP = "5511999999999";

// Depois
const SUPPORT_WHATSAPP = "5571981939047";
```

---

## Observações

- O formato do número para WhatsApp é `55` (código do Brasil) + DDD + número
- O número fornecido `71981939047` corresponde ao DDD 71 (Salvador/BA)
- Formato final para a API do WhatsApp: `5571981939047`

---

## Arquivos a Modificar

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `src/components/SupportWidget.tsx` | 6 | Alterar número para `5571981939047` |
| `src/components/mentoria/QuickAccessCards.tsx` | 10 | Alterar número para `5571981939047` |

---

## Resultado Esperado

1. O widget flutuante no canto inferior direito abrirá WhatsApp com o número correto
2. O botão "Abrir Chamado" no menu dos alunos também usará o número correto
