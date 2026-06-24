'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Save, Bell, Clock, Layers, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleRow, Toast, SectionCard, PageHeader, useToast } from '../_shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderSettings {
  auto_accept: boolean;
  preparation_time_minutes: number;
  max_simultaneous_orders: number;
  notify_whatsapp: boolean;
  sound_alert: boolean;
  require_payment_on_checkout: boolean;
}

const DEFAULT: OrderSettings = {
  auto_accept: false,
  preparation_time_minutes: 30,
  max_simultaneous_orders: 10,
  notify_whatsapp: true,
  sound_alert: true,
  require_payment_on_checkout: false,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersSettingsPage() {
  const [settings, setSettings] = useState<OrderSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toast, show: showToast } = useToast();

  // Use Callback to avoid exhaustive-deps issues due to new useToast structure
  const fetchWrapper = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/settings/restaurant/');
      if (!res.ok) throw new Error('Falha ao carregar');
      const data = await res.json();
      const stored = data?.config_json?.order_settings;
      if (stored) setSettings((prev) => ({ ...prev, ...stored }));
    } catch {
      showToast('error', 'Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWrapper();
  }, [fetchWrapper]);

  function update<K extends keyof OrderSettings>(key: K, value: OrderSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/settings/restaurant/');
      if (!res.ok) throw new Error('Falha ao carregar restaurante');
      const current = await res.json();

      const patch = await fetch('/api/proxy/settings/restaurant/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_json: { ...(current.config_json ?? {}), order_settings: settings },
        }),
      });

      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Configurações salvas!');
    } catch (err: unknown) {
      showToast('error', (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex h-full items-center justify-center py-space-20">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-4xl animate-in fade-in duration-500">
      <PageHeader
        title="Fluxo de Pedidos"
        description="Configure como novos pedidos são processados pela sua cozinha."
      >
        <Button
          form="orders-form"
          type="submit"
          className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand px-space-8 font-bold h-12 shadow-button-primary transition-all active:bg-action-primary-active active:scale-[0.98]"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-space-2 h-4 w-4" /> Salvar Alterações
            </>
          )}
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="orders-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard title="Automação" icon={Zap} description="Agilize o recebimento de pedidos.">
          <div>
            <ToggleRow
              label="Aceite Automático"
              description="O pedido entra direto na cozinha sem precisar clicar em aceitar."
              checked={settings.auto_accept}
              onChange={(checked) => update('auto_accept', checked)}
            />
            <ToggleRow
              label="Exigir Pagamento Online"
              description="O pedido só chega na cozinha após a confirmação do pagamento."
              checked={settings.require_payment_on_checkout}
              onChange={(checked) => update('require_payment_on_checkout', checked)}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Capacidade"
          icon={Layers}
          description="Controle o ritmo da sua produção."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6 py-space-5">
            <div className="space-y-1.5">
              <label className="text-text-xs font-bold text-text-muted uppercase ml-1 flex items-center gap-space-2">
                <Clock className="h-3 w-3" /> Tempo de Preparo (min)
              </label>
              <input
                type="number"
                value={settings.preparation_time_minutes}
                onChange={(e) => update('preparation_time_minutes', Number(e.target.value))}
                className="w-full h-11 px-space-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-text-xs font-bold text-text-muted uppercase ml-1 flex items-center gap-space-2">
                <Zap className="h-3 w-3" /> Limite de Pedidos Simultâneos
              </label>
              <input
                type="number"
                value={settings.max_simultaneous_orders}
                onChange={(e) => update('max_simultaneous_orders', Number(e.target.value))}
                className="w-full h-11 px-space-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Alertas"
          icon={Bell}
          description="Sempre saiba quando um pedido chegar."
        >
          <div>
            <ToggleRow
              label="Som de Notificação"
              description="Toca um som no computador ao receber um novo pedido."
              checked={settings.sound_alert}
              onChange={(checked) => update('sound_alert', checked)}
            />
            <ToggleRow
              label="Notificação WhatsApp"
              description="O cliente recebe avisos de status automaticamente."
              checked={settings.notify_whatsapp}
              onChange={(checked) => update('notify_whatsapp', checked)}
            />
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
