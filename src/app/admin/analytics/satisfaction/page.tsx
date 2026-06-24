'use client';

import React, { useEffect, useState } from 'react';
import {
  Smile,
  Loader2,
  Star,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  Meh,
  Frown,
} from 'lucide-react';
import { Toast, PageHeader, useToast, SectionCard, InfoCard } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface FeedbackEntry {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  order_id: string;
}

interface SatisfactionSummary {
  avg_rating: number;
  total_responses: number;
  positive_percent: number;
  neutral_percent: number;
  negative_percent: number;
  recent_feedback: FeedbackEntry[];
}

export default function SatisfactionPage() {
  const [data, setData] = useState<SatisfactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const result = await res.json();
        const stored = result?.config_json?.satisfaction_data;
        if (stored) setData(stored);
        else
          setData({
            avg_rating: 0,
            total_responses: 0,
            positive_percent: 0,
            neutral_percent: 0,
            negative_percent: 0,
            recent_feedback: [],
          });
      } catch {
        showToast('error', 'Erro ao carregar dados de satisfação.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn('h-4 w-4', i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200')}
      />
    ));
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4) return { label: 'Positivo', color: 'text-status-success', icon: ThumbsUp };
    if (rating >= 3) return { label: 'Neutro', color: 'text-amber-500', icon: Meh };
    return { label: 'Negativo', color: 'text-status-error', icon: Frown };
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR');
    } catch {
      return '—';
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center py-space-20">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Satisfação dos Clientes"
        description="Acompanhe o feedback e a satisfação dos seus clientes."
      />

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Avaliação Média',
            value: data ? `${data.avg_rating.toFixed(1)}/5` : '—',
            icon: Star,
            color: 'text-amber-500',
            bg: 'bg-amber-100',
          },
          {
            label: 'Total de Respostas',
            value: String(data?.total_responses || 0),
            icon: MessageSquare,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
          },
          {
            label: 'Positivas',
            value: `${data?.positive_percent || 0}%`,
            icon: ThumbsUp,
            color: 'text-green-600',
            bg: 'bg-green-100',
          },
          {
            label: 'Negativas',
            value: `${data?.negative_percent || 0}%`,
            icon: Frown,
            color: 'text-red-600',
            bg: 'bg-red-100',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-card border border-border-default rounded-radius-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {kpi.label}
              </p>
              <div className={cn('p-2 rounded-radius-lg', kpi.bg)}>
                <kpi.icon className={cn('h-4 w-4', kpi.color)} />
              </div>
            </div>
            <p className={cn('text-2xl font-black', kpi.color)}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Satisfaction Bars */}
      <SectionCard
        title="Distribuição"
        icon={Smile}
        description="Distribuição das avaliações dos clientes."
      >
        <div className="space-y-4">
          {[
            {
              label: 'Positivas (4-5)',
              percent: data?.positive_percent || 0,
              color: 'bg-green-500',
            },
            { label: 'Neutras (3)', percent: data?.neutral_percent || 0, color: 'bg-amber-400' },
            { label: 'Negativas (1-2)', percent: data?.negative_percent || 0, color: 'bg-red-500' },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-text-primary">{bar.label}</span>
                <span className="font-bold text-text-primary">{bar.percent}%</span>
              </div>
              <div className="h-3 bg-surface-subtle rounded-radius-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-radius-full transition-all duration-1000',
                    bar.color,
                  )}
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recent Feedback */}
      <SectionCard
        title="Feedbacks Recentes"
        icon={MessageSquare}
        description="Últimas avaliações e comentários dos clientes."
      >
        {data?.recent_feedback && data.recent_feedback.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {data.recent_feedback.map((fb) => {
              const ratingInfo = getRatingLabel(fb.rating);
              return (
                <div key={fb.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-radius-full bg-surface-subtle flex items-center justify-center text-sm font-bold text-text-secondary">
                        {fb.customer_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          {fb.customer_name || 'Anônimo'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(fb.rating)}</div>
                          <span className={cn('text-xs font-bold', ratingInfo.color)}>
                            {ratingInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted">{formatDate(fb.created_at)}</span>
                  </div>
                  {fb.comment && (
                    <p className="text-sm text-text-secondary ml-10 mt-1 italic">
                      &quot;{fb.comment}&quot;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Smile className="h-10 w-10 text-text-muted/30 mb-3" />
            <p className="text-sm font-medium text-text-muted">Nenhum feedback recebido ainda</p>
            <p className="text-xs text-text-muted mt-1">
              Os feedbacks dos clientes aparecerão aqui após ativar a pesquisa de satisfação no
              Robô.
            </p>
          </div>
        )}
      </SectionCard>

      <InfoCard icon={TrendingUp}>
        Ative a pesquisa de satisfação nas configurações do Robô para começar a coletar feedback dos
        clientes automaticamente após cada pedido.
      </InfoCard>
    </div>
  );
}
