'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bike,
  MapPin,
  LogOut,
  CheckCircle2,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CourierSession {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  restaurant_name: string;
  restaurant_id: string;
}

interface CourierOrder {
  id: string;
  status: string;
  type: string;
  total: number;
  subtotal?: number;
  delivery_fee?: number;
  notes?: string;
  created_at: string;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_confirmed_by_courier?: boolean;
  delivery_address?: string | null;
  delivery_number?: string | null;
  delivery_neighborhood?: string | null;
  delivery_city?: string | null;
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  card: 'Cartão (app)',
  credit_card: 'Cartão Crédito',
  debit_card: 'Cartão Débito',
  meal_voucher: 'Vale Refeição',
};

function getSession(): CourierSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('courier_session');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

export default function CourierDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<CourierSession | null>(null);
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/courier/login');
      return;
    }
    setSession(s);
  }, [router]);

  const fetchOrders = useCallback(async (courierId: string) => {
    try {
      const res = await fetch(`/api/proxy/delivery/courier/orders?courier_id=${courierId}`);
      if (res.ok) {
        setOrders((await res.json()) || []);
      }
    } catch {
      setError('Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchOrders(session.id);
      const interval = setInterval(() => fetchOrders(session.id), 30_000);
      return () => clearInterval(interval);
    }
  }, [session, fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating((prev) => new Set(prev).add(orderId));
    try {
      // Update order status
      const res = await fetch(`/api/proxy/delivery/courier/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();

      // Also confirm payment for cash/card on delivery (only if not already paid online)
      const order = orders.find((o) => o.id === orderId);
      const needsCourierConfirm = order
        && ['cash', 'debit_card', 'credit_card'].includes(order.payment_method ?? '')
        && order.payment_status !== 'paid';
      if (needsCourierConfirm) {
        await fetch(`/api/proxy/delivery/courier/orders/${orderId}/confirm-payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmed: true }),
        });
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, ...(needsCourierConfirm ? { payment_confirmed_by_courier: true } : {}) }
            : o
        ),
      );
    } catch {
      if (session) fetchOrders(session.id);
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('courier_session');
    router.replace('/courier/login');
  };

  if (!session) return null;

  const activeOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Header */}
      <header className="bg-white border-b border-border-subtle sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-action-primary" />
            <div>
              <p className="font-bold text-sm text-text-primary">{session.name}</p>
              <p className="text-[10px] text-text-muted">{session.restaurant_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted capitalize">
              {session.vehicle_type === 'motorcycle'
                ? 'Moto'
                : session.vehicle_type === 'bicycle'
                  ? 'Bike'
                  : 'Carro'}
            </span>
            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-status-error transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {error && (
          <p className="text-xs text-status-error font-medium text-center mb-4">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
          </div>
        ) : (
          <>
            {/* Active deliveries */}
            {activeOrders.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-status-success" />
                  Entregas em andamento ({activeOrders.length})
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <Card key={order.id} className="border-blue-200 border-2 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">
                            Pedido #{order.id.split('-')[0].toUpperCase()}
                          </span>
                          <span className="text-xs text-text-muted">{formatTime(order.created_at)}</span>
                        </div>

                        <div className="text-xs text-text-secondary space-y-1 mb-3">
                          {order.delivery_address && (
                            <p className="flex items-start gap-1">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                              {order.delivery_address}
                              {order.delivery_number && `, ${order.delivery_number}`}
                              {order.delivery_neighborhood && ` - ${order.delivery_neighborhood}`}
                              {order.delivery_city && `, ${order.delivery_city}`}
                            </p>
                          )}
                        </div>

                        {/* Payment info */}
                        <div className="flex items-center gap-2 text-xs text-text-secondary border-t border-border-subtle pt-2 mb-2">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span className="font-bold">{formatCurrency(order.total)}</span>
                          <span className="text-text-muted">·</span>
                          <span>{PAYMENT_LABELS[order.payment_method ?? ''] ?? order.payment_method ?? '-'}</span>

                          {/* Online payment confirmed */}
                          {order.payment_status === 'paid' ? (
                            <span className="ml-auto text-status-success font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Pago
                            </span>
                          ) : order.payment_method === 'cash' || order.payment_method === 'debit_card' || order.payment_method === 'credit_card' ? (
                            /* Payment on delivery */
                            order.payment_confirmed_by_courier ? (
                              <span className="ml-auto text-status-success font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Recebido
                              </span>
                            ) : null
                          ) : (
                            <span className="ml-auto text-text-muted">Aguardando pagamento</span>
                          )}
                        </div>

                        {/* Action button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => updateStatus(order.id, 'delivered')}
                            disabled={updating.has(order.id)}
                            className="flex items-center gap-1.5 bg-action-primary hover:bg-action-primary/90 text-text-on-brand text-xs font-bold px-4 py-2 rounded-radius-md transition-colors disabled:opacity-50"
                          >
                            {updating.has(order.id) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Confirmar Entrega
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {activeOrders.length === 0 && !loading && (
              <section className="mb-8 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-subtle rounded-full mb-3">
                  <Bike className="h-8 w-8 text-text-muted" />
                </div>
                <p className="font-medium text-text-primary">Nenhuma entrega no momento</p>
                <p className="text-xs text-text-muted mt-1">
                  Aguardando novas entregas serem atribuídas a você.
                </p>
              </section>
            )}

            {/* Delivered history */}
            {deliveredOrders.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-status-success" />
                  Entregues hoje ({deliveredOrders.length})
                </h2>
                <div className="space-y-2">
                  {deliveredOrders.map((order) => (
                    <Card key={order.id} className="border-border-subtle">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold">
                            #{order.id.split('-')[0].toUpperCase()}
                          </span>
                          <span className="text-xs text-text-muted ml-2">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                        <span className="text-[10px] text-status-success font-medium">
                          Entregue
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
