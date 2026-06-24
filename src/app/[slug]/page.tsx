'use client';

import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Product } from '@/components/ui/product-card';
import { ProductOptions, CartItem } from '@/types/order';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Store,
  Clock,
  Tag,
  Sparkles,
} from 'lucide-react';
import ChatWidget from '@/components/chat-widget';
import ProductOptionsModal from '@/components/ui/product-options-modal';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  description: string | null;
  order: number;
};

type BusinessHours = Record<string, { open: string; close: string }>;

type DeliveryRegion = {
  name: string;
  fee_cents: number;
  min_order_cents?: number;
};

type RestaurantConfig = {
  whatsapp?: string;
  logo_url?: string;
  cover_url?: string;
  accent_color?: string;
  business_hours?: BusinessHours;
  promo_banner?: { text: string; active: boolean };
  min_order_cents?: number;
  delivery_regions?: DeliveryRegion[];
  description?: string;
  footer_text?: string;
};

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  config_json: RestaurantConfig | null;
};

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function isOpen(business_hours?: BusinessHours | null): boolean | null {
  if (!business_hours) return null;
  const now = new Date();
  const dayKey = DAYS[now.getDay()];
  const dayHours = business_hours[dayKey];
  if (!dayHours) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = (dayHours.open ?? '00:00').split(':').map(Number);
  const [closeH, closeM] = (dayHours.close ?? '23:59').split(':').map(Number);
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  return current >= openMin && current < closeMin;
}

// CartItem now imported from @/types/order

// ─── Cart Drawer ───────────────────────────────────────────────────────────────

