'use client';

import React, { useEffect, useState } from 'react';
import { Save, Smartphone, Loader2, Bell, Shield, Palette, Eye } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface WaiterAppSettings {
  enabled: boolean;
  login_method: 'pin' | 'email' | 'both';
  pin_length: number;
  require_biometry: boolean;
  allow_take_orders: boolean;
  allow_split_bill: boolean;
  allow_discount: boolean;
  max_discount_percent: number;
  allow_close_table: boolean;
  sound_new_order: boolean;
  sound_payment: boolean;
  vibrate_on_order: boolean;
  show_table_status: boolean;
  show_order_history: boolean;
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
}

const DEFAULT: WaiterAppSettings = {
  enabled: true,
  login_method: 'pin',
  pin_length: 4,
  require_biometry: false,
  allow_take_orders: true,
  allow_split_bill: true,
  allow_discount: false,
  max_discount_percent: 10,
  allow_close_table: true,
  sound_new_order: true,
  sound_payment: true,
  vibrate_on_order: true,
  show_table_status: true,
  show_order_history: true,
  theme: 'light',
  primary_color: '#DA291C',
};

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Claro' },
  { value: 'dark' as const, label: 'Escuro' },
  { value: 'auto' as const, label: 'Automático' },
];

const LOGIN_OPTIONS = [
  { value: 'pin' as const, label: 'Apenas PIN', desc: 'Garçom digita o código PIN' },
  { value: 'email' as const, label: 'E-mail e Senha', desc: 'Login com credenciais' },
  { value: 'both' as const, label: 'PIN ou E-mail', desc: 'Ambas as opções' },
];

