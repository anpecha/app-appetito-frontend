'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Monitor,
  Users,
  Settings,
  ShoppingBag,
  Bot,
  CreditCard,
} from 'lucide-react';
import { PageHeader, InfoCard } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

const FAQ_CATEGORIES = [
  {
    icon: Monitor,
    label: 'Primeiros Passos',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    items: [
      {
        q: 'Como configurar meu restaurante?',
        a: 'Acesse Configurações > Estabelecimento para cadastrar nome, endereço, CNPJ e horários de funcionamento.',
      },
      {
        q: 'Como criar meu cardápio digital?',
        a: 'Vá em Gestão de Cardápio > Gestor para adicionar categorias e produtos. Você pode incluir fotos, preços e descrições.',
      },
      {
        q: 'Como ativar o cardápio QR Code?',
        a: "Acesse a página 'Cardápio QR Code' em Configuração de Salão para personalizar e gerar o QR Code do seu cardápio.",
      },
    ],
  },
  {
    icon: ShoppingBag,
    label: 'Pedidos',
    color: 'text-green-600',
    bg: 'bg-green-100',
    items: [
      {
        q: 'Como receber pedidos?',
        a: 'Os pedidos aparecem automaticamente no Kanban da página Meus Pedidos. Ative o som de notificação para ser alertado.',
      },
      {
        q: 'Como funciona o Kanban?',
        a: 'Os pedidos passam por 4 colunas: Em análise → Em produção → Pronto → Finalizado. Basta clicar para avançar.',
      },
      {
        q: 'Como gerenciar pedidos do salão?',
        a: "Use a página 'Pedidos Salão' para visualizar mesas ocupadas, abrir comandas e fechar contas.",
      },
    ],
  },
  {
    icon: Bot,
    label: 'Robô IA',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    items: [
      {
        q: 'Como ativar o robô de atendimento?',
        a: 'Vá em Robô > Configurações e ative o robô. Personalize a saudação e as respostas automáticas.',
      },
      {
        q: 'O robô responde em quais canais?',
        a: 'O robô atende pelo chat no cardápio digital e pode ser integrado ao WhatsApp.',
      },
      {
        q: 'Como funciona o feedback?',
        a: 'Após o pedido, o robô pergunta ao cliente sobre a experiência. Os resultados ficam em Análises > Satisfação.',
      },
    ],
  },
  {
    icon: Users,
    label: 'Garçons e Salão',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    items: [
      {
        q: 'Como cadastrar garçons?',
        a: 'Acesse Configuração de Salão > Meus Garçons. Cadastre nome, PIN e telefone.',
      },
      {
        q: 'Como configurar o App Garçom?',
        a: 'Vá em App Garçom para definir permissões, login por PIN e personalizar o aplicativo.',
      },
      {
        q: 'Como criar comandas?',
        a: 'Em Comandas, defina os tipos de comanda (normal, cortesia, avulsa) com prefixo e cor.',
      },
    ],
  },
  {
    icon: CreditCard,
    label: 'Pagamentos',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    items: [
      {
        q: 'Quais formas de pagamento aceitar?',
        a: 'Em Configurações > Pagamentos, ative Pix, cartão, dinheiro e vale refeição.',
      },
      {
        q: 'Como criar cupons de desconto?',
        a: 'Vá em Cupons e crie códigos promocionais com desconto percentual ou valor fixo.',
      },
      {
        q: 'Como configurar taxas?',
        a: 'A taxa de serviço e a taxa mínima de entrega são configuradas em suas respectivas páginas.',
      },
    ],
  },
  {
    icon: Settings,
    label: 'Configurações',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    items: [
      {
        q: 'Como configurar impressoras?',
        a: 'Adicione impressoras térmicas em Configurações > Impressoras. Configure porta, tipo e fila de impressão.',
      },
      {
        q: 'Como configurar nota fiscal?',
        a: 'Em Nota Fiscal, informe CNPJ, IE, regime tributário e certificado digital para emissão de NFC-e.',
      },
      {
        q: 'Como configurar entregas?',
        a: 'Defina áreas de entrega, taxas e tempo estimado em Configurações > Entregadores > Áreas de Entrega.',
      },
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const filtered = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (i) =>
        i.q.toLowerCase().includes(search.toLowerCase()) ||
        i.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-4xl animate-in fade-in duration-500">
      <PageHeader
        title="Instruções de Ajuda"
        description="Tire suas dúvidas e aprenda a usar o Appétito."
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ajuda..."
          className="w-full pl-12 pr-4 h-12 text-sm border border-border-default rounded-radius-xl bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 text-text-primary"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {filtered.map((cat) => (
          <div
            key={cat.label}
            className="bg-surface-card border border-border-default rounded-radius-xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle bg-surface-page/30">
              <div className={cn('p-2 rounded-radius-lg', cat.bg)}>
                <cat.icon className={cn('h-5 w-5', cat.color)} />
              </div>
              <h2 className="font-bold text-text-primary">{cat.label}</h2>
            </div>
            <div className="divide-y divide-border-subtle">
              {cat.items.map((item, idx) => {
                const key = `${cat.label}-${idx}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-subtle transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-text-primary pr-4">{item.q}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-text-muted transition-transform',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-1">
                        <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <InfoCard icon={HelpCircle}>
        Não encontrou o que procura? Envie sua dúvida através da página de Sugestões ou entre em
        contato com nosso suporte.
      </InfoCard>
    </div>
  );
}
