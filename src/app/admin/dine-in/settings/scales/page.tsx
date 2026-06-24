'use client';

import React, { useEffect, useState } from 'react';
import { Save, Scale, Loader2, Usb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ToggleRow,
  Toast,
  SectionCard,
  PageHeader,
  useToast,
  InfoCard,
} from '@/app/admin/settings/_shared';
import { Input } from '@/components/ui/input';

interface ScaleSettings {
  enabled: boolean;
  brand: string;
  model: string;
  port: string;
  baud_rate: number;
  auto_print_weight: boolean;
  integration_type: 'serial' | 'network' | 'bluetooth';
  ip_address: string;
}

const DEFAULT: ScaleSettings = {
  enabled: false,
  brand: '',
  model: '',
  port: 'COM1',
  baud_rate: 9600,
  auto_print_weight: false,
  integration_type: 'serial',
  ip_address: '',
};

export default function ScalesSettingsPage() {
  const [settings, setSettings] = useState<ScaleSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.scale_settings;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof ScaleSettings>(key: K, value: ScaleSettings[K]) {
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
          config_json: { ...(current.config_json ?? {}), scale_settings: settings },
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
        title="Balanças"
        description="Configure a integração com balanças para pesar produtos no PDV."
      >
        <Button
          form="scales-form"
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

      <form id="scales-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard
          title="Integração com Balança"
          icon={Scale}
          description="Conecte uma balança digital ao sistema para pesar produtos automaticamente."
        >
          <div className="space-y-6">
            <ToggleRow
              label="Usar Balança Integrada"
              description="Ative para liberar a opção de pesar produtos no PDV."
              checked={settings.enabled}
              onChange={(v) => update('enabled', v)}
            />

            {settings.enabled && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Marca
                    </label>
                    <Input
                      value={settings.brand}
                      onChange={(e) => update('brand', e.target.value)}
                      placeholder="Ex: Toledo, Filizola"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Modelo
                    </label>
                    <Input
                      value={settings.model}
                      onChange={(e) => update('model', e.target.value)}
                      placeholder="Ex: Prix 3"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Tipo de Conexão
                  </label>
                  <div className="flex gap-3">
                    {(['serial', 'network', 'bluetooth'] as const).map((type) => (
                      <label
                        key={type}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all font-medium text-sm ${settings.integration_type === type ? 'border-action-primary bg-action-primary/5 text-action-primary' : 'border-border-default hover:border-border-focus text-text-secondary'}`}
                      >
                        <input
                          type="radio"
                          checked={settings.integration_type === type}
                          onChange={() => update('integration_type', type)}
                          className="sr-only"
                        />
                        {type === 'serial'
                          ? 'Serial (COM)'
                          : type === 'network'
                            ? 'Rede (TCP/IP)'
                            : 'Bluetooth'}
                      </label>
                    ))}
                  </div>
                </div>

                {settings.integration_type === 'serial' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                        Porta COM
                      </label>
                      <Input
                        value={settings.port}
                        onChange={(e) => update('port', e.target.value)}
                        placeholder="COM1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                        Baud Rate
                      </label>
                      <select
                        value={settings.baud_rate}
                        onChange={(e) => update('baud_rate', Number(e.target.value))}
                        className="w-full h-11 rounded-radius-sm border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus cursor-pointer"
                      >
                        <option value={2400}>2400</option>
                        <option value={4800}>4800</option>
                        <option value={9600}>9600</option>
                        <option value={19200}>19200</option>
                        <option value={38400}>38400</option>
                        <option value={115200}>115200</option>
                      </select>
                    </div>
                  </div>
                )}

                {settings.integration_type === 'network' && (
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Endereço IP
                    </label>
                    <Input
                      value={settings.ip_address}
                      onChange={(e) => update('ip_address', e.target.value)}
                      placeholder="192.168.0.100:4000"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-border-subtle">
                  <ToggleRow
                    label="Imprimir peso automaticamente"
                    description="Ao pesar, o valor é enviado direto para a impressora fiscal."
                    checked={settings.auto_print_weight}
                    onChange={(v) => update('auto_print_weight', v)}
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <InfoCard icon={Usb}>
          Conecte a balança via cabo USB/serial ou rede. Consulte o manual da sua balança para
          confirmar a porta e o baud rate corretos.
        </InfoCard>
      </form>
    </div>
  );
}
