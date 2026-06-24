# Task Checklist — Refactoring Complete SaaS Appetite

Este checklist cobre a construção escalonada baseada na referência do 'Anota Ai'.

- [x] **Lote 1: Configurações Globais da Loja**
  - [x] DB/Backend: Atualizar/Adicionar suporte a Horários de Funcionamento, Taxas Mínimas e Pagamento em `restaurants`.
  - [x] Frontend: Criar/Refatorar Componentes em `src/app/admin/settings/*` para as sub-abas Gerais (Endereço, Loja, Horários, Pagamento).
- [x] **Lote 2: Caixa / PDV (Frente de Caixa)**
  - [x] DB/Backend: Endpoints otimizados (PDV necessita de latência mínima e busca unificada).
  - [x] Frontend: SPA do PDV com categorias colapsáveis e lista do pedido atual.
- [x] **Lote 3: "Meu Salão" e Garçons**
  - [x] DB/Backend: Migrações e rotas de mesas (`tables`) e interações de comandas.
  - [x] Frontend: Telas de Configurações das mesas e gestão.
- [x] **Lote 4: Painel do Robô (Chatbot)**
  - [x] DB/Backend: Base de dados de templates de prompt customizados p/ loja.
  - [x] Frontend: Configuração de textos para envio no WhatsApp + Toggles de notificação.
- [x] **Lote 5: Entregadores e Logística**
  - [x] DB: Tabelas `couriers` e integrações.
  - [x] Frontend: Cadastro dos motoboys e relatório analítico deles.
- [x] **QA e Testes (Finalização)**
  - [x] Testes end-to-end de simulação de fluxo (Menu -> Carrinho -> Painel Administrativo).
