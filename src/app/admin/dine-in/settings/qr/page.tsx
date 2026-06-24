'use client';

import React, { useEffect, useState } from 'react';
import {
  Save,
  QrCode,
  Loader2,
  Smartphone,
  Palette,
  Type,
  Image,
  Eye,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleRow, Toast, SectionCard, PageHeader, useToast } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface QrMenuSettings {
  enabled: boolean;
  layout: 'grid' | 'list' | 'compact';
  show_prices: boolean;
  show_images: boolean;
  show_descriptions: boolean;
  show_category_images: boolean;
  accent_color: string;
  welcome_message: string;
  show_whatsapp_button: boolean;
  whatsapp_label: string;
  background_color: string;
  card_style: 'rounded' | 'flat' | 'minimal';
  font_size: 'small' | 'medium' | 'large';
  qr_size: number;
  qr_foreground: string;
  qr_include_logo: boolean;
  auto_generate_for_tables: boolean;
}

const DEFAULT: QrMenuSettings = {
  enabled: true,
  layout: 'grid',
  show_prices: true,
  show_images: true,
  show_descriptions: true,
  show_category_images: false,
  accent_color: '#DA291C',
  welcome_message: 'Bem-vindo! Faça seu pedido diretamente pelo celular.',
  show_whatsapp_button: true,
  whatsapp_label: 'Fazer Pedido via WhatsApp',
  background_color: '#FFFFFF',
  card_style: 'rounded',
  font_size: 'medium',
  qr_size: 250,
  qr_foreground: '#000000',
  qr_include_logo: true,
  auto_generate_for_tables: true,
};

