# PRD Frontend - Appetito

## 1. Visão Geral

- **Produto**: SaaS modular de gestão e cardápio digital (Estilo McDonalds).
- **Público**: Clientes finais (Cardápio) e Donos/Gerentes de restaurante (Painel Kanban).
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, **Docker (Containers)**.
- **Plataforma**: Web Responsiva, otimizada primariamente para Mobile (Client-facing) e Desktop (Dashboard). Preparado para App Nativo no futuro.

## 2. Design System (Referências: McDonald's)

- **Cores**:
  - Action Primary: Amarelo Ouro / Mostarda (Botões de Compra/Avançar).
  - Destaques/Alertas: Vermelho (Promoções, Avisos, Cancela).
  - Backgrounds: Branco e Off-white (Limpo, destacando os produtos).
  - Textos: Preto profundo e Cinza chumbo.
- **Tipografia**: Moderna e legível (ex: Inter ou Roboto). Títulos grandes (text-2xl, text-4xl) e foco nas tags de preço.
- **Componentes Core (shadcn/ui + Tailwind)**:
  - **Botões**: Grandes, bem arredondados (`rounded-xl` ou `rounded-full`), fáceis de tocar no celular.
  - **Cards de Produto**: Imagem grande em alta resolução no topo, título, descrição curta e botão de ação embaixo. Sombra sutil (`shadow-md`).
  - **Inputs**: Grandes, com foco claro (border ring vermelho/amarelo) e labels explícitos.
- **UX Geral**: Interface focada diretamente nas imagens da comida. Fluxo de checkout com o mínimo de cliques (less friction).

## 3. Requisitos Não-Funcionais (UX & Performance)

- **Performance**: Catálogo do restaurante deve carregar em < 1 segundo (SSR/Caching do Next.js).
- **Autenticação Segura**: Gerenciada pelo Next.js com `iron-session`. Cookie HTTP-only, `sameSite=lax`, `secure`. Nenhum dado sensível em `localStorage`.
- **Proteção de Voo (Skeletons)**: Skeletons em todas as transições de carregamento de dados do Backend para não travar a tela.
- **Feedback Imediato**: Toasts de Sucesso/Erro no canto superior. Erros nunca mostram stack traces.
- **SSE Middleware**: Consumo de Server-Sent Events do FastAPI para o agente de IA com segurança no Next.js Proxy.

## 4. Mapa de Páginas (App Router)

### 4.1. Área Cliente Final (PDV / Cardápio Digital)

Base: `app/[restaurant_slug]/`

- `/` (Home do Cardápio)
  - Header com Logo e Busca.
  - Navegação rápida por Categorias estilizada (abastecida pelo backend).
  - Listagem de Produtos em Cards (Estilo App McDonald's).
- `/product/[id]` (Detalhes do Item)
  - Imagem full-width no topo.
  - Lista de checkboxes/radios para Adicionais (`product_extras`).
  - Botão pegajoso no rodapé "Adicionar - R$ XX,XX" (Bottom sheet).
- `/checkout`
  - Formulário de dados simples.
  - Seleção de Tipo: Delivery, Retirada no Balcão ou Mesa.
  - Seleção de Pagamento.
- `/tracking/[order_id]`
  - Timeline visual (Novo -> Na Cozinha -> Saiu pra Entrega).
  - Atualização em tempo real (Polling otimizado ou WebSocket).

### 4.2. Área de Gestão (Dono do Restaurante)

Base: `app/admin/`

- `/login`
  - Acesso tradicional Email/Senha.
- `/dashboard` (Visão Geral & Kanban)
  - Menu Lateral (Sidebar) mesclado: Fixo, que colapsa revelando apenas os ícones para dar total respiro a área de Orders.
  - Painel Kanban (`/orders` embutido): Pedidos entrando tocando alerta sonoro. Drag and drop ou click de botão para avançar colunas.
- `/menu` (Gestão de Cardápio)
  - Lista de Produtos e Categorias.
  - Modal Lateral ou Nova Página para Cadastrar Item (com Upload restrito a 5MB). Gerenciamento de Opcionais/Adicionais com botão de Togle para Inativação Rápida (Soft Delete explícito).
- `/finance`
  - Gráficos e cards de métricas (Ticket médio, Lucro do dia, Repasse do Módulo/Taxas).
  - Tabela paginada do histórico.
- `/customers` (CRM)
  - Listagem da carteira de clientes, filtros por recência e envio de disparo de cupom (se usar a API do WhatsApp).
- `/settings`
  - Horários, taxas, gerência de colaboradores (Garçons, Gerentes, Entregadores). Módulos de plano.

## 5. Integração com Backend

- O Frontend **NUNCA** acessará o Supabase diretamente do browser a não ser via Server Components ou Server Actions seguros.
- Toda chamada para o FastAPI passa por uma Route Handler no Next.js (`/api/proxy/[...path]`).
- Esta Route Handler decodifica a sessão (`iron-session`) e repassa a requisição com o cabeçalho seguro `X-User-Id` para o backend FastAPI.
