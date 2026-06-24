/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { X, Search, Plus, Minus, ShoppingBag } from 'lucide-react';

import ProductOptionsModal from '@/components/ui/product-options-modal';
import { ProductOptions } from '@/types/order';

interface LocalCategory {
  id: string;
  name: string;
  active: boolean;
}
interface LocalProduct {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price_cents: number;
  image_url: string | null;
  active?: boolean;
  product_type?: 'standard' | 'pizza' | 'variable';
  pizza_category_id?: string | null;
  fractional_pricing_strategy?: string | null;
}
interface LocalCartItem {
  id: string;
  product: LocalProduct;
  quantity: number;
  notes: string;
  options?: ProductOptions | null;
  unit_price: number;
}

interface Props {
  onClose: () => void;
  onOrderCreated: () => void;
}

type OrderType = 'delivery' | 'local' | 'takeout';
type PaymentMethod = 'pix' | 'card' | 'cash';

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  delivery: 'Delivery',
  local: 'Balcão / Mesa',
  takeout: 'Retirada',
};
const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartão',
  cash: 'Dinheiro',
};

export default function NewOrderModal({ onClose, onOrderCreated }: Props) {
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, _setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>('');

  // Options Modal
  const [_loading, _setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LocalProduct | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/proxy/catalog/categories/').then((r) => r.json()),
      fetch('/api/proxy/catalog/products/').then((r) => r.json()),
    ])
      .then(([cats, prods]) => {
        const activeCats = (cats || []).filter((c: LocalCategory) => c.active);
        setCategories(activeCats);
        setProducts(prods || []);
        if (activeCats.length > 0) setSelectedCategory(activeCats[0].id);
      })
      .catch(() => setError('Falha ao carregar cardápio.'));
  }, []);

  const displayedProducts = products.filter((p) => {
    if (!p.active) return false;
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (search) return p.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const handleAddToCart = (
    product: LocalProduct,
    quantity: number,
    options: ProductOptions | null,
    unitPrice: number,
  ) => {
    const item: LocalCartItem = {
      id: Math.random().toString(36).substring(7),
      product: product as LocalProduct,
      quantity,
      notes: '',
      options,
      unit_price: unitPrice,
    };
    setCart((prev) => [...prev, item]);
    setSelectedProduct(null);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((i) => i.id !== cartItemId);
      return prev.map((i) => (i.id === cartItemId ? { ...i, quantity: i.quantity - 1 } : i));
    });
  };

  const addToCart = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  };

  const subtotalCents = cart.reduce((acc, i) => acc + i.unit_price * i.quantity, 0); // unit_price and quantity calculation for subtotal in cents
  // unit_price already expressed in cents!

  const formatCurrency = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getQuantityInCart = (productId: string) =>
    cart.filter((i) => i.product.id === productId).reduce((sum, i) => sum + i.quantity, 0);

  const formatInputCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const cents = parseInt(digits || '0');
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const amountPaidCents = parseInt(amountPaid.replace(/\D/g, '') || '0');
  const changeCents =
    paymentMethod === 'cash' && amountPaidCents > subtotalCents
      ? amountPaidCents - subtotalCents
      : 0;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Adicione itens ao pedido.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customer_name: customerName || 'Balcão',
        customer_phone: customerPhone || '',
        customer_cpf: customerCpf || undefined,
        type: orderType,
        payment_method: paymentMethod,
        notes:
          paymentMethod === 'cash' && amountPaidCents > 0
            ? `Pago: ${formatCurrency(amountPaidCents)} | Troco: ${formatCurrency(changeCents)}`
            : undefined,
        items: cart.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.unit_price / 100,
          options: i.options,
          notes: i.notes || undefined,
        })),
      };
      const res = await fetch('/api/proxy/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Falha ao criar pedido.');
      }
      onOrderCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-page rounded-radius-xl shadow-lg w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-border-default">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-surface-card shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-action-primary" />
            <h2 className="font-bold text-text-primary text-lg">Pedidos Balcão (PDV)</h2>
          </div>
          <div className="flex items-center gap-2">
            {(['delivery', 'local', 'takeout'] as OrderType[]).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`px-4 py-1.5 rounded-radius-md text-sm font-semibold transition-colors ${orderType === t ? 'bg-action-primary text-white' : 'bg-surface-subtle text-text-secondary hover:bg-surface-section'}`}
              >
                {ORDER_TYPE_LABELS[t]}
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-radius-md hover:bg-surface-subtle transition-colors text-text-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT: Product Browser */}
          <div className="flex flex-col flex-1 border-r border-border-default min-h-0">
            {/* Search */}
            <div className="px-4 py-3 border-b border-border-subtle shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar produto..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-border-default rounded-radius-md bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 px-4 py-3 border-b border-border-subtle shrink-0 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-radius-md text-xs font-semibold whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-action-primary text-white' : 'bg-surface-subtle text-text-secondary hover:bg-surface-section'}`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-radius-md text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-action-primary text-white' : 'bg-surface-subtle text-text-secondary hover:bg-surface-section'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {error && !submitting && (
                <p className="text-status-error text-sm text-center py-4">{error}</p>
              )}
              {displayedProducts.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted text-sm">
                  <ShoppingBag className="h-12 w-12 mb-2 opacity-20" />
                  <p>Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {displayedProducts.map((product) => {
                    const quantity = getQuantityInCart(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`relative text-left rounded-radius-lg border-2 p-3 transition-all hover:shadow-md ${quantity > 0 ? 'border-action-primary bg-action-primary/5' : 'border-border-default bg-surface-card hover:border-action-primary/50'}`}
                      >
                        {quantity > 0 && (
                          <span className="absolute top-2 right-2 bg-action-primary text-white text-xs font-bold w-5 h-5 rounded-radius-full flex items-center justify-center">
                            {quantity}
                          </span>
                        )}
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-20 object-cover rounded-radius-md mb-2"
                          />
                        )}
                        {!product.image_url && (
                          <div className="w-full h-16 bg-surface-subtle rounded-radius-md mb-2 flex items-center justify-center text-2xl">
                            🍽
                          </div>
                        )}
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-action-primary font-bold mt-0.5">
                          {formatCurrency(product.price_cents)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-72 flex flex-col bg-surface-card min-h-0 shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Itens do pedido
              </span>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Subtotal
              </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-text-muted text-center px-4">
                  <p>Finalize o item ao lado, ele vai aparecer aqui</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 bg-surface-subtle border border-border-default rounded-radius-md p-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatCurrency(item.unit_price)} un
                        </p>

                        {item.options &&
                          (item.options.size ||
                            (item.options.addons && item.options.addons.length > 0)) && (
                            <div className="text-[10px] text-text-muted mt-1 leading-tight">
                              {item.options.size && <div>Tam: {item.options.size}</div>}
                              {item.options.addons?.map((opt: { name: string }, i: number) => (
                                <div key={i}>+ {opt.name}</div>
                              ))}
                            </div>
                          )}
                      </div>
                      <span className="text-xs font-bold text-text-primary text-right shrink-0">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                    <div className="flex justify-end gap-1.5 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-6 h-6 rounded-radius-full bg-surface-card border border-border-default flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        <Minus className="h-3 w-3 text-status-error" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item.id)}
                        className="p-1 rounded-radius-md hover:bg-surface-subtle text-text-primary transition-colors"
                      >
                        <Plus className="h-3 w-3 text-text-primary" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="p-3 border-t border-border-subtle space-y-1 shrink-0 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-text-muted text-xs">
                <span>Entrega</span>
                <span className="text-status-success font-semibold">Grátis</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary text-base pt-1 border-t border-border-subtle">
                <span>Total</span>
                <span>{formatCurrency(subtotalCents)}</span>
              </div>
            </div>

            {/* Customer Form */}
            <div className="p-3 border-t border-border-subtle space-y-2 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full text-xs border border-border-default rounded-radius-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-action-primary/30 bg-surface-card"
                />
                <div className="relative">
                  <input
                    type="text"
                    value={customerCpf}
                    onChange={(e) => setCustomerCpf(e.target.value)}
                    placeholder="CPF (opcional)"
                    maxLength={14}
                    className="w-full text-xs border border-border-default rounded-radius-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-action-primary/30 bg-surface-card"
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-3 gap-1">
                {(['pix', 'card', 'cash'] as PaymentMethod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPaymentMethod(p)}
                    className={`py-1.5 text-xs font-semibold rounded-radius-sm transition-colors ${paymentMethod === p ? 'bg-action-primary text-white' : 'bg-surface-subtle text-text-secondary hover:bg-surface-section border border-border-default'}`}
                  >
                    {PAYMENT_LABELS[p]}
                  </button>
                ))}
              </div>

              {/* Cash Change logic */}
              {paymentMethod === 'cash' && (
                <div className="space-y-2 mt-2 p-2 bg-surface-subtle rounded-radius-md animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Valor Pago
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">
                        R$
                      </span>
                      <input
                        type="text"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(formatInputCurrency(e.target.value))}
                        placeholder="0,00"
                        className="w-full text-sm font-bold border border-border-default rounded-radius-sm pl-8 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-action-primary/30 bg-surface-card"
                      />
                    </div>
                  </div>
                  {amountPaidCents > subtotalCents && (
                    <div className="flex justify-between items-center pt-1 border-t border-border-default/50">
                      <span className="text-xs font-semibold text-text-secondary">Troco:</span>
                      <span className="text-sm font-bold text-status-success">
                        {formatCurrency(changeCents)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {error && submitting === false && (
                <p className="text-status-error text-xs text-center">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full py-3 rounded-radius-md bg-action-strong text-white font-bold text-sm hover:bg-action-strong-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Criando pedido...' : '[ ENTER ] Gerar pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductOptionsModal
          product={selectedProduct as unknown as LocalProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
