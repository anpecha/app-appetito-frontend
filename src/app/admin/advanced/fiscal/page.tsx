'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, Filter, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, SectionCard, Toast, useToast } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface Invoice {
  id: string;
  order_id: string;
  customer_name: string;
  value: number;
  status: string;
  issued_at: string;
  nfce_number: string;
}

export default function AdvancedFiscalPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/orders?all=true');
        if (res.ok) {
          const data = await res.json();
          setInvoices(
            (data || [])
              .filter((o: any) => o.fiscal_note)
              .map((o: any) => ({
                id: o.id,
                order_id: o.order_number || o.id.slice(0, 8),
                customer_name: o.customer?.name || 'Consumidor',
                value: o.total || 0,
                status: o.fiscal_note?.status || 'pending',
                issued_at: o.fiscal_note?.issued_at || o.created_at,
                nfce_number: o.fiscal_note?.number || '—',
              })),
          );
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    fetchData();
  }, [showToast]);

  const filtered = invoices.filter(
    (i) =>
      i.order_id.toLowerCase().includes(search.toLowerCase()) ||
      i.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      i.nfce_number.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total: invoices.length,
    issued: invoices.filter((i) => i.status === 'issued').length,
    pending: invoices.filter((i) => i.status === 'pending').length,
    canceled: invoices.filter((i) => i.status === 'canceled').length,
  };

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Nota Fiscal"
        description="Gestão avançada de notas fiscais eletrônicas (NFC-e / NF-e)."
      />

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-text-primary' },
          { label: 'Emitidas', value: stats.issued, color: 'text-status-success' },
          { label: 'Pendentes', value: stats.pending, color: 'text-status-warning' },
          { label: 'Canceladas', value: stats.canceled, color: 'text-status-error' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-card border border-border-default rounded-radius-lg p-space-5"
          >
            <p className="text-xs font-bold text-text-muted uppercase">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Notas Fiscais Emitidas" icon={FileText}>
        <div className="flex items-center gap-space-3 mb-space-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por pedido, cliente ou NFC-e..."
              className="pl-9"
            />
          </div>
          <Button variant="secondary" leftIcon={<Filter className="h-4 w-4" />}>
            Filtros
          </Button>
          <Button variant="primary" leftIcon={<Download className="h-4 w-4" />}>
            Exportar
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-action-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-text-muted gap-2">
            <FileText className="h-8 w-8 opacity-50" />
            <p className="text-sm">Nenhuma nota fiscal encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-xs font-bold text-text-muted uppercase">
                  <th className="text-left py-3 px-2">Pedido</th>
                  <th className="text-left py-3 px-2">Cliente</th>
                  <th className="text-right py-3 px-2">Valor</th>
                  <th className="text-center py-3 px-2">NFC-e</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-center py-3 px-2">Data</th>
                  <th className="text-center py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3 px-2 font-mono text-xs font-bold">#{inv.order_id}</td>
                    <td className="py-3 px-2">{inv.customer_name}</td>
                    <td className="py-3 px-2 text-right font-medium">R$ {inv.value.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center font-mono text-xs">{inv.nfce_number}</td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          inv.status === 'issued'
                            ? 'bg-status-success/10 text-status-success'
                            : inv.status === 'pending'
                              ? 'bg-status-warning/10 text-status-warning'
                              : 'bg-status-error/10 text-status-error',
                        )}
                      >
                        {inv.status === 'issued'
                          ? 'Emitida'
                          : inv.status === 'pending'
                            ? 'Pendente'
                            : 'Cancelada'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-text-secondary">
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        className="p-1.5 text-text-secondary hover:text-action-primary transition-colors cursor-pointer"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
