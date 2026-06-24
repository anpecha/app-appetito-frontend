'use client';

import React from 'react';
import {
  Award,
  Check,
  Gift,
  Zap,
  Headphones,
  Cloud,
  Shield,
  Smartphone,
  BarChart,
  Bot,
} from 'lucide-react';
import { PageHeader, SectionCard, InfoCard } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const BENEFITS = [
  {
    icon: Cloud,
    title: 'SaaS 100% na Nuvem',
    desc: 'Acesse de qualquer lugar, sem instalação. Seus dados seguros em servidores com备份e alta disponibilidade.',
  },
  {
    icon: Smartphone,
    title: 'Cardápio Digital',
    desc: 'Cardápio online com QR Code. Clientes acessam pelo celular e fazem pedidos sem precisar de app.',
  },
  {
    icon: Bot,
    title: 'Robô de Atendimento IA',
    desc: 'IA que responde clientes automaticamente via chat ou WhatsApp, 24 horas por dia.',
  },
  {
    icon: Zap,
    title: 'PDV Rápido e Intuitivo',
    desc: 'Frente de caixa otimizada para touchscreen. Vendas rápidas com poucos cliques.',
  },
  {
    icon: Headphones,
    title: 'Suporte Prioritário',
    desc: 'Equipe dedicada para resolver suas dúvidas rápido. Chat, e-mail e WhatsApp.',
  },
  {
    icon: BarChart,
    title: 'Relatórios em Tempo Real',
    desc: 'Acompanhe vendas, ticket médio, produtos mais vendidos e desempenho da equipe.',
  },
  {
    icon: Shield,
    title: 'Segurança de Dados',
    desc: 'Criptografia ponta-a-ponta, certificado digital e conformidade com a LGPD.',
  },
  {
    icon: Gift,
    title: 'Atualizações Constantes',
    desc: 'Novas funcionalidades todo mês. O Appétito evolui com base no feedback dos clientes.',
  },
];

const PLANS = [
  {
    name: 'Start',
    price: 'Grátis',
    period: '',
    popular: false,
    features: ['1 usuário', '50 pedidos/mês', 'Cardápio digital', 'QR Code estático'],
  },
  {
    name: 'Pro',
    price: 'R$ 97,90',
    period: '/mês',
    popular: true,
    features: [
      'Usuários ilimitados',
      'Pedidos ilimitados',
      'Cardápio digital + QR Code',
      'Robô IA',
      'KDS',
      'Relatórios',
      'Suporte prioritário',
      'App Garçom',
    ],
  },
  {
    name: 'Enterprise',
    price: 'R$ 197,90',
    period: '/mês',
    popular: false,
    features: [
      'Tudo do Pro',
      'Nota fiscal integrada',
      'API dedicada',
      'Gerente de sucesso',
      'SLA 99.9%',
      'Onboarding personalizado',
      'Integrações customizadas',
    ],
  },
];

export default function BenefitsPage() {
  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-5xl animate-in fade-in duration-500">
      <PageHeader
        title="Vantagens Appétito"
        description="Descubra por que o Appétito é a melhor plataforma para seu restaurante."
      />

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="bg-surface-card border border-border-default rounded-radius-xl p-5 shadow-sm hover:shadow-card-hover transition-all hover:-translate-y-0.5"
          >
            <div className="p-2.5 rounded-radius-lg bg-action-primary/10 text-action-primary w-fit mb-4">
              <b.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-text-primary mb-1">{b.title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <SectionCard
        title="Planos e Preços"
        icon={Award}
        description="Escolha o plano ideal para o seu negócio."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative bg-surface-card border rounded-radius-xl p-6 shadow-sm flex flex-col',
                plan.popular
                  ? 'border-action-primary ring-2 ring-action-primary/20'
                  : 'border-border-default',
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-action-primary text-text-on-brand text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-radius-full">
                  MAIS POPULAR
                </span>
              )}
              <h3 className="text-lg font-black text-text-primary">{plan.name}</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-black text-text-primary">{plan.price}</span>
                <span className="text-sm text-text-muted">{plan.period}</span>
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-status-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? 'strong' : 'secondary'} className="w-full">
                {plan.price === 'Grátis' ? 'Começar Grátis' : 'Assinar Agora'}
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <InfoCard icon={Award}>
        Todos os planos incluem 7 dias de teste grátis. Sem fidelidade. Cancele quando quiser.
      </InfoCard>
    </div>
  );
}
