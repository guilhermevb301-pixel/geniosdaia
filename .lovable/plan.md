

# Plano: Melhorar Visual dos Banners do Dashboard

## O Que Sera Feito

1. **Remover o HeroBanner** (seção de boas-vindas com frases motivacionais) do Dashboard
2. **Adicionar imagens de alta qualidade** relacionadas a IA nos banners existentes
3. **Atualizar o visual** para ficar mais parecido com o Pressel App (com ilustrações e imagens de fundo)

---

## Estado Atual vs Desejado

### Atual
- HeroBanner com "Boa tarde, Guilherme" e frases motivacionais
- Banners apenas com cores gradientes (sem imagens)
- Visual simples e "feio" como você mencionou

### Desejado
- Sem HeroBanner (direto para os banners)
- Banners com imagens ilustrativas relacionadas a IA
- Visual profissional como no Pressel App

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Dashboard.tsx` | Remover o componente HeroBanner |
| Banco de dados `dashboard_banners` | Atualizar os 4 banners com URLs de imagens de alta qualidade |

---

## Imagens Propostas

Vou usar imagens de alta qualidade do Unsplash (gratuitas e profissionais) relacionadas a IA e tecnologia:

| Banner | Tema | Imagem |
|--------|------|--------|
| 1 - Comunidade | Pessoas colaborando/networking | Imagem com tema de colaboracao e conexao |
| 2 - Evento Ao Vivo | Workshop/Apresentação | Imagem com tema de evento/apresentacao |
| 3 - Templates | Design/Criatividade | Imagem com tema de criatividade/design |
| 4 - Desafios | Gamificação/Conquista | Imagem com tema de conquista/superacao |

---

## Detalhes Tecnicos

### 1. Remover HeroBanner do Dashboard

```tsx
// Dashboard.tsx - ANTES
<HeroBanner />
<AnnouncementCarousel />

// Dashboard.tsx - DEPOIS
<AnnouncementCarousel />  // Apenas o carrossel de banners
```

### 2. Atualizar Banners no Banco de Dados

Atualizar os 4 registros na tabela `dashboard_banners` com URLs de imagens de alta qualidade do Unsplash:

```sql
-- Banner 1: Comunidade
UPDATE dashboard_banners 
SET image_url = 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80'
WHERE order_index = 1;

-- Banner 2: Eventos
UPDATE dashboard_banners
SET image_url = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80'
WHERE order_index = 2;

-- Etc...
```

---

## Visual Final Esperado

```text
+------------------------------------------------------------------+
|                                                                  |
| +-----------------------------+  +-----------------------------+ |
| |  [Imagem IA/Networking]     |  |  [Imagem Robot/Workshop]    | |
| |                             |  |                             | |
| |  Junte-se à Comunidade      |  |  Próximo Evento Ao Vivo     | |
| |  Conecte-se com outros...   |  |  Workshop: Automações...    | |
| |                             |  |                             | |
| |  [Acessar Comunidade →]     |  |  [Ver Eventos →]            | |
| +-----------------------------+  +-----------------------------+ |
|                                                    <  ●○○○  >    |
+------------------------------------------------------------------+
```

Os banners terão:
- Imagens de fundo de alta qualidade
- Overlay escuro sutil para legibilidade do texto
- Mesma estrutura de texto e botões atuais
- Transição automática a cada 6.5 segundos

---

## Criterios de Aceite

- HeroBanner removido do Dashboard
- 4 banners com imagens de alta qualidade relacionadas a IA
- Visual profissional similar ao Pressel App
- Texto legível sobre as imagens
- Autoplay e navegação funcionando normalmente

