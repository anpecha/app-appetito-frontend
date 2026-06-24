# Plano de Implementação: Lote 5 - Entregadores e Logística

Este plano define a arquitetura e passo a passo para o gerenciamento da frota de entregadores proprietária do restaurante e suas áreas de entrega.

## Objetivo

Criar uma área dedicada para cadasrto de motoboys/entregadores, definição de áreas de cobertura (raios/bairros) e os relatórios operacionais atrelados.

## Proposed Changes

### Database e Migrations

Criaremos uma nova tabela no banco de dados e adicionaremos referência aos pedidos.

#### [NEW] `supabase/migrations/20240120000000_add_couriers.sql`

- **`couriers` table**: ID, `restaurant_id`, `name`, `phone`, `vehicle_type`, `active`, timestamps.
- Adicionar RLS Policies (SELECT, INSERT, UPDATE, DELETE com base no `restaurant_id`).
- Alterar a tabela `orders` adicionando a foreign key opcional `courier_id`.

### Backend: API de Entregadores (Python/FastAPI)

Adicionar rotas para consumo do CRUD de entregadores.

#### [NEW] `backend/routes/delivery.py`

- Endpoints CRUD: `GET /delivery/couriers`, `POST /delivery/couriers`, `PATCH /delivery/couriers/{id}`, `DELETE /delivery/couriers/{id}`.

### Frontend: Telas Administrativas (Next.js)

Construir as visualizações seguindo rigorosamente as cores e métricas do **Stitch Design System**.

#### [NEW] `src/app/admin/delivery/register/page.tsx`

- Tela de cadastro dos entregadores logísticos da loja contendo formulário (nome, celular e tipo de veículo) e tabela de listagem.

#### [NEW] `src/app/admin/delivery/areas/page.tsx`

- Configuração das Áreas de Entrega (lida/salva a partir do `config_json` da tabela `restaurants`).
- Determina taxa fixa, entrega por Bairro ou Raio (KM) e tempo estimado Padrão.

## Verification Plan

### Automated Tests

- O linter (`npm run lint`) será executado para garantir a coesão de tipagens.
- Validação semântica e import compliance checada no painel.

### Manual Verification

- Enviar push remoto e verificar com o Lojista como o módulo opera.
