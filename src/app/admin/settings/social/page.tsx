'use client';

import React, { useEffect, useState } from 'react';
import { Save, Share2, Instagram, Globe, ExternalLink } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { SectionCard, Toast, PageHeader, InfoCard, useToast } from '../_shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
  ifood_link: string;
  website: string;
}

const DEFAULT: SocialLinks = {
  instagram: '',
  facebook: '',
  tiktok: '',
  ifood_link: '',
  website: '',
};

// ─── SocialInput ──────────────────────────────────────────────────────────────

function SocialInput({
  label,
  id,
  prefix,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  id: string;
  prefix?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
}) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      labelIcon={Icon ? <Icon className="h-3.5 w-3.5" /> : undefined}
    >
      <div className="flex items-center rounded-radius-sm border border-border-default bg-surface-card overflow-hidden focus-within:ring-2 focus-within:ring-border-focus focus-within:border-transparent hover:border-border-focus transition-all duration-200">
        {prefix && (
          <span className="px-space-3 py-space-2 text-sm text-text-muted bg-surface-subtle border-r border-border-default shrink-0 whitespace-nowrap">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-space-3 h-11 text-sm text-text-primary bg-transparent focus:outline-none placeholder:text-text-muted"
        />
        {value && (
          <a
            href={prefix ? `https://${prefix}${value}` : value}
            target="_blank"
            rel="noopener noreferrer"
            className="px-space-3 py-space-2 text-text-muted hover:text-action-primary transition"
            title="Abrir link"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </FormField>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [links, setLinks] = useState<SocialLinks>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.social_links;
        if (stored) setLinks((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar links sociais.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof SocialLinks>(key: K, value: string) {
    setLinks((prev) => ({ ...prev, [key]: value }));
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
          config_json: { ...(current.config_json ?? {}), social_links: links },
        }),
      });

      if (!patch.ok) {
        const err = await patch.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Erro ao salvar');
      }
      showToast('success', 'Links salvos com sucesso!');
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
        title="Redes Sociais"
        description="Links exibidos no rodapé do seu cardápio digital."
      >
        <Button
          form="social-form"
          type="submit"
          variant="primary"
          isLoading={saving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="social-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard title="Redes Sociais" icon={Share2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
            <SocialInput
              label="Instagram"
              id="instagram"
              prefix="instagram.com/"
              value={links.instagram}
              onChange={(v) => update('instagram', v)}
              placeholder="seu.restaurante"
              icon={Instagram}
            />
            <SocialInput
              label="Facebook"
              id="facebook"
              prefix="facebook.com/"
              value={links.facebook}
              onChange={(v) => update('facebook', v)}
              placeholder="SeuRestaurante"
            />
            <SocialInput
              label="TikTok"
              id="tiktok"
              prefix="tiktok.com/@"
              value={links.tiktok}
              onChange={(v) => update('tiktok', v)}
              placeholder="seurestaurante"
            />
            <SocialInput
              label="iFood"
              id="ifood"
              value={links.ifood_link}
              onChange={(v) => update('ifood_link', v)}
              placeholder="https://www.ifood.com.br/delivery/..."
            />
          </div>
        </SectionCard>

        <SectionCard title="Site / Outros" icon={Globe}>
          <SocialInput
            label="Website"
            id="website"
            value={links.website}
            onChange={(v) => update('website', v)}
            placeholder="https://www.seurestaurante.com.br"
            icon={Globe}
          />
        </SectionCard>

        <InfoCard icon={Share2}>
          Os links serão exibidos no rodapé do seu cardápio digital para que clientes possam
          acompanhar suas novidades.
        </InfoCard>
      </form>
    </div>
  );
}
