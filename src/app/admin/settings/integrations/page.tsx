'use client';

import React, { useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  MessageCircle,
  CreditCard,
  ShoppingBag,
  Webhook,
  MessageSquare,
  Instagram,
  Send,
  Link2,
  Bot,
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

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder?: string;
  help?: string;
}

interface IntegrationConfig {
  id: string;
  name: string;
  provider: string;
  group: string;
  enabled: boolean;
  environment: 'sandbox' | 'production';
  fields: Record<string, string>;
}

const INTEGRATION_DEFS: Record<string, { fields: FieldDef[]; icon: any; color: string }> = {
  whatsapp_zapi: {
    icon: MessageCircle,
    color: 'text-status-success',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: '••••••••' },
      { key: 'api_secret', label: 'API Secret', type: 'password', placeholder: '••••••••' },
      { key: 'zapi_phone', label: 'WhatsApp Number', type: 'text', placeholder: '+5511999999999' },
    ],
  },
  whatsapp_evolution: {
    icon: MessageCircle,
    color: 'text-status-success',
    fields: [
      { key: 'api_key', label: 'Instance ID', type: 'password', placeholder: '••••••••' },
      { key: 'api_secret', label: 'API Token', type: 'password', placeholder: '••••••••' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://' },
    ],
  },
  facebook: {
    icon: MessageSquare,
    color: 'text-[#1877F2]',
    fields: [
      { key: 'page_id', label: 'Facebook Page ID', type: 'text', placeholder: '1234567890' },
      { key: 'page_token', label: 'Page Access Token', type: 'password', placeholder: 'EAAx...' },
      { key: 'app_id', label: 'App ID', type: 'text', placeholder: '987654321' },
      { key: 'app_secret', label: 'App Secret', type: 'password', placeholder: '••••••••' },
    ],
  },
  instagram: {
    icon: Instagram,
    color: 'text-[#E4405F]',
    fields: [
      { key: 'business_id', label: 'Instagram Business Account ID', type: 'text', placeholder: '178414...' },
      { key: 'page_id', label: 'Facebook Page ID', type: 'text', placeholder: '1234567890' },
      { key: 'page_token', label: 'Page Access Token', type: 'password', placeholder: 'EAAx...' },
    ],
  },
  telegram: {
    icon: Send,
    color: 'text-[#0088cc]',
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...' },
      { key: 'chat_id', label: 'Chat ID (opcional)', type: 'text', placeholder: '-1001234567890' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://' },
    ],
  },
  mercado_pago: {
    icon: CreditCard,
    color: 'text-status-success',
    fields: [
      { key: 'api_key', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' },
      { key: 'api_secret', label: 'Client Secret', type: 'password', placeholder: '••••••••' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://' },
    ],
  },
  stripe: {
    icon: CreditCard,
    color: 'text-status-success',
    fields: [
      { key: 'api_key', label: 'Publishable Key', type: 'password', placeholder: 'pk_live_...' },
      { key: 'api_secret', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://' },
    ],
  },
  ifood: {
    icon: ShoppingBag,
    color: 'text-[#EA1D2C]',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: '••••••••' },
      { key: 'store_id', label: 'Store ID', type: 'text', placeholder: '12345' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://' },
    ],
  },
  uber_eats: {
    icon: ShoppingBag,
    color: 'text-[#06C167]',
    fields: [
      { key: 'store_id', label: 'Store ID', type: 'text', placeholder: 'abc-def-123' },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: '••••••••' },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'uber_...' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://' },
    ],
  },
  webhook: {
    icon: Webhook,
    color: 'text-text-muted',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://' },
      { key: 'api_secret', label: 'Secret (opcional)', type: 'password', placeholder: '••••••••' },
    ],
  },
};

