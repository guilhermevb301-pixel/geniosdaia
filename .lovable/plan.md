
# Plano: Sidebar Mobile + Cards de Módulo Verticais

## Resumo das Mudanças

Vou fazer duas melhorias:

1. **Sidebar fechável no mobile**: Transformar a sidebar fixa em um menu lateral que pode ser aberto/fechado no mobile
2. **Cards de módulo mais verticais**: Alterar o layout para caber 4-5 cards por linha com formato mais vertical

---

## 1. Sidebar Responsiva para Mobile

### Problema Atual

A sidebar está sempre visível com `w-64` fixo, ocupando muito espaço no mobile e sem opção de fechar.

### Solução

| Arquivo | Mudança |
|---------|---------|
| `src/components/layout/AppLayout.tsx` | Adicionar lógica de mobile com Sheet |
| `src/components/layout/AppSidebar.tsx` | Adaptar para funcionar em ambos os modos |
| `src/components/layout/TopBar.tsx` | Adicionar botão de menu hamburger no mobile |

### Como vai funcionar

**Desktop (acima de 768px):**
- Sidebar fixa à esquerda (como está hoje)

**Mobile (abaixo de 768px):**
- Sidebar escondida por padrão
- Botão de menu (hamburger) na TopBar
- Ao clicar, abre um Sheet lateral que desliza da esquerda
- Botão X para fechar

---

## 2. Cards de Módulo Mais Verticais

### Problema Atual

- Grid com 3 colunas no desktop (`lg:grid-cols-3`)
- Cards com aspecto 16:9 (horizontais)

### Solução

| Arquivo | Mudança |
|---------|---------|
| `src/components/aulas/ModuleGrid.tsx` | Aumentar para 4-5 colunas |
| `src/components/aulas/ModuleCard.tsx` | Alterar aspecto para 3:4 (vertical) |

### Novo Layout do Grid

```text
Desktop (xl): 5 colunas
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │ │    │ │    │
│    │ │    │ │    │ │    │ │    │
└────┘ └────┘ └────┘ └────┘ └────┘

Desktop (lg): 4 colunas
┌────┐ ┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │ │    │
│    │ │    │ │    │ │    │
└────┘ └────┘ └────┘ └────┘

Tablet (md): 3 colunas
┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │
└────┘ └────┘ └────┘

Mobile (sm): 2 colunas
┌────┐ ┌────┐
│    │ │    │
└────┘ └────┘
```

### Novo Aspecto do Card

| Antes | Depois |
|-------|--------|
| 16:9 (horizontal) | 3:4 (vertical) |
| Imagem larga | Imagem mais alta |

---

## Arquivos a Modificar

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/components/layout/AppLayout.tsx` | Modificar | Adicionar Sheet para mobile |
| `src/components/layout/AppSidebar.tsx` | Modificar | Extrair conteúdo para componente reutilizável |
| `src/components/layout/TopBar.tsx` | Modificar | Adicionar botão hamburger no mobile |
| `src/components/aulas/ModuleGrid.tsx` | Modificar | Grid 5 colunas no xl, 4 no lg |
| `src/components/aulas/ModuleCard.tsx` | Modificar | Aspecto 3:4 (vertical) |

---

## Seção Técnica

### AppLayout.tsx - Nova estrutura

```typescript
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: sidebar fixa */}
      {!isMobile && <AppSidebar />}
      
      {/* Mobile: Sheet lateral */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <div className={cn(!isMobile && "pl-64")}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} showMenu={isMobile} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

### TopBar.tsx - Botão hamburger

```typescript
interface TopBarProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

// No início do header:
{showMenu && (
  <Button variant="ghost" size="icon" onClick={onMenuClick}>
    <Menu className="h-5 w-5" />
  </Button>
)}
```

### ModuleGrid.tsx - Novo grid

```typescript
// Antes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Depois
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
```

### ModuleCard.tsx - Aspecto vertical

```typescript
// Antes
<AspectRatio ratio={16 / 9}>

// Depois
<AspectRatio ratio={3 / 4}>
```

---

## Resultado Esperado

1. **No mobile**: Botão de menu hamburger na TopBar que abre/fecha a sidebar
2. **Cards verticais**: Formato de capa de livro/curso (3:4)
3. **Mais cards por linha**: 5 no desktop grande, 4 no desktop, 3 no tablet, 2 no mobile
4. **Gap menor**: Espaçamento reduzido para caber mais cards
