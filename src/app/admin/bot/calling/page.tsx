'use client';

import React, { useEffect, useState } from 'react';
import { PhoneOutgoing, Save, Loader2, UserCog, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, Toast, PageHeader, useToast } from '../../settings/_shared';
import { cn } from '@/lib/utils';

export default function BotCallingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Configurações Locais
  const [allowHandoff, setAllowHandoff] = useState(true);
  const [handoffMessage, setHandoffMessage] = useState(
    'Por favor, aguarde um momento. Estou transferindo você para um dos nossos atendentes humanos.',
  );
  const [ringTone, setRingTone] = useState('standard');

  const { toast, show: showToast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/proxy/bot/settings');
        if (res.ok) {
          const data = await res.json();

          if (data.allow_human_handoff !== undefined) setAllowHandoff(data.allow_human_handoff);
          if (data.handoff_message) setHandoffMessage(data.handoff_message);
          if (data.ring_tone) setRingTone(data.ring_tone);
        }
      } catch {
        showToast('error', 'Erro ao carregar configurações de atendimento.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [showToast]);

  // ─── Actions ────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/bot/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_settings: {
            allow_human_handoff: allowHandoff,
            handoff_message: handoffMessage,
            ring_tone: ringTone,
          },
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar');
      showToast('success', 'Configurações de atendimento salvas com sucesso!');
    } catch {
      showToast('error', 'Erro ao salvar as configurações.');
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
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Chamando Atendentes"
        description="Defina como o robô deve agir quando o cliente pedir para falar com um humano ou quando a IA não conseguir responder."
      />
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-6">
        <SectionCard title="Transbordo Humano (Handoff)" icon={UserCog}>
          <form onSubmit={handleSave} className="flex flex-col gap-space-6">
            {/* Handoff Toggle */}
            <div className="flex items-center justify-between p-4 bg-surface-subtle border border-border-default rounded-radius-lg">
              <div className="flex flex-col gap-1 pr-6">
                <span className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                  <PhoneOutgoing className="h-4 w-4 text-action-primary" /> Permitir solicitar
                  atendente
                </span>
                <span className="text-xs text-text-secondary leading-tight">
                  Se desligado, o robô não transferirá a conversa e tentará sempre guiá-lo para o
                  cardápio.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={allowHandoff}
                  onChange={(e) => setAllowHandoff(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-card border-2 border-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-primary peer-checked:border-action-primary peer-checked:after:bg-white"></div>
              </label>
            </div>

            {/* Handoff Message */}
            <div
              className={cn(
                'flex flex-col gap-2 relative transition-opacity',
                !allowHandoff && 'opacity-50 pointer-events-none',
              )}
            >
              <label className="text-xs font-bold text-text-secondary ml-1">
                Mensagem de Transferência
              </label>
              <textarea
                value={handoffMessage}
                onChange={(e) => setHandoffMessage(e.target.value)}
                rows={3}
                className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md p-space-3 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
                placeholder="Aguarde, estamos chamando um humano."
              />
            </div>

            {/* Tone Selector */}
            <div
              className={cn(
                'flex flex-col gap-2 relative transition-opacity',
                !allowHandoff && 'opacity-50 pointer-events-none',
              )}
            >
              <label className="text-xs font-bold text-text-secondary ml-1 flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                Alerta Sonoro no Painel (Sino)
              </label>
              <select
                value={ringTone}
                onChange={(e) => setRingTone(e.target.value)}
                className="w-full text-sm bg-surface-card border border-border-default rounded-radius-sm px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
              >
                <option value="standard">Campainha Tradicional (Trim-trim)</option>
                <option value="digital">Notificação Digital Singela</option>
                <option value="urgent">Alarme Urgente (Agressivo)</option>
                <option value="none">Silencioso</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand self-end w-full sm:w-auto px-space-6 shadow-button-primary disabled:opacity-50 h-11"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Transbordo
            </Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
