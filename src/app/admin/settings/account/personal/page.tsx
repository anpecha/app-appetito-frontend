'use client';

import React, { useEffect, useState } from 'react';
import { Save, UserCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast, PageHeader, useToast, SectionCard } from '@/app/admin/settings/_shared';
import { AccountSidebar } from '../shared';

export default function AccountPersonalPage() {
  const [data, setData] = useState({ name: '', email: '', phone: '', cpf: '', birth_date: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/auth/me');
        if (!res.ok) throw new Error();
        const user = await res.json();
        setData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          cpf: user.cpf || '',
          birth_date: user.birth_date || '',
        });
      } catch {
        showToast('error', 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

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
          config_json: { ...(current.config_json ?? {}), account_personal: data },
        }),
      });
      if (!patch.ok) throw new Error();
      showToast('success', 'Dados atualizados!');
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
      <PageHeader title="Informações Pessoais" description="Seus dados de cadastro." />
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="flex gap-8">
        <AccountSidebar active="personal" />
        <form onSubmit={handleSave} className="flex-1 max-w-2xl space-y-6">
          <SectionCard
            title="Dados Pessoais"
            icon={UserCircle}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                  Nome completo
                </label>
                <Input
                  value={data.name}
                  onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                  Telefone
                </label>
                <Input
                  value={data.phone}
                  onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-text-xs font-bold text-text-muted uppercase ml-1">CPF</label>
                <Input
                  value={data.cpf}
                  onChange={(e) => setData((p) => ({ ...p, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                  Data de Nascimento
                </label>
                <Input
                  type="date"
                  value={data.birth_date}
                  onChange={(e) => setData((p) => ({ ...p, birth_date: e.target.value }))}
                />
              </div>
            </div>
          </SectionCard>
        </form>
      </div>
    </div>
  );
}
