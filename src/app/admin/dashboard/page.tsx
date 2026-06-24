'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Receipt,
  ArrowRight,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  MenuSquare,
  Bike,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FinanceSummary {
  total_revenue: number;
  total_orders: number;
  avg_ticket: number;
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  loading,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; up: boolean };
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-card shadow-card p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {title}
          </span>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-text-muted mt-1" />
          ) : (
            <span className="text-xl font-black text-text-primary leading-tight truncate">
              {value}
            </span>
          )}
          <span className="text-xs text-text-muted">{subtitle}</span>
        </div>
        <div
          className={`${iconBg} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ml-3`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {trend && !loading && (
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-1">
          {trend.up ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-red-500 shrink-0" />
          )}
          <span className={`text-xs font-semibold ${trend.up ? 'text-green-600' : 'text-red-500'}`}>
            {trend.value}
          </span>
          <span className="text-xs text-text-muted ml-0.5">vs. ontem</span>
        </div>
      )}
    </div>
  );
}

// ─── Quick Link Card ──────────────────────────────────────────────────────────

function QuickLink({
  href,
  label,
  description,
  icon: Icon,
  accentBg,
  accentText,
  badge,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  accentBg: string;
  accentText: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border-default bg-surface-card p-5 shadow-card hover:shadow-card-hover hover:border-action-primary/30 transition-all duration-200 cursor-pointer"
    >
      <div className={`${accentBg} flex h-10 w-10 shrink-0 items-center justify-center rounded-lg`}>
        <Icon className={`h-5 w-5 ${accentText}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary text-sm">{label}</span>
          {badge && (
            <span className="text-[10px] font-bold bg-[#DA291C] text-white px-1.5 py-0.5 rounded-full leading-none">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5 truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-action-primary transition-colors shrink-0" />
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<FinanceSummary | null>(null);
  const [totalCustomers, setTotalCustomers] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<string>('');

  const loadMetrics = React.useCallback(async () => {
    try {
      const [financeRes, customersRes] = await Promise.all([
        fetch('/api/proxy/finance/summary?period=today'),
        fetch('/api/proxy/customers'),
      ]);
      if (financeRes.ok) setSummary(await financeRes.json());
      if (customersRes.ok) setTotalCustomers((await customersRes.json()).length);
      setLastUpdated(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      );
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60_000);
    return () => clearInterval(interval);
  }, [loadMetrics]);

  // ─── KPI config ─────────────────────────────────────────────────────────

  const KPIS = [
    {
      title: 'Pedidos hoje',
      value: summary?.total_orders?.toString() ?? '0',
      subtitle: 'pedidos recebidos',
      icon: ShoppingBag,
      iconBg: 'bg-[#DA291C]/10',
      iconColor: 'text-[#DA291C]',
      trend: { value: '+12%', up: true },
    },
    {
      title: 'Faturamento',
      value: summary ? formatCurrency(summary.total_revenue) : 'R$ 0,00',
      subtitle: 'receita do dia',
      icon: TrendingUp,
      iconBg: 'bg-[#FFC72E]/15',
      iconColor: 'text-amber-600',
      trend: { value: '+8%', up: true },
    },
    {
      title: 'Clientes',
      value: totalCustomers?.toString() ?? '0',
      subtitle: 'na carteira total',
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      trend: { value: '-2%', up: false },
    },
    {
      title: 'Ticket médio',
      value: summary ? formatCurrency(summary.avg_ticket) : 'R$ 0,00',
      subtitle: 'por pedido hoje',
      icon: Receipt,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      trend: { value: '+5%', up: true },
    },
  ];

  const QUICK_LINKS = [
    {
      href: '/admin/orders',
      label: 'Gestão de Pedidos',
      description: 'Kanban em tempo real',
      icon: ShoppingBag,
      accentBg: 'bg-[#DA291C]/10',
      accentText: 'text-[#DA291C]',
      badge: 'Ao vivo',
    },
    {
      href: '/admin/menu',
      label: 'Cardápio',
      description: 'Produtos e categorias',
      icon: MenuSquare,
      accentBg: 'bg-amber-50',
      accentText: 'text-amber-600',
    },
    {
      href: '/admin/finance',
      label: 'Financeiro',
      description: 'Relatórios e faturamento',
      icon: TrendingUp,
      accentBg: 'bg-blue-50',
      accentText: 'text-blue-500',
    },
    {
      href: '/admin/customers',
      label: 'Clientes',
      description: 'CRM e histórico de pedidos',
      icon: Users,
      accentBg: 'bg-green-50',
      accentText: 'text-green-500',
    },
    {
      href: '/admin/settings/delivery',
      label: 'Entregadores',
      description: 'Zonas e taxas de entrega',
      icon: Bike,
      accentBg: 'bg-orange-50',
      accentText: 'text-orange-500',
    },
    {
      href: '/admin/settings/digital-menu',
      label: 'Cardápio Digital',
      description: 'Personalize sua vitrine',
      icon: LayoutDashboard,
      accentBg: 'bg-purple-50',
      accentText: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Visão geral do seu estabelecimento hoje</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            loadMetrics();
          }}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
          title="Atualizar métricas"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {lastUpdated && !loading ? `Atualizado ${lastUpdated}` : 'Atualizando…'}
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${loading ? 'opacity-70' : ''}`}
      >
        {KPIS.map((k) => (
          <KpiCard key={k.title} {...k} loading={loading} />
        ))}
      </div>

      {/* ── Quick Access Grid ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-[#FFC72E]" />
          <h2 className="text-base font-bold text-text-primary">Acesso Rápido</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link) => (
            <QuickLink key={link.href} {...link} />
          ))}
        </div>
      </div>

      {/* ── Coming soon banner ── */}
      <div className="rounded-xl border-2 border-dashed border-[#FFC72E]/40 bg-[#FFC72E]/5 p-5 flex items-center gap-4">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-[#FFC72E]/20 flex items-center justify-center">
          <Zap className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-text-primary text-sm">Em breve: Alertas em tempo real</p>
          <p className="text-xs text-text-muted mt-0.5">
            Notificações sonoras e visuais instantâneas para novos pedidos sem precisar atualizar a
            página.
          </p>
        </div>
      </div>
    </div>
  );
}
