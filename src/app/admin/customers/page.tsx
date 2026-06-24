'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Phone, Mail, ChevronDown, ChevronRight, ShoppingBag, Clock } from 'lucide-react';

interface Customer {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  total_orders: number;
  created_at: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  status: string;
  type: string;
  total: number;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  pending: 'Pendente',
  preparing: 'Em preparo',
  ready: 'Pronto',
  finished: 'Finalizado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-green-100 text-green-700',
  finished: 'bg-slate-100 text-slate-600',
  delivered: 'bg-emerald-100 text-emerald-700',
  canceled: 'bg-gray-100 text-gray-500',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Record<string, Order[]>>({});
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/proxy/customers');
      if (!res.ok) throw new Error('Falha ao buscar clientes');
      setCustomers(await res.json());
    } catch {
      setError('Erro ao carregar clientes. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const toggleExpand = async (customer: Customer) => {
    if (expandedId === customer.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(customer.id);

    if (!customerOrders[customer.id]) {
      setLoadingOrders(customer.id);
      try {
        const res = await fetch(`/api/proxy/customers/${customer.id}/orders`);
        if (res.ok) {
          const data = await res.json();
          setCustomerOrders((prev) => ({ ...prev, [customer.id]: data }));
        }
      } finally {
        setLoadingOrders(null);
      }
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatCurrency = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-surface-page">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Clientes</h1>
          <p className="text-text-secondary mt-1">Histórico e dados dos seus clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface-card border border-border-default rounded-radius-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-text-primary">{customers.length}</p>
            <p className="text-xs text-text-muted">Total</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="mb-4 shrink-0">
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 text-sm border border-border-default rounded-radius-md bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-status-error/10 border border-status-error/30 rounded-radius-lg text-sm text-status-error font-medium shrink-0">
          {error}
        </div>
      )}

      {/* Table */}
      <main className="flex-1 bg-surface-card rounded-radius-xl border border-border-default shadow-md overflow-hidden flex flex-col min-h-0">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-subtle px-4 py-3 font-semibold text-xs text-text-secondary uppercase tracking-wider shrink-0">
          <div className="col-span-4">Cliente</div>
          <div className="col-span-3">Contato</div>
          <div className="col-span-2 text-center">Pedidos</div>
          <div className="col-span-2">Desde</div>
          <div className="col-span-1" />
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto min-h-0 divide-y divide-border-subtle">
          {loading ? (
            <div className="p-10 text-center text-text-muted animate-pulse text-sm">
              Carregando clientes…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-10 h-10 text-border-default mx-auto mb-3" />
              <p className="text-text-muted text-sm">
                {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Clientes são criados automaticamente ao fazer um pedido com telefone.
              </p>
            </div>
          ) : (
            filtered.map((customer) => (
              <div key={customer.id}>
                {/* Customer row */}
                <div
                  className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-subtle transition-colors cursor-pointer"
                  onClick={() => toggleExpand(customer)}
                >
                  {/* Name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-radius-full bg-action-primary/10 text-action-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {(customer.name ?? customer.phone)?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="font-semibold text-sm text-text-primary truncate">
                      {customer.name ?? 'Sem nome'}
                    </span>
                  </div>
                  {/* Contact */}
                  <div className="col-span-3 flex flex-col gap-0.5 min-w-0">
                    <span className="flex items-center gap-1.5 text-xs text-text-secondary truncate">
                      <Phone className="w-3 h-3 shrink-0" /> {customer.phone}
                    </span>
                    {customer.email && (
                      <span className="flex items-center gap-1.5 text-xs text-text-muted truncate">
                        <Mail className="w-3 h-3 shrink-0" /> {customer.email}
                      </span>
                    )}
                  </div>
                  {/* Orders count */}
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-text-primary">
                      <ShoppingBag className="w-3.5 h-3.5 text-text-muted" />
                      {customer.total_orders}
                    </span>
                  </div>
                  {/* Since */}
                  <div className="col-span-2 text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(customer.created_at)}
                  </div>
                  {/* Expand toggle */}
                  <div className="col-span-1 flex justify-end text-text-muted">
                    {expandedId === customer.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Expanded: Order History */}
                {expandedId === customer.id && (
                  <div className="bg-surface-subtle border-t border-border-subtle px-6 py-4">
                    {loadingOrders === customer.id ? (
                      <p className="text-xs text-text-muted animate-pulse">Carregando pedidos…</p>
                    ) : (customerOrders[customer.id] ?? []).length === 0 ? (
                      <p className="text-xs text-text-muted">
                        Nenhum pedido encontrado para este cliente.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                          Histórico de Pedidos
                        </p>
                        {(customerOrders[customer.id] ?? []).map((order) => (
                          <div
                            key={order.id}
                            className="bg-surface-card rounded-radius-lg border border-border-subtle p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-text-primary">
                                #{order.id.split('-')[0].toUpperCase()}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-radius-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                              >
                                {STATUS_LABELS[order.status] ?? order.status}
                              </span>
                              <span className="text-xs text-text-muted">
                                {formatDate(order.created_at)}
                              </span>
                              <span className="text-sm font-bold text-text-primary">
                                {formatCurrency(order.total)}
                              </span>
                            </div>
                            <ul className="space-y-0.5">
                              {order.order_items?.map((item, i) => (
                                <li key={i} className="text-xs text-text-secondary">
                                  <span className="font-medium">{item.quantity}x</span>{' '}
                                  {item.product_name}
                                  <span className="text-text-muted">
                                    {' '}
                                    — {formatCurrency(item.unit_price)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-auto p-4 border-t border-border-default text-xs text-text-muted shrink-0">
          {filtered.length} de {customers.length} cliente{customers.length !== 1 ? 's' : ''}
        </div>
      </main>
    </div>
  );
}
