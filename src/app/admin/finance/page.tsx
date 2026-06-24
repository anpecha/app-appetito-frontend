'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, ShoppingBag, Receipt, BarChart3 } from 'lucide-react';

type Period = 'today' | 'week' | 'month' | 'all';

interface DailyRevenue {
  date: string;
  revenue: number;
}

interface Transaction {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

interface FinanceSummary {
  period: string;
  total_revenue: number;
  total_orders: number;
  avg_ticket: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  daily_revenue: DailyRevenue[];
  recent_transactions?: Transaction[];
}

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  week: '7 dias',
  month: '30 dias',
  all: 'Tudo',
};

const TYPE_LABELS: Record<string, string> = {
  delivery: 'Delivery',
  local: 'Balcão',
  takeout: 'Retirada',
  dine_in: 'Mesa',
};

export default function FinancePage() {
  const [period, setPeriod] = useState<Period>('today');
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (p: Period) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/proxy/finance/summary?period=${p}`);
      if (!res.ok) throw new Error('Falha ao buscar dados financeiros');
      setSummary(await res.json());
    } catch {
      setError('Erro ao carregar dados. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(period);
  }, [period, fetchSummary]);

  const formatCurrency = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Bar chart helpers
  const maxRevenue = Math.max(...(summary?.daily_revenue.map((d) => d.revenue) ?? [0]), 1);

  const formatShortDate = (dateStr: string) => {
    try {
      const [, month, day] = dateStr.split('-');
      return `${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-page gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Financeiro</h1>
          <p className="text-text-secondary mt-1">Resumo de faturamento por período.</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1 bg-surface-card border border-border-default rounded-radius-lg p-1">
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-radius-md transition-colors ${
                period === p
                  ? 'bg-action-primary text-text-on-brand shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-status-error/10 border border-status-error/30 rounded-radius-lg text-sm text-status-error font-medium shrink-0">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        {[
          {
            label: 'Faturamento',
            value: loading ? '—' : formatCurrency(summary?.total_revenue ?? 0),
            sub: PERIOD_LABELS[period],
            icon: TrendingUp,
            color: 'text-status-success',
            bg: 'bg-status-success/10',
          },
          {
            label: 'Pedidos',
            value: loading ? '—' : String(summary?.total_orders ?? 0),
            sub: 'finalizados e em andamento',
            icon: ShoppingBag,
            color: 'text-action-primary',
            bg: 'bg-action-primary/10',
          },
          {
            label: 'Ticket Médio',
            value: loading ? '—' : formatCurrency(summary?.avg_ticket ?? 0),
            sub: 'por pedido',
            icon: Receipt,
            color: 'text-status-warning',
            bg: 'bg-status-warning/10',
          },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-surface-card rounded-radius-xl border border-border-default shadow-sm p-5 flex items-start gap-4"
          >
            <div className={`${bg} ${color} p-3 rounded-radius-lg shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {label}
              </p>
              <p
                className={`text-2xl font-bold mt-0.5 ${loading ? 'animate-pulse text-text-muted' : 'text-text-primary'}`}
              >
                {value}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
        {/* Daily Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-surface-card rounded-radius-xl border border-border-default shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-action-primary" />
            <h3 className="text-sm font-bold text-text-primary">Faturamento (últimos 7 dias)</h3>
          </div>
          {loading ? (
            <div className="h-36 animate-pulse bg-surface-subtle rounded-radius-lg" />
          ) : (summary?.daily_revenue.length ?? 0) === 0 ? (
            <div className="h-36 flex items-center justify-center text-xs text-text-muted">
              Sem dados para o período.
            </div>
          ) : (
            <div className="flex items-end gap-2 h-36 mt-2">
              {summary!.daily_revenue.map((d) => {
                const heightPct = (d.revenue / maxRevenue) * 100;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-xs text-action-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(d.revenue)}
                    </span>
                    <div
                      className="w-full bg-action-primary/80 hover:bg-action-primary rounded-t-radius-sm transition-all"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                    <span className="text-xs text-text-muted">{formatShortDate(d.date)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By Type Breakdown */}
        <div className="bg-surface-card rounded-radius-xl border border-border-default shadow-sm p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4">Receita por Canal</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-surface-subtle rounded-radius-md animate-pulse" />
              ))}
            </div>
          ) : Object.keys(summary?.by_type ?? {}).length === 0 ? (
            <p className="text-xs text-text-muted">Sem dados para o período.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(summary?.by_type ?? {}).map(([type, revenue]) => {
                const total = Object.values(summary!.by_type).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((revenue / total) * 100);
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-text-secondary">
                        {TYPE_LABELS[type] ?? type}
                      </span>
                      <span className="text-text-muted">
                        {formatCurrency(revenue)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-surface-subtle rounded-radius-full overflow-hidden">
                      <div
                        className="h-full bg-action-primary rounded-radius-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-surface-card rounded-radius-xl border border-border-default shadow-sm p-5 shrink-0">
        <h3 className="text-sm font-bold text-text-primary mb-4">Pedidos por Status</h3>
        {loading ? (
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-16 bg-surface-subtle rounded-radius-lg animate-pulse"
              />
            ))}
          </div>
        ) : Object.keys(summary?.by_status ?? {}).length === 0 ? (
          <p className="text-xs text-text-muted">Sem dados para o período.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(summary?.by_status ?? {}).map(([status, count]) => (
              <div
                key={status}
                className="flex-1 min-w-[100px] bg-surface-subtle rounded-radius-lg p-3 text-center"
              >
                <p className="text-2xl font-bold text-text-primary">{count}</p>
                <p className="text-xs text-text-muted mt-0.5 capitalize">{status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-surface-card rounded-radius-xl border border-border-default shadow-sm p-5 shrink-0">
        <h3 className="text-sm font-bold text-text-primary mb-4">Transações Recentes</h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between h-12 bg-surface-subtle rounded-radius-md animate-pulse"
              />
            ))}
          </div>
        ) : (summary?.recent_transactions ?? []).length === 0 ? (
          <p className="text-xs text-text-muted">Nenhuma transação recente encontrada.</p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {summary!.recent_transactions!.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{tx.customer}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted">Pedido #{tx.id.slice(-4)}</span>
                    <span className="text-xs text-text-muted">•</span>
                    <span className="text-xs text-text-muted">{formatShortDate(tx.date)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-status-success">
                    +{formatCurrency(tx.amount)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-radius-sm font-medium ${tx.status === 'completed' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}
                  >
                    {tx.status === 'completed' ? 'Concluído' : 'Processando'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
