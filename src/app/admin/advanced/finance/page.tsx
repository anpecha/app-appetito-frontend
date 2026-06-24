'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Loader2 } from 'lucide-react';
import { PageHeader, SectionCard, Toast, useToast } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface FinanceSummary {
  total_revenue: number;
  total_orders: number;
  avg_ticket: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
}

export default function AdvancedFinancePage() {
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'all'>('month');
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/proxy/finance/summary?period=${period}`);
        if (res.ok) setData(await res.json());
      } catch {
        showToast('error', 'Erro ao carregar dados financeiros.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period, showToast]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );
  }

  const periodLabel = period === 'month' ? 'Este Mês' : 'Todo Período';

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader title="Financeiro" description="Gestão financeira avançada do seu restaurante." />

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex gap-2">
        {(['month', 'all'] as const).map((p) => (
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
            {p === 'month' ? 'Este Mês' : 'Todo Período'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-4">
        {[
          {
            label: 'Faturamento',
            value: data?.total_revenue ?? 0,
            prefix: 'R$',
            icon: DollarSign,
            color: 'text-status-success',
          },
          {
            label: 'Pedidos',
            value: data?.total_orders ?? 0,
            icon: Receipt,
            color: 'text-action-primary',
          },
          {
            label: 'Ticket Médio',
            value: data?.avg_ticket ?? 0,
            prefix: 'R$',
            icon: TrendingUp,
            color: 'text-[#8B5CF6]',
          },
          {
            label: 'Pendentes',
            value: Object.entries(data?.by_status ?? {})
              .filter(([k]) => k !== 'finished' && k !== 'canceled')
              .reduce((a, [_, v]) => a + v, 0),
            icon: TrendingDown,
            color: 'text-status-warning',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-card border border-border-default rounded-radius-lg p-space-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-text-muted uppercase">{s.label}</p>
              <s.icon className={cn('h-5 w-5', s.color)} />
            </div>
            <p className={cn('text-2xl font-bold', s.color)}>
              {s.prefix === 'R$' ? `R$ ${(s.value as number).toFixed(2)}` : s.value}
            </p>
            <p className="text-[10px] text-text-muted mt-1">{periodLabel}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
        <SectionCard title="Receitas por Tipo" icon={TrendingUp}>
          {data?.by_type && Object.keys(data.by_type).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.by_type).map(([type, value]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {type === 'dine_in'
                      ? 'Salão'
                      : type === 'delivery'
                        ? 'Delivery'
                        : type === 'pickup'
                          ? 'Retirada'
                          : type}
                  </span>
                  <span className="text-sm font-bold text-text-primary">R$ {value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted py-4 text-center">Nenhum dado disponível.</p>
          )}
        </SectionCard>

        <SectionCard title="Receitas por Status" icon={TrendingUp}>
          {data?.by_status && Object.keys(data.by_status).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.by_status).map(([status, value]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {status === 'finished'
                      ? 'Concluídos'
                      : status === 'canceled'
                        ? 'Cancelados'
                        : status === 'preparing'
                          ? 'Preparando'
                          : status}
                  </span>
                  <span className="text-sm font-bold text-text-primary">{value} pedidos</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted py-4 text-center">Nenhum dado disponível.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
