'use client';

import React, { useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  MessageCircle,
  CreditCard,
  ShoppingBag,
  Webhook,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Toast,
  SectionCard,
  PageHeader,
  useToast,
  Toggle,
  InfoCard,
} from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface IntegrationConfig {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  api_key: string;
  api_secret: string;
  webhook_url: string;
  environment: 'sandbox' | 'production';
}

function IntegrationCard({
  config,
  onChange,
  onToggle,
}: {
  config: IntegrationConfig;
  onChange: (field: keyof IntegrationConfig, value: any) => void;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border-default rounded-radius-xl overflow-hidden bg-surface-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-page/30">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-radius-lg',
              config.enabled ? 'bg-status-success/10' : 'bg-surface-subtle',
            )}
          >
            {config.provider === 'whatsapp' ? (
              <MessageCircle
                className={cn(
                  'h-5 w-5',
                  config.enabled ? 'text-status-success' : 'text-text-muted',
                )}
              />
            ) : config.provider === 'payment' ? (
              <CreditCard
                className={cn(
                  'h-5 w-5',
                  config.enabled ? 'text-status-success' : 'text-text-muted',
                )}
              />
            ) : config.provider === 'ifood' ? (
              <ShoppingBag
                className={cn(
                  'h-5 w-5',
                  config.enabled ? 'text-status-success' : 'text-text-muted',
                )}
              />
            ) : (
              <Webhook
                className={cn(
                  'h-5 w-5',
                  config.enabled ? 'text-status-success' : 'text-text-muted',
                )}
              />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">{config.name}</h3>
            <p className="text-xs text-text-muted capitalize">
              {config.provider} · {config.environment}
            </p>
          </div>
        </div>
        <Toggle enabled={config.enabled} onToggle={onToggle} />
      </div>

      {config.enabled && (
        <div className="p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase ml-1">API Key</label>
            <Input
              type="password"
              value={config.api_key}
              onChange={(e) => onChange('api_key', e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {config.provider !== 'webhook' && (
            <div className="space-y-1.5">
              <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                API Secret
              </label>
              <Input
                type="password"
                value={config.api_secret}
                onChange={(e) => onChange('api_secret', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}
          {config.webhook_url && (
            <div className="space-y-1.5">
              <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                Webhook URL
              </label>
              <Input
                value={config.webhook_url}
                onChange={(e) => onChange('webhook_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
              Ambiente
            </label>
            <div className="flex gap-2">
              {(['sandbox', 'production'] as const).map((env) => (
                <label
                  key={env}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-2.5 border rounded-radius-md cursor-pointer transition-all text-xs font-medium capitalize',
                    config.environment === env
                      ? 'border-action-primary bg-action-primary/5 text-action-primary'
                      : 'border-border-default hover:border-border-focus text-text-secondary',
                  )}
                >
                  <input
                    type="radio"
                    checked={config.environment === env}
                    onChange={() => onChange('environment', env)}
                    className="sr-only"
                  />
                  {env === 'sandbox' ? 'Sandbox' : 'Produção'}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: '1',
      name: 'WhatsApp (Z-API)',
      provider: 'whatsapp',
      enabled: false,
      api_key: '',
      api_secret: '',
      webhook_url: '',
      environment: 'sandbox',
    },
    {
      id: '2',
      name: 'WhatsApp (Evolution API)',
      provider: 'whatsapp',
      enabled: false,
      api_key: '',
      api_secret: '',
      webhook_url: '',
      environment: 'sandbox',
    },
    {
      id: '3',
      name: 'Mercado Pago',
      provider: 'payment',
      enabled: false,
      api_key: '',
      api_secret: '',
      webhook_url: 'https://api.appetito.com.br/webhooks/mercadopago',
      environment: 'sandbox',
    },
    {
      id: '4',
      name: 'Stripe',
      provider: 'payment',
      enabled: false,
      api_key: '',
      api_secret: '',
      webhook_url: 'https://api.appetito.com.br/webhooks/stripe',
      environment: 'sandbox',
    },
    {
      id: '5',
      name: 'iFood',
      provider: 'ifood',
      enabled: false,
      api_key: '',
      api_secret: '',
      webhook_url: 'https://api.appetito.com.br/webhooks/ifood',
      environment: 'sandbox',
    },
    {
      id: '6',
      name: 'Webhooks Personalizados',
      provider: 'webhook',
      enabled: false,
      api_key: '',
      api_secret: '',
      webhook_url: '',
      environment: 'sandbox',
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.integrations;
        if (stored?.length) setIntegrations(stored);
      } catch {
        showToast('error', 'Erro ao carregar integrações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function updateIntegration(id: string, field: keyof IntegrationConfig, value: any) {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function toggleIntegration(id: string) {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
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
          config_json: { ...(current.config_json ?? {}), integrations },
        }),
      });
      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Integrações salvas com sucesso!');
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

  const grouped = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      items: integrations.filter((i) => i.provider === 'whatsapp'),
    },
    {
      label: 'Pagamentos',
      icon: CreditCard,
      items: integrations.filter((i) => i.provider === 'payment'),
    },
    {
      label: 'Marketplace',
      icon: ShoppingBag,
      items: integrations.filter((i) => i.provider === 'ifood'),
    },
    {
      label: 'Webhooks',
      icon: Webhook,
      items: integrations.filter((i) => i.provider === 'webhook'),
    },
  ];

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-4xl animate-in fade-in duration-500">
      <PageHeader
        title="Integrações"
        description="Conecte o Appétito com serviços externos para expandir suas funcionalidades."
      >
        <Button
          form="integrations-form"
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

      <form id="integrations-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        {grouped.map((group) => (
          <SectionCard
            key={group.label}
            title={group.label}
            icon={group.icon}
            description={`Configure as integrações de ${group.label.toLowerCase()}.`}
          >
            <div className="space-y-4">
              {group.items.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  config={integration}
                  onChange={(field, value) => updateIntegration(integration.id, field, value)}
                  onToggle={() => toggleIntegration(integration.id)}
                />
              ))}
            </div>
          </SectionCard>
        ))}

        <InfoCard icon={Link2}>
          As chaves de API são armazenadas de forma segura. Mantenha suas credenciais em sigilo e
          nunca as compartilhe.
        </InfoCard>
      </form>
    </div>
  );
}