export default function WaiterAppSettingsPage() {
  const [settings, setSettings] = useState<WaiterAppSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'access' | 'permissions' | 'appearance'>('access');
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.waiter_app;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof WaiterAppSettings>(key: K, value: WaiterAppSettings[K]) {
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
          config_json: { ...(current.config_json ?? {}), waiter_app: settings },
        }),
      });
      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Configurações do App Garçom salvas!');
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

  const tabs = [
    { id: 'access' as const, label: 'Acesso', icon: Shield },
    { id: 'permissions' as const, label: 'Permissões', icon: Smartphone },
    { id: 'appearance' as const, label: 'Aparência', icon: Palette },
  ];

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-5xl animate-in fade-in duration-500">
      <PageHeader
        title="App Garçom"
        description="Configure o aplicativo mobile usado pelos garçons para atendimento no salão."
      >
        <Button
          form="app-form"
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

      <div className="flex gap-2 border-b border-border-subtle">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-colors cursor-pointer',
                isActive
                  ? 'border-action-primary text-action-primary bg-action-primary/5'
                  : 'border-transparent text-text-secondary hover:text-text-primary',
              )}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <form id="app-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        {activeTab === 'access' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Ativação"
              icon={Smartphone}
              description="Ative ou desative o uso do App Garçom no salão."
            >
              <div className="py-2">
                <ToggleRow
                  label="App Garçom Ativo"
                  description="Garçons podem acessar o sistema pelo celular."
                  checked={settings.enabled}
                  onChange={(v) => update('enabled', v)}
                />
              </div>
            </SectionCard>

            {settings.enabled && (
              <>
                <SectionCard
                  title="Método de Login"
                  icon={Shield}
                  description="Defina como os garçons fazem login no aplicativo."
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {LOGIN_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={cn(
                            'flex flex-col gap-1 p-4 border rounded-radius-xl cursor-pointer transition-all',
                            settings.login_method === opt.value
                              ? 'border-action-primary bg-action-primary/5 ring-1 ring-action-primary'
                              : 'border-border-default hover:border-border-focus bg-surface-subtle',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={settings.login_method === opt.value}
                              onChange={() => update('login_method', opt.value)}
                              className="h-4 w-4 accent-action-primary"
                            />
                            <span className="font-bold text-sm text-text-primary">{opt.label}</span>
                          </div>
                          <p className="text-xs text-text-muted ml-6">{opt.desc}</p>
                        </label>
                      ))}
                    </div>

                    {settings.login_method !== 'email' && (
                      <div className="space-y-1.5">
                        <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                          Tamanho do PIN
                        </label>
                        <div className="flex items-center gap-3">
                          {[4, 5, 6].map((n) => (
                            <label
                              key={n}
                              className={cn(
                                'w-12 h-12 flex items-center justify-center border rounded-radius-md cursor-pointer font-bold transition-all',
                                settings.pin_length === n
                                  ? 'border-action-primary bg-action-primary/5 text-action-primary'
                                  : 'border-border-default hover:border-border-focus text-text-secondary',
                              )}
                            >
                              <input
                                type="radio"
                                checked={settings.pin_length === n}
                                onChange={() => update('pin_length', n)}
                                className="sr-only"
                              />{' '}
                              {n}
                            </label>
                          ))}
                          <span className="text-xs text-text-muted">dígitos</span>
                        </div>
                      </div>
                    )}

                    <ToggleRow
                      label="Exigir biometria"
                      description="Garçons precisam autenticar com digital ou facial no celular."
                      checked={settings.require_biometry}
                      onChange={(v) => update('require_biometry', v)}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Notificações e Alertas"
                  icon={Bell}
                  description="Configure os sons e alertas do aplicativo."
                >
                  <div>
                    <ToggleRow
                      label="Som ao receber pedido"
                      description="Toca um aviso sonoro quando chega um novo pedido."
                      checked={settings.sound_new_order}
                      onChange={(v) => update('sound_new_order', v)}
                    />
                    <ToggleRow
                      label="Som ao receber pagamento"
                      description="Toca um som quando uma conta é paga."
                      checked={settings.sound_payment}
                      onChange={(v) => update('sound_payment', v)}
                    />
                    <ToggleRow
                      label="Vibrar ao receber pedido"
                      description="O celular vibra quando um novo pedido é lançado."
                      checked={settings.vibrate_on_order}
                      onChange={(v) => update('vibrate_on_order', v)}
                    />
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        )}

        {activeTab === 'permissions' && settings.enabled && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Permissões do Garçom"
              icon={Eye}
              description="Controle o que cada garçom pode fazer no aplicativo."
            >
              <div>
                <ToggleRow
                  label="Receber pedidos"
                  description="Garçom pode registrar pedidos dos clientes."
                  checked={settings.allow_take_orders}
                  onChange={(v) => update('allow_take_orders', v)}
                />
                <ToggleRow
                  label="Dividir conta"
                  description="Permite que o garçom divida a conta entre clientes."
                  checked={settings.allow_split_bill}
                  onChange={(v) => update('allow_split_bill', v)}
                />
                <ToggleRow
                  label="Fechar mesa"
                  description="Garçom pode finalizar e fechar a conta da mesa."
                  checked={settings.allow_close_table}
                  onChange={(v) => update('allow_close_table', v)}
                />
                <ToggleRow
                  label="Conceder desconto"
                  description="Permite aplicar descontos nos pedidos."
                  checked={settings.allow_discount}
                  onChange={(v) => update('allow_discount', v)}
                />
                {settings.allow_discount && (
                  <div className="flex items-center gap-3 pt-3 pl-8 animate-in fade-in slide-in-from-top-2">
                    <label className="text-text-xs font-bold text-text-muted uppercase">
                      Desconto máximo (%):
                    </label>
                    <Input
                      type="number"
                      value={settings.max_discount_percent}
                      onChange={(e) => update('max_discount_percent', Number(e.target.value))}
                      min={0}
                      max={100}
                      className="w-24 h-9"
                    />
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Visibilidade"
              icon={Eye}
              description="O que o garçom pode visualizar no app."
            >
              <div>
                <ToggleRow
                  label="Status das mesas"
                  description="Mostra quais mesas estão ocupadas/livres."
                  checked={settings.show_table_status}
                  onChange={(v) => update('show_table_status', v)}
                />
                <ToggleRow
                  label="Histórico de pedidos"
                  description="Garçom pode ver pedidos anteriores da mesa."
                  checked={settings.show_order_history}
                  onChange={(v) => update('show_order_history', v)}
                />
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'appearance' && settings.enabled && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Personalização"
              icon={Palette}
              description="Personalize a aparência do app para os garçons."
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Tema
                  </label>
                  <div className="flex gap-3">
                    {THEME_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium',
                          settings.theme === opt.value
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={settings.theme === opt.value}
                          onChange={() => update('theme', opt.value)}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Cor principal do app
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => update('primary_color', e.target.value)}
                      className="w-16 h-11 p-1 cursor-pointer"
                    />
                    <span className="text-sm text-text-muted font-mono">
                      {settings.primary_color}
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <InfoCard icon={Smartphone}>
              O App Garçom está disponível para Android e iOS. Após configurar, os garçons podem
              baixar o app e fazer login com o PIN cadastrado.
            </InfoCard>
          </div>
        )}
      </form>
    </div>
  );
}
