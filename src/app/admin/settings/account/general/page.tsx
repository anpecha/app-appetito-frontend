'use client';

import React, { useEffect, useState } from 'react';
import { Save, Settings, Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast, PageHeader, useToast, SectionCard, ToggleRow } from '@/app/admin/settings/_shared';
import { AccountSidebar } from '../shared';

export default function AccountGeneralPage() {
  const [settings, setSettings] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    sound_enabled: true,
    email_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error();
        const data = await res.json();
        const pref = data?.config_json?.account_general;
        if (pref) setSettings((prev) => ({ ...prev, ...pref }));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/settings/restaurant');
      const current = await res.json();
      const patch = await fetch('/api/proxy/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_json: { ...(current.config_json ?? {}), account_general: settings },
        }),
      });
      if (!patch.ok) throw new Error();
      showToast('success', 'Preferências salvas!');
    } catch {
      showToast('error', 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader title="Minha Conta" description="Configurações gerais da sua conta." />
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="flex gap-8">
        <AccountSidebar active="general" />
        <form onSubmit={handleSave} className="flex-1 max-w-2xl space-y-6">
          <SectionCard
            title="Preferências"
            icon={Settings}
            action={
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Salvar
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings((p) => ({ ...p, language: e.target.value }))}
                  className="w-full h-11 rounded-radius-sm border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus cursor-pointer"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                  Fuso Horário
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full h-11 rounded-radius-sm border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus cursor-pointer"
                >
                  <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                  <option value="America/Manaus">America/Manaus (GMT-4)</option>
                  <option value="America/Noronha">America/Noronha (GMT-2)</option>
                </select>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Notificações" icon={Bell}>
            <div>
              <ToggleRow
                label="Sons do sistema"
                description="Tocar sons ao receber pedidos e notificações."
                checked={settings.sound_enabled}
                onChange={(v) => setSettings((p) => ({ ...p, sound_enabled: v }))}
              />
              <ToggleRow
                label="Notificações por e-mail"
                description="Receber resumos e alertas por e-mail."
                checked={settings.email_notifications}
                onChange={(v) => setSettings((p) => ({ ...p, email_notifications: v }))}
              />
            </div>
          </SectionCard>
        </form>
      </div>
    </div>
  );
}
