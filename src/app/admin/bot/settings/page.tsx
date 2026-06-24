'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bot, Save, Loader2, Trash2, Play, RefreshCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast, PageHeader, useToast, ToggleRow } from '../../settings/_shared';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'interaction' as const, label: '1. Interações robô' },
  { id: 'notifications' as const, label: '2. Notificações robô' },
  { id: 'sounds' as const, label: '3. Sons das notificações' },
  { id: 'menu_image' as const, label: '4. Imagens cardápio' },
  { id: 'promo_images' as const, label: '5. Imagens promoção' },
];

type TabId = (typeof TABS)[number]['id'];

const DAYS = [
  { id: 'dom', label: 'Dom' },
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sab' },
];

// Custom Hamburger and Soda icon for upload drop zone
const HamburgerSodaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M42 22 L46 6 H48"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36 22 H50 L46 54 H40"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M34 28 H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 36 C12 28 32 28 32 36 H12 Z" fill="currentColor" opacity="0.2" />
    <path
      d="M12 36 C12 28 32 28 32 36 H12 Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 40 H34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path
      d="M12 44 C12 44 14 48 22 48 C30 48 32 44 32 44"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M12 48 H32 C32 52 12 52 12 48"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Browser-based audio synthesis for notification testing
function playAudioTone(soundName: 'som1' | 'som2' | 'none') {
  if (soundName === 'none') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

    if (soundName === 'som1') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.12);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, audioCtx.currentTime);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.15);
    } else if (soundName === 'som2') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(987.77, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.06);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.08);
      osc2.start(audioCtx.currentTime + 0.08);
      osc2.stop(audioCtx.currentTime + 0.14);
    }
  } catch (e) {
    console.error('Erro ao reproduzir áudio:', e);
  }
}

