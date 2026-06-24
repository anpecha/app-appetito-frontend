'use client';

import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, RefreshCw, Clock, Bell } from 'lucide-react';

import NewOrderModal from '@/components/ui/new-order-modal';
import { Order, AddonOption, OrderStatus } from '@/types/order';

const COLUMN_CONFIG: {
  status: OrderStatus;
  label: string;
  color: string;
  headerBg: string;
  bodyBg: string;
}[] = [
  {
    status: 'new',
    label: 'Em análise',
    color: 'text-white',
    headerBg: 'bg-red-500',
    bodyBg: 'bg-red-50',
  },
  {
    status: 'preparing',
    label: 'Em produção',
    color: 'text-white',
    headerBg: 'bg-amber-500',
    bodyBg: 'bg-amber-50',
  },
  {
    status: 'ready',
    label: 'Pronto p/ entrega',
    color: 'text-white',
    headerBg: 'bg-green-500',
    bodyBg: 'bg-green-50',
  },
  {
    status: 'finished',
    label: 'Finalizados',
    color: 'text-white',
    headerBg: 'bg-slate-500',
    bodyBg: 'bg-slate-50',
  },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'finished',
};

const ADVANCE_LABEL: Partial<Record<OrderStatus, string>> = {
  new: 'Aceitar pedido →',
  preparing: 'Marcar Pronto',
  ready: 'Finalizar',
};

const POLL_INTERVAL_MS = 30_000;

// ─── Web Audio beep ───────────────────────────────────────────────────────────

function playNewOrderSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const playBeep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playBeep(880, 0, 0.15);
    playBeep(1100, 0.18, 0.15);
    playBeep(880, 0.36, 0.25);
  } catch {
    // Audio not available — fail silently
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CounterOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [hasNewAlert, setHasNewAlert] = useState(false);

  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/proxy/orders/');
      if (!res.ok) throw new Error('Falha ao buscar pedidos');
      const data: Order[] = (await res.json()) || [];

      // ONLY include "local" orders for the Counter page
      const counterOrders = data.filter((o) => o.type === 'local');

      setOrders(counterOrders);

      // Detect new orders (skip on first load to avoid false alerts)
      if (!isFirstFetch.current) {
        const incomingIds = new Set(counterOrders.map((o) => o.id));
        const freshIds = Array.from(incomingIds).filter((id) => !knownIdsRef.current.has(id));

        if (freshIds.length > 0) {
          playNewOrderSound();
          setHasNewAlert(true);
          setNewOrderIds((prev) => new Set([...Array.from(prev), ...freshIds]));

          // Auto-dismiss alert badge after 8s
          setTimeout(() => setHasNewAlert(false), 8_000);
          // Remove card highlight after 10s
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const updated = new Set(Array.from(prev));
              freshIds.forEach((id) => updated.delete(id));
              return updated;
            });
          }, 10_000);
        }
      }

      knownIdsRef.current = new Set(Array.from(counterOrders.map((o) => o.id)));
      isFirstFetch.current = false;
    } catch {
      setError('Não foi possível carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auto-polling
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advanceOrder = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));

    try {
      const res = await fetch(`/api/proxy/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      fetchOrders(true); // rollback on error
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  const formatCurrency = (amount: number) =>
    Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getOrdersByStatus = (status: OrderStatus) => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    return orders
      .filter((o) => o.status === status)
      .filter((o) => {
        if (status === 'finished') {
          try {
            const orderDateStr = new Date(o.created_at).toLocaleDateString('pt-BR');
            if (orderDateStr !== todayStr) return false;
          } catch {
            return false;
          }
        }
        return true;
      })
      .filter((o) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return o.id.toLowerCase().includes(s) || o.notes?.toLowerCase().includes(s);
      });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pedidos de Balcão</h1>
        <p className="text-sm text-gray-500">
          Gerencie todos os pedidos retirados ou feitos direto no balcão.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou número do pedido"
            className="w-full pl-10 pr-4 py-2 text-sm border border-border-default rounded-radius-md bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30"
          />
        </div>

        {/* New order alert badge */}
        {hasNewAlert && (
          <div className="flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-radius-full shadow-md animate-bounce">
            <Bell className="h-3.5 w-3.5" />
            Novo pedido!
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchOrders()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={() => setShowNewOrderModal(true)}
        >
          <Plus className="h-4 w-4" />
          Novo pedido
        </Button>
      </div>

      {/* Auto-refresh hint */}
      <p className="text-xs text-text-muted shrink-0 -mt-2">
        ↻ Atualização automática a cada {POLL_INTERVAL_MS / 1000}s • som ativado ao receber novos
        pedidos
      </p>

      {error && (
        <div className="text-center py-4 text-status-error text-sm font-medium">{error}</div>
      )}

      {showNewOrderModal && (
        <NewOrderModal
          onClose={() => setShowNewOrderModal(false)}
          onOrderCreated={() => {
            setShowNewOrderModal(false);
            fetchOrders();
          }}
        />
      )}

      {/* Kanban Board */}
      <div className="flex-1 min-h-0 overflow-x-auto">
        <div className="grid grid-cols-4 gap-3 h-full min-w-[900px]">
          {COLUMN_CONFIG.map(({ status, label, color, headerBg, bodyBg }) => {
            const cols = getOrdersByStatus(status);
            return (
              <div
                key={status}
                className="flex flex-col rounded-radius-xl overflow-hidden border border-border-subtle shadow-sm"
              >
                {/* Column Header */}
                <div
                  className={`${headerBg} ${color} flex items-center justify-between px-4 py-3 shrink-0`}
                >
                  <span className="font-bold text-sm">{label}</span>
                  <span className="text-xs font-bold bg-white/20 rounded-radius-full w-6 h-6 flex items-center justify-center">
                    {cols.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className={`${bodyBg} flex-1 p-3 space-y-3 overflow-y-auto`}>
                  {cols.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-xs text-text-muted text-center px-4">
                      <p className="font-medium">Nenhum pedido no momento.</p>
                      <p>Receba pedidos e visualize-os aqui.</p>
                    </div>
                  ) : (
                    cols.map((order) => {
                      const isNew = newOrderIds.has(order.id);
                      return (
                        <Card
                          key={order.id}
                          className={`p-3 bg-white shadow-sm flex flex-col gap-2 transition-all duration-300 ${
                            isNew
                              ? 'ring-2 ring-red-400 shadow-red-200 shadow-md border-red-200'
                              : 'border-border-subtle'
                          }`}
                        >
                          {isNew && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 animate-pulse">
                              <Bell className="h-3 w-3" />
                              NOVO PEDIDO
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-text-primary">
                              Pedido #{order.id.split('-')[0].toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock className="h-3 w-3" />
                              {formatTime(order.created_at)}
                            </span>
                          </div>

                          <div className="text-xs text-text-secondary space-y-0.5">
                            <p>
                              <span className="font-semibold">
                                {order.type === 'local'
                                  ? 'Balcão'
                                  : order.type === 'delivery'
                                    ? 'Delivery'
                                    : 'Retirada'}
                              </span>
                              {order.table_id && ` · Mesa ${order.table_id}`}
                            </p>
                            {order.notes && (
                              <p className="text-text-muted truncate">📝 {order.notes}</p>
                            )}
                          </div>

                          <ul className="text-xs text-text-secondary space-y-0.5 border-t border-border-subtle pt-2">
                            {order.order_items?.map((item) => (
                              <li key={item.id}>
                                <span className="font-medium">{item.quantity}x</span>{' '}
                                {item.product_name ?? 'Item'}
                                {item.notes && (
                                  <span className="text-text-muted"> – {item.notes}</span>
                                )}
                                {/* Options Display */}
                                {item.options &&
                                  (item.options.size ||
                                    (item.options.addons && item.options.addons.length > 0)) && (
                                    <div className="pl-4 mt-0.5 text-[10px] text-text-muted">
                                      {item.options.size && (
                                        <div className="font-medium text-text-secondary">
                                          Tamanho: {item.options.size}
                                        </div>
                                      )}
                                      {item.options.addons?.map(
                                        (addon: AddonOption, idx: number) => (
                                          <div key={idx}>+ {addon.name}</div>
                                        ),
                                      )}
                                    </div>
                                  )}
                              </li>
                            ))}
                          </ul>

                          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                            <span className="text-sm font-bold text-text-primary">
                              Total: {formatCurrency(order.total)}
                            </span>
                          </div>

                          {ADVANCE_LABEL[status] && (
                            <button
                              onClick={() => advanceOrder(order.id, status)}
                              className={`w-full text-xs font-bold py-2 rounded-radius-md transition-colors ${
                                status === 'new'
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : status === 'preparing'
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {ADVANCE_LABEL[status]}
                            </button>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
