'use client';

import React, { useEffect, useState } from 'react';
import { Save, BookOpen, Palette, Search, Image, Eye } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { SectionCard, Toast, PageHeader, ToggleRow, useToast } from '../_shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogSettings {
  show_prices: boolean;
  show_photos: boolean;
  enable_search: boolean;
  welcome_message: string;
  accent_color: string;
  show_out_of_stock: boolean;
}

const DEFAULT: CatalogSettings = {
  show_prices: true,
  show_photos: true,
  enable_search: true,
  welcome_message: '',
  accent_color: '#F59E0B',
  show_out_of_stock: false,
};

const PRESET_COLORS = [
  { label: 'Âmbar (Padrão)', value: '#F59E0B' },
  { label: 'Vermelho', value: '#EF4444' },
  { label: 'Verde', value: '#22C55E' },
  { label: 'Azul', value: '#3B82F6' },
  { label: 'Roxo', value: '#A855F7' },
  { label: 'Rosa', value: '#EC4899' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DigitalMenuSettingsPage() {
  const [settings, setSettings] = useState<CatalogSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState<string>('');
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        setRestaurantSlug(data.slug ?? '');
        const stored = data?.config_json?.catalog_settings;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações do cardápio.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof CatalogSettings>(key: K, value: CatalogSettings[K]) {
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
          config_json: { ...(current.config_json ?? {}), catalog_settings: settings },
        }),
      });

      if (!patch.ok) {
        const err = await patch.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Erro ao salvar');
      }
      showToast('success', 'Configurações salvas com sucesso!');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-8 pb-space-12">
      <PageHeader
        title="Cardápio Digital"
        description="Personalize a aparência e experiência do seu cardápio online."
      >
        {restaurantSlug && (
          <a
            href={`/${restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-space-2 rounded-radius-md border border-border-default bg-surface-card px-space-4 py-space-2 text-sm font-medium text-text-secondary hover:text-action-primary hover:border-action-primary transition"
          >
            <Eye className="h-4 w-4" />
            Ver cardápio
          </a>
        )}
        <Button
          form="digital-menu-form"
          type="submit"
          variant="primary"
          isLoading={saving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="digital-menu-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        {/* Cor de destaque */}
        <SectionCard title="Cor de Destaque" icon={Palette}>
          <div className="flex flex-col gap-space-4">
            <p className="text-xs text-text-muted">
              Cor principal dos botões e elementos de ação no cardápio do cliente.
            </p>
            <div className="flex flex-wrap gap-space-3">
              {PRESET_COLORS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('accent_color', value)}
                  title={label}
                  className={`h-9 w-9 rounded-radius-full border-2 transition cursor-pointer shadow-sm hover:scale-110 ${settings.accent_color === value ? 'border-text-primary scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: value }}
                />
              ))}
              <div className="flex items-center gap-space-2">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => update('accent_color', e.target.value)}
                  className="h-9 w-9 rounded-radius-full border border-border-default cursor-pointer"
                  title="Cor personalizada"
                />
                <span className="text-xs text-text-muted font-mono">{settings.accent_color}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Exibição */}
        <SectionCard title="Exibição" icon={Image}>
          <ToggleRow
            label="Exibir preços dos itens"
            description="Mostrar o valor de cada produto no cardápio."
            checked={settings.show_prices}
            onChange={(v) => update('show_prices', v)}
          />
          <ToggleRow
            label="Exibir fotos dos produtos"
            description="Mostrar a imagem dos pratos no cardápio."
            checked={settings.show_photos}
            onChange={(v) => update('show_photos', v)}
          />
          <ToggleRow
            label="Mostrar itens esgotados"
            description="Produtos fora de estoque aparecem como indisponíveis."
            checked={settings.show_out_of_stock}
            onChange={(v) => update('show_out_of_stock', v)}
          />
        </SectionCard>

        {/* Funcionalidades */}
        <SectionCard title="Funcionalidades" icon={Search}>
          <ToggleRow
            label="Habilitar busca no cardápio"
            description="Clientes podem pesquisar produtos por nome."
            checked={settings.enable_search}
            onChange={(v) => update('enable_search', v)}
          />
        </SectionCard>

        {/* Mensagem de boas-vindas */}
        <SectionCard title="Mensagem de Boas-vindas" icon={BookOpen}>
          <FormField
            label="Mensagem de boas-vindas"
            htmlFor="welcome_message"
            hint={`${settings.welcome_message.length}/200`}
          >
            <textarea
              id="welcome_message"
              value={settings.welcome_message}
              onChange={(e) => update('welcome_message', e.target.value)}
              placeholder="Ex: Bem-vindo! Peça agora e receba em até 30 min 🍔"
              rows={3}
              maxLength={200}
              className="w-full rounded-radius-sm border border-border-default bg-surface-card px-space-4 py-space-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus hover:border-border-focus transition-all duration-200 resize-none"
            />
          </FormField>
        </SectionCard>
      </form>
    </div>
  );
}
