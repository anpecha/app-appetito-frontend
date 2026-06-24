'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Store, Loader2, Clock, Receipt, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, Toast, PageHeader, useToast } from '../../settings/_shared';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  status: string;
  type: string;
  table_id: string | null;
  total: number;
  created_at: string;
  order_items: OrderItem[];
  customer_id?: string | null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SalonManagementDashboard() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { toast, show: showToast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const [resTables, resOrders] = await Promise.all([
        fetch('/api/proxy/tables'),
        fetch('/api/proxy/orders'),
      ]);

      if (!resTables.ok || !resOrders.ok) throw new Error('Falha ao buscar dados');

      const [dataTables, dataOrders] = await Promise.all([resTables.json(), resOrders.json()]);

      setTables(dataTables || []);
      setOrders(dataOrders || []);
    } catch {
      showToast('error', 'Erro ao carregar o salão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds for immediate feedback
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Logic ──────────────────────────────────────────────────────────────

  // Map active orders to their respective tables
  const tableOrders = useMemo(() => {
    const activeOrders = orders.filter(
      (o) =>
        o.type === 'dine_in' && o.status !== 'finished' && o.status !== 'canceled' && o.table_id,
    );

    const map = new Map<string, Order[]>();
    activeOrders.forEach((o) => {
      if (!o.table_id) return;
      const existing = map.get(o.table_id) || [];
      map.set(o.table_id, [...existing, o]);
    });

    return map;
  }, [orders]);

  const formatMoneyReais = (value: number) =>
    `R$ ${Number(value || 0)
      .toFixed(2)
      .replace('.', ',')}`;

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Gestão de Salão"
        description="Visão em tempo real de todas as mesas, comandas ativas e pedidos em andamento no salão."
      >
        <Button
          onClick={() => fetchData(true)}
          variant="outline"
          className="gap-2 border-border-default hover:bg-surface-subtle"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Atualizar Agora
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <SectionCard title="Visão Geral das Mesas" icon={Store}>
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-space-12 text-text-muted text-center">
            <Store className="h-10 w-10 opacity-20 mb-space-3" />
            <p className="text-sm font-medium">Você ainda não configurou as mesas.</p>
            <p className="text-xs mt-1">
              Acesse a configuração de salão para registrar as suas mesas físicas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-4">
            {tables.map((table) => {
              const activeOrdersForTable = tableOrders.get(table.id) || [];
              const isOccupied = activeOrdersForTable.length > 0;

              // Calculate total spent by table
              const tableTotal = activeOrdersForTable.reduce((acc, order) => acc + order.total, 0);

              // Find oldest order for table occupancy time
              const oldestOrder =
                activeOrdersForTable.length > 0
                  ? activeOrdersForTable.reduce((oldest, current) =>
                      new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest,
                    )
                  : null;

              return (
                <div
                  key={table.id}
                  className={cn(
                    'bg-surface-card border rounded-radius-lg overflow-hidden flex flex-col transition-all shadow-sm',
                    isOccupied
                      ? 'border-action-primary shadow-md ring-1 ring-action-primary/20'
                      : 'border-border-default hover:border-border-focus',
                  )}
                >
                  {/* Component Header */}
                  <div
                    className={cn(
                      'p-space-4 flex justify-between items-center border-b',
                      isOccupied
                        ? 'bg-action-primary/5 border-action-primary/20'
                        : 'bg-surface-subtle border-border-default',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-text-primary">{table.number}</h3>
                      <span
                        className={cn(
                          'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-radius-full',
                          isOccupied
                            ? 'bg-status-warning/20 text-status-warning'
                            : 'bg-status-success/10 text-status-success',
                        )}
                      >
                        {isOccupied ? 'Ocupada' : 'Livre'}
                      </span>
                    </div>

                    {isOccupied && oldestOrder && (
                      <div className="flex items-center gap-1 text-xs font-medium text-text-secondary bg-surface-card px-2 py-1 rounded-radius-sm border border-border-default shadow-sm">
                        <Clock className="h-3 w-3 text-action-primary" />
                        {formatDistanceToNow(new Date(oldestOrder.created_at), { locale: ptBR })}
                      </div>
                    )}
                  </div>

                  {/* Order Content */}
                  <div className="p-space-4 flex-1 flex flex-col bg-surface-card min-h-[140px]">
                    {!isOccupied ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-60 m-auto py-4">
                        <Store className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-xs font-medium">Mesa Livre</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col gap-3">
                        <p className="text-xs font-bold text-text-secondary border-b border-border-subtle pb-1">
                          {activeOrdersForTable.length} pedido(s) ativo(s)
                        </p>

                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
                          {activeOrdersForTable.map((order) => (
                            <div
                              key={order.id}
                              className="text-sm border-l-2 border-action-primary/50 pl-space-2 py-0.5 relative group"
                            >
                              {order.order_items.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-start leading-tight mb-1"
                                >
                                  <span className="text-text-primary">
                                    <span className="text-text-muted mr-1">{item.quantity}x</span>{' '}
                                    {item.product_name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer / Total */}
                  {isOccupied && (
                    <div className="bg-text-primary text-text-on-dark p-space-4 flex justify-between items-center rounded-b-radius-md mt-auto">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1">
                        <Receipt className="h-4 w-4" />
                        Total da Mesa
                      </span>
                      <span className="text-lg font-black tracking-tight">
                        {formatMoneyReais(tableTotal)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
