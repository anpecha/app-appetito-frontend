'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Banknote, QrCode, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, Toast, PageHeader, useToast, Toggle } from '../_shared';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentMethods {
  pix: boolean;
  cash: boolean;
  credit_card: boolean;
  debit_card: boolean;
  meal_voucher: boolean;
}

const DEFAULT_METHODS: PaymentMethods = {
  pix: true,
  cash: true,
  credit_card: true,
  debit_card: true,
  meal_voucher: false,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsSettingsPage() {
  const [methods, setMethods] = useState<PaymentMethods>(DEFAULT_METHODS);
  const [requireChange, setRequireChange] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();

        const storedSettings = data?.config_json?.payment_settings;
        if (storedSettings) {
          setMethods(storedSettings.methods ?? DEFAULT_METHODS);
          setRequireChange(storedSettings.require_change ?? true);
        }
      } catch {
        showToast('error', 'Erro ao carregar configurações de pagamento.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/settings/restaurant');
      if (!res.ok) throw new Error('Falha ao carregar restaurante');
      const current = await res.json();

      const patch = await fetch('/api/proxy/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_json: {
            ...(current.config_json ?? {}),
            payment_settings: {
              methods,
              require_change: requireChange,
            },
          },
        }),
      });

      if (!patch.ok) {
        const err = await patch.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Erro ao salvar');
      }
      showToast('success', 'Formas de pagamento salvas com sucesso!');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  }

  const toggleMethod = (key: keyof PaymentMethods) => {
    setMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Formas de Pagamento"
        description="Selecione quais métodos de pagamento sua loja aceita na entrega e retirada."
      >
        <Button
          form="payments-form"
          type="submit"
          className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand px-space-8 rounded-radius-md font-bold h-12 shadow-button-primary transition-all hover:scale-[1.02] active:bg-action-primary-active active:scale-[0.98] disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="payments-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard title="Métodos de Pagamento na Entrega" icon={CreditCard}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
            {/* PIX */}
            <div
              className={cn(
                'flex items-center justify-between p-space-4 rounded-radius-lg border transition-all',
                methods.pix
                  ? 'border-action-primary bg-action-primary/5'
                  : 'border-border-subtle bg-surface-subtle',
              )}
            >
              <div className="flex items-center gap-space-4">
                <div
                  className={cn(
                    'p-2 rounded-radius-md',
                    methods.pix
                      ? 'bg-action-primary/20 text-action-primary'
                      : 'bg-surface-card text-text-muted',
                  )}
                >
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      methods.pix ? 'text-text-primary' : 'text-text-secondary',
                    )}
                  >
                    Pix
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Pagamento instantâneo via QR Code ou Chave.
                  </p>
                </div>
              </div>
              <Toggle enabled={methods.pix} onToggle={() => toggleMethod('pix')} />
            </div>

            {/* Cartão de Crédito */}
            <div
              className={cn(
                'flex items-center justify-between p-space-4 rounded-radius-lg border transition-all',
                methods.credit_card
                  ? 'border-action-primary bg-action-primary/5'
                  : 'border-border-subtle bg-surface-subtle',
              )}
            >
              <div className="flex items-center gap-space-4">
                <div
                  className={cn(
                    'p-2 rounded-radius-md',
                    methods.credit_card
                      ? 'bg-action-primary/20 text-action-primary'
                      : 'bg-surface-card text-text-muted',
                  )}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      methods.credit_card ? 'text-text-primary' : 'text-text-secondary',
                    )}
                  >
                    Cartão de Crédito
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Pagamento via maquininha na entrega.
                  </p>
                </div>
              </div>
              <Toggle enabled={methods.credit_card} onToggle={() => toggleMethod('credit_card')} />
            </div>

            {/* Cartão de Débito */}
            <div
              className={cn(
                'flex items-center justify-between p-space-4 rounded-radius-lg border transition-all',
                methods.debit_card
                  ? 'border-action-primary bg-action-primary/5'
                  : 'border-border-subtle bg-surface-subtle',
              )}
            >
              <div className="flex items-center gap-space-4">
                <div
                  className={cn(
                    'p-2 rounded-radius-md',
                    methods.debit_card
                      ? 'bg-action-primary/20 text-action-primary'
                      : 'bg-surface-card text-text-muted',
                  )}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      methods.debit_card ? 'text-text-primary' : 'text-text-secondary',
                    )}
                  >
                    Cartão de Débito
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Dinheiro debitado na hora via maquininha.
                  </p>
                </div>
              </div>
              <Toggle enabled={methods.debit_card} onToggle={() => toggleMethod('debit_card')} />
            </div>

            {/* Ticket Alimentação */}
            <div
              className={cn(
                'flex items-center justify-between p-space-4 rounded-radius-lg border transition-all',
                methods.meal_voucher
                  ? 'border-action-primary bg-action-primary/5'
                  : 'border-border-subtle bg-surface-subtle',
              )}
            >
              <div className="flex items-center gap-space-4">
                <div
                  className={cn(
                    'p-2 rounded-radius-md',
                    methods.meal_voucher
                      ? 'bg-action-primary/20 text-action-primary'
                      : 'bg-surface-card text-text-muted',
                  )}
                >
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      methods.meal_voucher ? 'text-text-primary' : 'text-text-secondary',
                    )}
                  >
                    Vale Refeição
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Aceitar Sodexo, Alelo, VR, Ticket, etc.
                  </p>
                </div>
              </div>
              <Toggle
                enabled={methods.meal_voucher}
                onToggle={() => toggleMethod('meal_voucher')}
              />
            </div>

            {/* Dinheiro */}
            <div
              className={cn(
                'flex items-center justify-between p-space-4 rounded-radius-lg border transition-all md:col-span-2',
                methods.cash
                  ? 'border-action-primary bg-action-primary/5'
                  : 'border-border-subtle bg-surface-subtle',
              )}
            >
              <div className="flex items-center gap-space-4">
                <div
                  className={cn(
                    'p-2 rounded-radius-md',
                    methods.cash
                      ? 'bg-action-primary/20 text-action-primary'
                      : 'bg-surface-card text-text-muted',
                  )}
                >
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      methods.cash ? 'text-text-primary' : 'text-text-secondary',
                    )}
                  >
                    Dinheiro (Espécie)
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Receber em cédulas no balcão ou entrega.
                  </p>
                </div>
              </div>
              <Toggle enabled={methods.cash} onToggle={() => toggleMethod('cash')} />
            </div>
          </div>

          {methods.cash && (
            <div className="mt-space-6 pt-space-6 border-t border-border-default flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div>
                <h4 className="text-sm font-bold text-text-primary">Perguntar por troco</h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Se ativo, obriga o cliente a informar se precisa de troco ao fechar o pedido em
                  dinheiro.
                </p>
              </div>
              <Toggle enabled={requireChange} onToggle={() => setRequireChange(!requireChange)} />
            </div>
          )}
        </SectionCard>
      </form>
    </div>
  );
}
