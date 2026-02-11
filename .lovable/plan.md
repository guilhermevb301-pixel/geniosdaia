

# Plano: Criar os 12 Grupos de Modificadores no Banco de Dados

## O que sera feito

Inserir os 12 grupos como registros na tabela `prompts` com `category = 'modifier'`. Para os dois grupos que voce ja passou os prompts completos (Estilos de Imagem e Cameras e Lentes), tambem inserir as variacoes com os comandos em ingles e traducoes em portugues.

Os outros 10 grupos serao criados vazios, prontos para voce (como mentor) adicionar os prompts depois pela interface.

## Grupos a criar

1. **Estilos de Imagem** - com 10 prompts prontos
2. **Cameras e Lentes** - com 10 prompts prontos
3. **Angulos e Enquadramentos** - vazio (pronto para preencher)
4. **Iluminacao** - vazio
5. **Condicoes do Tempo** - vazio
6. **Estilos de Diretores** - vazio
7. **Estilos de Fotografos** - vazio
8. **Tipos de Filme** - vazio
9. **Emocoes** - vazio
10. **Materiais** - vazio
11. **Paletas de Cores** - vazio
12. **Acoes** - vazio

## Como funciona

- Cada grupo e um registro na tabela `prompts` com `category = 'modifier'`
- Os prompts individuais ficam na tabela `prompt_variations` com:
  - `content` = comando em ingles
  - `image_url` = traducao em portugues
- Mentores podem editar/adicionar prompts via botao de editar no card
- Alunos so visualizam e copiam

## Detalhes tecnicos

Serão executadas queries INSERT para criar os 12 prompts e as 20 variacoes (10 para cada grupo preenchido). Nenhuma mudanca de codigo e necessaria - a UI ja suporta tudo isso.

