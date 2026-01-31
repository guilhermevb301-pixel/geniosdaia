

# Plano: Carrossel de Banners Editaveis no Dashboard

## Resumo do Pedido

Voce quer:
1. Um carrossel com 4 banners no Dashboard (mostrando 2 por vez)
2. Avanco automatico a cada 6-7 segundos
3. Navegacao manual com setas laterais
4. Mentores podem editar os banners e seus links

---

## Visual de Referencia (Pressel App)

Baseado nas imagens que voce enviou, o carrossel deve ter:
- Banners com imagens de alta qualidade/gradientes coloridos
- 2 banners visiveis por vez (lado a lado)
- Setas de navegacao nas laterais
- Transicao suave automatica
- Links clicaveis que abrem ao clicar no banner

---

## Arquitetura da Solucao

### 1. Nova Tabela no Banco de Dados: `dashboard_banners`

```text
+------------------+----------------------------------------+
| Coluna           | Descricao                              |
+------------------+----------------------------------------+
| id               | UUID primary key                       |
| title            | Titulo do banner                       |
| subtitle         | Texto secundario (opcional)            |
| image_url        | URL da imagem de fundo                 |
| button_text      | Texto do botao CTA                     |
| button_url       | Link quando clica no botao/banner      |
| gradient         | Classe CSS de gradiente (fallback)     |
| order_index      | Ordem de exibicao                      |
| is_active        | Se o banner esta ativo                 |
| created_at       | Data de criacao                        |
+------------------+----------------------------------------+
```

### 2. Autoplay no Carrossel

Adicionar o plugin `embla-carousel-autoplay` para rotacao automatica:

```tsx
import Autoplay from "embla-carousel-autoplay";

<Carousel
  plugins={[
    Autoplay({
      delay: 6500, // 6.5 segundos
      stopOnInteraction: true, // Para quando usuario interage
    }),
  ]}
  opts={{ loop: true }}
>
```

### 3. Pagina de Admin para Mentores

Nova pagina `/admin/banners` acessivel por mentores para:
- Ver lista de banners
- Criar novo banner
- Editar banner existente
- Upload de imagem
- Definir ordem
- Ativar/desativar

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useDashboardBanners.ts` | Hook para buscar banners do banco |
| `src/pages/admin/AdminBanners.tsx` | Pagina de gerenciamento de banners |

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/components/dashboard/AnnouncementCarousel.tsx` | Buscar banners do banco + autoplay |
| `src/App.tsx` | Adicionar rota /admin/banners |
| `src/components/layout/SidebarContent.tsx` | Adicionar link no menu admin |

---

## Detalhes Tecnicos

### Estrutura do Componente Atualizado

```tsx
import Autoplay from "embla-carousel-autoplay";
import { useDashboardBanners } from "@/hooks/useDashboardBanners";

export function AnnouncementCarousel() {
  const { banners, isLoading } = useDashboardBanners();

  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 6500,
          stopOnInteraction: true,
        }),
      ]}
      opts={{
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id} className="md:basis-1/2">
            <a href={banner.button_url} target="_blank" rel="noopener">
              <div className="relative h-44 rounded-xl overflow-hidden">
                {banner.image_url ? (
                  <img 
                    src={banner.image_url} 
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 ${banner.gradient}`} />
                )}
                <div className="relative z-10 p-5">
                  <h3>{banner.title}</h3>
                  <p>{banner.subtitle}</p>
                  <Button>{banner.button_text}</Button>
                </div>
              </div>
            </a>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

### Hook useDashboardBanners

```tsx
export function useDashboardBanners() {
  return useQuery({
    queryKey: ["dashboardBanners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_banners")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      
      if (error) throw error;
      return data;
    },
  });
}
```

### Pagina Admin de Banners

Interface para mentores gerenciarem banners:

