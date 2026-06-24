'use client';

import React, { useEffect, useState } from 'react';
import { Save, ShoppingCart, Loader2, MessageSquare, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ToggleRow,
  Toast,
  SectionCard,
  PageHeader,
  useToast,
  InfoCard,
} from '@/app/admin/settings/_shared';

interface RecoverSettings {
  enabled: boolean;
  delay_minutes: number;
  message_template: string;
  send_whatsapp: boolean;
  max_attempts: number;
  offer_coupon: boolean;
  coupon_code: string;
}

const DEFAULT: RecoverSettings = {
  enabled: false,
  delay_minutes: 30,
  message_template:
    'Olá {nome}, percebemos que você não finalizou seu pedido no {restaurante}. Ainda está interessado? Clique no link e finalize: {link}',
  send_whatsapp: true,
  max_attempts: 2,
  offer_coupon: false,
  coupon_code: '',
};

export default function SalesRecoverPage() {
  const [settings, setSettings] = useState<RecoverSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.sales_recover;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof RecoverSettings>(key: K, value: RecoverSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/settings/restaurant');
      if (!res.ok) throw new Error('Falha ao carregar');
      const current = await res.json();
      const patch = await fetch('/api/proxy/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_json: { ...(current.config_json ?? {}), sales_recover: settings },
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
        title="Recuperador de Vendas"
        description="Recupere clientes que abandonaram o carrinho enviando lembretes automáticos."
      >
        <Button
          form="recover-form"
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

      <form id="recover-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard
          title="Ativação"
          icon={ShoppingCart}
          description="Ative o sistema de recuperação de carrinhos abandonados."
        >
          <ToggleRow
            label="Ativar Recuperador"
            description="Clientes que não finalizarem o pedido receberão um lembrete."
            checked={settings.enabled}
            onChange={(v) => update('enabled', v)}
          />
        </SectionCard>

        {settings.enabled && (
          <>
            <SectionCard
              title="Tempo e Frequência"
              icon={Clock}
              description="Configure quando e quantas vezes o lembrete será enviado."
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Tempo após abandono (minutos)
                    </label>
                    <Input
                      type="number"
                      value={settings.delay_minutes}
                      onChange={(e) => update('delay_minutes', Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Máximo de tentativas
                    </label>
                    <Input
                      type="number"
                      value={settings.max_attempts}
                      onChange={(e) => update('max_attempts', Number(e.target.value))}
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Mensagem"
              icon={MessageSquare}
              description="Personalize a mensagem enviada ao cliente."
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Modelo de mensagem
                  </label>
                  <textarea
                    value={settings.message_template}
                    onChange={(e) => update('message_template', e.target.value)}
                    className="w-full h-32 px-4 py-3 text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary resize-none"
                  />
                  <p className="text-xs text-text-muted">
                    Variáveis disponíveis:{' '}
                    <code className="bg-surface-subtle px-1 rounded">{`{nome}`}</code>,{' '}
                    <code className="bg-surface-subtle px-1 rounded">{`{restaurante}`}</code>,{' '}
                    <code className="bg-surface-subtle px-1 rounded">{`{link}`}</code>
                  </p>
                </div>
                <ToggleRow
                  label="Enviar via WhatsApp"
                  description="A mensagem será enviada pelo WhatsApp do restaurante."
                  checked={settings.send_whatsapp}
                  onChange={(v) => update('send_whatsapp', v)}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Oferta Especial"
              icon={Bell}
              description="Ofereça um cupom de desconto para incentivar a finalização."
            >
              <div className="space-y-4">
                <ToggleRow
                  label="Oferecer cupom de desconto"
                  description="Inclui um cupom automático na mensagem de recuperação."
                  checked={settings.offer_coupon}
                  onChange={(v) => update('offer_coupon', v)}
                />
                {settings.offer_coupon && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Código do Cupom
                    </label>
                    <Input
                      value={settings.coupon_code}
                      onChange={(e) => update('coupon_code', e.target.value)}
                      placeholder="Ex: VOLTE10"
                      className="max-w-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        )}

        <InfoCard icon={ShoppingCart}>
          O recuperador de vendas envia uma mensagem automática para clientes que adicionaram itens
          ao carrinho mas não finalizaram o pedido. Isso ajuda a reduzir o abandono de carrinho e
          aumentar suas vendas.
        </InfoCard>
      </form>
    </div>
  );
}
