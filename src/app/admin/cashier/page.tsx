/* eslint-disable @next/next/no-img-element */
'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Utensils,
  CreditCard,
  Banknote,
  QrCode,
  Plus,
  Minus,
  Trash2,
  Store,
  User,
  Loader2,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '../settings/_shared';
import { cn } from '@/lib/utils';
import { Product, Category, CartItem, ProductOptions, AddonOption } from '@/types/order';
import ProductOptionsModal from '@/components/ui/product-options-modal';

// ─── Close Table Modal ──────────────────────────────────────────────────────
function CloseTableModal({
  isOpen,
  onClose,
  tableId,
  tableName,
  formatMoney,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  tableName: string;
  formatMoney: (cents: number) => string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState<{ total_bill_cents: number; orders: any[] } | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [customerName, setCustomerName] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [saving, setSaving] = useState(false);
  const { show: showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !tableId) return;
    setLoading(true);
    fetch(`/api/proxy/tables/${tableId}/bill`)
      .then((res) => res.json())
      .then((data) => setBillData(data))
      .catch((err) => {
        console.error(err);
        showToast('error', 'Erro ao carregar conta da mesa.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, tableId, showToast]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/proxy/tables/${tableId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: paymentMethod,
          customer_name: customerName.trim() || undefined,
          customer_cpf: customerCpf.replace(/\D/g, '') || undefined,
        }),
      });
      if (!res.ok) throw new Error('Erro ao fechar mesa.');
      showToast('success', 'Mesa fechada com sucesso!');
      onSuccess();
    } catch (err) {
      console.error(err);
      showToast('error', 'Erro ao fechar mesa.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-space-4 backdrop-blur-sm">
      <div className="bg-surface-card rounded-radius-xl shadow-lg w-full max-w-sm flex flex-col border border-border-default animate-in zoom-in-95 duration-200">
        <div className="p-space-6 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-xl font-black text-text-primary text-center">
            Fechamento: Mesa {tableName}
          </h2>
        </div>
        <div className="p-space-6 flex flex-col gap-space-6 bg-surface-page">
          {loading ? (
            <div className="flex justify-center p-4 text-text-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : billData ? (
            <>
              <div className="bg-surface-card p-space-4 rounded-radius-lg border border-border-default text-center shadow-sm flex flex-col items-center justify-center">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Total da Conta
                </p>
                <p className="text-4xl font-black text-text-primary tracking-tight">
                  {formatMoney(billData.total_bill_cents)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-3">
                <div className="relative">
                  <User className="absolute left-space-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Nome na Nota"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs bg-surface-card border border-border-default rounded-radius-sm pl-space-8 pr-space-4 py-1.5 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="relative">
                  <Hash className="absolute left-space-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="CPF na Nota"
                    value={customerCpf}
                    onChange={(e) => setCustomerCpf(e.target.value)}
                    className="w-full text-xs bg-surface-card border border-border-default rounded-radius-sm pl-space-8 pr-space-4 py-1.5 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-space-3 block text-center">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-space-2">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={cn(
                      'p-space-3 border rounded-radius-md text-sm font-bold transition-all',
                      paymentMethod === 'pix'
                        ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                        : 'border-border-default text-text-muted hover:border-border-focus',
                    )}
                  >
                    Pix
                  </button>
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={cn(
                      'p-space-3 border rounded-radius-md text-sm font-bold transition-all',
                      paymentMethod === 'credit_card'
                        ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                        : 'border-border-default text-text-muted hover:border-border-focus',
                    )}
                  >
                    Crédito
                  </button>
                  <button
                    onClick={() => setPaymentMethod('debit_card')}
                    className={cn(
                      'p-space-3 border rounded-radius-md text-sm font-bold transition-all',
                      paymentMethod === 'debit_card'
                        ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                        : 'border-border-default text-text-muted hover:border-border-focus',
                    )}
                  >
                    Débito
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      'p-space-3 border rounded-radius-md text-sm font-bold transition-all',
                      paymentMethod === 'cash'
                        ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                        : 'border-border-default text-text-muted hover:border-border-focus',
                    )}
                  >
                    Dinheiro
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-status-error text-sm font-medium">
              Erro ao carregar dados.
            </p>
          )}
        </div>
        <div className="p-space-4 border-t border-border-default bg-surface-card flex gap-space-3 rounded-b-radius-xl">
          <Button
            variant="outline"
            className="flex-1 h-12 font-bold text-text-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={saving || !billData}
            className="flex-1 h-12 bg-action-strong hover:bg-action-strong-hover text-white font-bold shadow-md"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function POSCashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Filtros e UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Options Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Store Tables for "Mesa" order type
  const [tables, setTables] = useState<{ id: string; number: string }[]>([]);

  // Dados do Pedido
  const [orderType, setOrderType] = useState<'pickup' | 'dine_in' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash'>(
    'pix',
  );
  const [customerName, setCustomerName] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Existing Table Bill
  const [tableBillLoading, setTableBillLoading] = useState(false);
  const [tableBillData, setTableBillData] = useState<{
    total_bill_cents: number;
    orders: any[];
  } | null>(null);

  const { show: showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ─── Initial Params ───
  useEffect(() => {
    const tid = searchParams.get('tableId');
    const type = searchParams.get('type') as any;
    if (tid) setSelectedTableId(tid);
    if (type && ['pickup', 'dine_in', 'delivery'].includes(type)) setOrderType(type);
  }, [searchParams]);

  // ─── Fetch Existing Table Orders ───
  useEffect(() => {
    if (orderType === 'dine_in' && selectedTableId) {
      setTableBillLoading(true);
      fetch(`/api/proxy/tables/${selectedTableId}/bill`)
        .then((res) => res.json())
        .then((data) => setTableBillData(data))
        .catch((err) => console.error('Error fetching table bill:', err))
        .finally(() => setTableBillLoading(false));
    } else {
      setTableBillData(null);
    }
  }, [orderType, selectedTableId]);

  // ─── Fetch Data ─────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes, tabRes] = await Promise.all([
          fetch('/api/proxy/catalog/categories'),
          fetch('/api/proxy/catalog/products'),
          fetch('/api/proxy/tables'),
        ]);

        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data || []);
        }

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data || []);
        }

        if (tabRes.ok) {
          const tabs = await tabRes.json();
          setTables(tabs || []);
          if (tabs.length > 0) setSelectedTableId(tabs[0].id);
        }
      } catch (err) {
        console.error('Failed to load data', err);
        showToast('error', 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  // ─── Cart Logic ─────────────────────────────────────────────────────────

  const handleAddToCartModal = useCallback(
    (product: Product, quantity: number, options: ProductOptions | null, unitPrice: number) => {
      setCart((prev) => {
        const optionsHash = JSON.stringify(options || {});
        const cartItemId = `${product.id}-${optionsHash}`;

        const existing = prev.find((item) => item.id === cartItemId);
        if (existing) {
          return prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            quantity,
            options: options || {},
            unit_price: unitPrice,
            total_price: unitPrice * quantity,
          },
        ];
      });
      setSelectedProduct(null);
    },
    [],
  );

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQ = item.quantity + delta;
            const updatedQ = Math.max(0, newQ);
            return { ...item, quantity: updatedQ, total_price: item.unit_price * updatedQ };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.unit_price * item.quantity, 0);
  }, [cart]);

  // ─── Checkout ───────────────────────────────────────────────────────────

  const handleCheckout = async () => {
    if (cart.length === 0)
      return showToast('error', 'Adicione itens ao pedido antes de finalizar.');

    if (orderType === 'dine_in' && !selectedTableId) {
      return showToast('error', 'Selecione uma mesa para lançar o pedido.');
    }

    setSaving(true);
    try {
      const payload = {
        type: orderType,
        payment_method: paymentMethod,
        table_id: orderType === 'dine_in' ? selectedTableId : undefined,
        customer_name: customerName.trim() || undefined,
        customer_cpf: customerCpf.replace(/\D/g, '') || undefined,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unit_price / 100, // O banco espera REAIS, não centavos!
          options: item.options,
          notes: item.notes,
        })),
      };

      const res = await fetch('/api/proxy/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao lançar pedido');

      showToast('success', 'Pedido lançado com sucesso!');
      clearCart();
      setCustomerName('');
      setCustomerCpf('');

      if (orderType === 'dine_in') {
        router.push('/admin/orders/dine-in');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('error', 'Erro de comunicação ao enviar o pedido.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Filtering ──────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory ? p.category_id === selectedCategory : true;
      return p.active !== false && matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const formatMoney = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

  // ─── UI Variables ───────────────────────────────────────────────────────

  // Organize categories (parents + children) into a flat list, or keep it simple for POS
  const rootCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] gap-space-6 pb-space-6 bg-surface-page">
      {/* Left Box: Menu/Catalog */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-card rounded-radius-xl shadow-card border border-border-default overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="p-space-6 border-b border-border-subtle bg-surface-card z-10">
          <div className="relative">
            <Search className="absolute left-space-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar produtos (cód, nome)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-space-12 pr-space-4 bg-surface-subtle border border-border-default rounded-radius-md text-text-primary text-sm font-medium focus:outline-none focus:bg-surface-card focus:border-action-primary focus:ring-4 focus:ring-action-primary/10 transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="mt-space-4 flex gap-space-2 overflow-x-auto pb-space-2 p-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'flex-shrink-0 px-space-4 py-2 rounded-radius-full text-sm font-bold transition-all border',
                selectedCategory === null
                  ? 'bg-text-primary border-text-primary text-text-on-dark shadow-sm'
                  : 'bg-surface-card border-border-default text-text-secondary hover:bg-surface-subtle',
              )}
            >
              Todos
            </button>
            {rootCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex-shrink-0 px-space-4 py-2 rounded-radius-full text-sm font-bold transition-all border',
                  selectedCategory === cat.id
                    ? 'bg-text-primary border-text-primary text-text-on-dark shadow-sm'
                    : 'bg-surface-card border-border-default text-text-secondary hover:bg-surface-subtle',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-space-6 bg-surface-subtle">
          {loading ? (
            <div className="flex items-center justify-center h-full text-text-muted">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <Store className="h-12 w-12 opacity-20 mb-space-4" />
              <p className="font-medium text-sm">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-space-4">
              {filteredProducts.map((product) => {
                const price = product.promotional_price_cents ?? product.price_cents;
                const outOfStock = (product.stock_quantity ?? 1) <= 0;
                return (
                  <div
                    key={product.id}
                    onClick={() => !outOfStock && setSelectedProduct(product)}
                    className={cn(
                      'bg-surface-card border border-border-default rounded-radius-lg overflow-hidden shadow-sm transition-all cursor-pointer group flex flex-col h-full',
                      outOfStock
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-card-hover hover:border-action-primary/40',
                    )}
                  >
                    {/* Image Header if exists */}
                    {product.image_url ? (
                      <div className="h-32 bg-surface-subtle w-full relative overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-2 bg-action-primary/10 w-full" />
                    )}
                    <div className="p-space-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-sm text-text-primary line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                      <span className="font-black text-action-primary mt-auto pt-space-3">
                        {formatMoney(price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Box: Current Order & Cart */}
      <div className="w-96 flex flex-col bg-surface-card rounded-radius-xl shadow-card border border-border-default animate-in fade-in slide-in-from-right-4 duration-500 flex-shrink-0 relative overflow-hidden">
        {/* Header Comanda */}
        <div className="bg-text-primary text-text-on-dark p-space-6">
          <div className="flex items-center justify-between mb-space-4">
            <h2 className="font-black text-xl tracking-tight flex items-center gap-2">
              <Utensils className="h-5 w-5 opacity-70" />
              Comanda
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-text-on-dark/60 hover:text-text-on-dark uppercase tracking-wider transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Order Type Selector */}
          <div className="flex bg-surface-page/10 p-1 rounded-radius-md backdrop-blur-sm shadow-inner gap-1">
            <button
              onClick={() => setOrderType('pickup')}
              className={cn(
                'flex-1 text-xs font-bold py-1.5 rounded-radius-sm transition-all',
                orderType === 'pickup'
                  ? 'bg-surface-card text-text-primary shadow-sm'
                  : 'text-text-on-dark/70 hover:text-text-on-dark',
              )}
            >
              Balcão
            </button>
            <button
              onClick={() => setOrderType('dine_in')}
              className={cn(
                'flex-1 text-xs font-bold py-1.5 rounded-radius-sm transition-all',
                orderType === 'dine_in'
                  ? 'bg-surface-card text-text-primary shadow-sm'
                  : 'text-text-on-dark/70 hover:text-text-on-dark',
              )}
            >
              Mesa
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={cn(
                'flex-1 text-xs font-bold py-1.5 rounded-radius-sm transition-all',
                orderType === 'delivery'
                  ? 'bg-surface-card text-text-primary shadow-sm'
                  : 'text-text-on-dark/70 hover:text-text-on-dark',
              )}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Customer Section */}
        <div className="p-space-4 bg-surface-subtle border-b border-border-subtle flex flex-col gap-space-3">
          {orderType === 'dine_in' && (
            <div className="flex flex-col gap-1 mb-1 animate-in fade-in slide-in-from-top-1">
              <label className="text-xs font-bold text-text-secondary ml-1">Vincular à Mesa</label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full text-sm bg-surface-card border border-border-default rounded-radius-sm px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
              >
                {tables.length === 0 ? (
                  <option value="" disabled>
                    Nenhuma mesa cadastrada
                  </option>
                ) : (
                  tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {orderType !== 'dine_in' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-3">
              <div className="relative">
                <User className="absolute left-space-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Nome"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs bg-surface-card border border-border-default rounded-radius-sm pl-space-8 pr-space-4 py-1.5 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium"
                />
              </div>
              <div className="relative">
                <Hash className="absolute left-space-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="CPF"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full text-xs bg-surface-card border border-border-default rounded-radius-sm pl-space-8 pr-space-4 py-1.5 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-surface-page/50 p-space-2 flex flex-col gap-space-4">
          {/* Exibir itens já pedidos na mesa */}
          {orderType === 'dine_in' && tableBillLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            </div>
          )}

          {orderType === 'dine_in' && tableBillData && tableBillData.orders.length > 0 && (
            <div className="flex flex-col gap-space-2">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">
                Itens na Mesa
              </div>
              {tableBillData.orders.map((order) => (
                <div key={order.id} className="flex flex-col gap-1">
                  {order.order_items.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-surface-subtle p-space-2 rounded-radius-md border border-border-default flex flex-col gap-1 opacity-80"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-text-primary leading-tight max-w-[180px]">
                          <span className="text-text-muted mr-1">{item.quantity}x</span>{' '}
                          {item.product_name}
                        </span>
                        <span className="text-sm font-black text-text-secondary">
                          {formatMoney(Math.round(item.unit_price * 100) * item.quantity)}
                        </span>
                      </div>
                      {item.options &&
                        (item.options.size ||
                          (item.options.addons && item.options.addons.length > 0)) && (
                          <div className="text-xs text-text-muted">
                            {item.options.size && <div>Tamanho: {item.options.size}</div>}
                            {item.options.addons?.map((opt: any, i: number) => (
                              <div key={i}>+ {opt.name}</div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-space-2">
            {cart.length > 0 && (
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">
                Novo Pedido
              </div>
            )}
            {cart.length === 0 && (!tableBillData || tableBillData.orders.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted px-space-6 text-center pt-8">
                <ShoppingBag className="h-12 w-12 opacity-20 mb-space-4" />
                <p className="text-sm font-medium">Comanda vazia</p>
                <p className="text-xs mt-1">Clique nos produtos ao lado para iniciar a venda.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-card p-space-3 rounded-radius-md border border-border-default flex flex-col gap-space-3 shadow-sm hover:border-border-focus transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-text-primary leading-tight max-w-[180px]">
                      {item.product.name}
                    </span>
                    <span className="text-sm font-black text-action-primary">
                      {formatMoney(item.unit_price * item.quantity)}
                    </span>
                  </div>
                  {item.options &&
                    (item.options.size ||
                      (item.options.addons && item.options.addons.length > 0)) && (
                      <div className="text-xs text-text-muted mb-2">
                        {item.options.size && <div>Tamanho: {item.options.size}</div>}
                        {item.options.addons?.map((opt: AddonOption, i: number) => (
                          <div key={i}>+ {opt.name}</div>
                        ))}
                      </div>
                    )}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-text-muted">{formatMoney(item.unit_price)} un</div>
                    <div className="flex items-center border border-border-default rounded-radius-sm overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 flex items-center justify-center bg-surface-subtle hover:bg-border-default text-text-secondary transition-colors"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-3 w-3 text-status-error" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </button>
                      <div className="h-8 w-10 flex items-center justify-center bg-surface-card text-sm font-bold text-text-primary">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 flex items-center justify-center bg-surface-subtle hover:bg-border-default text-text-secondary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Checkout Footer block */}
        <div className="border-t border-border-default bg-surface-card p-space-6 pt-space-4 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          {/* Payment Method Selector */}
          {orderType !== 'dine_in' && (
            <div className="mb-space-4">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-space-2 block">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 p-1 border rounded-radius-md transition-all',
                    paymentMethod === 'pix'
                      ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                      : 'border-border-default text-text-muted hover:border-border-focus',
                  )}
                >
                  <QrCode className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Pix</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 p-1 border rounded-radius-md transition-all',
                    paymentMethod === 'credit_card'
                      ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                      : 'border-border-default text-text-muted hover:border-border-focus',
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Crédito</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('debit_card')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 p-1 border rounded-radius-md transition-all',
                    paymentMethod === 'debit_card'
                      ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                      : 'border-border-default text-text-muted hover:border-border-focus',
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Débito</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 p-1 border rounded-radius-md transition-all',
                    paymentMethod === 'cash'
                      ? 'border-action-primary bg-action-primary/10 text-action-primary shadow-sm'
                      : 'border-border-default text-text-muted hover:border-border-focus',
                  )}
                >
                  <Banknote className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Dinheiro</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1 mb-space-4 pt-space-2 border-t border-border-subtle">
            {orderType === 'dine_in' && tableBillData && tableBillData.orders.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  Já na Mesa
                </span>
                <span className="text-sm font-bold text-text-secondary tracking-tight">
                  {formatMoney(tableBillData.total_bill_cents)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                Total Pedido Atual
              </span>
              <span className="text-2xl font-black text-text-primary tracking-tight">
                {formatMoney(cartTotal)}
              </span>
            </div>
          </div>

          <div className="flex gap-space-2 mt-[auto]">
            {orderType === 'dine_in' && selectedTableId && (
              <Button
                onClick={() => setIsCloseModalOpen(true)}
                disabled={saving}
                className="flex-1 h-12 bg-status-warning hover:opacity-90 text-white text-sm font-bold rounded-radius-lg shadow-sm transition-all"
              >
                Fechar Mesa
              </Button>
            )}
            <Button
              onClick={handleCheckout}
              disabled={saving || cart.length === 0}
              className={cn(
                'flex-1 h-12 text-sm font-bold rounded-radius-lg shadow-sm transition-all text-white bg-action-strong hover:bg-action-strong-hover flex items-center justify-center',
              )}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Concluir Venda'}
            </Button>
          </div>
        </div>
      </div>
      {/* Product Options Modal */}
      {selectedProduct && (
        <ProductOptionsModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCartModal}
        />
      )}

      {/* Close Table Modal */}
      <CloseTableModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        tableId={selectedTableId}
        tableName={tables.find((t) => t.id === selectedTableId)?.number || ''}
        formatMoney={formatMoney}
        onSuccess={() => {
          setIsCloseModalOpen(false);
          router.push('/admin/orders/dine-in');
        }}
      />
    </div>
  );
}
