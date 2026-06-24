'use client';

import React, { useEffect, useState } from 'react';
import { Save, CalendarClock, Loader2, Clock, Bell, Ban } from 'lucide-react';
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

interface ScheduledOrdersSettings {
  enabled: boolean;
  min_advance_minutes: number;
  max_advance_days: number;
  max_orders_per_slot: number;
  slot_interval_minutes: number;
  require_confirmation: boolean;
  send_reminder: boolean;
  reminder_minutes_before: number;
  allow_pickup: boolean;
  allow_delivery: boolean;
  cut_off_time: string;
  block_weekends: boolean;
  block_holidays: boolean;
  auto_cancel_no_show: boolean;
  no_show_grace_minutes: number;
}

const DEFAULT: ScheduledOrdersSettings = {
  enabled: false,
  min_advance_minutes: 60,
  max_advance_days: 7,
  max_orders_per_slot: 10,
  slot_interval_minutes: 30,
  require_confirmation: true,
  send_reminder: true,
  reminder_minutes_before: 60,
  allow_pickup: true,
  allow_delivery: true,
  cut_off_time: '23:00',
  block_weekends: false,
  block_holidays: false,
  auto_cancel_no_show: false,
  no_show_grace_minutes: 30,
};

export default function ScheduledOrdersSettingsPage() {
  const [settings, setSettings] = useState<ScheduledOrdersSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.scheduled_orders;
        if (stored) setSettings((prev) => ({ ...prev, ...stored }));
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function update<K extends keyof ScheduledOrdersSettings>(
    key: K,
    value: ScheduledOrdersSettings[K],
  ) {
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
          config_json: { ...(current.config_json ?? {}), scheduled_orders: settings },
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
        title="Pedidos Agendados"
        description="Configure o agendamento de pedidos para horários futuros."
      >
        <Button
          form="sched-form"
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

      <form id="sched-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard
          title="Ativação"
          icon={CalendarClock}
          description="Permita que clientes agendem pedidos com data e hora."
        >
          <ToggleRow
            label="Aceitar Pedidos Agendados"
            description="Clientes podem escolher data/hora futura para entrega ou retirada."
            checked={settings.enabled}
            onChange={(v) => update('enabled', v)}
          />
        </SectionCard>

        {settings.enabled && (
          <>
            <SectionCard
              title="Janela de Agendamento"
              icon={Clock}
              description="Defina os limites de tempo para agendamento."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Antecedência mínima (minutos)
                  </label>
                  <Input
                    type="number"
                    value={settings.min_advance_minutes}
                    onChange={(e) => update('min_advance_minutes', Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Máximo de dias para agendar
                  </label>
                  <Input
                    type="number"
                    value={settings.max_advance_days}
                    onChange={(e) => update('max_advance_days', Number(e.target.value))}
                    min={1}
                    max={90}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Intervalo entre horários (minutos)
                  </label>
                  <Input
                    type="number"
                    value={settings.slot_interval_minutes}
                    onChange={(e) => update('slot_interval_minutes', Number(e.target.value))}
                    min={5}
                    step={5}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Pedidos máximos por horário
                  </label>
                  <Input
                    type="number"
                    value={settings.max_orders_per_slot}
                    onChange={(e) => update('max_orders_per_slot', Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Horários"
              icon={CalendarClock}
              description="Configure os períodos disponíveis para agendamento."
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Horário de corte (último horário)
                  </label>
                  <Input
                    type="time"
                    value={settings.cut_off_time}
                    onChange={(e) => update('cut_off_time', e.target.value)}
                    className="w-32"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ToggleRow
                    label="Permitir retirada"
                    description="Cliente pode agendar para retirar no balcão."
                    checked={settings.allow_pickup}
                    onChange={(v) => update('allow_pickup', v)}
                  />
                  <ToggleRow
                    label="Permitir delivery"
                    description="Cliente pode agendar para entrega."
                    checked={settings.allow_delivery}
                    onChange={(v) => update('allow_delivery', v)}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Bloqueios"
              icon={Ban}
              description="Dias e situações em que o agendamento não estará disponível."
            >
              <div className="space-y-4">
                <ToggleRow
                  label="Bloquear finais de semana"
                  description="Desativa agendamentos para sábados e domingos."
                  checked={settings.block_weekends}
                  onChange={(v) => update('block_weekends', v)}
                />
                <ToggleRow
                  label="Bloquear feriados"
                  description="Desativa agendamentos em feriados nacionais."
                  checked={settings.block_holidays}
                  onChange={(v) => update('block_holidays', v)}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Confirmação e Lembretes"
              icon={Bell}
              description="Configure notificações para pedidos agendados."
            >
              <div className="space-y-4">
                <ToggleRow
                  label="Exigir confirmação manual"
                  description="Pedido agendado só é confirmado após aprovação manual."
                  checked={settings.require_confirmation}
                  onChange={(v) => update('require_confirmation', v)}
                />
                <ToggleRow
                  label="Enviar lembrete"
                  description="Cliente recebe lembrete antes do horário agendado."
                  checked={settings.send_reminder}
                  onChange={(v) => update('send_reminder', v)}
                />
                {settings.send_reminder && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Lembrar quanto tempo antes (minutos)
                    </label>
                    <Input
                      type="number"
                      value={settings.reminder_minutes_before}
                      onChange={(e) => update('reminder_minutes_before', Number(e.target.value))}
                      min={5}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="No-Show"
              icon={CalendarClock}
              description="Gerencie pedidos agendados que não foram retirados."
            >
              <ToggleRow
                label="Cancelar automaticamente"
                description="Cancela pedidos não retirados após o tempo de tolerância."
                checked={settings.auto_cancel_no_show}
                onChange={(v) => update('auto_cancel_no_show', v)}
              />
              {settings.auto_cancel_no_show && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Tolerância (minutos após o horário)
                  </label>
                  <Input
                    type="number"
                    value={settings.no_show_grace_minutes}
                    onChange={(e) => update('no_show_grace_minutes', Number(e.target.value))}
                    min={5}
                    className="w-32"
                  />
                </div>
              )}
            </SectionCard>
          </>
        )}

        <InfoCard icon={CalendarClock}>
          Os pedidos agendados aparecem no painel &quot;Pedidos Agendados&quot; e podem ser
          gerenciados individualmente. Lembre-se de configurar os horários de funcionamento para que
          os agendamentos respeitem o expediente.
        </InfoCard>
      </form>
    </div>
  );
}
