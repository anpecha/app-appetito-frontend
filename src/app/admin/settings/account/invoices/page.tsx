'use client';

import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Toast, PageHeader, useToast, SectionCard } from '@/app/admin/settings/_shared';
import { AccountSidebar } from '../shared';
import { cn } from '@/lib/utils';

const MOCK_INVOICES = [
  {
    id: '1',
    reference: '2026-04',
    amount: 97.9,
    status: 'paid',
    due_date: '10/04/2026',
    paid_at: '08/04/2026',
  },
  {
    id: '2',
    reference: '2026-03',
    amount: 97.9,
    status: 'paid',
    due_date: '10/03/2026',
    paid_at: '05/03/2026',
  },
  {
    id: '3',
    reference: '2026-02',
    amount: 97.9,
    status: 'paid',
    due_date: '10/02/2026',
    paid_at: '10/02/2026',
  },
  {
    id: '4',
    reference: '2026-01',
    amount: 97.9,
    status: 'paid',
    due_date: '10/01/2026',
    paid_at: '08/01/2026',
  },
];

export default function AccountInvoicesPage() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader title="Fatura" description="Histórico de faturas da sua assinatura." />
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="flex gap-8">
        <AccountSidebar active="invoices" />
        <div className="flex-1 max-w-3xl">
          <SectionCard title="Faturas" icon={FileText}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-xs font-bold text-text-muted uppercase tracking-wider">
                    <th className="text-left py-3 px-2">Referência</th>
                    <th className="text-left py-3 px-2">Vencimento</th>
                    <th className="text-left py-3 px-2">Pagamento</th>
                    <th className="text-right py-3 px-2">Valor</th>
                    <th className="text-center py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {MOCK_INVOICES.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3 px-2 font-medium text-text-primary">{inv.reference}</td>
                      <td className="py-3 px-2 text-text-secondary">{inv.due_date}</td>
                      <td className="py-3 px-2 text-text-secondary">{inv.paid_at}</td>
                      <td className="py-3 px-2 text-right font-semibold text-text-primary">
                        R$ {inv.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-radius-full',
                            inv.status === 'paid'
                              ? 'bg-status-success/10 text-status-success'
                              : 'bg-status-error/10 text-status-error',
                          )}
                        >
                          {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-1.5 text-text-secondary hover:text-action-primary transition-colors cursor-pointer"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-text-secondary hover:text-action-primary transition-colors cursor-pointer"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
