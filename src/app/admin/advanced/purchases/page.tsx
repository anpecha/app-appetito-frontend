'use client';

import React, { useState } from 'react';
import { ShoppingCart, Plus, Package, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionCard, Toast, useToast } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface Purchase {
  id: string;
  product: string;
  supplier: string;
  quantity: number;
  unit_cost: number;
  total: number;
  date: string;
  category: string;
}

const SAMPLE: Purchase[] = [
  {
    id: '1',
    product: 'Tomate',
    supplier: 'HortiFruti LTDA',
    quantity: 50,
    unit_cost: 3.5,
    total: 175.0,
    date: '2026-05-28',
    category: 'Hortifrúti',
  },
  {
    id: '2',
    product: 'Arroz 5kg',
    supplier: 'Distribuidora Alimentos',
    quantity: 10,
    unit_cost: 22.9,
    total: 229.0,
    date: '2026-05-27',
    category: 'Mercearia',
  },
  {
    id: '3',
    product: 'Carne Moída',
    supplier: 'Açougue do Zé',
    quantity: 30,
    unit_cost: 18.0,
    total: 540.0,
    date: '2026-05-27',
    category: 'Carnes',
  },
];

export default function PurchasesPage() {
  const [purchases] = useState<Purchase[]>(SAMPLE);
  const [_showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader title="Compras" description="Controle de compras e insumos do seu restaurante.">
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nova Compra
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-4">
        {[
          {
            label: 'Total Gasto (Mês)',
            value: 'R$ 944,00',
            icon: DollarSign,
            color: 'text-status-error',
          },
          { label: 'Fornecedores', value: '3', icon: Package, color: 'text-action-primary' },
          {
            label: 'Itens Comprados',
            value: '90 uni.',
            icon: ShoppingCart,
            color: 'text-[#8B5CF6]',
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
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Histórico de Compras" icon={ShoppingCart}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs font-bold text-text-muted uppercase">
                <th className="text-left py-3 px-2">Produto</th>
                <th className="text-left py-3 px-2">Fornecedor</th>
                <th className="text-center py-3 px-2">Qtd</th>
                <th className="text-right py-3 px-2">Custo Uni.</th>
                <th className="text-right py-3 px-2">Total</th>
                <th className="text-center py-3 px-2">Data</th>
                <th className="text-center py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-2 font-medium">{p.product}</td>
                  <td className="py-3 px-2 text-text-secondary text-xs">{p.supplier}</td>
                  <td className="py-3 px-2 text-center">{p.quantity}</td>
                  <td className="py-3 px-2 text-right">R$ {p.unit_cost.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-bold">R$ {p.total.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center text-xs text-text-secondary">{p.date}</td>
                  <td className="py-3 px-2 text-center">
                    <button className="p-1 text-text-muted hover:text-status-error transition-colors cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {purchases.length === 0 && (
          <div className="flex flex-col items-center py-12 text-text-muted gap-2">
            <ShoppingCart className="h-8 w-8 opacity-50" />
            <p className="text-sm">Nenhuma compra registrada.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
