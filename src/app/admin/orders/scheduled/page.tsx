'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Loader2,
  Users,
  RefreshCw,
  CalendarClock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast, PageHeader, useToast } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface ScheduledOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled';
  type: 'delivery' | 'pickup';
  items_count: number;
  total: number;
  notes: string;
}

export default function ScheduledOrdersPage() {
  const [orders, setOrders] = useState<ScheduledOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/orders?scheduled=true');
        if (!res.ok) throw new Error('Falha ao carregar');
        setOrders(await res.json());
      } catch {
        showToast('error', 'Erro ao carregar pedidos agendados.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  const filteredOrders = orders.filter((o) => o.scheduled_date === selectedDate);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const dayAfter = new Date(Date.now() + 172800000).toISOString().slice(0, 10);

  const quickDates = [
    { label: 'Hoje', value: today },
    { label: 'Amanhã', value: tomorrow },
    { label: 'Depois', value: dayAfter },
  ];

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendente', color: 'text-amber-600', bg: 'bg-amber-100' },
    confirmed: { label: 'Confirmado', color: 'text-blue-600', bg: 'bg-blue-100' },
    preparing: { label: 'Preparando', color: 'text-purple-600', bg: 'bg-purple-100' },
    ready: { label: 'Pronto', color: 'text-green-600', bg: 'bg-green-100' },
    delivered: { label: 'Entregue', color: 'text-gray-600', bg: 'bg-gray-100' },
    canceled: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100' },
  };

  const formatMoney = (v: number) =>
    `R$ ${Number(v || 0)
      .toFixed(2)
      .replace('.', ',')}`;

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Pedidos Agendados"
        description="Visualize e gerencie pedidos programados para entregas futuras."
      />

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Date Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          {quickDates.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={cn(
                'px-4 py-2 rounded-radius-md text-sm font-bold border transition-all cursor-pointer',
                selectedDate === d.value
                  ? 'border-action-primary bg-action-primary/5 text-action-primary'
                  : 'border-border-default text-text-secondary hover:border-border-focus',
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-10 px-3 text-sm border border-border-default rounded-radius-md bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setLoading(true);
            window.location.reload();
          }}
          leftIcon={<RefreshCw className="h-3 w-3" />}
        >
          Atualizar
        </Button>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: filteredOrders.length, color: 'text-text-primary' },
            {
              label: 'Pendentes',
              value: filteredOrders.filter((o) => o.status === 'pending').length,
              color: 'text-amber-600',
            },
            {
              label: 'Confirmados',
              value: filteredOrders.filter((o) => o.status === 'confirmed').length,
              color: 'text-blue-600',
            },
            {
              label: 'Entregues',
              value: filteredOrders.filter((o) => o.status === 'delivered').length,
              color: 'text-green-600',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-card border border-border-default rounded-radius-xl p-4 shadow-sm"
            >
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {s.label}
              </p>
              <p className={cn('text-2xl font-black mt-1', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders List */}
      <div className="rounded-radius-xl border border-border-default bg-surface-card shadow-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-subtle px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          <div className="col-span-2">Cliente</div>
          <div className="col-span-2">Telefone</div>
          <div className="col-span-2">Horário</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-1">Itens</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-border-subtle">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-12 w-12 rounded-radius-full bg-surface-subtle flex items-center justify-center">
                <CalendarClock className="h-6 w-6 text-text-muted" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">
                  Nenhum pedido agendado para esta data
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Selecione outra data ou aguarde novos pedidos.
                </p>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-surface-subtle transition-colors"
              >
                <div className="col-span-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {order.customer_name}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-text-secondary">{order.customer_phone}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-action-primary shrink-0" />
                  <span className="font-bold text-sm text-text-primary">
                    {order.scheduled_time}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-text-secondary">
                  {order.type === 'delivery' ? 'Delivery' : 'Retirada'}
                </div>
                <div className="col-span-1 text-sm text-text-secondary">{order.items_count}</div>
                <div className="col-span-1 text-sm font-bold text-text-primary">
                  {formatMoney(order.total)}
                </div>
                <div className="col-span-1">
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-radius-full',
                      statusConfig[order.status]?.bg || 'bg-gray-100',
                      statusConfig[order.status]?.color || 'text-gray-600',
                    )}
                  >
                    {statusConfig[order.status]?.label || order.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <button
                    className="p-1.5 text-text-secondary hover:text-status-success transition-colors cursor-pointer"
                    title="Confirmar"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-text-secondary hover:text-status-error transition-colors cursor-pointer"
                    title="Cancelar"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
