# PRD Backend - saas-appetito

## 1. Visão Geral

- **Produto**: SaaS modular de gestão e cardápio digital que liberta donos de restaurante do WhatsApp e zera comissões abusivas de delivery.
- **Modelo**: SaaS Modular (R$ 49, R$ 99, R$ 149/mês).
- **Plataformas**: Backend preparado para servir Frontend Web e App Nativo (Mobile).
- **Stack**: FastAPI (Python 3.11+), Supabase (PostgreSQL), LangGraph (IA), **Docker (Containers)**.

## 2. Requisitos Não-Funcionais

- **Segurança (Isolamento)**: Row Level Security (RLS) obrigatório. Nenhum tenant (restaurante) pode acessar dados de outro.
- **Auth**: Autenticação gerida via proxy com Next.js (iron-session). O Backend confia no cabeçalho `X-User-Id` validado pelo proxy.
- **Performance**: Rotas 100% assíncronas (`async def`). Streaming de respostas de IA via SSE.
- **Rate Limit**: 100 req/min por usuário logado.
- **Uploads**: Máximo 5MB por arquivo (Imagens do cardápio/logo, Relatórios em Excel/PDF). Tipos MIME rigorosamente validados.

## 3. Database Schema (Supabase)

### Core Multi-Tenant & Operação

- **`restaurants`**: `id` (uuid), `name`, `document` (CNPJ/CPF), `config_json`, `created_at`, `status`.
- **`users`**: `id` (uuid, auth.uid), `restaurant_id` (fk), `role` (owner, manager, attendant, waiter), `name`, `email`.
- **`couriers`**: (Entregadores) `id`, `restaurant_id` (fk), `name`, `phone`, `vehicle`.
- **`tables`**: (Mesas) `id`, `restaurant_id` (fk), `number`, `status`.

### Catálogo

- **`categories`**: `id`, `restaurant_id` (fk), `name`, `sort_order`, `is_active`.
- **`products`**: `id`, `restaurant_id` (fk), `category_id` (fk), `name`, `description`, `price_cents` (int), `image_url`, `is_active`.
- **`product_extras`**: (Adicionais) `id`, `product_id` (fk), `name`, `price_cents` (int), `is_mandatory`.
- **`price_history`**: (Auditoria/Histórico) `id`, `product_id` (fk), `old_price`, `new_price`, `changed_at`, `changed_by_user`.

### Vendas / PDV

- **`customers`**: `id`, `restaurant_id` (fk), `name`, `phone`, `total_orders`.
- **`orders`**: `id`, `restaurant_id` (fk), `customer_id` (fk, nullable para balcão anônimo), `type` (delivery, local, takeout), `status` (new, accepted, preparing, out_for_delivery, finished, canceled), `total_cents`, `created_at`, `table_id` (fk, nullable).
- **`order_items`**: `id`, `order_id` (fk), `product_id` (fk), `quantity`, `unit_price_cents`, `notes`, `extras_json`.
- **`commands`**: (Comandas) `id`, `restaurant_id` (fk), `table_id` (fk), `status`.

### Financeiro / Assinatura

- **`payments`**: `id`, `order_id` (fk), `restaurant_id` (fk), `method` (pix, credit_card, cash), `amount_cents`, `status`.
- **`coupons`**: `id`, `restaurant_id` (fk), `code`, `discount_type`, `discount_value`, `is_active`.
- **`subscriptions`**: `id`, `restaurant_id` (fk), `plan_name`, `status`, `expires_at`.

### Regras de Negócio (DB)

- **Soft Delete**: `deleted_at` (timestamp, nullable) em produtos, categorias, mesas e usuários. Views ou escopos globais no backend para ignorá-los nas listagens pro cliente.
- **RLS**: Policy `restaurant_isolation`: `restaurant_id = (select restaurant_id from users where id = auth.uid())` para todas as tabelas de domínio.

## 4. Arquitetura do Backend (Endpoints)

Todos os endpoints precisam pertencer a um roteador/módulo (Domain-driven).

- **`/api/v1/catalog`**
  - `GET /categories`, `POST /categories`, `PUT /categories/{id}`, `DELETE /categories/{id}` (Soft Delete)
  - `GET /products`, `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` (Soft Delete - grava em `price_history` se preço mudar)
- **`/api/v1/orders`**
  - `POST /checkout` (Criação do pedido pelo cliente)
  - `GET /` (Filtro Kanban para o restaurante)
  - `PATCH /{id}/status` (Avançar no Kanban)
  - `GET /{id}/tracking` (Status em tempo real pro cliente)
- **`/api/v1/finance`**
  - `GET /dashboard` (Resumo de pagamentos, ticket médio, lucro)
  - `GET /payments` (Detalhes dos recebimentos PIX/Cartão/Dinheiro)
- **`/api/v1/settings`**
  - `GET /restaurant`, `PATCH /restaurant` (Configurações, logo, horários)
- **`/api/v1/webhooks`**
  - `POST /stripe` (Sincronização de assinaturas do SaaS)
  - `POST /whatsapp-events` (Recebimento de mensagens da Z-API/Evoluton)

## 5. Integrações Externas

- **WhatsApp API**: (Z-API, Evolution API ou Oficial). Disparo transacional ("Seu pedido está sendo preparado") e escuta de webhooks para o IA Bot.
- **Pagamentos**: Mercado Pago/Stripe para as transações dos clientes finais. Stripe para a assinatura do SaaS.
- **Fiscal**: Módulo opcional de emissão de NF-e via Focus NFe ou Asaas (somente emitir quando `order.status == finished` e o restaurante tiver o módulo contratado).

## 6. Agent Graph (LangGraph)

- **Função**: Chatbot dinâmico do restaurante no WhatsApp/Web.
- **Nós (Nodes)**:
  - `parse_intent`: Entende o que o cliente quer (cardápio, falar com humano, tempo de entrega).
  - `context_retriever`: Busca dados no DB (promoções ativas, horário de funcionamento).
  - `answer_generator`: Gera a resposta humanizada.
- **Ferramentas (Tools)**:
  - `get_catalog()`: Busca link do cardápio digital do restaurante.
  - `check_order_status(phone)`: Consulta o status atual de um pedido em aberto.
- **Streaming**: O backend reporta o progresso do LLM usando Streaming (SSE) para a integração do WhatsApp disparar a ação de "Digitando..." antes do bloco de texto final.
