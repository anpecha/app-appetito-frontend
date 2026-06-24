# Walkthrough — Redesign Stitch [SaaS Appetito] (Configurações)

Este documento documenta todas as alterações feitas para unificar e aplicar rigorosamente os tokens semânticos do **Design System Stitch** (como `action-primary`, `surface-card`, `radius-xl`) nas telas do módulo administrativo, eliminando hardcodes arbitrários do Tailwind de toda interface.

## 1. Mapeamento dos Tokens no Tailwind e MASTER.md

- **`design-system/MASTER.md`**: Reescrevemos as definições para ficarem à prova de erros, introduzindo valores fixos (e.g., `text-primary: #202020`, `action-primary: #DA291C`).
- **`tailwind.config.ts`**: Adicionamos explicitamente a escala semântica:
  - Estendemos `spacing` com tokens exatos como `space-1`, `space-6`, `space-8`.
  - Estendemos `fontSize` mapeando nossa tipografia `text-text-xs` até `text-text-5xl`.
  - Isso garante que a engine do Tailwind gere as classes exatas prescritas no MASTER.md (ex: `p-space-4`, `gap-space-2`).

## 2. Refatoração do `_shared.tsx`

Refizemos completamente o repositório de componentes básicos de Settings (`src/app/admin/settings/_shared.tsx`):

- **`PageHeader`**: Adição de Badges superiores opcionais (`badgePrimary` e `badgeSecondary`), agora respeitando `text-text-3xl`, `tracking-tight` e a formatação `pb-space-8`.
- **`SectionCard`**: O container foi padronizado em um visual "elevado sutil", usando `bg-surface-card rounded-radius-xl shadow-card p-space-6`.
- **`Toggle`**: Foi desmembrado numa entidade própria, permitindo que a tela refatore botões de liga/desliga separadamente ou através da nova variação padronizada `ToggleRow`.
- Todos os ícones, transições e interações foram linkados aos tokens de "action" e "status" (`border-focus`, `action-primary-hover`).

## 3. Tela Estabelecimento (`establishment/page.tsx`)

Re-orquestramos o form inteiro para espelhar as mudanças globais do design system usando os componentes padronizados de `_shared.tsx`:

- Remoção total de referências explícitas como `bg-white`, `rounded-3xl` e `bg-[#DA291C]`.
- As seções ganharam uma identidade muito mais modular via `<SectionCard>` com espaçamentos fluidos e consistentes baseados na nossa escala de padronização (`space-4`, `space-8`).
- O botão salvar (`<Button>`) agora integra os estados precisos: `bg-action-primary hover:bg-action-primary-hover active:bg-action-primary-active`.
- As marcações de abertura de horário com toggle são processadas individualmente usando a prop `ToggleRow`.

## 4. Tela Fluxo de Pedidos (`orders/page.tsx`)

A tela de configurações foi inteiramente re-desenhada para consumir os mesmos `<SectionCard>` e `<ToggleRow>` introduzidos previamente:

- Não existem mais customizações divergentes: ambas as telas dividem agora os mesmos visuais e reações a interações (hover states idênticos, radius, e ring inputs coerentes).
- Uso do hook otimizado `useToast` unificado.

## 5. Correção da Navegação Lateral (Sidebar)

Ajuste da estrutura do menu lateral (`src/app/admin/layout.tsx`) para refletir hierarquia agrupada e reintrodução do Dashboard, combinando referências fornecidas para "Meu dia a dia", "Configurações" e "Gestão Avançada".

## 6. Hierarquia de Categorias (Subcategorias)

Adaptando referências do "Anota ai" mantendo o Stitch Design System.

1. **Database:** Migration `20240110000000_add_parent_id_to_categories.sql` criando a coluna `parent_id`.
2. **Backend:** Inclusão de `parent_id` nos modelos Pydantic da rota `/catalog/categories`.
3. **Frontend:**
   - `CategoryFormModal`: Dropdown de seleção de "Categoria Pai" na criação.
   - `MenuManagementPage`: Renderização recursiva (tree-view) das Categorias, permitindo níveis N de subcategorias através da estilização `padding-left`.

## Resultados e Verificações Finais

- Tudo compilou com perfeição (`npm run lint`), limpando inclusive algumas variáveis não utilizadas (`Users`, `useCallback`) que haviam sobrado e causavam warnings antes.
- Essa consolidação pavimenta o caminho inteiro pros outros módulos de "Configuração" seguirem estritamente as regras de layout impostas pelo conceito do Painel Administrativo ("Stitch").

## Phase 3 - Lote 1: Configurações Globais da Loja

Atendendo às referências do "Anota Ai" referentes a Endereço, Loja, Horários, Taxa Mínima e Formas de Pagamento:

1. **Estabelecimento (`establishment`)**: Refatorada a página inteira para parar de usar dados _mockados_ e conectar _real-time_ com `/api/proxy/settings/restaurant`. Salvando Horários, CNPJ e WhatsApp organizadamente dentro do `config_json`.
2. **Entregadores (`delivery`)**: Adicionado controle de **Taxa Mínima do Pedido** e **Entrega Grátis acima de R$ X** no topo da página de Zonas de Entrega.
3. **Pagamentos (`payments`)**: Criada DO ZERO a página de Formas de Pagamento em `src/app/admin/settings/payments/page.tsx`, utilizando o Design System nativo (`SectionCard`, `Toggle`) para habilitar Pix, Cartões, Dinheiro (com necessidade de Troco) e Vale Refeição. Os dados são salvos em `config_json.payment_settings`.