function CartDrawer({
  items,
  open,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
  slug: _slug,
}: {
  items: CartItem[];
  open: boolean;
  onClose: () => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  slug: string;
}) {
  const total = items.reduce((acc, i) => acc + (i.total_price || i.unit_price * i.quantity), 0);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface-card shadow-lg z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-action-primary" />
            <span className="font-bold text-lg text-text-primary">Carrinho</span>
            {totalItems > 0 && (
              <span className="bg-action-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
              <ShoppingCart className="h-12 w-12 opacity-30" />
              <p className="text-sm">Seu carrinho está vazio</p>
            </div>
          ) : (
            items.map((item: CartItem) => (
              <div key={item.id} className="flex items-center gap-3">
                {/* Image or placeholder */}
                <div className="h-14 w-14 rounded-lg bg-surface-subtle shrink-0 overflow-hidden">
                  {item.product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-text-muted opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {(item.unit_price / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}{' '}
                    cada
                  </p>
                  {item.options &&
                    (item.options.size ||
                      (item.options.addons && item.options.addons.length > 0)) && (
                      <div className="text-[10px] text-text-muted mt-0.5 leading-tight">
                        {item.options.size && <div>Tam: {item.options.size}</div>}
                        {item.options.addons?.map((opt: { name: string }, i: number) => (
                          <div key={i}>+ {opt.name}</div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1">
                  {item.quantity === 1 ? (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-full text-status-error hover:bg-status-error/10 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onDecrement(item.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-full border border-border-default text-text-secondary hover:bg-surface-subtle transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  )}
                  <span className="w-6 text-center text-sm font-bold text-text-primary">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onIncrement(item.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-action-primary text-white hover:bg-action-primary-hover transition"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-border-subtle space-y-3">
            <div className="flex justify-between text-sm font-medium text-text-secondary">
              <span>Subtotal</span>
              <span className="text-text-primary font-bold">
                {(total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-radius-md bg-action-strong py-3.5 text-sm font-bold text-white shadow-shadow-md hover:bg-action-strong-hover active:scale-[0.98] transition"
            >
              Finalizar Pedido
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Badge helpers ──────────────────────────────────────────────────────────────

function PriceDisplay({ product }: { product: Product }) {
  const hasPromo = product.promotional_price_cents != null && product.promotional_price_cents > 0;
  const finalPrice = hasPromo ? product.promotional_price_cents! : product.price_cents;
  return (
    <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
      {hasPromo && (
        <span className="text-xs text-text-muted line-through">
          {(product.price_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      )}
      <span className={`text-sm font-bold ${hasPromo ? 'text-status-error' : 'text-action-primary'}`}>
        {(finalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </span>
    </div>
  );
}

// ─── Product Card (inline, horizontal style) ───────────────────────────────────

function ProductRow({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const outOfStock = product.is_out_of_stock === true;
  const hasPromo = product.promotional_price_cents != null && product.promotional_price_cents > 0;

  return (
    <div className={`flex items-center gap-4 rounded-radius-xl border bg-surface-card shadow-card hover:shadow-card-hover transition-shadow p-4 ${outOfStock ? 'opacity-60 border-border-subtle' : 'border-border-default'}`}>
      {/* Image */}
      <div className="relative h-20 w-20 shrink-0">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover rounded-radius-lg bg-surface-subtle"
          />
        ) : (
          <div className="h-full w-full rounded-radius-lg bg-surface-subtle flex items-center justify-center">
            <Store className="h-6 w-6 text-text-muted opacity-40" />
          </div>
        )}
        {hasPromo && !outOfStock && (
          <span className="absolute -top-1 -left-1 bg-status-error text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm shadow-sm">
            Promoção
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 rounded-radius-lg flex items-center justify-center">
            <span className="text-white text-[10px] font-bold uppercase bg-black/60 px-2 py-0.5 rounded-sm">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-text-primary text-sm leading-snug">{product.name}</p>
          {(product.orders_count ?? 0) > 5 && (
            <span className="text-[9px] font-bold uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
              Mais Pedido
            </span>
          )}
        </div>
        {product.description && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <PriceDisplay product={product} />
      </div>

      {/* Add button */}
      {outOfStock ? (
        <div className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-surface-subtle text-text-muted cursor-not-allowed">
          <X className="h-4 w-4" />
        </div>
      ) : (
        <button
          onClick={() => onAdd(product)}
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-action-primary text-white shadow-sm hover:bg-action-primary-hover active:scale-90 transition"
          aria-label={`Adicionar ${product.name}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CatalogPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const pillsRef = useRef<HTMLDivElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(`cart-${params.slug}`);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        /* empty */
      }
    }

    async function fetchCatalog() {
      try {
        // Use Next.js API proxy — backend URL never exposed to browser
        const res = await fetch(`/api/catalog/${params.slug}`);

        if (!res.ok) {
          setError(
            res.status === 404 ? 'Restaurante não encontrado.' : 'Erro ao carregar cardápio.',
          );
          return;
        }

        const data = await res.json();
        setRestaurant(data.restaurant);
        setCategories(data.categories ?? []);
        setProducts(
          (data.products ?? []).map(
            (p: {
              id: string;
              name: string;
              description?: string | null;
              price: number;
              promotional_price_cents?: number | null;
              is_out_of_stock?: boolean;
              orders_count?: number;
              image_url?: string | null;
              category_id: string;
              product_type?: 'standard' | 'pizza' | 'variable';
              pizza_category_id?: string | null;
              fractional_pricing_strategy?: string | null;
              sizes?: { id: string; name: string; price: number; max_flavors: number }[];
            }) => ({
              id: p.id,
              name: p.name,
              description: p.description ?? null,
              price_cents: Math.round((p.price as number) * 100),
              promotional_price_cents: p.promotional_price_cents ?? null,
              is_out_of_stock: p.is_out_of_stock ?? false,
              orders_count: p.orders_count ?? 0,
              image_url: p.image_url ?? null,
              category_id: p.category_id,
              product_type: p.product_type ?? 'standard',
              pizza_category_id: p.pizza_category_id ?? null,
              fractional_pricing_strategy: p.fractional_pricing_strategy ?? null,
              sizes: p.sizes ?? [],
            }),
          ),
        );
      } catch {
        setError('Erro de conexão ao servidor.');
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [params.slug]);

  // Persist cart
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(`cart-${params.slug}`, JSON.stringify(cart));
    }
  }, [cart, loading, params.slug]);

  // ── Abandoned Cart Detection ─────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (cart.length === 0) {
      localStorage.removeItem(`abandoned-cart-${params.slug}`);
      return;
    }
    const timer = setTimeout(() => {
      localStorage.setItem(`abandoned-cart-${params.slug}`, 'true');
    }, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [cart, params.slug, loading]);

  // ── Cart operations ────────────────────────────────────────────────────────
  const handleAddToCartModal = (
    product: Product,
    quantity: number,
    options: ProductOptions | null,
  ) => {
    setCart((prev) => {
      const optionsHash = JSON.stringify(options || {});
      const cartItemId = `${product.id}-${optionsHash}`;

      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total_price: item.unit_price * (item.quantity + quantity),
              }
            : item,
        );
      }
      const unitPrice = options?.size
        ? (product.sizes?.find((s) => s.name === options.size)?.price ?? product.price_cents)
        : product.price_cents;
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          quantity,
          options: options || null,
          unit_price: unitPrice,
          total_price: unitPrice * quantity,
        },
      ];
    });
    setSelectedProduct(null);
    setDrawerOpen(true);
  };

  const increment = useCallback((id: string) => {
    setCart((prev: CartItem[]) =>
      prev.map((i: CartItem) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  }, []);

  const decrement = useCallback((id: string) => {
    setCart((prev: CartItem[]) =>
      prev
        .map((i: CartItem) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i: CartItem) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setCart((prev: CartItem[]) => prev.filter((i: CartItem) => i.id !== id));
  }, []);

  const totalItems = cart.reduce((a: number, i: CartItem) => a + i.quantity, 0);
  const totalCents = cart.reduce((a: number, i: CartItem) => a + i.unit_price * i.quantity, 0);

  // ── Filter products ────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p: Product) => {
    const matchQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase());
    const matchCat = activeCat === 'all' || p.category_id === activeCat;
    return matchQuery && matchCat;
  });

  // ── Scroll to category section ─────────────────────────────────────────────
  function scrollToCategory(catId: string) {
    setActiveCat(catId);
    setQuery(''); // clear search when clicking category
    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = categoryRefs.current[catId];
    if (el) {
      const offset = 130; // header + pills height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // ── Checkout ────────────────────────────────────────────────────────────────
  function goToCheckout() {
    setDrawerOpen(false);
    router.push(`/${params.slug}/checkout`);
  }

  // ── States ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-action-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted font-medium">Carregando cardápio…</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page px-4">
        <div className="text-center space-y-2">
          <Store className="h-12 w-12 text-text-muted mx-auto opacity-30" />
          <p className="font-semibold text-text-primary">{error || 'Restaurante não encontrado'}</p>
        </div>
      </div>
    );
  }

  // ── Categories that have visible products ──────────────────────────────────
  const visibleCategories = categories.filter((cat) =>
    filteredProducts.some((p) => p.category_id === cat.id),
  );

  const cfg = restaurant.config_json || {};
  const accentColor = cfg.accent_color || '#F97316';
  const openStatus = isOpen(cfg.business_hours);
  const logoUrl = cfg.logo_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=200&h=200';
  const coverUrl = cfg.cover_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200&h=400';

  // Featured products (top 5 by orders_count)
  const mostOrdered = products
    .filter((p) => !p.is_out_of_stock)
    .sort((a, b) => (b.orders_count ?? 0) - (a.orders_count ?? 0))
    .slice(0, 5);

  // Products on promotion
  const promoProducts = products.filter(
    (p) => p.promotional_price_cents != null && p.promotional_price_cents > 0 && !p.is_out_of_stock,
  );

  return (
    <div className="min-h-screen bg-surface-page">
      {/* ── Top Header / Hero ─────────────────────────────────────────── */}
      <header className="relative bg-surface-card shadow-sm border-b border-border-subtle pb-4">
        {/* Banner Image */}
        <div className="h-32 w-full bg-surface-subtle relative" style={{ backgroundColor: accentColor + '20' }}>
          <img
            src={coverUrl}
            alt="Capa do Restaurante"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Cart Button overlay on Banner */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-1.5 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition rounded-full px-3 py-1.5 text-white text-sm font-semibold shadow-sm"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && <span className="font-bold">{totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Info Container */}
        <div className="max-w-2xl mx-auto px-4 relative -mt-10">
          <div className="flex gap-4 items-end">
            {/* Logo */}
            <div className="h-20 w-20 rounded-radius-full border-4 border-surface-card bg-surface-page shadow-sm overflow-hidden shrink-0 relative z-10">
              <img
                src={logoUrl}
                alt="Logo do Restaurante"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="pb-1 flex-1">
              <h1 className="font-bold text-2xl text-text-primary capitalize leading-none tracking-tight">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {openStatus === null ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-subtle px-2 py-0.5 rounded-radius-sm">
                    Verifique o horário
                  </span>
                ) : openStatus ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-status-success bg-status-success/15 px-2 py-0.5 rounded-radius-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                    Aberto
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-status-error bg-status-error/15 px-2 py-0.5 rounded-radius-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-status-error" />
                    Fechado
                  </span>
                )}
                <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3 opacity-70" /> {cfg.description ? 'Delivery • Retirada' : 'Delivery • Retirada'}
                </span>
              </div>
              {cfg.description && (
                <p className="text-xs text-text-muted mt-1">{cfg.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Search bar ────────────────────────────────────────────── */}
        <div className="px-4 mt-5 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar no cardápio…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveCat('all');
              }}
              className="w-full bg-surface-subtle placeholder:text-text-muted text-text-primary rounded-radius-full pl-9 pr-9 py-2.5 text-sm border border-transparent focus:border-border-focus focus:bg-surface-card focus:outline-none transition shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Category Pills ─────────────────────────────────────────────── */}
      {!query && (
        <nav
          ref={pillsRef}
          className="sticky top-0 z-20 bg-surface-card border-b border-border-subtle overflow-x-auto flex gap-2 px-4 py-3 scrollbar-none shadow-sm"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            onClick={() => scrollToCategory('all')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeCat === 'all' ? 'bg-action-primary text-white shadow-sm' : 'bg-surface-subtle text-text-secondary hover:bg-surface-section'}`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeCat === cat.id ? 'bg-action-primary text-white shadow-sm' : 'bg-surface-subtle text-text-secondary hover:bg-surface-section'}`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      )}

      {/* ── Promo Banner ─────────────────────────────────────────────── */}
      {cfg.promo_banner?.active && cfg.promo_banner.text && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div
            className="rounded-radius-xl px-5 py-3 text-center text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            <Sparkles className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            {cfg.promo_banner.text}
          </div>
        </div>
      )}

      {/* ── Featured Sections ────────────────────────────────────────── */}
      {!query && (
        <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
          {/* Mais Pedidos */}
          {mostOrdered.length >= 3 && (
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Os mais pedidos
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
                {mostOrdered.map((prod) => (
                  <div key={prod.id} className="shrink-0 w-40">
                    <div
                      onClick={() => setSelectedProduct(prod)}
                      className="rounded-radius-xl border border-border-default bg-surface-card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow"
                    >
                      <div className="h-28 w-full bg-surface-subtle relative">
                        {prod.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-text-muted opacity-30" />
                          </div>
                        )}
                        {(prod.orders_count ?? 0) > 10 && (
                          <span className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-sm">
                            #{prod.orders_count}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-text-primary leading-tight line-clamp-2">{prod.name}</p>
                        <PriceDisplay product={prod} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Promoções */}
          {promoProducts.length >= 2 && (
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-status-error" />
                Promoções
              </h2>
              <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
                {promoProducts.map((prod) => (
                  <div key={prod.id} className="shrink-0 w-40">
                    <div
                      onClick={() => setSelectedProduct(prod)}
                      className="rounded-radius-xl border border-border-default bg-surface-card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow"
                    >
                      <div className="h-28 w-full bg-surface-subtle relative">
                        {prod.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-text-muted opacity-30" />
                          </div>
                        )}
                        <span className="absolute top-1 left-1 bg-status-error text-white text-[8px] font-bold uppercase px-1 py-0.5 rounded-sm">
                          -
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-text-primary leading-tight line-clamp-2">{prod.name}</p>
                        <PriceDisplay product={prod} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Product List ───────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-8">
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Search className="h-10 w-10 text-text-muted opacity-30" />
            <p className="text-sm text-text-muted text-center">
              {query ? `Nenhum resultado para "${query}"` : 'Nenhum produto disponível'}
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-action-primary font-semibold underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}

        {/* Group by category */}
        {query ? (
          // ── Search mode: flat list ─────────────────────────────────
          <div className="space-y-3">
            {filteredProducts.map((prod) => (
              <ProductRow key={prod.id} product={prod} onAdd={setSelectedProduct} />
            ))}
          </div>
        ) : (
          // ── Browse mode: sectioned by category ────────────────────
          visibleCategories.map((cat) => {
            const catProds = filteredProducts.filter((p) => p.category_id === cat.id);
            if (!catProds.length) return null;
            return (
              <section
                key={cat.id}
                ref={(el) => {
                  categoryRefs.current[cat.id] = el;
                }}
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-text-primary">{cat.name}</h2>
                  {cat.description && (
                    <p className="text-xs text-text-muted mt-0.5">{cat.description}</p>
                  )}
                </div>
                <div className="space-y-3">
                  {catProds.map((prod) => (
                    <ProductRow key={prod.id} product={prod} onAdd={setSelectedProduct} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* ── Floating Cart Button (mobile-friendly) ─────────────────────── */}
      {totalItems > 0 && !drawerOpen && (
        <div className="fixed bottom-6 left-4 right-4 z-30 max-w-2xl mx-auto">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full flex items-center justify-between bg-action-strong text-white rounded-radius-xl px-5 py-4 shadow-lg hover:bg-action-strong-hover active:scale-[0.98] transition"
          >
            <div className="flex items-center gap-3">
              <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">
                {totalItems}
              </span>
              <span className="text-sm font-semibold">Ver carrinho</span>
            </div>
            <span className="font-bold text-sm">
              {(totalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </button>
        </div>
      )}

      {/* ── Cart Drawer ────────────────────────────────────────────────── */}
      <CartDrawer
        items={cart}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onIncrement={increment}
        onDecrement={decrement}
        onRemove={remove}
        onCheckout={goToCheckout}
        slug={params.slug}
      />

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      {cfg.footer_text && (
        <footer className="max-w-2xl mx-auto px-4 pb-6 text-center">
          <p className="text-xs text-text-muted">{cfg.footer_text}</p>
        </footer>
      )}

      {/* ── Chat Widget & Modals ────────────────────────────────────────── */}
      <ChatWidget
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        accentColor={
          (restaurant.config_json as { catalog_settings?: { accent_color?: string } } | null)
            ?.catalog_settings?.accent_color
        }
      />

      {selectedProduct && (
        <ProductOptionsModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCartModal}
        />
      )}
    </div>
  );
}
