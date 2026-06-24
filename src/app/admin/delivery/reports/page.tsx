'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Loader2, Bike, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, PageHeader, useToast, Toast } from '../../settings/_shared';
import { cn } from '@/lib/utils';

// Mock para simulação enquantos os analytics do backend não chegam
const MOCK_REPORTS = [
  {
    id: '1',
    name: 'João Silva',
    vehicle: 'motorcycle',
    completed: 45,
    total_revenue: 650.0,
    avg_time: '22m',
    status: 'active',
  },
  {
    id: '2',
    name: 'Carlos Antunes',
    vehicle: 'bicycle',
    completed: 12,
    total_revenue: 144.0,
    avg_time: '35m',
    status: 'active',
  },
  {
    id: '3',
    name: 'Pedro Moto',
    vehicle: 'motorcycle',
    completed: 89,
    total_revenue: 1250.5,
    avg_time: '18m',
    status: 'inactive',
  },
];

export default function DeliveryReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(MOCK_REPORTS);

  // Configurações Locais
  const { toast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    // Simulando load
    const timer = setTimeout(() => {
      setLoading(false);
      if (period === 'today') {
        setData(
          MOCK_REPORTS.map((r) => ({
            ...r,
            completed: Math.floor(r.completed / 7),
            total_revenue: r.total_revenue / 7,
          })),
        );
      } else if (period === 'week') {
        setData(MOCK_REPORTS);
      } else {
        setData(
          MOCK_REPORTS.map((r) => ({
            ...r,
            completed: r.completed * 4,
            total_revenue: r.total_revenue * 4,
          })),
        );
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <PageHeader
          title="Relatório de Frota"
          description="Acompanhe a produtividade e o faturamento gerado pelos seus entregadores."
        />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Relatório de Frota"
        description="Acompanhe a produtividade e o repasse (taxa de entrega) gerado pelos seus entregadores no período selecionado."
      />
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex flex-col gap-space-6">
        {/* Filters */}
        <div className="flex items-center justify-between bg-surface-card border border-border-default rounded-radius-lg p-space-4 shadow-sm">
          <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-radius-md border border-border-subtle">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-radius-sm transition-all capitalize',
                  period === p
                    ? 'bg-surface-card text-text-primary shadow-sm border border-border-default'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-card/50 border border-transparent',
                )}
              >
                {p === 'today' ? 'Hoje' : p === 'week' ? '7 Dias' : '30 Dias'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            className="border-border-default text-text-secondary hover:text-action-primary hover:bg-action-primary/5 h-9"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-4">
          <div className="bg-surface-card border border-border-default rounded-radius-lg p-space-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Bike className="w-5 h-5 text-action-primary" />
              <span className="font-semibold text-sm">Entregas Realizadas</span>
            </div>
            <span className="text-3xl font-bold text-text-primary">
              {data.reduce((acc, curr) => acc + curr.completed, 0)}
            </span>
          </div>

          <div className="bg-surface-card border border-border-default rounded-radius-lg p-space-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <DollarSign className="w-5 h-5 text-status-success" />
              <span className="font-semibold text-sm">Total Repasse Gerado</span>
            </div>
            <span className="text-3xl font-bold text-text-primary">
              R${' '}
              {data
                .reduce((acc, curr) => acc + curr.total_revenue, 0)
                .toFixed(2)
                .replace('.', ',')}
            </span>
          </div>

          <div className="bg-surface-card border border-border-default rounded-radius-lg p-space-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="w-5 h-5 text-status-warning" />
              <span className="font-semibold text-sm">Tempo Médio (Geral)</span>
            </div>
            <span className="text-3xl font-bold text-text-primary">24 min</span>
          </div>
        </div>

        <SectionCard title="Performance por Entregador" icon={FileText}>
          <div className="overflow-x-auto -mx-space-5 -mb-space-5">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-surface-subtle text-text-secondary uppercase text-[10px] font-bold tracking-wider border-b border-border-default">
                <tr>
                  <th className="px-6 py-4">Entregador</th>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4 text-center">Entregas Concluídas</th>
                  <th className="px-6 py-4 text-center">Tempo Médio</th>
                  <th className="px-6 py-4 text-right">Repasse Aprox.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-surface-card">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-border-default flex items-center justify-center font-bold text-text-secondary text-xs uppercase">
                        {row.name.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{row.name}</span>
                        <span
                          className={cn(
                            'text-[10px] uppercase tracking-wider font-semibold',
                            row.status === 'active' ? 'text-status-success' : 'text-status-error',
                          )}
                        >
                          {row.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-medium">
                      {row.vehicle === 'motorcycle'
                        ? '🛵 Moto'
                        : row.vehicle === 'bicycle'
                          ? '🚲 Bike'
                          : '🚗 Carro'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-text-primary text-base">
                      {row.completed}
                    </td>
                    <td className="px-6 py-4 text-center text-text-secondary">{row.avg_time}</td>
                    <td className="px-6 py-4 text-right font-bold text-text-primary">
                      R$ {row.total_revenue.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
