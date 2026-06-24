'use client';

import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock, CheckCircle2, AlertTriangle, History, Wifi, Loader2,
  Smartphone, MessageCircle, Globe, Store,
} from 'lucide-react';
import { Order, OrderItem, AddonOption } from '@/types/order';
import { cn } from '@/lib/utils';

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle className="h-3 w-3" />, color: 'text-green-700', bg: 'bg-green-100' },
  telegram: { label: 'Telegram', icon: <MessageCircle className="h-3 w-3" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  facebook: { label: 'Facebook', icon: <MessageCircle className="h-3 w-3" />, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  instagram: { label: 'Instagram', icon: <Smartphone className="h-3 w-3" />, color: 'text-pink-700', bg: 'bg-pink-100' },
  ifood: { label: 'iFood', icon: <Globe className="h-3 w-3" />, color: 'text-red-700', bg: 'bg-red-100' },
  uber_eats: { label: 'Uber Eats', icon: <Globe className="h-3 w-3" />, color: 'text-green-700', bg: 'bg-green-100' },
  balcao: { label: 'Balcão', icon: <Store className="h-3 w-3" />, color: 'text-amber-700', bg: 'bg-amber-100' },
  website: { label: 'Site', icon: <Globe className="h-3 w-3" />, color: 'text-gray-700', bg: 'bg-gray-100' },
};

function SourceBadge({ source }: { source?: string }) {
  const cfg = SOURCE_CONFIG[source ?? 'website'] ?? SOURCE_CONFIG.website;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.bg}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

const POLL_INTERVAL_MS = 15_000;
const DELAY_THRESHOLD_MINUTES = 15; // Mark as delayed after 15 mins

// ─── Web Audio beep ───────────────────────────────────────────────────────────
function playNewOrderSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const playBeep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playBeep(880, 0, 0.15);
    playBeep(1100, 0.18, 0.15);
    playBeep(880, 0.36, 0.25);
  } catch {
    // Audio not available
  }
}

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(new Date());

  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/proxy/orders/');
      if (!res.ok) throw new Error('Falha ao buscar pedidos');
      const data: Order[] = (await res.json()) || [];

      // Filter for active kitchen orders (preparing)
      const activeOrders = data.filter((o) => o.status === 'preparing');

      setOrders(activeOrders);

      // Sound notifications for new "preparing" orders
      if (!isFirstFetch.current) {
        const incomingIds = new Set(activeOrders.map((o) => o.id));
        const freshIds = Array.from(incomingIds).filter((id) => !knownIdsRef.current.has(id));

        if (freshIds.length > 0) {
          playNewOrderSound();
          setNewOrderIds((prev) => new Set([...Array.from(prev), ...freshIds]));
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const updated = new Set(Array.from(prev));
              freshIds.forEach((id) => updated.delete(id));
              return updated;
            });
          }, 10_000);
        }
      }

      knownIdsRef.current = new Set(Array.from(activeOrders.map((o) => o.id)));
      isFirstFetch.current = false;
      setNow(new Date());
    } catch {
      setError('Erro ao carregar pedidos para produção.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), POLL_INTERVAL_MS);
    const timeInterval = setInterval(() => setNow(new Date()), 10_000); // UI update every 10s
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [fetchOrders]);

  const advanceOrder = async (orderId: string) => {
    // Optimistic update
    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    try {
      const res = await fetch(`/api/proxy/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' }),
      });
      if (!res.ok) throw new Error();
    } catch {
      fetchOrders(true); // rollback
    }
  };

  const getFormattedTime = (isoString: string) => {
    const start = new Date(isoString);
    const diffMs = now.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isDelayed = (isoString: string) => {
    const start = new Date(isoString);
    const diffMs = now.getTime() - start.getTime();
    return diffMs / 60000 > DELAY_THRESHOLD_MINUTES;
  };

  // Stats calculation
  const totalAtivos = orders.length;
  const totalAtrasados = orders.filter((o) => isDelayed(o.created_at)).length;
  const totalNoPrazo = totalAtivos - totalAtrasados;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-8 -my-8 bg-[#F9FAFB] overflow-hidden">
      {/* ─── KDS Header ─── */}
      <div className="bg-white border-b border-gray-200 px-space-8 py-space-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-[#202020] uppercase tracking-tighter leading-none">
            Pedidos em Produção
          </h1>
        </div>

        <div className="flex items-center gap-space-4">
          {/* Status Badges */}
          <div className="flex items-center gap-space-2 mr-space-2">
            <div className="bg-[#FFF8E1] text-[#A66C02] px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[80px] border border-[#FFECB3]">
              <span className="text-[9px] font-black uppercase tracking-wider">Ativos</span>
              <span className="text-lg font-black leading-none">{totalAtivos}</span>
            </div>
            <div className="bg-[#E8F5E9] text-[#2E7D32] px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[80px] border border-[#C8E6C9]">
              <span className="text-[9px] font-black uppercase tracking-wider">No Prazo</span>
              <span className="text-lg font-black leading-none">{totalNoPrazo}</span>
            </div>
            <div className="bg-[#FFEBEE] text-[#C62828] px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[80px] border border-[#FFCDD2]">
              <span className="text-[9px] font-black uppercase tracking-wider">Atrasados</span>
              <span className="text-lg font-black leading-none">{totalAtrasados}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="gap-2 h-12 rounded-2xl border-gray-200 font-bold text-[#202020] shadow-sm"
          >
            <History className="h-5 w-5" />
            Histórico
          </Button>

          <div className="h-10 w-px bg-gray-200 mx-space-2" />

          <div className="flex items-center gap-1.5">
            <div className="text-right">
              <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
                Cozinha #1
              </p>
              <p className="text-[10px] font-black text-[#202020] uppercase">Chapa Principal</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FFC72E] flex items-center justify-center font-black text-base text-[#202020]">
              M1
            </div>
          </div>
        </div>
      </div>

      {/* ─── Orders Grid Area ─── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#F4F5F7] p-space-6">
        <div className="flex h-full gap-space-6 items-start pb-4">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-gray-300" />
              <p className="text-xl font-black uppercase tracking-widest">Carregando pedidos...</p>
            </div>
          ) : error ? (
            <div className="w-full flex flex-col items-center justify-center h-full text-status-error gap-4">
              <AlertTriangle className="h-12 w-12" />
              <p className="font-bold text-lg">{error}</p>
              <Button onClick={() => fetchOrders()}>Tentar Novamente</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-xl font-black uppercase tracking-widest">
                Sem pedidos em produção
              </p>
            </div>
          ) : (
            orders.map((order: Order) => {
              const delayed = isDelayed(order.created_at);
              const isNew = newOrderIds.has(order.id);
              const timeStr = getFormattedTime(order.created_at);

              return (
                <Card
                  key={order.id}
                  className={cn(
                    'w-[190px] max-h-full flex flex-col bg-white border-0 shadow-lg rounded-xl overflow-hidden shrink-0 transition-all duration-500',
                    delayed ? 'ring-4 ring-[#C62828] shadow-[#C62828]/10' : 'ring-1 ring-gray-100',
                    isNew && 'animate-pulse',
                  )}
                >
                  {/* Card Header */}
                  <div
                    className={cn(
                      'p-1.5 flex items-start justify-between min-h-[40px]',
                      delayed ? 'bg-[#FFEBEE]/30' : 'bg-white',
                    )}
                  >
                    <div>
                      <h3 className="text-base font-medium text-[#202020] tracking-tighter leading-tight">
                        #{order.id.split('-')[0].toUpperCase()}
                      </h3>
                      <p
                        className={cn(
                          'text-[7px] font-medium uppercase tracking-[0.1em] mt-0.5',
                          delayed ? 'text-[#C62828]' : 'text-gray-400',
                        )}
                      >
                        {order.type === 'local'
                          ? `MESA ${order.table_id || 'S/M'}`
                          : order.type === 'delivery'
                            ? 'DELIVERY'
                            : 'RETIRADA'}
                      </p>
                      <div className="mt-1">
                        <SourceBadge source={order.order_source} />
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          'text-base font-medium tracking-tighter leading-none',
                          delayed ? 'text-[#C62828]' : 'text-[#202020]',
                        )}
                      >
                        {timeStr}
                      </span>
                      {delayed ? (
                        <span className="text-[7px] font-medium text-[#C62828] uppercase tracking-widest text-[0.6rem]">
                          ATRASADO
                        </span>
                      ) : (
                        <span className="text-[7px] font-medium text-gray-300 uppercase tracking-widest text-[0.6rem]">
                          RECEBIDO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="flex-1 overflow-y-auto px-2 space-y-2 py-1 custom-scrollbar">
                    {(order.items || order.order_items || []).map(
                      (item: OrderItem, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5 group">
                          <div className="font-medium text-sm text-[#202020] shrink-0 pt-0.5">
                            {item.quantity}x
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-sm font-medium text-[#202020] leading-tight tracking-tight uppercase">
                                {item.product_name}
                              </h4>
                              <div
                                className={cn(
                                  'w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors',
                                  delayed
                                    ? 'border-[#C62828]/20 bg-[#C62828]/5'
                                    : 'border-gray-100 bg-gray-50',
                                )}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-[#FFC72E] transition-colors" />
                              </div>
                            </div>

                            {/* Modifiers */}
                            <div className="mt-space-2 space-y-1 ml-space-1">
                              {item.options?.addons?.map((addon: AddonOption, aIdx: number) => (
                                <div
                                  key={aIdx}
                                  className="flex items-center gap-2 text-xs font-normal text-gray-500 uppercase italic"
                                >
                                  <span className="text-[#DA291C] text-base leading-none">•</span>
                                  {addon.name}
                                </div>
                              ))}
                              {item.notes && (
                                <div className="flex items-center gap-2 text-xs font-normal text-[#C62828] uppercase italic mt-2">
                                  <span className="text-[#C62828] text-base leading-none">•</span>
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Finalize Button */}
                  <div className="p-2 pt-1">
                    <Button
                      className="w-full h-8 rounded-lg bg-[#FFC72E] hover:bg-[#F2BD29] text-[#202020] text-[10px] font-semibold uppercase tracking-widest shadow-md shadow-[#FFC72E]/10 transition-all border-none"
                      onClick={() => advanceOrder(order.id)}
                    >
                      Pronto
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* ─── KDS Footer ─── */}
      <div className="bg-white border-t border-gray-200 px-space-8 py-space-3 flex items-center justify-between shrink-0 h-16">
        <div className="flex items-center gap-space-8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#202020]">
              Monitor de Cozinha Ativo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Conectado ao PDV
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-12">
          {/* Workload Indicator */}
          <div className="flex items-center gap-space-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Carga de Trabalho
            </span>
            <div className="w-48 h-2.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className={cn(
                  'h-full transition-all duration-1000',
                  totalAtivos > 10
                    ? 'bg-[#C62828]'
                    : totalAtivos > 5
                      ? 'bg-[#FFC72E]'
                      : 'bg-[#2E7D32]',
                )}
                style={{ width: `${Math.min(totalAtivos * 10, 100)}%` }}
              />
            </div>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#202020]" />
            <span className="text-lg font-black text-[#202020] tracking-tighter">
              {now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
