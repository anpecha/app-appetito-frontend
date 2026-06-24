'use client';

import React, { useEffect, useState } from 'react';
import { Star, Save, Loader2, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, Toast, PageHeader, useToast } from '../../settings/_shared';
import { cn } from '@/lib/utils';

export default function BotFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Configurações Locais
  const [askFeedback, setAskFeedback] = useState(true);
  const [delayHours, setDelayHours] = useState('2');
  const [feedbackMessage, setFeedbackMessage] = useState(
    'Oi {customer_name}! Como foi o seu último pedido com a gente? Por favor, avalie sua experiência de 1 a 5 estrelas ⭐ respondendo a essa mensagem.',
  );

  const { toast, show: showToast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/proxy/bot/settings');
        if (res.ok) {
          const data = await res.json();

          if (data.ask_feedback !== undefined) setAskFeedback(data.ask_feedback);
          if (data.feedback_delay_hours) setDelayHours(data.feedback_delay_hours);
          if (data.feedback_message) setFeedbackMessage(data.feedback_message);
        }
      } catch {
        showToast('error', 'Erro ao carregar configurações de feedback.');
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
            ask_feedback: askFeedback,
            feedback_delay_hours: delayHours,
            feedback_message: feedbackMessage,
          },
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar');
      showToast('success', 'Configurações de feedback atualizadas!');
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
        title="Feedback Automático"
        description="Habilite a função de envio automático de NPS e colete avaliações valiosas dos seus clientes pós-venda via WhatsApp."
      />
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-6">
        <SectionCard title="Pesquisa de Satisfação" icon={Star}>
          <form onSubmit={handleSave} className="flex flex-col gap-space-6">
            <div className="flex items-center justify-between p-4 bg-surface-subtle border border-border-default rounded-radius-lg">
              <div className="flex flex-col gap-1 pr-6">
                <span className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                  <StarHalf className="h-4 w-4 text-action-primary" /> Pesquisa Pós-Entrega
                </span>
                <span className="text-xs text-text-secondary leading-tight">
                  Um gatilho será disparado um tempo depois do pedido finalizado, pedindo pro
                  cliente dar uma nota e um comentário.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={askFeedback}
                  onChange={(e) => setAskFeedback(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-card border-2 border-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-primary peer-checked:border-action-primary peer-checked:after:bg-white"></div>
              </label>
            </div>

            <div
              className={cn(
                'flex flex-col gap-space-5 transition-opacity',
                !askFeedback && 'opacity-50 pointer-events-none',
              )}
            >
              {/* Delay Input */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-text-secondary ml-1">
                  Tempo Estimado de Refeição (Horas)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={delayHours}
                    onChange={(e) => setDelayHours(e.target.value)}
                    className="w-24 text-sm bg-surface-card border border-border-default rounded-radius-sm px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary text-center"
                  />
                  <span className="text-sm font-medium text-text-muted">
                    horas após Entregue/Finalizado.
                  </span>
                </div>
              </div>

              {/* Feedback Message */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-text-secondary ml-1">
                  Mensagem da Pesquisa
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={4}
                  className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md p-space-3 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
                />
                <p className="text-[11px] text-text-muted ml-1">
                  Para forçar a nota inteira, instrua-os a responder com 1 a 5.
                </p>
              </div>
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
              Habilitar Feedback
            </Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
