'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Clock,
  Eye,
  MoreVertical,
  PlusCircle,
  LayoutGrid,
  ClipboardList,
  X,
  CreditCard as CreditCardIcon,
  Banknote,
  QrCode,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, Order } from '@/types/order';
import { useToast, Toast } from '../../settings/_shared';

const formatMoney = (value: number) =>
  `R$ ${Number(value || 0)
    .toFixed(2)
    .replace('.', ',')}`;

// --- Types ---
type ViewMode = 'mesas' | 'comandas';
type FilterStatus = 'todas' | 'livre' | 'ocupada' | 'fechando';

interface TableCardProps {
  table: Table;
  activeOrders?: Order[];
  onAction: (action: string, tableId: string) => void;
}

// --- Components ---

const TableStatusBadge = ({ status }: { status: Table['status'] }) => {
  const configs = {
    available: { label: 'Livre', className: 'bg-green-50 text-green-700 border-green-200' },
    occupied: { label: 'Ocupada', className: 'bg-red-50 text-red-700 border-red-200' },
    closing: { label: 'Fechando conta', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  const config = configs[status];

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
};

const TableCard = ({ table, activeOrders = [], onAction }: TableCardProps) => {
  const getDuration = (createdAt?: string) => {
    if (!createdAt) return '00:00';
    const start = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000); // minutes
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isOccupied = table.status === 'occupied' || table.status === 'closing';

  const oldestOrderCreatedAt =
    activeOrders.length > 0
      ? activeOrders.reduce(
          (oldest, current) =>
            new Date(current.created_at) < new Date(oldest) ? current.created_at : oldest,
          activeOrders[0].created_at,
        )
      : undefined;

  const tableTotal = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div
      className={cn(
        'relative bg-white rounded-[24px] border border-gray-200 p-6 flex flex-col gap-4 shadow-sm transition-all hover:shadow-md',
        table.status === 'closing' && 'border-blue-200 bg-blue-50/10',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 leading-none">
              Mesa {table.number}
            </span>
          </div>
          <TableStatusBadge status={table.status} />
        </div>

        <div className="bg-gray-50 p-3 rounded-2xl">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      {/* Info Row */}
      {isOccupied && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock
              className={cn(
                'h-4 w-4',
                table.status === 'occupied' ? 'text-red-500' : 'text-gray-400',
              )}
            />
            <span className="text-sm font-medium">{getDuration(oldestOrderCreatedAt)}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Parcial</p>
            <p className="text-lg font-bold text-gray-900 font-black">{formatMoney(tableTotal)}</p>
          </div>
        </div>
      )}

      {!isOccupied && (
        <div className="flex-1 flex items-center justify-center py-4">
          <p className="text-gray-400 text-sm font-medium tracking-tight">Mesa disponível</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-2 flex items-center gap-2">
        {table.status === 'available' ? (
          <button
            onClick={() => onAction('open', table.id)}
            className="flex-1 bg-[#DA291C] text-white py-3 rounded-2xl font-bold text-sm hover:bg-[#C12519] transition-colors shadow-sm shadow-red-200"
          >
            Abrir Mesa
          </button>
        ) : table.status === 'closing' ? (
          <button
            onClick={() => onAction('view_bill', table.id)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            Ver Conta
          </button>
        ) : (
          <>
            <button
              onClick={() => onAction('add_order', table.id)}
              className="flex-1 bg-gray-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Pedido
            </button>
            <button
              onClick={() => onAction('view_bill', table.id)}
              className="px-4 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Eye className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// --- Modals ---

const BillModal = ({
  table,
  activeOrders = [],
  onClose,
  onCloseAccount,
  onFinalizePayment,
}: {
  table: Table;
  activeOrders?: Order[];
  onClose: () => void;
  onCloseAccount: (tableId: string) => Promise<void>;
  onFinalizePayment: (tableId: string) => Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'view' | 'payment'>(
    table.status === 'closing' ? 'payment' : 'view',
  );

  const handleCloseAccount = async () => {
    setLoading(true);
    await onCloseAccount(table.id);
    setStep('payment');
    setLoading(false);
  };

  const handleFinalize = async () => {
    setLoading(true);
    await onFinalizePayment(table.id);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Mesa {table.number}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              {step === 'view' ? 'Detalhamento da Conta' : 'Finalizar Pagamento'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-all shadow-sm"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {step === 'view' ? (
            <div className="flex flex-col gap-6">
              {activeOrders.some((o) => o.order_items && o.order_items.length > 0) ? (
                <div className="flex flex-col gap-4">
                  {activeOrders
                    .flatMap((o) => o.order_items || [])
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-gray-900 leading-tight">
                            {item.quantity}x {item.product_name}
                          </span>
                          {item.options?.size && (
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Tamanho: {item.options.size}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-black text-gray-900 whitespace-nowrap">
                          {formatMoney(item.total_price || 0)}
                        </span>
                      </div>
                    ))}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      {formatMoney(activeOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium tracking-tight">
                    Nenhum item lançado nesta mesa.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8 text-center py-4">
              <div className="bg-green-50 p-6 rounded-[24px] inline-flex flex-col gap-2 border border-green-100 mx-auto w-full max-w-xs">
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">
                  Total à Pagar
                </span>
                <span className="text-4xl font-black text-green-700 tracking-tighter leading-none">
                  {formatMoney(activeOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'pix', icon: QrCode, label: 'Pix' },
                  { id: 'card', icon: CreditCardIcon, label: 'Cartão' },
                  { id: 'cash', icon: Banknote, label: 'Dinheiro' },
                  { id: 'other', icon: MoreVertical, label: 'Outros' },
                ].map((m) => (
                  <button
                    key={m.id}
                    className="flex flex-col items-center justify-center gap-3 p-6 border border-gray-100 rounded-[24px] hover:border-[#DA291C] hover:bg-red-50/10 transition-all group"
                  >
                    <m.icon className="h-6 w-6 text-gray-400 group-hover:text-[#DA291C]" />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
          {step === 'view' ? (
            <button
              onClick={handleCloseAccount}
              disabled={loading || activeOrders.length === 0}
              className="w-full bg-[#DA291C] text-white h-14 rounded-2xl font-bold text-base hover:bg-[#C12519] transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Solicitar Fechamento (Conta)'
              )}
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setStep('view')}
                className="flex-1 bg-white border border-gray-200 text-gray-700 h-14 rounded-2xl font-bold text-base hover:bg-gray-50 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="flex-[2] bg-gray-900 text-white h-14 rounded-2xl font-bold text-base hover:bg-black transition-all shadow-lg flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar Pagamento'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateTableModal = ({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (number: string) => Promise<void>;
}) => {
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!number) return;
    setLoading(true);
    await onSave(number);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900 leading-tight">Criar Nova Mesa</h2>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-all shadow-sm"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Número da Mesa
            </label>
            <input
              type="text"
              placeholder="Ex: 01, 15..."
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              autoFocus
              className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#DA291C] transition-all"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading || !number}
            className="w-full bg-[#DA291C] text-white h-14 rounded-2xl font-bold text-base hover:bg-[#C12519] transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Adicionar Mesa'}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({
  order,
  onAction,
}: {
  order: Order;
  onAction: (action: string, id: string) => void;
}) => {
  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 flex flex-col gap-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold text-gray-900 leading-none">
            Pedido #{order.id.slice(-4)}
          </span>
          <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
            {order.status === 'new'
              ? 'Novo'
              : order.status === 'preparing'
                ? 'Preparando'
                : 'Pronto'}
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-2xl">
          <ClipboardList className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-gray-400 font-bold uppercase">Cliente</p>
        <p className="text-sm font-bold text-gray-900">{order.customer_name || 'Consumidor'}</p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            {new Date(order.created_at || '').toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
          <p className="text-lg font-black text-gray-900">{formatMoney(order.total || 0)}</p>
        </div>
      </div>

      <div className="mt-auto pt-2 flex gap-2">
        <button
          onClick={() => onAction('view_order', order.id)}
          className="flex-1 bg-gray-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-black transition-colors"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function DineInPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('mesas');
  const [filter, setFilter] = useState<FilterStatus>('todas');
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { toast, show: showToast } = useToast();

  // Modals state
  const [selectedTableForBill, setSelectedTableForBill] = useState<Table | null>(null);
  const [showCreateTable, setShowCreateTable] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch('/api/proxy/tables/'),
        fetch('/api/proxy/orders/'),
      ]);

      const tablesData = await tablesRes.json();
      const ordersData = await ordersRes.json();

      setTables(Array.isArray(tablesData) ? tablesData : []);
      // Filter for active dine-in orders
      setOrders(
        Array.isArray(ordersData)
          ? ordersData.filter((o: Order) => o.type === 'dine_in' && o.status !== 'finished')
          : [],
      );
    } catch (error) {
      console.error('Error fetching dine-in data:', error);
      showToast('error', 'Não foi possível carregar os dados do salão.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    switch (action) {
      case 'open':
        try {
          await fetch(`/api/proxy/tables/${tableId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'occupied' }),
          });
          await fetchData();
          showToast('success', `Mesa ${table.number} agora está ocupada.`);
        } catch (error) {
          console.error('Error opening table:', error);
          showToast('error', 'Não foi possível abrir a mesa.');
        }
        break;

      case 'add_order':
        router.push(`/admin/cashier?tableId=${tableId}&type=dine_in`);
        break;

      case 'view':
      case 'view_bill':
        setSelectedTableForBill(table);
        break;

      default:
        console.log(`Action ${action} for table ${tableId}`);
    }
  };

  const handleCloseAccount = async (tableId: string) => {
    try {
      await fetch(`/api/proxy/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closing' }),
      });
      await fetchData();
      showToast('success', 'Mesa movida para fechamento.');
    } catch (error) {
      console.error('Error closing account:', error);
      showToast('error', 'Não foi possível fechar a conta.');
    }
  };

  const handleFinalizePayment = async (tableId: string) => {
    try {
      // 1. Mark orders as finished
      const tableOrders = orders.filter((o) => o.table_id === tableId);
      await Promise.all(
        tableOrders.map((o) =>
          fetch(`/api/proxy/orders/${o.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'finished' }),
          }),
        ),
      );

      // 2. Mark table as available
      await fetch(`/api/proxy/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available' }),
      });
      await fetchData();
      showToast('success', 'Pagamento confirmado com sucesso.');
    } catch (error) {
      console.error('Error finalizing payment:', error);
      showToast('error', 'Não foi possível finalizar o pagamento.');
    }
  };

  const handleCreateTable = async (number: string) => {
    try {
      const res = await fetch('/api/proxy/tables/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, status: 'available' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Erro ao criar mesa');
      }

      await fetchData();
      showToast('success', `Mesa ${number} adicionada ao salão.`);
    } catch (error: any) {
      console.error('Error creating table:', error);
      showToast('error', error.message || 'Não foi possível criar a mesa.');
    }
  };

  const filteredTables = tables.filter((t) => {
    const matchesSearch = t.number.toLowerCase().includes(search.toLowerCase());
    if (filter === 'todas') return matchesSearch;

    const statusMap: Record<string, string> = {
      livre: 'available',
      ocupada: 'occupied',
      fechando: 'closing',
    };

    return matchesSearch && t.status === statusMap[filter];
  });

  const stats = {
    todas: tables.length,
    livre: tables.filter((t) => t.status === 'available').length,
    ocupada: tables.filter((t) => t.status === 'occupied').length,
    fechando: tables.filter((t) => t.status === 'closing').length,
  };

  const activeOrdersForSelectedTable = selectedTableForBill
    ? orders.filter(
        (o) =>
          o.table_id === selectedTableForBill.id &&
          o.status !== 'canceled' &&
          o.status !== 'finished',
      )
    : [];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header section from Stitch Design */}
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Salão</h1>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-white border border-gray-200 rounded-2xl w-fit">
            <button
              onClick={() => setViewMode('mesas')}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
                viewMode === 'mesas'
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Mesas
            </button>
            <button
              onClick={() => setViewMode('comandas')}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
                viewMode === 'comandas'
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              <ClipboardList className="h-4 w-4" />
              Comandas
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateTable(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Criar Mesa
            </button>
            <button
              onClick={() => router.push('/admin/cashier?type=dine_in')}
              className="flex items-center gap-2 px-6 py-3 bg-[#DA291C] text-white rounded-2xl text-sm font-bold hover:bg-[#C12519] transition-all shadow-sm shadow-red-100"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(stats) as Array<keyof typeof stats>).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterStatus)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border',
                filter === key
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-900',
              )}
            >
              {key === 'todas'
                ? 'Todas'
                : key === 'livre'
                  ? 'Livre'
                  : key === 'ocupada'
                    ? 'Ocupada'
                    : 'Fechando conta'}
              <span
                className={cn(
                  'flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px]',
                  filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                )}
              >
                {stats[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mesa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#DA291C] transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[220px] bg-gray-100 rounded-[24px]" />
          ))}
        </div>
      ) : viewMode === 'mesas' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((table) => {
            const tableActiveOrders = orders.filter(
              (o) => o.table_id === table.id && o.status !== 'canceled' && o.status !== 'finished',
            );
            return (
              <TableCard
                key={table.id}
                table={table}
                activeOrders={tableActiveOrders}
                onAction={handleAction}
              />
            );
          })}
          {filteredTables.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
              <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">Nenhuma mesa encontrada</p>
              <p className="text-gray-400 text-sm">Tente mudar o filtro ou criar uma nova mesa.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders
            .filter((o) => !o.table_id && o.status !== 'canceled' && o.status !== 'finished')
            .map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={(action, _id) => {
                  if (action === 'view_order') {
                    // Reuse the bill modal for details if it fits, or navigate
                    router.push(`/admin/orders?search=${order.id}`);
                  }
                }}
              />
            ))}
          {orders.filter((o) => !o.table_id).length === 0 && (
            <div className="col-span-full py-20 text-center">
              <ClipboardList className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">Nenhuma comanda ativa</p>
              <p className="text-gray-400 text-sm">Crie um novo pedido para começar</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedTableForBill && (
        <BillModal
          table={selectedTableForBill}
          activeOrders={activeOrdersForSelectedTable}
          onClose={() => setSelectedTableForBill(null)}
          onCloseAccount={handleCloseAccount}
          onFinalizePayment={handleFinalizePayment}
        />
      )}

      {showCreateTable && (
        <CreateTableModal onClose={() => setShowCreateTable(false)} onSave={handleCreateTable} />
      )}

      {/* Info Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-200/50">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Livre
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Ocupada
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Fechando
          </span>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}
