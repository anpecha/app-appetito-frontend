# Design System — SaaS Appetito

## Visão Geral do App

O Appetito é um SaaS modular para gestão de restaurantes, lanchonetes e pizzarias, focando em libertar os donos do WhatsApp e reduzir taxas de delivery. O aplicativo possui um PDV Digital (Área do Cliente) e um Dashboard Kanban para Gestão (Área do Restaurante). Este Design System garante consistência, acessibilidade e uma estética premium e responsiva (Mobile-first para o cardápio e Desktop-responsive para a gestão). Apenas os tokens semânticos definidos abaixo devem ser utilizados.

## Paleta de Cores (Valores Reais → Tokens)

A paleta baseia-se nas cores da marca (Amarelo Ouro/Mostarda, Vermelho, Branco/Off-white e Preto/Cinza chumbo).

### Texto

- **text-primary**: `#202020` - Cor principal de títulos e texto importante.
- **text-secondary**: `#666666` - Cor de texto de apoio, legendas, descrições.
- **text-muted**: `#9CA3AF` - Cor de placeholders, hints, texto desabilitado.
- **text-on-dark**: `#FFFFFF` - Texto sobre fundos escuros.
- **text-on-brand**: `#FFFFFF` - Texto sobre cor primária da marca (ex: vermelho/amarelo).

### Superfícies (Fundos)

- **surface-page**: `#F9FAFB` - Fundo principal da página.
- **surface-section**: `#FFFFFF` - Fundo de seções alternadas.
- **surface-card**: `#FFFFFF` - Fundo de cards.
- **surface-subtle**: `#F3F4F6` - Fundos sutis, áreas de destaque leve.
- **surface-elevated**: `#FFFFFF` - Elementos elevados (com sombra).

### Ações (Botões, Links)

- **action-primary**: `#DA291C` - Botões principais, links.
- **action-primary-hover**: `#B4292E` - Hover de action-primary.
- **action-primary-active**: `#8B1F23` - Estado pressed.
- **action-secondary**: `#FFC72E` - Botões secundários.
- **action-strong**: `#111827` - CTAs de alta conversão.
- **action-strong-hover**: `#000000` - Hover de action-strong.

### Bordas

- **border-default**: `#E5E7EB` - Bordas padrão.
- **border-subtle**: `#F3F4F6` - Bordas muito sutis.
- **border-focus**: `#DA291C` - Cor do focus ring.

### Status

- **status-success**: `#10B981` - Sucesso, confirmação.
- **status-warning**: `#F59E0B` - Alertas, atenção.
- **status-error**: `#EF4444` - Erros, problemas.

## Espaçamento

Utilizar **apenas** estes valores:

- **space-1**: 4px (mínimo, ícones inline)
- **space-2**: 8px (gaps pequenos)
- **space-3**: 12px (gaps médios internos)
- **space-4**: 16px (padding padrão)
- **space-6**: 24px (padding de cards)
- **space-8**: 32px (gaps entre seções)
- **space-12**: 48px (padding de seções)
- **space-16**: 64px (padding vertical de seções grandes)
- **space-20**: 80px (seções hero)

## Tipografia

Fonte principal: _Inter, sans-serif_.

### Tamanhos

- **text-xs**: 12px (badges, labels pequenos)
- **text-sm**: 14px (texto secundário, captions)
- **text-base**: 16px (corpo de texto)
- **text-lg**: 18px (texto destacado)
- **text-xl**: 20px (subtítulos)
- **text-2xl**: 24px (títulos de cards)
- **text-3xl**: 30px (títulos de seção)
- **text-4xl**: 36px (títulos principais)
- **text-5xl**: 48px (headlines hero)

### Pesos

- **font-normal**: 400 (corpo)
- **font-medium**: 500 (ênfase leve)
- **font-semibold**: 600 (títulos, botões)
- **font-bold**: 700 (headlines)

## Bordas e Sombras

### Border Radius

- **radius-sm**: 6px (inputs, badges)
- **radius-md**: 8px (botões)
- **radius-lg**: 12px (cards pequenos)
- **radius-xl**: 16px (cards grandes)
- **radius-2xl**: 24px (cards hero)
- **radius-full**: 9999px (avatares, pills)

### Sombras

- **shadow-sm**: sombra sutil (inputs, hover states)
- **shadow-md**: sombra média (cards, dropdowns)
- **shadow-lg**: sombra forte (modais, popovers)
- **shadow-card**: sombra específica para cards
- **shadow-card-hover**: sombra para hover de cards
- **shadow-button-primary**: sombra para botões primários

## Componentes Documentados (Padrões Obrigatórios)

### Botões

Todos os botões interativos devem respeitar os estados obrigatórios de Hover, Active, Focus e Disabled.

- **Primary**: bg `action-primary`, texto `text-on-brand`, `radius-md`, sombra `shadow-button-primary`.
- **Secondary**: bg `surface-card`, texto `text-primary`, borda `border-default`, `radius-md`.
- **Strong (CTA)**: bg `action-strong`, texto `text-on-dark`, sombra forte `shadow-md`.

### Cards

- **Background**: `surface-card`
- **Radius**: `radius-xl`
- **Shadow**: `shadow-card`
- **Padding**: `space-6`
- **Hover**: `shadow-card-hover`

### Inputs

- **Background**: `surface-card`
- **Border**: `border-default`
- **Radius**: `radius-sm`
- **Focus**: `border-focus` com ring

## Estados Obrigatórios

Todo componente interativo DEVE ter:

1.  **Default**: estado normal
2.  **Hover**: feedback visual ao passar mouse
3.  **Active/Pressed**: feedback ao clicar
4.  **Focus**: ring visível para acessibilidade
5.  **Disabled**: opacidade reduzida, cursor `not-allowed`

## Exemplos de Uso

### Estrutura de Card Simples (Tailwind)

```html
<div
  class="bg-surface-card rounded-radius-xl shadow-card p-space-6 hover:shadow-card-hover transition-shadow"
>
  <h3 class="text-text-2xl font-semibold text-text-primary mb-space-3">Título do Card</h3>
  <p class="text-text-base text-text-secondary mb-space-4">
    Descrição curta demonstrando o uso da tipografia secundária.
  </p>
  <button
    class="bg-action-primary text-text-on-brand rounded-radius-md shadow-button-primary px-space-4 py-space-2 hover:bg-action-primary-hover active:bg-action-primary-active focus:ring-2 focus:ring-border-focus disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Salvar
  </button>
</div>
```

## Regras Finais de Implementação

1. **Nunca invente valores.** Use apenas os tokens descritos acima.
2. Se um token não existir para uma necessidade específica, **comunicar e solicitar antes de inventar**.
3. **Mantenha consistência:** o mesmo componente deve ser estilizado sempre com os mesmos tokens.
4. **Mobile-first:** Inicie a adaptação pelo contexto móvel e escale para o desktop.