export default function QrMenuSettingsPage() {
  const [settings, setSettings] = useState<QrMenuSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'appearance' | 'qr' | 'behavior'>('appearance');
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.qr_menu;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof QrMenuSettings>(key: K, value: QrMenuSettings[K]) {
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
          config_json: { ...(current.config_json ?? {}), qr_menu: settings },
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

  const tabs = [
    { id: 'appearance' as const, label: 'Aparência', icon: Palette },
    { id: 'qr' as const, label: 'QR Code', icon: QrCode },
    { id: 'behavior' as const, label: 'Comportamento', icon: Smartphone },
  ];

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-5xl animate-in fade-in duration-500">
      <PageHeader
        title="Cardápio QR Code"
        description="Personalize a aparência e configure o QR Code do seu cardápio digital."
      >
        <Button
          form="qr-form"
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

      {/* Tabs */}
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

      <form id="qr-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Layout"
              icon={Eye}
              description="Escolha como o cardápio é exibido no celular do cliente."
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Estilo de visualização
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['grid', 'list', 'compact'] as const).map((layout) => (
                      <label
                        key={layout}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 border rounded-radius-xl cursor-pointer transition-all',
                          settings.layout === layout
                            ? 'border-action-primary bg-action-primary/5 ring-1 ring-action-primary'
                            : 'border-border-default hover:border-border-focus bg-surface-subtle',
                        )}
                      >
                        <input
                          type="radio"
                          checked={settings.layout === layout}
                          onChange={() => update('layout', layout)}
                          className="sr-only"
                        />
                        {layout === 'grid' ? (
                          <Image className="h-8 w-8" />
                        ) : layout === 'list' ? (
                          <Type className="h-8 w-8" />
                        ) : (
                          <Smartphone className="h-8 w-8" />
                        )}
                        <span className="text-xs font-bold text-text-primary capitalize">
                          {layout === 'grid' ? 'Grade' : layout === 'list' ? 'Lista' : 'Compacto'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Estilo do card
                  </label>
                  <div className="flex gap-3">
                    {(['rounded', 'flat', 'minimal'] as const).map((style) => (
                      <label
                        key={style}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium',
                          settings.card_style === style
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={settings.card_style === style}
                          onChange={() => update('card_style', style)}
                          className="sr-only"
                        />
                        {style === 'rounded'
                          ? 'Arredondado'
                          : style === 'flat'
                            ? 'Reto'
                            : 'Minimalista'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Tamanho da Fonte
                  </label>
                  <div className="flex gap-3">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <label
                        key={size}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium',
                          settings.font_size === size
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={settings.font_size === size}
                          onChange={() => update('font_size', size)}
                          className="sr-only"
                        />
                        {size === 'small' ? 'Pequena' : size === 'medium' ? 'Média' : 'Grande'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Cor de destaque (accent)
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={settings.accent_color}
                        onChange={(e) => update('accent_color', e.target.value)}
                        className="w-16 h-11 p-1 cursor-pointer"
                      />
                      <span className="text-sm text-text-muted font-mono">
                        {settings.accent_color}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Cor de fundo
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={settings.background_color}
                        onChange={(e) => update('background_color', e.target.value)}
                        className="w-16 h-11 p-1 cursor-pointer"
                      />
                      <span className="text-sm text-text-muted font-mono">
                        {settings.background_color}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Conteúdo"
              icon={Type}
              description="O que será exibido no cardápio digital."
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Mensagem de boas-vindas
                  </label>
                  <textarea
                    value={settings.welcome_message}
                    onChange={(e) => update('welcome_message', e.target.value)}
                    className="w-full h-20 px-4 py-3 text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary resize-none"
                    placeholder="Bem-vindo ao nosso cardápio!"
                  />
                </div>

                <div className="space-y-3">
                  <ToggleRow
                    label="Exibir preços"
                    description="Mostra o valor de cada produto no cardápio."
                    checked={settings.show_prices}
                    onChange={(v) => update('show_prices', v)}
                  />
                  <ToggleRow
                    label="Exibir imagens"
                    description="Mostra as fotos dos produtos."
                    checked={settings.show_images}
                    onChange={(v) => update('show_images', v)}
                  />
                  <ToggleRow
                    label="Exibir descrições"
                    description="Mostra a descrição de cada produto."
                    checked={settings.show_descriptions}
                    onChange={(v) => update('show_descriptions', v)}
                  />
                  <ToggleRow
                    label="Imagens nas categorias"
                    description="Exibe imagem de capa para cada categoria."
                    checked={settings.show_category_images}
                    onChange={(v) => update('show_category_images', v)}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Gerar QR Code"
              icon={QrCode}
              description="Personalize o QR Code do seu cardápio digital."
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Tamanho do QR Code (px)
                  </label>
                  <Input
                    type="number"
                    value={settings.qr_size}
                    onChange={(e) => update('qr_size', Number(e.target.value))}
                    min={100}
                    max={500}
                    className="w-32"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Cor do QR Code
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={settings.qr_foreground}
                        onChange={(e) => update('qr_foreground', e.target.value)}
                        className="w-16 h-11 p-1 cursor-pointer"
                      />
                      <span className="text-sm text-text-muted font-mono">
                        {settings.qr_foreground}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end pb-2">
                    <ToggleRow
                      label="Incluir logo no centro"
                      description="Adiciona a logo do restaurante no centro do QR Code."
                      checked={settings.qr_include_logo}
                      onChange={(v) => update('qr_include_logo', v)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-surface-subtle border border-border-default rounded-radius-xl">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-primary">
                      Pré-visualização do QR Code
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      O QR Code será gerado automaticamente com base no link do seu cardápio
                      digital.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    Baixar QR Code
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Gerar para Mesas"
              icon={QrCode}
              description="Crie QR Codes individuais para cada mesa do salão."
            >
              <div className="space-y-4">
                <ToggleRow
                  label="Gerar automaticamente para mesas"
                  description="Cria QR Codes únicos para cada mesa ao cadastrá-las."
                  checked={settings.auto_generate_for_tables}
                  onChange={(v) => update('auto_generate_for_tables', v)}
                />
                <div className="p-4 bg-status-info/5 border border-status-info/20 rounded-radius-lg">
                  <p className="text-sm text-text-secondary">
                    Os QR Codes por mesa direcionam o cliente direto para o cardápio, identificando
                    automaticamente a mesa para agilizar o atendimento.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <SectionCard
              title="Ações do Cliente"
              icon={Smartphone}
              description="Configure as opções disponíveis para o cliente no cardápio digital."
            >
              <div className="space-y-4">
                <ToggleRow
                  label="Habilitar Cardápio QR Code"
                  description="Ativa o cardápio digital acessível via QR Code."
                  checked={settings.enabled}
                  onChange={(v) => update('enabled', v)}
                />
                <ToggleRow
                  label="Botão WhatsApp"
                  description="Exibe botão para o cliente fazer pedido via WhatsApp."
                  checked={settings.show_whatsapp_button}
                  onChange={(v) => update('show_whatsapp_button', v)}
                />

                {settings.show_whatsapp_button && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Texto do botão WhatsApp
                    </label>
                    <Input
                      value={settings.whatsapp_label}
                      onChange={(e) => update('whatsapp_label', e.target.value)}
                      className="max-w-sm"
                      placeholder="Fazer Pedido"
                    />
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </form>
    </div>
  );
}
