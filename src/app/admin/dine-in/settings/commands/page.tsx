'use client';

import React, { useEffect, useState } from 'react';
import { Save, ScrollText, Loader2, Plus, Trash2, Info } from 'lucide-react';
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

interface CommandType {
  id: string;
  name: string;
  prefix: string;
  color: string;
  active: boolean;
}

interface CommandSettings {
  enabled: boolean;
  auto_print: boolean;
  require_cpf: boolean;
  max_items_per_command: number;
  command_types: CommandType[];
  numbering_start: number;
}

const DEFAULT_TYPES: CommandType[] = [
  { id: '1', name: 'Comanda Normal', prefix: 'C', color: '#DA291C', active: true },
  { id: '2', name: 'Comanda Cortesia', prefix: 'CC', color: '#22C55E', active: true },
  { id: '3', name: 'Comanda Avulsa', prefix: 'CA', color: '#3B82F6', active: false },
];

const DEFAULT: CommandSettings = {
  enabled: true,
  auto_print: true,
  require_cpf: false,
  max_items_per_command: 50,
  command_types: DEFAULT_TYPES,
  numbering_start: 1,
};

export default function CommandsSettingsPage() {
  const [settings, setSettings] = useState<CommandSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.command_settings;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof CommandSettings>(key: K, value: CommandSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateType(id: string, field: keyof CommandType, value: any) {
    setSettings((prev) => ({
      ...prev,
      command_types: prev.command_types.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }));
  }

  function addType() {
    const newId = String(Date.now());
    setSettings((prev) => ({
      ...prev,
      command_types: [
        ...prev.command_types,
        { id: newId, name: '', prefix: 'N', color: '#6B7280', active: true },
      ],
    }));
  }

  function removeType(id: string) {
    setSettings((prev) => ({
      ...prev,
      command_types: prev.command_types.filter((t) => t.id !== id),
    }));
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
          config_json: { ...(current.config_json ?? {}), command_settings: settings },
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
        title="Comandas"
        description="Configure os tipos de comanda e o controle de numeração do seu salão."
      >
        <Button
          form="commands-form"
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

      <form id="commands-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard
          title="Configuração Geral"
          icon={ScrollText}
          description="Defina as regras de funcionamento das comandas no salão."
        >
          <div className="space-y-6">
            <ToggleRow
              label="Usar Comandas"
              description="Ativa o sistema de comandas para pedidos no salão."
              checked={settings.enabled}
              onChange={(v) => update('enabled', v)}
            />

            {settings.enabled && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Iniciar numeração em
                    </label>
                    <Input
                      type="number"
                      value={settings.numbering_start}
                      onChange={(e) => update('numbering_start', Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Limite de itens por comanda
                    </label>
                    <Input
                      type="number"
                      value={settings.max_items_per_command}
                      onChange={(e) => update('max_items_per_command', Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>

                <ToggleRow
                  label="Imprimir automaticamente"
                  description="Ao lançar o pedido, a comanda é impressa na hora."
                  checked={settings.auto_print}
                  onChange={(v) => update('auto_print', v)}
                />
                <ToggleRow
                  label="Exigir CPF na comanda"
                  description="Obriga o cadastro de CPF para emissão de comanda."
                  checked={settings.require_cpf}
                  onChange={(v) => update('require_cpf', v)}
                />
              </div>
            )}
          </div>
        </SectionCard>

        {settings.enabled && (
          <SectionCard
            title="Tipos de Comanda"
            icon={ScrollText}
            description="Cadastre os tipos de comanda usados no seu estabelecimento."
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="h-3 w-3" />}
                onClick={addType}
              >
                Novo Tipo
              </Button>
            }
          >
            <div className="space-y-3">
              {settings.command_types.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-4 p-4 border border-border-default rounded-radius-lg bg-surface-subtle"
                >
                  <div
                    className="w-8 h-8 rounded-radius-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.prefix}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase">
                        Nome
                      </label>
                      <Input
                        value={type.name}
                        onChange={(e) => updateType(type.id, 'name', e.target.value)}
                        placeholder="Ex: Comanda VIP"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase">
                        Prefixo
                      </label>
                      <Input
                        value={type.prefix}
                        onChange={(e) => updateType(type.id, 'prefix', e.target.value)}
                        placeholder="Ex: VIP"
                        className="h-9 text-sm"
                        maxLength={5}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase">
                          Cor
                        </label>
                        <Input
                          type="color"
                          value={type.color}
                          onChange={(e) => updateType(type.id, 'color', e.target.value)}
                          className="h-9 p-1 cursor-pointer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeType(type.id)}
                        className="p-2 text-text-muted hover:text-status-error transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={type.active}
                      onChange={(e) => updateType(type.id, 'active', e.target.checked)}
                      className="h-4 w-4 accent-action-primary"
                    />
                    <span className="text-xs font-medium text-text-secondary">Ativo</span>
                  </label>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <InfoCard icon={Info}>
          As comandas controlam os pedidos individuais ou por mesa. Cada tipo de comanda pode ter
          uma numeração e prefixo diferentes para facilitar a identificação na cozinha.
        </InfoCard>
      </form>
    </div>
  );
}
