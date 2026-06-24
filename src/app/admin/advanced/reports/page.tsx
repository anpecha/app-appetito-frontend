'use client';

import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionCard, Toast, useToast } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

const REPORTS = [
  {
    id: 'sales',
    label: 'Relatório de Vendas',
    desc: 'Vendas por período, produto e categoria.',
    icon: DollarSign,
  },
  {
    id: 'products',
    label: 'Relatório de Produtos',
    desc: 'Desempenho individual de cada produto.',
    icon: ShoppingBag,
  },
  {
    id: 'customers',
    label: 'Relatório de Clientes',
    desc: 'Clientes frequentes, gastos e fidelidade.',
    icon: Users,
  },
  {
    id: 'comparative',
    label: 'Relatório Comparativo',
    desc: 'Compare períodos e analise tendências.',
    icon: TrendingUp,
  },
];

export default function AdvancedReportsPage() {
  const [selected, setSelected] = useState('sales');
  const [period, setPeriod] = useState('month');
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Relatórios"
        description="Relatórios gerenciais avançados para tomada de decisão."
      >
        <Button variant="primary" leftIcon={<Download className="h-4 w-4" />}>
          Exportar
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex flex-wrap gap-2">
        {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-2 text-sm font-bold rounded-radius-md border transition-all cursor-pointer',
              period === p
                ? 'bg-action-primary text-text-on-brand border-action-primary'
                : 'bg-surface-card text-text-secondary border-border-default hover:border-action-primary',
            )}
          >
            {p === 'week'
              ? 'Semana'
              : p === 'month'
                ? 'Mês'
                : p === 'quarter'
                  ? 'Trimestre'
                  : 'Ano'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-4">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={cn(
              'text-left bg-surface-card border rounded-radius-lg p-space-5 transition-all cursor-pointer hover:border-action-primary/50',
              selected === r.id
                ? 'border-action-primary ring-2 ring-action-primary/10'
                : 'border-border-default',
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-radius-lg bg-action-primary/10 flex items-center justify-center">
                <r.icon className="h-5 w-5 text-action-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{r.label}</p>
                <p className="text-[10px] text-text-muted">{r.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <SectionCard
        title={REPORTS.find((r) => r.id === selected)?.label || 'Relatório'}
        icon={BarChart3}
      >
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-text-muted">
          <BarChart3 className="h-12 w-12 opacity-30" />
          <div className="text-center">
            <p className="text-sm font-medium">Relatório em desenvolvimento</p>
            <p className="text-xs mt-1">
              Os dados detalhados estarão disponíveis em breve com gráficos interativos.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