## Phase 3 - Lote 2: Frente de Caixa (PDV)

Uma Single Page Application focada inteiramente em estabilidade e uso fluído por operadores de caixa:

1. **Database / Backend**: Verificada a migration `orders.type` (`delivery`, `pickup`, `dine_in`). O schema de Pydantic na rota `/orders/checkout` foi retificado para impedir enums inválidos, casando exatamente com as enumerações do banco de dados (rejeitando `takeout` e `local` não suportados pelo DB original).
2. **Frontend (`/admin/cashier`)**: Desenvolvido um Painel de POS (Point of sale):
   - **Esquerda**: Catálogo puxado otimizado da rota pública existente (`/catalog/public`). Categorias organizadas por pills no topo, e grade de Cards com hover states Stitch. Imagens Lazy Load.
   - **Direita**: Aba de "Comanda" afixada (Sticky) permitindo adicionar produtos dinamicamente `updateQuantity()`. Selector integrado de Mesa/Balcão/Delivery e atalhos rápidos de Pagamento (Dinheiro, PIX, Cartão). Integração direta por fetch assíncrono finalizando em `checkout()`.
   - **Links e Layout**: Ajustado todos os links da Sidebar do projeto de antigas nomenclaturas "Pedidos Balcão" para focar diretamente e exclusivamente à rota isolada `/admin/cashier`.

## Phase 3 - Lote 3: "Meu Salão" (Gestão Físicas e Mesas)

1. **Backend (`/routes/tables.py`)**: Criado no FastAPI o CRUD unificado de "Mesas" (`tables`) interagindo estritamente com o tenant atual (`restaurant_id`).
2. **Atualização Checkout (`/routes/orders.py`)**: A rota `checkout` foi readaptada para receber `table_id` e atualizar o status da mesa automaticamente para "Ocupada" quando o pedido desce do `cashier`.
3. **Frontend de Config**: Construída tela `/admin/dine-in/settings/salon` com CRUD limpo.
4. **Dashboard de Visão do Garçom** (`/admin/dine-in/management`): Uma tela assíncrona exibindo Mesas. Ela converte num mapa em tempo real listando as comandas atreladas as respectivas mesas e o tempo de uso (+ total gastado globalizado da respectiva mesa).

## Phase 4 - Lote 4: Automação Robô (WhatsApp AI)

1. **Backend (`/routes/bot.py`)**: Criado endpoint unificado `GET/PATCH /bot/settings` que manipula o cluster de cache flexível `config_json.bot_settings` dentro da tabela nativa de `restaurants`. Dispensa uso de SQL migrations pesadas.
2. **Settings AI (`/admin/bot/settings`)**: Controle Toggle Switch central de ativação de Auto Respostas e Saudação inteligente emulando a tela de um device Android para preview do Flow de mensagem.
3. **Template Messages (`/admin/bot/messages`)**: Gestor de templates que varre as variáveis de estado como `{customer_name}`, `{order_id}`, etc para personalizar mensagens automatizadas.
4. **Calling & Feedback (`/admin/bot/calling` | `/admin/bot/feedback`)**: Telas que permitem personalização do Bot para transbordo para Humano e recolher Feedbacks (NPS) dos clientes após horas de finalizado o pedido. Todas interligadas reativamente ao `useToast()` do sistema Stitch.

## Phase 5 - Lote 5: Logística e Entregadores

1. **Database (`20240120000000_add_couriers.sql`)**: Adição da tabela primária `couriers` vinculada com RLS (Row Level Security) e edição da Foreign Key opcional `courier_id` nos `orders`.
2. **Backend Engine (`/routes/delivery.py`)**: Rotas isoladas para lidar com GET, POST, DELETE (soft-delete) de frota e PATCH das instâncias baseando-se em JWT/Current Session.
3. **Register Page (`admin/delivery/register`)**: Frontend de controle de frota (CRUD visual limpo) exibindo grids de drivers, tipologias flexíveis de veículos (Moto, Bike, Carro).
4. **Delivery Areas (`admin/delivery/areas`)**: Modificação do `orders` ou manipulação baseada em settings pra gerenciar Raios ou Bairros. As variáveis vão no JSON Master `config_json.delivery_areas`.
5. **Reports Tab (`admin/delivery/reports`)**: Tela em grid dinâmico e tabelas (design-first) prevendo cálculos de Entregas por Motorista e Totais Dinheiros repassados (+ exportação mockada em CSV). Módulo feito pra não poluir o arquivo principal de `Financeiro`.

## Phase 6 - QA e Testes (Finalização)

1. **Linter Compliance**: Rodado `npm run lint` para remover imports fantasmas vindos de templates velhos (`lucide-react`, variáveis omitidas em desuso).
2. **Build de Produção**: Executado teste global com `npm run build` na interface (Next.js 14).
   - Múltiplos avisos nativos foram resolvidos.
   - A resolução de módulos como `date-fns/locale` foi restabelecida re-instalando do repositório NPM com a tag `-save`.
   - Os Typescript errors estritos de tipagem (`SectionCard -> className`) foram corrigidos para abraçar dinamicidade na DOM sem estourar o build.
   - Build completado com êxito sem warnings críticos. Processo finalizado com Exit 0!
