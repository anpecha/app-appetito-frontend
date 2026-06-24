'use client';

import React, { useEffect, useState } from 'react';
import { Save, Loader2, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, Toast, PageHeader, useToast } from '../../settings/_shared';

const MESSAGE_TEMPLATES = [
  {
    key: 'msg_order_received',
    label: 'Pedido Recebido',
    default: 'Recebemos o seu pedido #{order_id}! Ele já está indo para a nossa cozinha.',
  },
  {
    key: 'msg_order_preparing',
    label: 'Em Preparo',
    default: 'Estamos preparando o seu pedido #{order_id} com muito carinho!',
  },
  {
    key: 'msg_order_ready',
    label: 'Pronto para Retirada',
    default: 'Opa, seu pedido #{order_id} já está prontinho te esperando aqui no balcão!',
  },
  {
    key: 'msg_order_out_for_delivery',
    label: 'Saiu para Entrega',
    default:
      'Chegando! Seu pedido (#{order_id}) acaba de sair pra entrega com o motoboy {courier_name}.',
  },
  {
    key: 'msg_order_finished',
    label: 'Concluído',
    default: 'Obrigado por pedir conosco! Aproveite sua refeição :)',
  },
  {
    key: 'msg_order_canceled',
    label: 'Cancelado',
    default:
      'Poxa, seu pedido #{order_id} precisou ser cancelado. Entre em contato para mais detalhes.',
  },
];

export default function BotMessagesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Configurações Locais
  const [messages, setMessages] = useState<Record<string, string>>({});

  const { toast, show: showToast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/proxy/bot/settings');
        if (res.ok) {
          const data = await res.json();

          // Inicializar state com dict merging
          const loaded: Record<string, string> = {};
          MESSAGE_TEMPLATES.forEach((t) => {
            loaded[t.key] = data[t.key] || t.default;
          });

          setMessages(loaded);
        }
      } catch {
        showToast('error', 'Erro ao carregar mensagens.');
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
          bot_settings: messages,
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar');
      showToast('success', 'Mensagens customizadas salvas!');
    } catch {
      showToast('error', 'Erro ao salvar as mensagens.');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (key: string, value: string) => {
    setMessages((prev) => ({ ...prev, [key]: value }));
  };

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
        title="Personalizar Mensagens"
        description="Modifique as mensagens automáticas disparadas em cada fase do funil de pedidos."
      />
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-6">
        <div className="lg:col-span-2">
          <SectionCard title="Templates de Status via WhatsApp" icon={MessageCircle}>
            <form onSubmit={handleSave} className="flex flex-col gap-space-6">
              <div className="bg-surface-subtle p-space-4 border border-border-default rounded-radius-md flex gap-space-3 items-start">
                <Info className="h-5 w-5 text-action-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-sm text-text-secondary leading-relaxed">
                  <p>Utilize as variáveis mágicas em suas mensagens (com as chaves):</p>
                  <ul className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs bg-surface-card p-3 rounded-radius-sm border border-border-subtle">
                    <li>{`{order_id}`} ID curto</li>
                    <li>{`{customer_name}`} Nome</li>
                    <li>{`{total}`} R$ Total</li>
                    <li>{`{courier_name}`} Nome entregador</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-space-6">
                {MESSAGE_TEMPLATES.map((tpl) => (
                  <div key={tpl.key} className="flex flex-col gap-2 relative">
                    <label className="text-xs font-bold text-text-secondary ml-1 flex items-center justify-between">
                      <span>
                        Trilha:{' '}
                        <span className="text-action-primary uppercase tracking-wider text-[10px] ml-1 bg-action-primary/10 px-2 py-0.5 rounded-radius-full">
                          {tpl.label}
                        </span>
                      </span>
                    </label>
                    <textarea
                      value={messages[tpl.key] || ''}
                      onChange={(e) => handleChange(tpl.key, e.target.value)}
                      rows={2}
                      required
                      className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md p-space-3 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
                    />
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="bg-text-primary hover:bg-text-secondary text-text-on-dark self-start px-space-6 h-11 disabled:opacity-50 mt-space-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Todas as Mensagens
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
