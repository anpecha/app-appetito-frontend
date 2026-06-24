'use client';

import React, { useEffect, useState } from 'react';
import { Save, Percent, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ToggleRow,
  Toast,
  SectionCard,
  PageHeader,
  useToast,
  InfoCard,
  Toggle,
} from '@/app/admin/settings/_shared';

interface ServiceFeeSettings {
  enabled: boolean;
  percentage: number;
  apply_to_delivery: boolean;
  apply_to_dine_in: boolean;
  label: string;
}

const DEFAULT: ServiceFeeSettings = {
  enabled: false,
  percentage: 10,
  apply_to_delivery: false,
  apply_to_dine_in: true,
  label: 'Taxa de Serviço',
};

export default function ServiceFeeSettingsPage() {
  const [settings, setSettings] = useState<ServiceFeeSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.service_fee;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof ServiceFeeSettings>(key: K, value: ServiceFeeSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

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
          config_json: { ...(current.config_json ?? {}), service_fee: settings },
        }),
      });
      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Configurações salvas com sucesso!');
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
        title="Taxa de Serviço"
        description="Configure a cobrança da taxa de serviço (gorjeta) nos pedidos."
      >
        <Button
          form="fees-form"
          type="submit"
          className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand px-space-8 font-bold h-12 shadow-button-primary transition-all active:scale-[0.98]"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Salvar Alterações
            </>
          )}
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="fees-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard
          title="Configuração da Taxa"
          icon={Percent}
          description="A taxa de serviço é um valor adicional opcional aplicado ao total do pedido."
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between py-space-5 border-b border-border-subtle group">
              <div className="flex flex-col gap-0.5">
                <span className="text-text-sm font-bold text-text-primary group-hover:text-action-primary transition-colors flex items-center gap-2">
                  Cobrar Taxa de Serviço
                  {settings.enabled && (
                    <span className="bg-action-primary/10 text-action-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      {settings.percentage}%
                    </span>
                  )}
                </span>
                <span className="text-text-xs font-medium text-text-muted leading-tight">
                  Ative para que a taxa apareça como opção no fechamento da conta.
                </span>
              </div>
              <Toggle
                enabled={settings.enabled}
                onToggle={() => update('enabled', !settings.enabled)}
              />
            </div>

            {settings.enabled && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1 flex items-center gap-2">
                    <Percent className="h-3 w-3" /> Percentual (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={settings.percentage}
                      onChange={(e) => update('percentage', Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.5}
                      className="w-32 h-11 px-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
                    />
                    <span className="text-sm text-text-secondary font-medium">
                      % do total do pedido
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Nome exibido no pedido
                  </label>
                  <input
                    type="text"
                    value={settings.label}
                    onChange={(e) => update('label', e.target.value)}
                    className="w-full max-w-xs h-11 px-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
                    placeholder="Taxa de Serviço"
                  />
                </div>

                <div className="pt-4 border-t border-border-subtle">
                  <p className="text-text-xs font-bold text-text-muted uppercase mb-3">
                    Aplicar taxa em:
                  </p>
                  <ToggleRow
                    label="Pedidos do Salão"
                    description="Aplica a taxa em pedidos feitos nas mesas."
                    checked={settings.apply_to_dine_in}
                    onChange={(v) => update('apply_to_dine_in', v)}
                  />
                  <ToggleRow
                    label="Pedidos para Entrega"
                    description="Aplica a taxa em pedidos de delivery."
                    checked={settings.apply_to_delivery}
                    onChange={(v) => update('apply_to_delivery', v)}
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <InfoCard icon={Info}>
          A taxa de serviço é opcional para o cliente no momento do pagamento. Ela aparece como um
          item separado no resumo do pedido e não interfere no cálculo de impostos.
        </InfoCard>
      </form>
    </div>
  );
}
