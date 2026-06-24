'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, TrendingUp, DollarSign, ShoppingBag, Users, Calendar } from 'lucide-react';
import { Toast, PageHeader, useToast, SectionCard, InfoCard } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface DailySummary {
  date: string;
  revenue: number;
  orders_count: number;
  avg_ticket: number;
  new_customers: number;
}

interface ReportData {
  total_revenue: number;
  total_orders: number;
  avg_ticket: number;
  total_customers: number;
  daily: DailySummary[];
}

export default function AnalyticsReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/proxy/finance/summary?period=${period}`);
        if (!res.ok) throw new Error('Falha ao carregar');
        const result = await res.json();
        setData(result);
      } catch {
        showToast('error', 'Erro ao carregar relatórios.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period, showToast]);

  const formatMoney = (v: number) =>
    `R$ ${Number(v || 0)
      .toFixed(2)
      .replace('.', ',')}`;

  if (loading)
    return (
      <div className="flex h-full items-center justify-center py-space-20">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Relatórios"
        description="Acompanhe o desempenho do seu restaurante com dados detalhados."
      >
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-radius-md border transition-all cursor-pointer capitalize',
                period === p
                  ? 'border-action-primary bg-action-primary/5 text-action-primary'
                  : 'border-border-default text-text-secondary hover:border-border-focus',
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
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Receita Total',
            value: formatMoney(data?.total_revenue || 0),
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100',
          },
          {
            label: 'Pedidos',
            value: String(data?.total_orders || 0),
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
          },
          {
            label: 'Ticket Médio',
            value: formatMoney(data?.avg_ticket || 0),
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
          },
          {
            label: 'Clientes',
            value: String(data?.total_customers || 0),
            icon: Users,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-card border border-border-default rounded-radius-xl p-5 shadow-sm hover:shadow-card-hover transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {kpi.label}
              </p>
              <div className={cn('p-2 rounded-radius-lg', kpi.bg)}>
                <kpi.icon className={cn('h-4 w-4', kpi.color)} />
              </div>
            </div>
            <p className="text-2xl font-black text-text-primary">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Breakdown */}
      <SectionCard
        title="Detalhamento Diário"
        icon={Calendar}
        description={`Últimos ${period === 'week' ? '7 dias' : period === 'month' ? '30 dias' : period === 'quarter' ? '3 meses' : '12 meses'}.`}
      >
        {data?.daily && data.daily.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs font-bold text-text-muted uppercase tracking-wider">
                  <th className="text-left py-3 px-2">Data</th>
                  <th className="text-right py-3 px-2">Pedidos</th>
                  <th className="text-right py-3 px-2">Receita</th>
                  <th className="text-right py-3 px-2">Ticket Médio</th>
                  <th className="text-right py-3 px-2">Novos Clientes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.daily.map((day) => (
                  <tr key={day.date} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3 px-2 font-medium text-text-primary">
                      {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-2 text-right text-text-secondary">{day.orders_count}</td>
                    <td className="py-3 px-2 text-right font-semibold text-text-primary">
                      {formatMoney(day.revenue)}
                    </td>
                    <td className="py-3 px-2 text-right text-text-secondary">
                      {formatMoney(day.avg_ticket)}
                    </td>
                    <td className="py-3 px-2 text-right text-text-secondary">
                      {day.new_customers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-8">
            Nenhum dado disponível para o período selecionado.
          </p>
        )}
      </SectionCard>

      <InfoCard icon={TrendingUp}>
        Os dados são atualizados em tempo real. Para relatórios mais detalhados, utilize a
        exportação em CSV disponível na página de Financeiro.
      </InfoCard>
    </div>
  );
}