```text
+----------------------------------------------------------+
| [Seta Voltar] Gerenciar Banners        [+ Novo Banner]   |
+----------------------------------------------------------+
|                                                          |
| +-----------------------------------------------------+  |
| | Preview | Titulo         | Link           | Acoes   |  |
| +-----------------------------------------------------+  |
| | [img]   | Seja Parceiro  | /parceiros     | [E] [X] |  |
| | [img]   | Queremos Ouvir | /feedback      | [E] [X] |  |
| | [img]   | Bem-vindo      | /tour          | [E] [X] |  |
| | [img]   | Fast COD       | /fast-cod      | [E] [X] |  |
| +-----------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

### Modal de Edicao

```text
+----------------------------------------------------------+
|  Editar Banner                                      [X]  |
+----------------------------------------------------------+
|                                                          |
|  Titulo*                                                 |
|  [Torne-se um parceiro Pressel App.________________]     |
|                                                          |
|  Subtitulo                                               |
|  [Indique a ferramenta e ganhe comissoes____________]    |
|                                                          |
|  Imagem do Banner                                        |
|  [URL ou arraste arquivo] [Upload]                       |
|                                                          |
|  Gradiente (fallback se nao tiver imagem)                |
|  [from-blue-500 to-cyan-500________________________]     |
|                                                          |
|  Texto do Botao                                          |
|  [Enviar Solicitacao_______________________________]     |
|                                                          |
|  Link do Botao*                                          |
|  [https://exemplo.com/parceiros___________________]      |
|                                                          |
|  Ordem                                                   |
|  [1]                                                     |
|                                                          |
|  [x] Banner ativo                                        |
|                                                          |
|  [Cancelar]                    [Salvar Alteracoes]       |
+----------------------------------------------------------+
```

---

## Migracao SQL

```sql
-- Criar tabela de banners
CREATE TABLE public.dashboard_banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  gradient text DEFAULT 'from-primary to-purple-600',
  button_text text DEFAULT 'Saiba Mais',
  button_url text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE public.dashboard_banners ENABLE ROW LEVEL SECURITY;

-- Todos usuarios autenticados podem ver banners ativos
CREATE POLICY "Anyone can view active banners"
ON public.dashboard_banners FOR SELECT
USING (is_active = true);

-- Admins e mentores podem gerenciar
CREATE POLICY "Admins and mentors can manage banners"
ON public.dashboard_banners FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'mentor')
  )
);

-- Inserir banners iniciais (4 banners de exemplo)
INSERT INTO public.dashboard_banners (title, subtitle, button_text, button_url, gradient, order_index) VALUES
('Junte-se a Comunidade', 'Conecte-se com outros automatizadores', 'Acessar Comunidade', '/eventos', 'from-primary to-purple-600', 1),
('Proximo Evento Ao Vivo', 'Workshop: Automacoes Avancadas com IA', 'Ver Eventos', '/eventos', 'from-blue-500 to-cyan-500', 2),
('Novos Templates', 'Confira os templates mais recentes', 'Explorar Templates', '/templates', 'from-accent to-orange-500', 3),
('Desafios Semanais', 'Complete desafios e ganhe XP', 'Ver Desafios', '/desafios', 'from-green-500 to-emerald-600', 4);
```

---

## Dependencia NPM

Adicionar o plugin de autoplay:

```bash
npm install embla-carousel-autoplay
```

---

## Fluxo do Usuario Final

1. Usuario acessa o Dashboard
2. Ve 2 banners lado a lado
3. A cada 6.5 segundos, o carrossel avanca automaticamente
4. Usuario pode navegar manualmente com as setas
5. Ao clicar em um banner, abre o link configurado

## Fluxo do Mentor

1. Mentor acessa `/admin/banners`
2. Ve lista de banners existentes
3. Pode criar novo banner com titulo, subtitulo, imagem e link
4. Pode editar banners existentes
5. Pode ativar/desativar banners
6. Pode reordenar banners
7. Mudancas refletem imediatamente no Dashboard

---

## Beneficios

1. **Dinamico**: Banners podem ser atualizados sem alterar codigo
2. **Flexivel**: Suporta imagens ou gradientes de fallback
3. **Profissional**: Autoplay como no Pressel App de referencia
4. **Controlado**: Apenas mentores/admins podem editar
5. **4 banners, 2 visiveis**: Exatamente como solicitado

---

## Criterios de Aceite

- 4 banners no carrossel do Dashboard
- 2 banners visiveis por vez
- Autoplay a cada 6-7 segundos
- Setas de navegacao funcionando
- Pagina admin para mentores editarem
- Upload de imagem funcionando
- Links clicaveis nos banners
- Banners vem do banco de dados

