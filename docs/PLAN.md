# Plano de Orquestração — Gestão de Cardápio e Produtos

Este plano define a arquitetura e a ordem de execução para a finalização do módulo de **Gestão de Cardápio**, baseado nas imagens de referência e respeitando o Design System Stitch.

## 🎯 Objetivos da Orquestração

- Completar as funcionalidades avançadas de catálogo e produtos.
- Implementar fluxos específicos de criação (Pizza, Itens, etc.).
- Desenvolver recursos de importação e edição em massa.
- Garantir que toda a UI siga estritamente os padrões do Stitch.

## 🗂️ Fases de Implementação (Gestão de Cardápio)

### Fase 1: Interface de Modelos de Produtos (Item Principal vs Pizza)

> _Referência: `Gestão de Cardapio - Gestor 1_2 Novo Cardapio modelo...` até `1_26`_

- **Database (`database-architect`)**: Verificar se `products` suporta a diferenciação de modelos de venda (ex: `product_model` enum: `standard`, `pizza`). Garantir suporte a frações de pizza (meio a meio) em `product_options` ou tabela separada.
- **Backend (`backend-specialist`)**: Adaptar a rota `/catalog/products` para lidar com a lógica de meio a meio e componentes específicos de pizza.
- **Frontend (`frontend-specialist`)**: Atualizar `ProductFormModal` para ser dinâmico com base no "Modelo" selecionado (Item Principal, Pizza, etc.). Criar abas para configurações de Tamanhos, Disponibilidade e Promoção de forma clara.

### Fase 2: Edição em Massa e Gestão de Imagens

> _Referência: `Edição em massa 1_0.png`, `Imagens Cardapio 1_0.png`_

- **Backend (`backend-specialist`)**: Criar rotas de `PUT /catalog/products/bulk` para edição rápida de preços e status.
- **Frontend (`frontend-specialist`)**:
  - Desenvolver uma visão de tabela (data-grid) em `src/app/admin/menu/bulk-edit` permitindo digitação rápida de preços.
  - Desenvolver modal/página para gerenciamento em grade de imagens dos produtos, com upload via arrastar e soltar integrado ao Supabase Storage.

### Fase 3: Importadores de Cardápio (iFood e Inteligente)

> _Referência: `Importação de Cardapio IFood`, `Importação Inteligente`_

- **Backend (`backend-specialist`)**:
  - Endpoint para receber e parsear o `.zip` ou `.json` de exportação do iFood.
  - Endpoint de "Importação Inteligente" que receba um PDF/Imagem do cardápio físico e use IA (Gemini) para estruturar categorias e produtos.
- **Frontend (`frontend-specialist`)**: Telas de step-by-step wizard para upload de arquivos, preview de importação, e confirmação do cardápio importado.

### Fase 4: Potencializador de Cardápio

> _Referência: `Potencializador de Cardapio 1_0` a `1_2`_

- **Backend (`backend-specialist`)**: Endpoint que analisa os produtos atuais (usando IA) e sugere melhorias em nomes, descrições para aumentar conversão.
- **Frontend (`frontend-specialist`)**: Dashboard exibindo o "Score do Cardápio" e cards de sugestão com botão de "Aplicar melhoria" automático.

---

## 🚦 Critérios de Aceitação (UI/UX Stitch)

- **Cores & Backgrounds**: Uso exclusivo de `bg-surface-card`, `bg-surface-page`, `text-primary`.
- **Botões**: Utilizar `bg-action-primary` e `bg-action-secondary` com respectivos states.
- **Feedback**: Sempre utilizar alertas e modais baseados no Sonner e nos padrões do repositório.

## User Review Required

Por favor, analise as fases propostas acima.
Você aprova este plano para começarmos a execução em paralelo com os agentes especializados? (Responda **S** para aprovar ou peça modificações).
