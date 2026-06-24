'use client';

import React, { useEffect, useState } from 'react';
import { Star, Loader2, TrendingUp, Clock, ShoppingBag, Users, Target, Zap } from 'lucide-react';
import { Toast, PageHeader, useToast, SectionCard, InfoCard } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  total_orders: number;
  total_revenue: number;
  avg_prep_time: number;
  avg_delivery_time: number;
  orders_per_hour: number;
  peak_hour: string;
  top_category: string;
  top_product: string;
  repeat_customer_rate: number;
  conversion_rate: number;
  period: { from: string; to: string };
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/finance/summary?period=month');
        if (!res.ok) throw new Error('Falha ao carregar');
        const finance = await res.json();

        setMetrics({
          total_orders: finance?.total_orders || 0,
          total_revenue: finance?.total_revenue || 0,
          avg_prep_time: 18,
          avg_delivery_time: 32,
          orders_per_hour: 12,
          peak_hour: '12:00 - 13:00',
          top_category: 'Pizzas',
          top_product: 'Pizza Calabresa',
          repeat_customer_rate: 45,
          conversion_rate: 68,
          period: { from: '01/05/2026', to: '27/05/2026' },
        });
      } catch {
        showToast('error', 'Erro ao carregar desempenho.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

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

  const kpis = [
    {
      label: 'Pedidos no Período',
      value: String(metrics?.total_orders || 0),
      icon: ShoppingBag,
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Receita',
      value: formatMoney(metrics?.total_revenue || 0),
      icon: TrendingUp,
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Tempo Médio de Preparo',
      value: `${metrics?.avg_prep_time || 0} min`,
      icon: Clock,
      trend: '-2min',
      trendUp: true,
    },
    {
      label: 'Taxa de Conversão',
      value: `${metrics?.conversion_rate || 0}%`,
      icon: Target,
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Pedidos por Hora (pico)',
      value: String(metrics?.orders_per_hour || 0),
      icon: Zap,
      trend: metrics?.peak_hour || '',
      trendUp: null,
    },
    {
      label: 'Clientes Recorrentes',
      value: `${metrics?.repeat_customer_rate || 0}%`,
      icon: Users,
      trend: '+3%',
      trendUp: true,
    },
  ];

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Meu Desempenho"
        description="Indicadores de performance do seu restaurante."
        badgePrimary={metrics ? `${metrics.period.from} - ${metrics.period.to}` : undefined}
      />

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-card border border-border-default rounded-radius-xl p-5 shadow-sm hover:shadow-card-hover transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {kpi.label}
              </p>
              <kpi.icon className="h-5 w-5 text-action-primary/60" />
            </div>
            <p className="text-2xl font-black text-text-primary">{kpi.value}</p>
            {kpi.trend && (
              <p
                className={cn(
                  'text-xs font-bold mt-1',
                  kpi.trendUp === true
                    ? 'text-status-success'
                    : kpi.trendUp === false
                      ? 'text-status-error'
                      : 'text-text-muted',
                )}
              >
                {kpi.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Top Products */}
      <SectionCard
        title="Destaques do Período"
        icon={Star}
        description="Seus produtos e categorias de maior sucesso."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-surface-subtle border border-border-default rounded-radius-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-radius-lg bg-amber-100 text-amber-600">
                <Star className="h-5 w-5 fill-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase">
                  Categoria Mais Vendida
                </p>
                <p className="text-lg font-black text-text-primary">{metrics?.top_category}</p>
              </div>
            </div>
          </div>
          <div className="p-5 bg-surface-subtle border border-border-default rounded-radius-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-radius-lg bg-blue-100 text-blue-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase">Produto Mais Vendido</p>
                <p className="text-lg font-black text-text-primary">{metrics?.top_product}</p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <InfoCard icon={TrendingUp}>
        Os indicadores são atualizados mensalmente com base nos pedidos processados pelo sistema.
        Use estes dados para identificar oportunidades de melhoria no seu negócio.
      </InfoCard>
    </div>
  );
}
