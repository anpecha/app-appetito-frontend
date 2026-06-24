'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Tag,
  Percent,
  AlertCircle,
} from 'lucide-react';
import { CartItem } from '@/types/order';
import { createPayment, PaymentResult } from '@/lib/payment';

type DeliveryRegion = {
  name: string;
  fee_cents: number;
  min_order_cents?: number;
};

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  config_json: {
    whatsapp?: string;
    delivery_regions?: DeliveryRegion[];
    min_order_cents?: number;
  } | null;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildWhatsappMessage(
  restaurantName: string,
  cart: CartItem[],
  customer: {
    name: string;
    phone: string;
    address: string;
    number: string;
    complement: string;
    paymentMethod: string;
    type: string;
  },
) {
  const items = cart
    .map((i) => `• ${i.quantity}x ${i.product.name} — ${formatBRL(i.unit_price * i.quantity)}`)
    .join('\n');
  const subtotal = cart.reduce((a, i) => a + i.unit_price * i.quantity, 0);
  const deliveryFee = customer.type === 'delivery' ? 500 : 0;
  const total = subtotal + deliveryFee;

  const address =
    customer.type === 'delivery'
      ? `${customer.address}, ${customer.number}${customer.complement ? ` (${customer.complement})` : ''}`
      : customer.type === 'takeout'
        ? 'Retirada no Balcão'
        : 'Consumo no Local';

  const payment: Record<string, string> = {
    pix: 'PIX',
    card: 'Cartão de Crédito/Débito',
    cash: 'Dinheiro',
  };

  return encodeURIComponent(
    `*Novo Pedido — ${restaurantName}*\n\n` +
      `👤 *Cliente:* ${customer.name}\n` +
      `📱 *Telefone:* ${customer.phone}\n` +
      `📦 *Entrega:* ${address}\n` +
      `💳 *Pagamento:* ${payment[customer.paymentMethod] ?? customer.paymentMethod}\n\n` +
      `*Itens:*\n${items}\n` +
      (deliveryFee > 0 ? `\n*Taxa de Entrega:* ${formatBRL(deliveryFee)}` : '') +
      `\n\n*Total: ${formatBRL(total)}*`,
  );
}

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Read source from URL query params (whatsapp, telegram, facebook, instagram, etc.)
  const [orderSource, setOrderSource] = useState('website');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('source');
    if (src) setOrderSource(src);
  }, []);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [orderType, setOrderType] = useState<'delivery' | 'local' | 'takeout'>('delivery');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountCents, setCouponDiscountCents] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  // Delivery region
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [regions, setRegions] = useState<DeliveryRegion[]>([]);
  const [deliveryFeeCents, setDeliveryFeeCents] = useState(500);

  // Minimum order validation
  const [minOrderCents, setMinOrderCents] = useState(0);

  // Snapshot for success screen WA link
  const [cartSnapshot, setCartSnapshot] = useState<CartItem[]>([]);

  // Load cart + restaurant via secure proxy
  useEffect(() => {
    const saved = localStorage.getItem(`cart-${params.slug}`);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        /* empty */
      }
    }

    async function fetchRestaurant() {
      try {
        // Use the same secure Next.js proxy — never expose backend URL to browser
        const res = await fetch(`/api/catalog/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          const rest = data.restaurant;
          setRestaurant(rest);

          // Load delivery regions from config
          const cfg = rest?.config_json || {};
          const deliveryRegions = cfg.delivery_regions || [];
          setRegions(deliveryRegions);
          if (deliveryRegions.length > 0) {
            setSelectedRegion(deliveryRegions[0].name);
            setDeliveryFeeCents(deliveryRegions[0].fee_cents);
          }
          if (cfg.min_order_cents) {
            setMinOrderCents(cfg.min_order_cents);
          }
        }
      } catch {
        /* no-op */
      }
    }
    fetchRestaurant();
  }, [params.slug]);

  const subtotalCents = cart.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
  const totalCents = subtotalCents + (orderType === 'delivery' ? deliveryFeeCents : 0) - couponDiscountCents;

  // ── Coupon validation ─────────────────────────────────────────────────────
  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponApplied(false);
    try {
      const orderValueBrl = subtotalCents / 100;
      const res = await fetch(
        `/api/proxy/coupons/public/validate?code=${encodeURIComponent(couponCode.trim())}&restaurant_id=${restaurant?.id}&order_value=${orderValueBrl}`,
        { method: 'POST' },
      );
      if (!res.ok) {
        const err = await res.json();
        setCouponError(err.detail || 'Cupom inválido');
        setCouponDiscountCents(0);
        return;
      }
      const data = await res.json();
      const discountBrl = data.discount_amount as number;
      setCouponDiscountCents(Math.round(discountBrl * 100));
      setCouponApplied(true);
    } catch {
      setCouponError('Erro ao validar cupom');
      setCouponDiscountCents(0);
    } finally {
      setCouponLoading(false);
    }
  }

  // ── Delivery region change ────────────────────────────────────────────────
  function handleRegionChange(regionName: string) {
    setSelectedRegion(regionName);
    const region = regions.find((r) => r.name === regionName);
    if (region) {
      setDeliveryFeeCents(region.fee_cents);
      if (region.min_order_cents && subtotalCents < region.min_order_cents) {
        // warn but don't block
      }
    }
  }

  // ── Abandoned cart recovery ────────────────────────────────────────────────
  const abandonKey = `abandoned-cart-${params.slug}`;
  useEffect(() => {
    const flagged = localStorage.getItem(abandonKey);
    if (flagged === 'true' && phone.replace(/\D/g, '').length >= 10 && restaurant) {
      // Trigger the recovery message once when phone is detected
      localStorage.removeItem(abandonKey);
      fetch('/api/proxy/services/cardapiodigital/abandoned-cart/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          customer_phone: phone.replace(/\D/g, ''),
          customer_name: name || 'Cliente',
          slug: params.slug,
          item_count: cart.length,
          cart_total_cents: subtotalCents,
          items_summary: cart.map((i) => `${i.quantity}x ${i.product.name}`).join(', '),
        }),
      }).catch(() => {});
    }
  }, [phone, name, restaurant, params.slug, abandonKey, cart, subtotalCents]);

  // ── Min order check ───────────────────────────────────────────────────────
  const belowMinOrder = minOrderCents > 0 && subtotalCents < minOrderCents;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      router.push(`/${params.slug}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unit_price / 100,
      }));

      const fullAddress =
        orderType === 'delivery'
          ? `${address}, ${number}${complement ? ` - ${complement}` : ''}`
          : undefined;

      const payload = {
        customer_name: name,
        customer_phone: phone,
        customer_document: cpf.replace(/\D/g, '') || undefined,
        type: orderType,
        payment_method: paymentMethod,
        order_source: orderSource,
        notes: fullAddress,
        items: itemsPayload,
        delivery_region: orderType === 'delivery' ? selectedRegion || undefined : undefined,
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : undefined,
        discount_cents: couponDiscountCents > 0 ? couponDiscountCents : undefined,
      };

      const res = await fetch('/api/proxy/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha ao enviar pedido');

      const data = await res.json();
      const fullOrderId: string = data.order?.id ?? '';
      setCreatedOrderId(fullOrderId);

      // Snapshot cart for WA message before clearing
      setCartSnapshot([...cart]);

      // Clear cart
      localStorage.removeItem(`cart-${params.slug}`);
      setCart([]);

      // Create payment if online payment method
      if (paymentMethod === 'pix' || paymentMethod === 'card') {
        const totalWithFee = totalCents + (orderType === 'delivery' ? deliveryFeeCents : 0);
        const result = await createPayment({
          provider: paymentMethod === 'pix' ? 'mercadopago' : 'stripe',
          order_id: fullOrderId,
          amount_cents: totalWithFee,
          customer_name: name,
          customer_email: '',
        });
        setPaymentResult(result);
      }

      setSuccess(true);

      // WhatsApp redirect (only for delivery with WA configured)
      const waNumber = restaurant?.config_json?.whatsapp?.replace(/\D/g, '');
      if (waNumber) {
        // Redirect for all order types if WA is configured
        const msg = buildWhatsappMessage(
          restaurant!.name,
          cartSnapshot.length > 0 ? cartSnapshot : [...cart],
          { name, phone, address, number, complement, paymentMethod, type: orderType },
        );
        setTimeout(() => {
          window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
        }, 1200);
      }
    } catch {
      alert('Erro ao enviar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    const waNumber = restaurant?.config_json?.whatsapp?.replace(/\D/g, '');
    const shortId = createdOrderId.split('-')[0]?.toUpperCase() ?? '???';

    return (
      <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center px-6 text-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-success/15">
          <CheckCircle2 className="h-10 w-10 text-status-success" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">Pedido enviado!</h1>
          <p className="text-text-secondary text-sm">
            Pedido <span className="font-semibold text-text-primary">#{shortId}</span> recebido com
            sucesso.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* Track order button */}
          {createdOrderId && (
            <button
              onClick={() => router.push(`/tracking/${createdOrderId}`)}
              className="flex items-center justify-center gap-2 rounded-radius-xl bg-action-primary text-text-on-brand font-bold text-sm px-6 py-3.5 shadow-sm hover:bg-action-primary-hover transition"
            >
              <MapPin className="h-4 w-4" />
              Rastrear meu pedido
            </button>
          )}

          {/* Payment link */}
          {(paymentResult?.init_point || paymentResult?.checkout_url) && (
            <a
              href={paymentResult.checkout_url ?? paymentResult.init_point!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-radius-xl bg-[#0070BA] px-6 py-3.5 text-white font-bold text-sm shadow-sm hover:bg-[#005a99] transition"
            >
              Pagar agora
            </a>
          )}
          {paymentResult?.error && (
            <p className="text-xs text-status-error text-center">
              Erro ao gerar pagamento: {paymentResult.error}
            </p>
          )}

          {/* WhatsApp button */}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}?text=${buildWhatsappMessage(
                restaurant!.name,
                cartSnapshot,
                { name, phone, address, number, complement, paymentMethod, type: orderType },
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-radius-xl bg-[#25D366] px-6 py-3.5 text-white font-bold text-sm shadow-sm hover:bg-[#1DB954] transition"
            >
              <MessageCircle className="h-4 w-4" />
              Confirmar pelo WhatsApp
            </a>
          )}

          <button
            onClick={() => router.push(`/${params.slug}`)}
            className="text-sm text-action-primary font-semibold underline underline-offset-2"
          >
            Voltar ao cardápio
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-page pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-card border-b border-border-subtle shadow-sm flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-action-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <h1 className="flex-1 text-center font-bold text-text-primary capitalize">
          {params.slug.replace(/-/g, ' ')}
        </h1>
        <div className="w-16" />
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <p className="text-2xl font-bold text-text-primary tracking-tight">Finalizar Pedido</p>

        {/* Empty cart warning */}
        {cart.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <ShoppingCart className="h-10 w-10 text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">Seu carrinho está vazio.</p>
            <button
              onClick={() => router.push(`/${params.slug}`)}
              className="text-sm text-action-primary font-semibold underline"
            >
              Voltar ao cardápio
            </button>
          </div>
        )}

        {cart.length > 0 && (
          <>
            {/* Order Summary */}
            <div className="rounded-radius-xl border border-border-default bg-surface-card shadow-card p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                <ShoppingCart className="h-4 w-4 text-action-primary" />
                <span className="font-semibold text-sm text-text-primary">Resumo do pedido</span>
              </div>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    <span className="font-semibold text-text-primary">{item.quantity}x</span>{' '}
                    {item.product.name}
                  </span>
                  <span className="font-semibold text-text-primary shrink-0 ml-2">
                    {formatBRL(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
              {orderType === 'delivery' && deliveryFeeCents > 0 && (
                <div className="flex justify-between text-sm pt-2 text-text-secondary">
                  <span>Taxa de entrega</span>
                  <span className="font-semibold text-text-primary">{formatBRL(deliveryFeeCents)}</span>
                </div>
              )}
              {couponDiscountCents > 0 && (
                <div className="flex justify-between text-sm text-status-success">
                  <span>Cupom de desconto</span>
                  <span className="font-semibold">-{formatBRL(couponDiscountCents)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border-subtle font-bold text-base">
                <span className="text-text-primary">Total</span>
                <span className="text-action-primary">
                  {formatBRL(totalCents)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Order Type */}
              <fieldset className="rounded-radius-xl border border-border-default bg-surface-card shadow-card p-5 space-y-3">
                <legend className="text-sm font-bold text-text-primary px-1">Tipo de Pedido</legend>
                {[
                  { value: 'delivery', label: '🛵 Delivery' },
                  { value: 'takeout', label: '🏃 Retirada no balcão' },
                  { value: 'local', label: '🪑 Consumo no local' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 cursor-pointer rounded-radius-md border px-4 py-3 text-sm font-medium transition ${orderType === opt.value ? 'border-action-primary bg-action-primary/5 text-action-primary' : 'border-border-default text-text-secondary hover:bg-surface-subtle'}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={opt.value}
                      checked={orderType === opt.value}
                      onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                      className="accent-action-primary"
                    />
                    {opt.label}
                  </label>
                ))}
              </fieldset>

              {/* Customer Info */}
              <fieldset className="rounded-radius-xl border border-border-default bg-surface-card shadow-card p-5 space-y-4">
                <legend className="text-sm font-bold text-text-primary px-1">Seus Dados</legend>
                <Field
                  label="Nome Completo"
                  id="name"
                  value={name}
                  onChange={setName}
                  placeholder="João Silva"
                  required
                />
                <Field
                  label="Telefone (WhatsApp)"
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="(11) 90000-0000"
                  required
                />
                <Field
                  label="CPF (opcional)"
                  id="cpf"
                  value={cpf}
                  onChange={setCpf}
                  placeholder="000.000.000-00"
                />
              </fieldset>

              {/* Delivery address — only for delivery type */}
              {orderType === 'delivery' && (
                <fieldset className="rounded-radius-xl border border-border-default bg-surface-card shadow-card p-5 space-y-4">
                  <legend className="text-sm font-bold text-text-primary px-1">
                    Endereço de Entrega
                  </legend>

                  {/* Delivery Region */}
                  {regions.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-text-secondary">Região de entrega</label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full rounded-radius-sm border border-border-default bg-surface-page px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus transition"
                      >
                        {regions.map((r) => (
                          <option key={r.name} value={r.name}>
                            {r.name} — {(r.fee_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Field
                    label="Endereço"
                    id="address"
                    value={address}
                    onChange={setAddress}
                    placeholder="Rua das Flores"
                    required={orderType === 'delivery'}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Número"
                      id="number"
                      value={number}
                      onChange={setNumber}
                      placeholder="123"
                      required={orderType === 'delivery'}
                    />
                    <Field
                      label="Complemento"
                      id="complement"
                      value={complement}
                      onChange={setComplement}
                      placeholder="Apto 42"
                    />
                  </div>
                </fieldset>
              )}

              {/* Coupon */}
              <fieldset className="rounded-radius-xl border border-border-default bg-surface-card shadow-card p-5 space-y-3">
                <legend className="text-sm font-bold text-text-primary px-1 flex items-center gap-1.5">
                  <Tag className="h-4 w-4" /> Cupom de desconto
                </legend>
                <div className="flex items-center gap-2">
                  <input
                    id="coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponApplied(false);
                      setCouponDiscountCents(0);
                      setCouponError('');
                    }}
                    placeholder="Digite o cupom"
                    disabled={couponApplied}
                    className="flex-1 rounded-radius-sm border border-border-default bg-surface-page px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition disabled:opacity-50"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || couponApplied || !couponCode.trim()}
                    className="shrink-0"
                  >
                    {couponLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : couponApplied ? (
                      '✓ Aplicado'
                    ) : (
                      'Aplicar'
                    )}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-status-error flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {couponError}
                  </p>
                )}
                {couponApplied && (
                  <p className="text-xs text-status-success">
                    Desconto de {formatBRL(couponDiscountCents)} aplicado!
                  </p>
                )}
              </fieldset>

              {/* Payment */}
              <fieldset className="rounded-radius-xl border border-border-default bg-surface-card shadow-card p-5 space-y-3">
                <legend className="text-sm font-bold text-text-primary px-1">Pagamento</legend>
                {[
                  { value: 'pix', label: 'PIX' },
                  { value: 'card', label: 'Cartão de Crédito/Débito' },
                  { value: 'cash', label: 'Dinheiro' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 cursor-pointer rounded-radius-md border px-4 py-3 text-sm font-medium transition ${paymentMethod === opt.value ? 'border-action-primary bg-action-primary/5 text-action-primary' : 'border-border-default text-text-secondary hover:bg-surface-subtle'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-action-primary"
                    />
                    {opt.label}
                  </label>
                ))}
              </fieldset>

              {/* Minimum order warning */}
              {belowMinOrder && (
                <div className="rounded-radius-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">Pedido mínimo não atingido</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      Valor mínimo: {formatBRL(minOrderCents)}. Adicione mais {formatBRL(minOrderCents - subtotalCents)} ao carrinho.
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="strong"
                size="lg"
                type="submit"
                className="w-full h-14 font-bold text-base"
                disabled={isSubmitting || cart.length === 0 || belowMinOrder}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Enviando…
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

// ── Helper component ────────────────────────────────────────────────────────────
function Field({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-radius-sm border border-border-default bg-surface-page px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition"
      />
    </div>
  );
}
