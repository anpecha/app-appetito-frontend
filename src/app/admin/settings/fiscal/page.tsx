'use client';

import React, { useEffect, useState } from 'react';
import {
  Save,
  FileText,
  Loader2,
  Building2,
  FileSpreadsheet,
  ShieldCheck,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ToggleRow,
  Toast,
  SectionCard,
  PageHeader,
  useToast,
  Toggle,
  InfoCard,
} from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface FiscalSettings {
  enabled: boolean;
  cnpj: string;
  ie: string;
  im: string;
  regime_tributario: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei';
  ambiente: 'producao' | 'homologacao';
  serie_nfce: string;
  serie_nfe: string;
  emitir_automatico: boolean;
  certificado_digital: boolean;
  certificado_validade: string;
  csc: string;
  csc_id: string;
  notify_email: string;
}

const DEFAULT: FiscalSettings = {
  enabled: false,
  cnpj: '',
  ie: '',
  im: '',
  regime_tributario: 'simples_nacional',
  ambiente: 'homologacao',
  serie_nfce: '1',
  serie_nfe: '1',
  emitir_automatico: true,
  certificado_digital: false,
  certificado_validade: '',
  csc: '',
  csc_id: '',
  notify_email: '',
};

const REGIME_OPTIONS = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'mei', label: 'MEI' },
];

export default function FiscalSettingsPage() {
  const [settings, setSettings] = useState<FiscalSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.fiscal_settings;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações fiscais.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof FiscalSettings>(key: K, value: FiscalSettings[K]) {
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
          config_json: { ...(current.config_json ?? {}), fiscal_settings: settings },
        }),
      });
      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Configurações fiscais salvas!');
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
        title="Nota Fiscal"
        description="Configure a emissão de NF-e e NFC-e para seus pedidos."
      >
        <Button
          form="fiscal-form"
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

      <form id="fiscal-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard
          title="Ativação"
          icon={FileText}
          description="Ative a emissão de documentos fiscais para suas vendas."
        >
          <ToggleRow
            label="Emitir Nota Fiscal"
            description="Ativa a emissão automática de NFC-e ao finalizar vendas."
            checked={settings.enabled}
            onChange={(v) => update('enabled', v)}
          />
        </SectionCard>

        {settings.enabled && (
          <>
            <SectionCard
              title="Dados da Empresa"
              icon={Building2}
              description="Informações fiscais do seu estabelecimento."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    CNPJ *
                  </label>
                  <Input
                    value={settings.cnpj}
                    onChange={(e) => update('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Inscrição Estadual
                  </label>
                  <Input
                    value={settings.ie}
                    onChange={(e) => update('ie', e.target.value)}
                    placeholder="000.000.000.000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Inscrição Municipal
                  </label>
                  <Input
                    value={settings.im}
                    onChange={(e) => update('im', e.target.value)}
                    placeholder="0000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Regime Tributário
                  </label>
                  <select
                    value={settings.regime_tributario}
                    onChange={(e) =>
                      update(
                        'regime_tributario',
                        e.target.value as FiscalSettings['regime_tributario'],
                      )
                    }
                    className="w-full h-11 rounded-radius-sm border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus cursor-pointer"
                  >
                    {REGIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Configuração de Série"
              icon={FileSpreadsheet}
              description="Defina as séries dos documentos fiscais."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Série NFC-e (consumidor)
                  </label>
                  <Input
                    value={settings.serie_nfce}
                    onChange={(e) => update('serie_nfce', e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Série NF-e (nota fiscal)
                  </label>
                  <Input
                    value={settings.serie_nfe}
                    onChange={(e) => update('serie_nfe', e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Ambiente e Certificado"
              icon={ShieldCheck}
              description="Configure o ambiente de emissão e o certificado digital A1."
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Ambiente
                  </label>
                  <div className="flex gap-3">
                    {(['homologacao', 'producao'] as const).map((amb) => (
                      <label
                        key={amb}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium',
                          settings.ambiente === amb
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={settings.ambiente === amb}
                          onChange={() => update('ambiente', amb)}
                          className="sr-only"
                        />
                        {amb === 'homologacao' ? 'Homologação (testes)' : 'Produção'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Certificado Digital A1</p>
                    <p className="text-xs text-text-muted">
                      Certificado ICP-Brasil válido para assinatura das notas.
                    </p>
                  </div>
                  <Toggle
                    enabled={settings.certificado_digital}
                    onToggle={() => update('certificado_digital', !settings.certificado_digital)}
                  />
                </div>

                {settings.certificado_digital && (
                  <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pl-4 border-l-2 border-action-primary/30">
                    <div className="space-y-1.5">
                      <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                        Validade do Certificado
                      </label>
                      <Input
                        type="date"
                        value={settings.certificado_validade}
                        onChange={(e) => update('certificado_validade', e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                    <div className="p-4 bg-surface-subtle border border-border-default rounded-radius-lg">
                      <p className="text-xs font-medium text-text-secondary">
                        Faça o upload do certificado digital (.pfx) nas configurações avançadas do
                        sistema. O certificado deve ser válido e estar dentro do prazo de validade.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      CSC (Código de Segurança do Contribuinte)
                    </label>
                    <Input
                      value={settings.csc}
                      onChange={(e) => update('csc', e.target.value)}
                      placeholder="Código fornecido pela SEFAZ"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      ID do CSC
                    </label>
                    <Input
                      value={settings.csc_id}
                      onChange={(e) => update('csc_id', e.target.value)}
                      placeholder="ID do token"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Emissão"
              icon={ToggleRight}
              description="Configure o comportamento da emissão das notas."
            >
              <div className="space-y-4">
                <ToggleRow
                  label="Emitir automaticamente"
                  description="A nota é emitida automaticamente ao finalizar a venda."
                  checked={settings.emitir_automatico}
                  onChange={(v) => update('emitir_automatico', v)}
                />
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    E-mail para notificação de falhas
                  </label>
                  <Input
                    type="email"
                    value={settings.notify_email}
                    onChange={(e) => update('notify_email', e.target.value)}
                    placeholder="admin@restaurante.com"
                    className="max-w-sm"
                  />
                </div>
              </div>
            </SectionCard>
          </>
        )}

        <InfoCard icon={FileText}>
          Antes de ativar a emissão em produção, realize testes no ambiente de homologação.
          Certifique-se de que todos os dados fiscais estão corretos para evitar problemas com o
          fisco.
        </InfoCard>
      </form>
    </div>
  );
}
