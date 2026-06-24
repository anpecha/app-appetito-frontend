'use client';

import React, { useEffect, useState } from 'react';
import {
  Save,
  Monitor,
  Loader2,
  CreditCard,
  Printer,
  Users,
  Receipt,
  Settings2,
} from 'lucide-react';
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

interface CashierSettings {
  enabled: boolean;
  default_payment: string;
  require_operator: boolean;
  auto_print_receipt: boolean;
  auto_open_drawer: boolean;
  show_product_images: boolean;
  show_stock_warning: boolean;
  allow_negative_sale: boolean;
  ask_cpf: boolean;
  accept_multiple_payments: boolean;
  default_view: 'grid' | 'list';
  confirm_on_add: boolean;
  show_last_sale: boolean;
  idle_timeout_minutes: number;
}

const DEFAULT: CashierSettings = {
  enabled: true,
  default_payment: 'pix',
  require_operator: true,
  auto_print_receipt: true,
  auto_open_drawer: true,
  show_product_images: true,
  show_stock_warning: false,
  allow_negative_sale: false,
  ask_cpf: false,
  accept_multiple_payments: true,
  default_view: 'grid',
  confirm_on_add: false,
  show_last_sale: true,
  idle_timeout_minutes: 0,
};

const PAYMENT_OPTIONS = [
  { value: 'pix', label: 'Pix' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit', label: 'Cartão de Crédito' },
  { value: 'debit', label: 'Cartão de Débito' },
  { value: 'meal', label: 'Vale Refeição' },
];

export default function CashierSettingsPage() {
  const [settings, setSettings] = useState<CashierSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'behavior' | 'display'>('general');
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.cashier_settings;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof CashierSettings>(key: K, value: CashierSettings[K]) {
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
          config_json: { ...(current.config_json ?? {}), cashier_settings: settings },
        }),
      });
      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Configurações do PDV salvas!');
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
    { id: 'general' as const, label: 'Geral', icon: Settings2 },
    { id: 'behavior' as const, label: 'Comportamento', icon: Monitor },
    { id: 'display' as const, label: 'Exibição', icon: Monitor },
  ];

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-5xl animate-in fade-in duration-500">
      <PageHeader
        title="Frente de Caixa (PDV)"
        description="Configure o comportamento do ponto de venda presencial."
      >
        <Button
          form="cashier-form"
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

      <form id="cashier-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Ativação"
              icon={Monitor}
              description="Ative o módulo de frente de caixa (PDV) para atendimento presencial."
            >
              <ToggleRow
                label="PDV Ativo"
                description="Libera o módulo de frente de caixa no sistema."
                checked={settings.enabled}
                onChange={(v) => update('enabled', v)}
              />
            </SectionCard>

            {settings.enabled && (
              <>
                <SectionCard
                  title="Forma de Pagamento Padrão"
                  icon={CreditCard}
                  description="Define qual forma de pagamento vem selecionada por padrão no PDV."
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium',
                          settings.default_payment === opt.value
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={settings.default_payment === opt.value}
                          onChange={() => update('default_payment', opt.value)}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Operadores"
                  icon={Users}
                  description="Controle de acesso e operação do PDV."
                >
                  <div>
                    <ToggleRow
                      label="Exigir operador"
                      description="Obriga selecionar o operador antes de iniciar a venda."
                      checked={settings.require_operator}
                      onChange={(v) => update('require_operator', v)}
                    />
                    <ToggleRow
                      label="Aceitar múltiplos pagamentos"
                      description="Permite dividir a conta em várias formas de pagamento."
                      checked={settings.accept_multiple_payments}
                      onChange={(v) => update('accept_multiple_payments', v)}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Impressão"
                  icon={Printer}
                  description="Configure a impressão de recibos e cupons."
                >
                  <div>
                    <ToggleRow
                      label="Imprimir recibo automaticamente"
                      description="Após finalizar a venda, imprime o comprovante."
                      checked={settings.auto_print_receipt}
                      onChange={(v) => update('auto_print_receipt', v)}
                    />
                    <ToggleRow
                      label="Abrir gaveta automaticamente"
                      description="A gaveta de dinheiro abre ao finalizar a venda."
                      checked={settings.auto_open_drawer}
                      onChange={(v) => update('auto_open_drawer', v)}
                    />
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        )}

        {activeTab === 'behavior' && settings.enabled && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Regras de Venda"
              icon={Receipt}
              description="Defina as regras e validações do PDV."
            >
              <div>
                <ToggleRow
                  label="Confirmar ao adicionar produto"
                  description="Exige confirmação ao adicionar cada item no carrinho."
                  checked={settings.confirm_on_add}
                  onChange={(v) => update('confirm_on_add', v)}
                />
                <ToggleRow
                  label="Exibir última venda"
                  description="Mostra o resumo da última venda realizada."
                  checked={settings.show_last_sale}
                  onChange={(v) => update('show_last_sale', v)}
                />
                <ToggleRow
                  label="Perguntar CPF na venda"
                  description="Solicita CPF do cliente no momento da venda."
                  checked={settings.ask_cpf}
                  onChange={(v) => update('ask_cpf', v)}
                />
                <ToggleRow
                  label="Permitir venda negativa"
                  description="Permite fechar vendas com valor total negativo (apenas para correções)."
                  checked={settings.allow_negative_sale}
                  onChange={(v) => update('allow_negative_sale', v)}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Tempo e Segurança"
              icon={Settings2}
              description="Controle de inatividade e alertas."
            >
              <div className="space-y-4">
                <ToggleRow
                  label="Alertar estoque baixo"
                  description="Mostra aviso se o produto está com estoque baixo."
                  checked={settings.show_stock_warning}
                  onChange={(v) => update('show_stock_warning', v)}
                />
                <div className="space-y-1.5 pt-2">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Tempo de inatividade para bloquear (minutos)
                  </label>
                  <Input
                    type="number"
                    value={settings.idle_timeout_minutes}
                    onChange={(e) => update('idle_timeout_minutes', Number(e.target.value))}
                    min={0}
                    className="w-32"
                  />
                  <p className="text-xs text-text-muted">0 = nunca bloquear</p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'display' && settings.enabled && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Layout do PDV"
              icon={Monitor}
              description="Personalize a aparência da tela do PDV."
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Visualização padrão
                  </label>
                  <div className="flex gap-3">
                    {(['grid', 'list'] as const).map((view) => (
                      <label
                        key={view}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium capitalize',
                          settings.default_view === view
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={settings.default_view === view}
                          onChange={() => update('default_view', view)}
                          className="sr-only"
                        />
                        {view === 'grid' ? 'Grade' : 'Lista'}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <ToggleRow
                    label="Exibir imagens dos produtos"
                    description="Mostra a foto do produto na tela do PDV."
                    checked={settings.show_product_images}
                    onChange={(v) => update('show_product_images', v)}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {!settings.enabled && (
          <InfoCard icon={Settings2}>
            O PDV está desativado. Ative-o na aba &quot;Geral&quot; para configurar as demais
            opções.
          </InfoCard>
        )}
      </form>
    </div>
  );
}
