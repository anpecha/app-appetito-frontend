'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ChefHat,
  Loader2,
  AlertCircle,
  Package,
  Bike,
  Phone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'finished' | 'canceled' | 'delivered';

interface CourierData {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  license_plate?: string | null;
}

interface OrderData {
  id: string;
  status: OrderStatus;
  type: string;
  total: number;
  notes?: string;
  created_at: string;
  courier?: CourierData | null;
  delivery_address?: string | null;
  delivery_neighborhood?: string | null;
  delivery_city?: string | null;
}

const STATUS_STEPS = [
  {
    id: 'new',
    label: 'Pedido Recebido',
    description: 'Estamos analisando o seu pedido.',
    icon: Clock,
  },
  {
    id: 'preparing',
    label: 'Preparando',
    description: 'Seu lanche está sendo preparado!',
    icon: ChefHat,
  },
  {
    id: 'out_for_delivery',
    label: 'A Caminho',
    description: 'O entregador já está a caminho.',
    icon: MapPin,
  },
  { id: 'finished', label: 'Entregue', description: 'Bom apetite! 🍔', icon: CheckCircle2 },
] as const;

// For "takeout" / "local" type orders, skip out_for_delivery
const STATUS_STEPS_LOCAL = [
  {
    id: 'new',
    label: 'Pedido Recebido',
    description: 'Estamos analisando o seu pedido.',
    icon: Clock,
  },
  {
    id: 'preparing',
    label: 'Preparando',
    description: 'Seu pedido está sendo preparado!',
    icon: ChefHat,
  },
  { id: 'ready', label: 'Pronto!', description: 'Pode retirar no balcão. 🎉', icon: Package },
  {
    id: 'finished',
    label: 'Concluído',
    description: 'Obrigado pela preferência! 🍔',
    icon: CheckCircle2,
  },
] as const;

const STATUS_ORDER: OrderStatus[] = ['new', 'preparing', 'out_for_delivery', 'finished'];
const STATUS_ORDER_LOCAL: OrderStatus[] = ['new', 'preparing', 'ready', 'finished'];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = React.useState<OrderData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchOrder = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy/orders/${params.id}/tracking`);
      if (res.status === 404) {
        setError('Pedido não encontrado.');
        return;
      }
      if (!res.ok) throw new Error('Erro ao buscar pedido.');
      const data: OrderData = await res.json();
      setOrder(data);
    } catch {
      setError('Não foi possível carregar o status do pedido.');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    fetchOrder();
    // Poll every 15 seconds for status updates
    const interval = setInterval(fetchOrder, 15_000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const isLocal = order && (order.type === 'local' || order.type === 'takeout');
  const steps = isLocal ? STATUS_STEPS_LOCAL : STATUS_STEPS;
  const statusOrder = isLocal ? STATUS_ORDER_LOCAL : STATUS_ORDER;
  const currentStepIndex = order ? statusOrder.indexOf(order.status as OrderStatus) : -1;

  const formatCurrency = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-surface-page flex flex-col pt-8 pb-12 px-4">
      <main className="container mx-auto max-w-sm flex-1">
        {/* Logo */}
        <p className="text-center font-bold text-action-primary text-xl mb-6 tracking-tight">
          Appétito
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-center text-text-primary mb-2">
          Acompanhe seu pedido
        </h1>

        {loading ? (
          <div className="flex justify-center pt-16">
            <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
          </div>
        ) : error ? (
          <Card className="border-status-error/30 mt-6">
            <CardContent className="p-6 flex flex-col items-center gap-space-3 text-center">
              <AlertCircle className="h-10 w-10 text-status-error" />
              <p className="font-semibold text-text-primary">{error}</p>
              <p className="text-sm text-text-muted">Verifique o link ou tente novamente.</p>
            </CardContent>
          </Card>
        ) : order ? (
          <>
            <p className="text-center text-text-secondary mb-8 font-mono text-sm">
              #{params.id.slice(0, 8).toUpperCase()}
            </p>

            {/* Order info banner */}
            <Card className="mb-6 border-border-subtle shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                    {order.type === 'delivery'
                      ? 'Delivery'
                      : order.type === 'local'
                        ? 'Balcão'
                        : 'Retirada'}
                  </p>
                  {order.notes && (
                    <p className="text-xs text-text-muted mt-0.5 truncate max-w-[160px]">
                      {order.notes}
                    </p>
                  )}
                </div>
                <p className="font-bold text-text-primary text-lg">{formatCurrency(order.total)}</p>
              </CardContent>
            </Card>

            {/* Courier info — when out_for_delivery or delivered */}
            {order.status === 'out_for_delivery' && order.courier && (
              <Card className="mb-6 border-blue-200 bg-blue-50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                      <Bike className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-text-primary">{order.courier.name}</p>
                      <p className="text-xs text-text-muted capitalize">
                        {order.courier.vehicle_type === 'motorcycle'
                          ? 'Moto'
                          : order.courier.vehicle_type === 'bicycle'
                            ? 'Bicicleta'
                            : 'Carro'}
                      </p>
                      <a
                        href={`tel:${order.courier.phone}`}
                        className="inline-flex items-center gap-1.5 mt-2 bg-action-primary text-text-on-brand text-xs font-bold px-4 py-2 rounded-radius-md hover:bg-action-primary/90 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Ligar para entregador
                      </a>
                    </div>
                  </div>
                  {order.delivery_address && (
                    <p className="text-xs text-text-secondary mt-3 flex items-start gap-1 border-t border-blue-200 pt-3">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                      {order.delivery_address}
                      {order.delivery_neighborhood && ` - ${order.delivery_neighborhood}`}
                      {order.delivery_city && `, ${order.delivery_city}`}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Canceled state */}
            {order.status === 'canceled' ? (
              <Card className="border-status-error/30">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-10 w-10 text-status-error mx-auto mb-3" />
                  <p className="font-bold text-text-primary">Pedido cancelado</p>
                  <p className="text-sm text-text-muted mt-1">
                    Entre em contato com o restaurante para mais informações.
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Timeline */
              <Card className="border-border-subtle shadow-lg">
                <CardContent className="p-6">
                  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-default before:to-transparent">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="relative flex items-center gap-4">
                          {/* Icon */}
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0
                                                        ${isCompleted ? 'bg-action-primary text-text-on-brand' : 'bg-surface-subtle text-text-muted'}
                                                        ${isCurrent ? 'ring-2 ring-action-primary ring-offset-2' : ''}
                                                    `}
                          >
                            {isCurrent ? (
                              <div className="relative">
                                <Icon className="w-5 h-5" />
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-action-primary rounded-full animate-ping" />
                              </div>
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>

                          {/* Content */}
                          <div
                            className={`flex-1 p-4 rounded-radius-lg border transition-all
                                                        ${
                                                          isCurrent
                                                            ? 'bg-action-primary/5 border-action-primary shadow-sm'
                                                            : isCompleted
                                                              ? 'bg-surface-card border-border-default'
                                                              : 'bg-surface-subtle border-transparent'
                                                        }
                                                    `}
                          >
                            <p
                              className={`font-bold text-sm ${isCurrent ? 'text-action-primary' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="mt-0.5 text-xs text-text-secondary">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="text-center text-xs text-text-muted mt-6">Atualizando automaticamente…</p>
          </>
        ) : null}
      </main>
    </div>
  );
}