export default function BotSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('interaction');
  const [activePromoDay, setActivePromoDay] = useState<string>('dom');

  // ─── Estados das Configurações ──────────────────────────────────────────
  // Tab 1: Interações robô
  const [askNotUnderstand, setAskNotUnderstand] = useState(true);
  const [warnClosed, setWarnClosed] = useState(true);
  const [sendGameLink, setSendGameLink] = useState(true);
  const [sendCsat, setSendCsat] = useState(true);
  const [warnAbandonedCart, setWarnAbandonedCart] = useState(true);
  const [warnOpening30m, setWarnOpening30m] = useState(true);
  const [disableClosedGreeting, setDisableClosedGreeting] = useState(false);
  const [disableConversionGreeting, setDisableConversionGreeting] = useState(false);
  const [autoSendInvoice, setAutoSendInvoice] = useState(false);

  // Tab 2: Notificações robô
  const [notifyObs, setNotifyObs] = useState(true);
  const [notifyError, setNotifyError] = useState(true);
  const [notifyHandoff, setNotifyHandoff] = useState(true);
  const [notifyInvoice, setNotifyInvoice] = useState(true);

  // Tab 3: Sons das notificações
  const [soundHandoff, setSoundHandoff] = useState<'som1' | 'som2' | 'none'>('som1');
  const [soundClientRequest, setSoundClientRequest] = useState<'som1' | 'som2' | 'none'>('som1');

  // Tab 4: Imagens cardápio
  const [menuImageUrl, setMenuImageUrl] = useState<string | null>(null);
  const [sendMenuImage, setSendMenuImage] = useState(true);

  // Tab 5: Imagens promoção (mapeado por dia da semana)
  const [promoByDay, setPromoByDay] = useState<
    Record<string, { url: string; description: string }>
  >({
    dom: { url: '', description: '' },
    seg: { url: '', description: '' },
    ter: { url: '', description: '' },
    qua: { url: '', description: '' },
    qui: { url: '', description: '' },
    sex: { url: '', description: '' },
    sab: { url: '', description: '' },
  });

  const { toast, show: showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/proxy/bot/settings');
        if (res.ok) {
          const data = await res.json();

          setAskNotUnderstand(data.ask_not_understand ?? true);
          setWarnClosed(data.warn_closed ?? true);
          setSendGameLink(data.send_game_link ?? true);
          setSendCsat(data.send_csat ?? true);
          setWarnAbandonedCart(data.warn_abandoned_cart ?? true);
          setWarnOpening30m(data.warn_opening_30m ?? true);
          setDisableClosedGreeting(data.disable_closed_greeting ?? false);
          setDisableConversionGreeting(data.disable_conversion_greeting ?? false);
          setAutoSendInvoice(data.auto_send_invoice ?? false);

          setNotifyObs(data.notify_obs ?? true);
          setNotifyError(data.notify_error ?? true);
          setNotifyHandoff(data.notify_handoff ?? true);
          setNotifyInvoice(data.notify_invoice ?? true);

          setSoundHandoff(data.sound_handoff ?? 'som1');
          setSoundClientRequest(data.sound_client_request ?? 'som1');

          setMenuImageUrl(data.menu_image_url ?? null);
          setSendMenuImage(data.send_menu_image ?? true);

          if (data.promo_by_day) {
            setPromoByDay(data.promo_by_day);
          } else if (data.promo_images && Array.isArray(data.promo_images)) {
            // Backfill conversion from old flat array format to key-value
            const mapping: Record<string, { url: string; description: string }> = {
              dom: { url: '', description: '' },
              seg: { url: '', description: '' },
              ter: { url: '', description: '' },
              qua: { url: '', description: '' },
              qui: { url: '', description: '' },
              sex: { url: '', description: '' },
              sab: { url: '', description: '' },
            };
            const daysList = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
            data.promo_images.forEach((item: any, idx: number) => {
              if (daysList[idx]) {
                mapping[daysList[idx]] = {
                  url: item.url || '',
                  description: item.description || '',
                };
              }
            });
            setPromoByDay(mapping);
          }
        }
      } catch {
        showToast('error', 'Erro ao carregar configurações do robô.');
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
            ask_not_understand: askNotUnderstand,
            warn_closed: warnClosed,
            send_game_link: sendGameLink,
            send_csat: sendCsat,
            warn_abandoned_cart: warnAbandonedCart,
            warn_opening_30m: warnOpening30m,
            disable_closed_greeting: disableClosedGreeting,
            disable_conversion_greeting: disableConversionGreeting,
            auto_send_invoice: autoSendInvoice,

            notify_obs: notifyObs,
            notify_error: notifyError,
            notify_handoff: notifyHandoff,
            notify_invoice: notifyInvoice,

            sound_handoff: soundHandoff,
            sound_client_request: soundClientRequest,

            menu_image_url: menuImageUrl,
            send_menu_image: sendMenuImage,
            promo_by_day: promoByDay,
          },
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar');
      showToast('success', 'Configurações salvas com sucesso!');
    } catch {
      showToast('error', 'Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  }

  // Upload de Imagem do Cardápio
  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        showToast('success', 'Iniciando upload do cardápio...');
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/proxy/catalog/upload-image', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Erro no upload');

        const data = await res.json();
        setMenuImageUrl(data.url);
        showToast('success', 'Imagem do cardápio enviada com sucesso!');
      } catch {
        showToast('error', 'Erro ao fazer upload da imagem.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleMenuImageRemove = () => {
    setMenuImageUrl(null);
    showToast('success', 'Imagem do cardápio removida.');
  };

  // Upload de Imagem de Promoção Diária
  const handlePromoImageUpload = async (dayId: string, file: File) => {
    try {
      showToast('success', 'Enviando imagem de promoção...');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/proxy/catalog/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Erro no upload');

      const data = await res.json();
      setPromoByDay((prev) => ({
        ...prev,
        [dayId]: { ...prev[dayId], url: data.url },
      }));
      showToast('success', 'Imagem de promoção carregada com sucesso!');
    } catch {
      showToast('error', 'Erro ao carregar imagem da promoção.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-space-20">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-6 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Configurações do Robô"
        description="Personalize o chatbot, sons de alertas, avisos e campanhas de ofertas por dia da semana."
      />

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-space-6 items-start">
        {/* ─── Sidebar de Abas Verticais ───────────────────────────────────── */}
        <div className="w-full md:w-72 bg-surface-card rounded-radius-xl border border-border-default overflow-hidden shadow-sm shrink-0 flex flex-col">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full text-left px-6 py-4 border-b border-border-subtle last:border-0 font-bold text-sm transition-all cursor-pointer hover:bg-surface-subtle',
                  isActive
                    ? 'text-action-primary bg-action-primary/5 border-l-4 border-l-action-primary'
                    : 'text-text-secondary border-l-4 border-l-transparent',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Painel de Conteúdo Principal ─────────────────────────────────── */}
        <div className="flex-1 w-full bg-surface-card rounded-radius-xl border border-border-default p-space-6 sm:p-space-8 shadow-card flex flex-col gap-space-6 min-h-[450px]">
          {/* ABA 1: Interações robô */}
          {activeTab === 'interaction' && (
            <div className="flex flex-col gap-space-4 animate-in fade-in duration-300">
              <h2 className="text-text-xl font-bold text-text-primary border-b border-border-subtle pb-space-3">
                1. Interações
              </h2>

              <ToggleRow
                label="Enviar pergunta quando o robô não entender a mensagem do cliente"
                description="Ex: Não consegui entender o que você deseja, você gostaria de uma sugestão ou saber sobre a promoção?"
                checked={askNotUnderstand}
                onChange={setAskNotUnderstand}
              />

              <ToggleRow
                label="Avisar quando o estabelecimento estiver fechado"
                description="O robô envia uma mensagem informando que o estabelecimento está fechado após o horário de funcionamento"
                checked={warnClosed}
                onChange={setWarnClosed}
              />

              <ToggleRow
                label="Enviar link para jogos"
                description="Envie o link de jogos para os seus clientes enquanto eles aguardam o pedido"
                checked={sendGameLink}
                onChange={setSendGameLink}
              />

              <ToggleRow
                label="Enviar pesquisa CSAT (Pesquisa de satisfação) para clientes"
                description="Saiba qual o nível de satisfação dos seus clientes com o robô Anota AI enviando uma pesquisa"
                checked={sendCsat}
                onChange={setSendCsat}
              />

              <ToggleRow
                label="Avisar quando houver itens não finalizados no carrinho"
                description="O robô envia um lembrete quando o cliente deixa itens no carrinho sem finalizar a compra"
                checked={warnAbandonedCart}
                onChange={setWarnAbandonedCart}
              />

              <ToggleRow
                label="Enviar aviso de que a loja abrirá em 30 minutos"
                description="O robô envia uma mensagem de lembrete para o cliente que acessar o cardápio 30 minutos antes da abertura da loja"
                checked={warnOpening30m}
                onChange={setWarnOpening30m}
              />

              <ToggleRow
                label="Desativar aviso na saudação sobre o estabelecimento fechado"
                description="Quando o estabelecimento estiver fechado, o robô não enviará esse aviso para o cliente na saudação."
                checked={disableClosedGreeting}
                onChange={setDisableClosedGreeting}
              />

              <ToggleRow
                label="Desativar mensagens de conversão na saudação"
                description="Robô não enviará mensagens de saudação personalizadas de acordo com o tipo do cliente, sem impactar positivamente na conversão de pedidos."
                checked={disableConversionGreeting}
                onChange={setDisableConversionGreeting}
              />

              <ToggleRow
                label="Envio automático da Nota Fiscal via WhatsApp"
                description="Permite que o Robô Anota AI envie a nota fiscal automaticamente para os clientes via WhatsApp."
                checked={autoSendInvoice}
                onChange={setAutoSendInvoice}
              />
            </div>
          )}

          {/* ABA 2: Notificações robô */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col md:flex-row gap-space-6 animate-in fade-in duration-300">
              <div className="flex-1 flex flex-col gap-space-4">
                <h2 className="text-text-xl font-bold text-text-primary border-b border-border-subtle pb-space-3">
                  2. Notificações robô
                </h2>

                <ToggleRow
                  label="O cliente deseja informar sobre observações do pedido"
                  description="Você é notificado no seu painel administrativo quando o cliente deseja adicionar observações no pedido"
                  checked={notifyObs}
                  onChange={setNotifyObs}
                />

                <ToggleRow
                  label="O cliente informou que o pedido está errado"
                  description="Você é notificado no seu painel administrativo quando o cliente informar que o pedido está errado"
                  checked={notifyError}
                  onChange={setNotifyError}
                />

                <ToggleRow
                  label="O cliente deseja chamar atendente"
                  description="Você é notificado no seu painel administrativo quando um cliente quiser falar com um humano"
                  checked={notifyHandoff}
                  onChange={setNotifyHandoff}
                />

                <ToggleRow
                  label="Solicitação de nota fiscal"
                  description="Você recebe uma notificação no seu painel administrativo quando o cliente solicita nota fiscal"
                  checked={notifyInvoice}
                  onChange={setNotifyInvoice}
                />
              </div>

              {/* Simulated Panel Notification Preview (Match Screenshot Mockup) */}
              <div className="w-full md:w-80 border border-border-subtle bg-surface-subtle/50 rounded-radius-lg p-space-4 flex flex-col items-center justify-center shrink-0">
                <div className="w-full bg-white rounded-radius-lg border border-border-default shadow-sm p-4 flex flex-col gap-3 font-sans relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] text-text-secondary border-b border-border-subtle pb-2">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3 text-action-primary" /> Loja
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-500" /> Cardápio Digital
                    </span>
                  </div>

                  <div className="bg-white rounded border-l-4 border-l-action-primary border border-border-default p-3 shadow-md">
                    <span className="block text-[9px] font-black text-text-muted uppercase tracking-wider mb-1">
                      Solicitações de Atendimento
                    </span>
                    <span className="text-[11px] text-text-primary font-bold block mb-2">
                      👤 Luiz solicitou atendimento.
                    </span>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="px-2 py-0.5 border border-border-default rounded text-[10px] font-semibold text-text-secondary bg-white hover:bg-surface-subtle"
                      >
                        Ver conversa
                      </button>
                      <button
                        type="button"
                        className="px-2 py-0.5 bg-action-primary text-white rounded text-[10px] font-bold hover:bg-action-primary-hover"
                      >
                        Resolvido
                      </button>
                    </div>
                  </div>

                  <div className="bg-status-success text-white text-[9px] font-medium p-1.5 rounded text-center">
                    Nenhum pedido no momento.
                  </div>
                </div>
                <span className="text-[10px] text-text-muted mt-3 text-center leading-tight">
                  Você será notificado no local indicado na imagem acima
                </span>
              </div>
            </div>
          )}

          {/* ABA 3: Sons das notificações */}
          {activeTab === 'sounds' && (
            <div className="flex flex-col gap-space-6 animate-in fade-in duration-300">
              <h2 className="text-text-xl font-bold text-text-primary border-b border-border-subtle pb-space-3">
                3. Sons das notificações
              </h2>

              {/* Chamados atendente */}
              <div className="flex flex-col gap-space-4 border-b border-border-subtle pb-space-6">
                <div>
                  <h3 className="text-text-base font-bold text-text-primary">Chamados atendente</h3>
                  <p className="text-text-xs text-text-secondary mt-0.5">
                    A notificação tocará sempre que um cliente desejar falar com um atendente
                  </p>
                </div>

                <div className="flex flex-col gap-space-3">
                  {(['som1', 'som2', 'none'] as const).map((option) => (
                    <div key={`sound-handoff-${option}`} className="flex items-center gap-space-4">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="soundHandoff"
                          checked={soundHandoff === option}
                          onChange={() => setSoundHandoff(option)}
                          className="w-4 h-4 text-action-primary border-border-default focus:ring-action-primary"
                        />
                        <span className="text-sm font-semibold text-text-primary">
                          {option === 'som1'
                            ? 'Som 1'
                            : option === 'som2'
                              ? 'Som 2'
                              : 'Sem notificação'}
                        </span>
                      </label>
                      {option !== 'none' && (
                        <button
                          type="button"
                          onClick={() => playAudioTone(option)}
                          className="flex items-center gap-1.5 text-xs font-bold text-action-primary hover:text-action-primary-hover transition-colors ml-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-action-primary" /> Testar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Solicitações de clientes */}
              <div className="flex flex-col gap-space-4 pt-space-2">
                <div>
                  <h3 className="text-text-base font-bold text-text-primary">
                    Solicitações de clientes
                  </h3>
                  <p className="text-text-xs text-text-secondary mt-0.5">
                    Solicitações de ajuste no pedido, na observação ou Nota Fiscal
                  </p>
                </div>

                <div className="flex flex-col gap-space-3">
                  {(['som1', 'som2', 'none'] as const).map((option) => (
                    <div key={`sound-client-${option}`} className="flex items-center gap-space-4">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="soundClientRequest"
                          checked={soundClientRequest === option}
                          onChange={() => setSoundClientRequest(option)}
                          className="w-4 h-4 text-action-primary border-border-default focus:ring-action-primary"
                        />
                        <span className="text-sm font-semibold text-text-primary">
                          {option === 'som1'
                            ? 'Som 1'
                            : option === 'som2'
                              ? 'Som 2'
                              : 'Sem notificação'}
                        </span>
                      </label>
                      {option !== 'none' && (
                        <button
                          type="button"
                          onClick={() => playAudioTone(option)}
                          className="flex items-center gap-1.5 text-xs font-bold text-action-primary hover:text-action-primary-hover transition-colors ml-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-action-primary" /> Testar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: Imagem Cardápio */}
          {activeTab === 'menu_image' && (
            <div className="flex flex-col gap-space-4 animate-in fade-in duration-300">
              <div>
                <h2 className="text-text-xl font-bold text-text-primary">4. Imagem cardápio</h2>
                <p className="text-text-xs text-text-secondary mt-0.5">
                  Envie imagens do cardápio ao cliente quando ele estiver com problemas de conexão
                </p>
              </div>

              <ToggleRow
                label="Enviar imagem do cardápio automaticamente"
                description="Quando ativo, o robô anexará essa imagem na mensagem de saudação ou quando o cliente digitar 'cardápio'."
                checked={sendMenuImage}
                onChange={setSendMenuImage}
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleMenuImageUpload}
              />

              {menuImageUrl ? (
                <div className="border border-border-default rounded-radius-xl p-space-6 bg-surface-subtle flex flex-col sm:flex-row gap-space-6 items-center">
                  <div className="w-full sm:w-48 h-48 border border-border-subtle rounded-radius-lg overflow-hidden flex items-center justify-center bg-white shadow-sm shrink-0">
                    <img
                      src={menuImageUrl}
                      alt="Cardápio"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-space-4 w-full">
                    <div>
                      <h4 className="font-bold text-text-primary text-text-base">
                        Imagem Cadastrada
                      </h4>
                      <p className="text-text-xs text-text-secondary mt-0.5">
                        Imagem pronta para envio nas mensagens automáticas.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-space-2">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand font-semibold text-sm px-space-4 py-space-2"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Alterar Imagem
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleMenuImageRemove}
                        className="border border-border-default text-text-primary hover:bg-surface-subtle font-semibold text-sm px-space-4 py-space-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover Imagem
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-action-primary/30 hover:border-action-primary rounded-radius-xl p-space-12 flex flex-col items-center justify-center gap-space-2 text-center cursor-pointer hover:bg-action-primary/5 transition-all duration-300"
                >
                  <div className="text-action-primary p-space-2">
                    <HamburgerSodaIcon className="w-12 h-12 text-[#0084FF]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">Escolha a foto</h4>
                    <p className="text-xs text-text-muted mt-1">
                      Clique aqui ou arraste a<br />
                      foto para cá.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 5: Imagens promoções */}
          {activeTab === 'promo_images' && (
            <div className="flex flex-col gap-space-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-text-xl font-bold text-text-primary">5. Imagem promoção</h2>
              </div>

              {/* Day Tabs */}
              <div className="flex border-b border-border-default overflow-x-auto scrollbar-none">
                {DAYS.map((day) => {
                  const isActive = activePromoDay === day.id;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setActivePromoDay(day.id)}
                      className={cn(
                        'px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0',
                        isActive
                          ? 'border-action-primary text-action-primary'
                          : 'border-transparent text-text-secondary hover:text-text-primary',
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Day Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6 items-start">
                {/* Left Column: Image Upload Box */}
                <div className="flex flex-col gap-space-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Imagem da promoção *
                  </label>

                  {promoByDay[activePromoDay]?.url ? (
                    <div className="border border-border-default rounded-radius-lg p-3 bg-surface-subtle flex flex-col gap-3">
                      <div className="w-full h-44 border border-border-subtle rounded-radius-md overflow-hidden bg-white flex items-center justify-center relative group">
                        <img
                          src={promoByDay[activePromoDay].url}
                          alt="Promoção"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() =>
                            document.getElementById(`promo-file-${activePromoDay}`)?.click()
                          }
                          className="flex-1 bg-action-primary text-text-on-brand text-xs h-9"
                        >
                          <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Alterar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setPromoByDay((prev) => ({
                              ...prev,
                              [activePromoDay]: { ...prev[activePromoDay], url: '' },
                            }));
                          }}
                          className="border border-border-default text-xs h-9"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Excluir
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        document.getElementById(`promo-file-${activePromoDay}`)?.click()
                      }
                      className="border-2 border-dashed border-action-primary/30 hover:border-action-primary rounded-radius-lg p-space-6 flex flex-col items-center justify-center gap-space-2 text-center cursor-pointer hover:bg-action-primary/5 transition-all duration-300"
                    >
                      <div className="text-action-primary p-space-2">
                        <HamburgerSodaIcon className="w-12 h-12 text-[#0084FF]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary text-sm">Escolha a foto</h4>
                        <p className="text-xs text-text-muted mt-1">
                          Clique aqui ou arraste a<br />
                          foto para cá.
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    id={`promo-file-${activePromoDay}`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handlePromoImageUpload(activePromoDay, e.target.files[0]);
                      }
                    }}
                  />

                  <div className="text-[10px] text-text-muted mt-1 leading-normal font-medium">
                    <p>Formatos: .png, .jpg, .jpeg, .webp</p>
                    <p>Peso máximo: 1mb</p>
                    <p>Resolução mínima: 200px</p>
                  </div>
                </div>

                {/* Right Column: Description Textarea */}
                <div className="flex flex-col gap-space-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Descrição
                  </label>
                  <textarea
                    value={promoByDay[activePromoDay]?.description || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPromoByDay((prev) => ({
                        ...prev,
                        [activePromoDay]: { ...prev[activePromoDay], description: val },
                      }));
                    }}
                    rows={6}
                    placeholder="Ex: Confira a nossa nova promoção!"
                    className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md p-space-3 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary resize-none"
                  />
                  <span className="text-[10px] text-text-muted font-medium">
                    A mensagem será enviada como descrição da imagem
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Botão de Salvamento Unificado (Footer) ────────────────────────── */}
          <div className="mt-space-6 pt-space-4 border-t border-border-subtle flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#0084FF] hover:bg-[#0074E0] text-white px-space-8 shadow-button-primary disabled:opacity-50 h-12 rounded-radius-md font-bold transition-all active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
