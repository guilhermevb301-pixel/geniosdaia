

# Plano: Simplificar Banners (Apenas Imagem + Link)

## Resumo das Mudanças

| Mudança | Descrição |
|---------|-----------|
| **1. Remover Título** | Tirar campo obrigatório de título do formulário |
| **2. Remover Subtítulo** | Tirar campo de subtítulo do formulário |
| **3. Renomear Link** | Campo "Link do Botão" vira "Link de Destino" |
| **4. Atualizar Tabela** | Mostrar apenas Preview, Link, Ativo e Ações |
| **5. Atualizar Carrossel** | Remover texto e botão do banner (só imagem clicável) |

---

## 1. Mudanças no Formulário (AdminBanners.tsx)

### Campos Atuais:
- Título (obrigatório) ❌ **REMOVER**
- Subtítulo ❌ **REMOVER**
- Imagem do Banner ✅ mantém
- Gradiente (fallback) ✅ mantém
- Ordem ✅ mantém
- Altura/Largura ✅ mantém
- Link do Botão → **renomear para "Link de Destino"**
- Banner Ativo ✅ mantém

### Campos Finais:
1. **Imagem do Banner** (upload)
2. **Link de Destino** (obrigatório)
3. **Altura** (px)
4. **Largura** (half/third/full)
5. **Ordem** 
6. **Gradiente** (fallback)
7. **Ativo** (switch)

---

## 2. Atualizar Tabela de Listagem

### Antes:
| Ordem | Preview | Título | Link | Ativo | Ações |

### Depois:
| Ordem | Preview | Link de Destino | Ativo | Ações |

---

## 3. Atualizar Carrossel (AnnouncementCarousel.tsx)

### Antes:
```text
┌──────────────────────────────────┐
│  [Imagem de Fundo]               │
│  ┌────────────────────────┐      │
│  │ Título Grande          │      │
│  │ Subtítulo pequeno      │      │
│  │                        │      │
│  │ [Botão: Saiba Mais →]  │      │
│  └────────────────────────┘      │
└──────────────────────────────────┘
```

### Depois:
```text
┌──────────────────────────────────┐
│                                  │
│       [Imagem Clicável]          │
│                                  │
└──────────────────────────────────┘
```

O banner fica apenas com a imagem ocupando todo o espaço, sem sobreposição de texto ou botão.

---

## 4. Ajuste de Validação

Como título não será mais obrigatório, ajustar:
- `defaultFormData.title` → `"Banner"` (valor padrão para o banco)
- Remover `required` do campo título

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/admin/AdminBanners.tsx` | Remover campos título/subtítulo, ajustar tabela e labels |
| `src/components/dashboard/AnnouncementCarousel.tsx` | Remover título, subtítulo e botão do render |

---

## Resultado Esperado

1. Formulário simplificado: só imagem + link de destino + configurações de tamanho
2. Tabela mostra apenas preview e link
3. Carrossel exibe banners como imagens clicáveis puras (estilo banner de loja)

