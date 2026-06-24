'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast, PageHeader, useToast } from '@/app/admin/settings/_shared';
import { AccountSidebar } from '../shared';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Start',
    price: 'Grátis',
    period: '',
    features: ['1 usuário', '50 pedidos/mês', 'Cardápio digital', 'Suporte por e-mail'],
    popular: false,
    current: false,
  },
  {
    name: 'Pro',
    price: 'R$ 97,90',
    period: '/mês',
    features: [
      'Usuários ilimitados',
      'Pedidos ilimitados',
      'Cardápio digital + QR Code',
      'Robô de atendimento IA',
      'KDS (Cozinha)',
      'Relatórios financeiros',
      'Suporte prioritário',
    ],
    popular: true,
    current: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 197,90',
    period: '/mês',
    features: [
      'Tudo do Pro',
      'Nota fiscal integrada',
      'API dedicada',
      'Gerente de sucesso',
      'SLA 99.9%',
      'Onboarding personalizado',
    ],
    popular: false,
    current: false,
  },
];

export default function AccountPlansPage() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader title="Planos" description="Escolha o plano ideal para seu restaurante." />
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="flex gap-8">
        <AccountSidebar active="plans" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Plano Atual
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-black text-text-primary">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-black text-text-primary">{plan.price}</span>
                  <span className="text-sm text-text-muted">{plan.period}</span>
                </div>
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-status-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? 'strong' : plan.popular ? 'primary' : 'secondary'}
                className="w-full"
                disabled={plan.current}
              >
                {plan.current
                  ? 'Plano Atual'
                  : plan.price === 'Grátis'
                    ? 'Começar Grátis'
                    : 'Fazer Upgrade'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
