# Plano de Implementação (saas-appetito / Appetito)

Este plano divide a construção do SaaS em tarefas focadas (5-15 min cada), organizadas por Batch lógicos.

## Batch 1: Infraestrutura (Setup Multi-repositório ou Monorepo turbinado)

- **Task 1.1: Inicializar Frontend Next.js** | Arquivos: Frontend `package.json` | Verificação: O comando `npm run dev` abre a porta 3000 exibindo o App Router. Instalar Shadcn.
- **Task 1.2: Inicializar Backend FastAPI** | Arquivos: Backend `requirements.txt`, `main.py` | Verificação: `uvicorn main:app --reload` exibe Swagger UI na `/docs`.
- **Task 1.3: Conectar Supabase no Backend** | Arquivos: `.env`, `database.py` | Verificação: Script pinga leitura de tabela e não lança exceção.
- **Task 1.4: Configurar `iron-session` + Middleware** | Arquivos: `lib/session.ts`, `middleware.ts` no Next.js | Verificação: Rota `/api/auth/me` decripta cookie corretamente ou retorna 401.
- **Task 1.5: Configurar Docker (Frontend & Backend)** | Arquivos: `Dockerfile` (front), `Dockerfile` (back), `docker-compose.yml` | Verificação: O comando `docker compose up -d` sobe os dois containers na mesma rede sem erros.

## Batch 2: Database (Schema e RLS)

- **Task 2.1: Criar Tabelas Core & Catálogo** | Arquivo: `docs/prd-backend.md` (SQL/Migrations Supersync) | Verificação: Supabase Studio > Table Editor lista `restaurants`, `users`, `categories`, `products`.
- **Task 2.2: Criar Tabelas Vendas & Operação** | Arquivo: `docs/prd-backend.md` | Verificação: Tabelas de `orders`, `order_items`, `customers` e `tables` criadas via SQL.
- **Task 2.3: Aplicar RLS Policies** | Arquivo: SQL script de RLS | Verificação: Conta local teste com Service Role vs Conta teste Auth. Tentar `select * from products` retorna apenas produtos do tenant.
- **Task 2.4: Triggers e Audits** | Arquivo: SQL triggers | Verificação: Atualizar preço do item; conferir se `price_history` inseriu a linha.

## Batch 3: Backend Custom Auth & Users

- **Task 3.1: Autenticação via FastAPI proxy** | Arquivos: Rotas auth FastAPI dependentes de `X-User-Id` | Verificação: Bate endpoint restrito sem HEADER = 401; Com HEADER mock = 200 OK.
- **Task 3.2: CRUD Restritos de Config do Restaurante** | Arquivos: `routes/settings` | Verificação: Editar nome do local via Postman salva no banco.

## Batch 4: Backend Core (Catálogo e Pedidos)

- **Task 4.1: CRUD Categorias e Produtos** | Arquivos: `routes/catalog` | Verificação: Criar, ler, editar produto. Tentar deletar deve apenas atualizar `deleted_at`.
- **Task 4.2: Endpoint Checkout (Post) do Pedido** | Arquivos: `routes/orders` | Verificação: Postman no `/checkout` insere na `orders` e `order_items` retornando hash do pedido.

## Batch 5: Frontend System e Auth

- **Task 5.1: Configurar Tailwind + Variáveis McDonald's** | Arquivos: `globals.css`, `tailwind.config.ts` | Verificação: Subir uma tela com botão primary amarelo-mostarda e fonte base.
- **Task 5.2: Tela de Login e Integração (Next.js)** | Arquivos: `app/admin/login/page.tsx`, `actions/auth.ts` | Verificação: Login bem sucedido injeta cookie de `iron-session` no Application Tab do devtools.

## Batch 6: Frontend Pages (Client-Facing)

- **Task 6.1: Cardápio Digital (View)** | Arquivos: `app/[slug]/page.tsx`, Cards | Verificação: Acesse rota com slug de mock. Produtos renderizam corretamente com as fotos.
- **Task 6.2: Fluxo de Carrinho e Checkout (Floating button)** | Arquivos: Componente de Carrinho, `checkout/form` | Verificação: Clicar "Adicionar", ir ao carrinho e preencher dados preenche os States do React sem erros de validação (zod/react-hook-form).
- **Task 6.3: Tela de Rastreamento Real-time** | Arquivos: `app/tracking/[id]/page.tsx` | Verificação: Status fake na tela altera cor baseada em prop mockada.

## Batch 7: Frontend Pages (Dashboard Restaurante)

- **Task 7.1: Setup Sidebar Collapsible UI** | Arquivos: `components/layout/Sidebar.tsx` | Verificação: Clicar no toggle esconde rótulos/mantêm ícones na esquerda (estilo top SaaS).
- **Task 7.2: Tela de Kanban Dashboard** | Arquivos: `app/admin/dashboard/page.tsx` | Verificação: Mock de data listado em 4 colunas. Drag and drop visual funcional. Integração `PATCH /orders/{id}/status`.
- **Task 7.3: CRUD Visual de Cardápio** | Arquivos: `app/admin/menu/page.tsx` | Verificação: Formulário preenche dados e submete JSON correto via Fetch (proxy Next.js).

## Batch 8: IA LangGraph e SSE

- **Task 8.1: Setup LangGraph State/Graph** | Arquivos: Python Backend (`agent/graph.py`) | Verificação: CLI Graph roda um fluxo humano simulado para "Qual telefone da loja?".
- **Task 8.2: Integrar Tools com DB** | Arquivos: `agent/tools.py` | Verificação: Teste envia pergunta "Qual cardápio" e a LangGraph executa `get_catalog_url()` tool.
- **Task 8.3: Endpoint Streaming (SSE)** | Arquivos: `routes/ai_chat` | Verificação: Postman recebe chunks em `text/event-stream`.

## Batch 9: Integrações Externas e Billing

- **Task 9.1: Conectar Recebimentos (Stripe/MP)** | Arquivos: Backend webhooks, Front redirect | Verificação: Criar link de pagamento fake. Webhook pinga sucesso.
- **Task 9.2: Webhooks Z-API (WA)** | Arquivos: Listener Python, Notificações | Verificação: Script simulando mudança de Status de pedido dispara payload HTTP pro Z-API url mock.