const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
  { id: 'whatsapp_zapi', name: 'WhatsApp (Z-API)', provider: 'whatsapp', group: 'whatsapp', enabled: false, environment: 'sandbox', fields: {} },
  { id: 'whatsapp_evolution', name: 'WhatsApp (Evolution API)', provider: 'whatsapp', group: 'whatsapp', enabled: false, environment: 'sandbox', fields: {} },
  { id: 'facebook', name: 'Facebook Messenger', provider: 'meta', group: 'chat', enabled: false, environment: 'production', fields: {} },
  { id: 'instagram', name: 'Instagram Direct', provider: 'meta', group: 'chat', enabled: false, environment: 'production', fields: {} },
  { id: 'telegram', name: 'Telegram', provider: 'telegram', group: 'chat', enabled: false, environment: 'production', fields: {} },
  { id: 'mercado_pago', name: 'Mercado Pago', provider: 'payment', group: 'payment', enabled: false, environment: 'sandbox', fields: {} },
  { id: 'stripe', name: 'Stripe', provider: 'payment', group: 'payment', enabled: false, environment: 'sandbox', fields: {} },
  { id: 'ifood', name: 'iFood', provider: 'ifood', group: 'marketplace', enabled: false, environment: 'sandbox', fields: {} },
  { id: 'uber_eats', name: 'UberEats', provider: 'uber_eats', group: 'marketplace', enabled: false, environment: 'sandbox', fields: {} },
  { id: 'webhook', name: 'Webhooks Personalizados', provider: 'webhook', group: 'webhook', enabled: false, environment: 'sandbox', fields: {} },
];

function IntegrationCard({
  config,
  onChange,
  onToggle,
}: {
  config: IntegrationConfig;
  onChange: (field: string, value: any) => void;
  onToggle: () => void;
}) {
  const def = INTEGRATION_DEFS[config.id];
  if (!def) return null;
  const Icon = def.icon;

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
            <Icon
              className={cn(
                'h-5 w-5',
                config.enabled ? def.color : 'text-text-muted',
              )}
            />
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
          {def.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                {field.label}
              </label>
              {field.help && (
                <p className="text-xs text-text-muted ml-1 mb-1">{field.help}</p>
              )}
              <Input
                type={field.type}
                value={config.fields[field.key] ?? ''}
                onChange={(e) => {
                  const newFields = { ...config.fields, [field.key]: e.target.value };
                  onChange('fields', newFields);
                }}
                placeholder={field.placeholder}
              />
            </div>
          ))}
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
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(DEFAULT_INTEGRATIONS);
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
        if (stored?.length) {
          setIntegrations((prev) =>
            prev.map((d) => {
              const found = stored.find((s: any) => s.id === d.id);
              return found
                ? { ...d, enabled: found.enabled ?? false, environment: found.environment ?? d.environment, fields: found.fields ?? {} }
                : d;
            }),
          );
        }
      } catch {
        showToast('error', 'Erro ao carregar integrações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function updateIntegration(id: string, field: keyof IntegrationConfig | string, value: any) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  }

  function toggleIntegration(id: string) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)),
    );
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

  const groups = [
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, desc: 'Conecte ao WhatsApp via Z-API ou Evolution API.' },
    { key: 'chat', label: 'Canais de Atendimento', icon: Bot, desc: 'Conecte ao Facebook Messenger, Instagram Direct e Telegram para atendimento via robô IA.' },
    { key: 'payment', label: 'Pagamentos', icon: CreditCard, desc: 'Configure processadores de pagamento.' },
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, desc: 'Conecte a plataformas de delivery.' },
    { key: 'webhook', label: 'Webhooks', icon: Webhook, desc: 'Webhooks personalizados para integrações customizadas.' },
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
        {groups.map((group) => {
          const items = integrations.filter((i) => i.group === group.key);
          if (!items.length) return null;
          return (
            <SectionCard
              key={group.key}
              title={group.label}
              icon={group.icon}
              description={group.desc}
            >
              <div className="space-y-4">
                {items.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    config={integration}
                    onChange={(field, value) => updateIntegration(integration.id, field, value)}
                    onToggle={() => toggleIntegration(integration.id)}
                  />
                ))}
              </div>
            </SectionCard>
          );
        })}

        <InfoCard icon={Link2}>
          As chaves de API são armazenadas de forma segura. Mantenha suas credenciais em sigilo e
          nunca as compartilhe. Para Facebook Messenger e Instagram Direct é necessário criar um
          aplicativo no{' '}
          <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-action-primary underline">
            Meta for Developers
          </a>{' '}
          e configurar o webhook.
        </InfoCard>
      </form>
    </div>
  );
}
