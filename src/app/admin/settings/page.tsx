'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, SectionCard, ToggleRow, InfoCard, useToast, Toast } from './_shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Truck, Clock, Save, Loader2, Info } from 'lucide-react';

interface RestaurantSettings {
  name: string;
  description: string;
  phone: string;
  config_json: {
    whatsapp?: string;
    delivery_fee?: number;
    delivery_time?: string;
    is_open?: boolean;
    auto_accept_orders?: boolean;
  };
}

export default function SettingsPage() {
  const { toast, show } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'logistics' | 'hours'>('general');

  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    description: '',
    phone: '',
    config_json: {
      whatsapp: '',
      delivery_fee: 500,
      delivery_time: '40-50 min',
      is_open: true,
      auto_accept_orders: false,
    },
  });

  useEffect(() => {
    // Fetch current settings (mock integration or real if endpoint exists)
    async function fetchSettings() {
      try {
        // Adjust to the real endpoint once we have it mapped
        const res = await fetch('/api/proxy/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.restaurant) {
            setSettings({
              name: data.restaurant.name || '',
              description: data.restaurant.description || '',
              phone: data.restaurant.phone || '',
              config_json: data.restaurant.config_json || {},
            });
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (field: keyof RestaurantSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field: keyof RestaurantSettings['config_json'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      config_json: { ...prev.config_json, [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      show('success', 'Configurações salvas com sucesso!');
    } catch {
      show('error', 'Não foi possível salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-12">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <PageHeader
        title="Configurações do Restaurante"
        description="Gerencie as informações da sua loja, horários e logística de entrega."
        badgePrimary="Appetito SaaS"
      >
        <Button
          variant="strong"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border-subtle pb-px">
        {[
          { id: 'general', label: 'Geral', icon: Store },
          { id: 'logistics', label: 'Logística', icon: Truck },
          { id: 'hours', label: 'Horários', icon: Clock },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-colors ${
                isActive
                  ? 'border-action-primary text-action-primary bg-action-primary/5'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Informações Básicas"
              description="Dados públicos do seu restaurante no cardápio digital."
              icon={Store}
            >
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-text-primary">
                    Nome do Restaurante
                  </label>
                  <Input
                    value={settings.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Pizzaria do João"
                    className="h-12 border-border-default focus-visible:ring-border-focus focus-visible:ring-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-text-primary">Descrição Curta</label>
                  <Input
                    value={settings.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="A melhor pizza da região!"
                    className="h-12"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Contato e Redes"
              description="Como seus clientes entram em contato com você."
              icon={Store}
            >
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-text-primary">
                    WhatsApp (Para pedidos e dúvidas)
                  </label>
                  <Input
                    value={settings.config_json.whatsapp || ''}
                    onChange={(e) => handleConfigChange('whatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-12"
                  />
                </div>
                <InfoCard icon={Info}>
                  O número do WhatsApp é usado para redirecionar clientes que finalizam pedidos e
                  para o widget flutuante de atendimento no cardápio digital.
                </InfoCard>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Taxas e Tempo"
              description="Configurações de entrega e estimativas para o cliente."
              icon={Truck}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-text-primary">
                    Taxa de Entrega Padrão (R$)
                  </label>
                  <Input
                    type="number"
                    value={(settings.config_json.delivery_fee || 0) / 100}
                    onChange={(e) =>
                      handleConfigChange('delivery_fee', parseFloat(e.target.value) * 100)
                    }
                    placeholder="5.00"
                    className="h-12"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-text-primary">
                    Tempo Estimado (Ex: 40-50 min)
                  </label>
                  <Input
                    value={settings.config_json.delivery_time || ''}
                    onChange={(e) => handleConfigChange('delivery_time', e.target.value)}
                    placeholder="40-50 min"
                    className="h-12"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Regras Operacionais"
              description="Comportamentos automáticos do sistema."
              icon={Truck}
            >
              <div className="space-y-2">
                <ToggleRow
                  label="Aceitar pedidos automaticamente"
                  description="Se ativo, os pedidos caem direto na coluna 'Preparando' no Kanban."
                  checked={!!settings.config_json.auto_accept_orders}
                  onChange={(v) => handleConfigChange('auto_accept_orders', v)}
                />
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Status da Loja"
              description="Controle manual de abertura e fechamento do restaurante."
              icon={Clock}
              iconBg="bg-status-success/10"
              iconColor="text-status-success"
            >
              <div className="p-6 bg-surface-subtle rounded-radius-lg border border-border-default mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">
                    {settings.config_json.is_open
                      ? 'Sua loja está Aberta'
                      : 'Sua loja está Fechada'}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {settings.config_json.is_open
                      ? 'Os clientes podem ver o cardápio e fazer pedidos.'
                      : 'O cardápio está visível, mas a opção de fazer pedidos está bloqueada.'}
                  </p>
                </div>
                <Button
                  variant={settings.config_json.is_open ? 'destructive' : 'strong'}
                  size="lg"
                  className="font-bold shadow-sm"
                  onClick={() => handleConfigChange('is_open', !settings.config_json.is_open)}
                >
                  {settings.config_json.is_open
                    ? 'Pausar Vendas (Fechar Loja)'
                    : 'Abrir Loja Agora'}
                </Button>
              </div>
              <InfoCard icon={Clock}>
                A configuração de horários automáticos por dia da semana será liberada no próximo
                pacote de atualização do Appetito. Por enquanto, utilize o controle manual acima.
              </InfoCard>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
