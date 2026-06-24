export interface PaymentResult {
  provider: 'stripe' | 'mercadopago';
  status: string;
  /** Stripe: client secret for PaymentIntent */
  client_secret?: string;
  payment_intent_id?: string;
  /** Stripe Checkout Session URL */
  checkout_url?: string;
  session_id?: string;
  /** Mercado Pago: init point URL */
  init_point?: string;
  sandbox_init_point?: string;
  preference_id?: string;
  error?: string;
}

export async function createPayment(params: {
  provider: string;
  order_id: string;
  amount_cents: number;
  description?: string;
  customer_email?: string;
  customer_name?: string;
}): Promise<PaymentResult> {
  const res = await fetch('/api/proxy/services/cardapiodigital/payments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: params.provider,
      order_id: params.order_id,
      amount_cents: params.amount_cents,
      description: params.description ?? 'Pedido Appetito',
      customer_email: params.customer_email,
      customer_name: params.customer_name,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    return {
      provider: params.provider as 'stripe' | 'mercadopago',
      status: 'error',
      error: err?.detail ?? `HTTP ${res.status}`,
    };
  }

  return res.json();
}
