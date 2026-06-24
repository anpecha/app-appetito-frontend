'use client';

import React, { useEffect, useState } from 'react';
import { Map, Save, Loader2, MapPin, Navigation2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, Toast, PageHeader, useToast } from '../../settings/_shared';
import { cn } from '@/lib/utils';

export default function DeliveryAreasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delivery Logic Type
  const [deliveryType, setDeliveryType] = useState<'radius' | 'neighborhoods'>('radius');

  // Radius config (Simplificação para Store Config json_data)
  const [baseRate, setBaseRate] = useState('5.00');
  const [ratePerKm, setRatePerKm] = useState('1.50');
  const [maxDistance, setMaxDistance] = useState('15');

  // Time
  const [estimatedTime, setEstimatedTime] = useState('30-45');

  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/proxy/restaurants/settings');
        if (res.ok) {
          const data = await res.json();
          const json = data.config_json || {};
          const deliv = json.delivery_areas || {};

          if (deliv.type) setDeliveryType(deliv.type);
          if (deliv.baseRate) setBaseRate(deliv.baseRate);
          if (deliv.ratePerKm) setRatePerKm(deliv.ratePerKm);
          if (deliv.maxDistance) setMaxDistance(deliv.maxDistance);
          if (deliv.estimatedTime) setEstimatedTime(deliv.estimatedTime);
        }
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
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
      // First we need to fetch the existing whole config json
      const fetchRes = await fetch('/api/proxy/restaurants/settings');
      const currentData = await fetchRes.json();
      const currentConfigJson = currentData.config_json || {};

      currentConfigJson.delivery_areas = {
        type: deliveryType,
        baseRate,
        ratePerKm,
        maxDistance,
        estimatedTime,
      };

      const res = await fetch('/api/proxy/restaurants/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_json: currentConfigJson,
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar');
      showToast('success', 'Áreas de entrega e taxas salvas!');
    } catch {
      showToast('error', 'Erro ao salvar config do delivery.');
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
        title="Áreas de Entrega e Taxas"
        description="Determine como as taxas de entrega são calculadas: por raio geográfico ou por tabela fixa de bairros."
      />
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-6">
        <SectionCard title="Configuração de Cálculo" icon={Map}>
          <form onSubmit={handleSave} className="flex flex-col gap-space-6">
            {/* Selector */}
            <div className="flex gap-4">
              <div
                onClick={() => setDeliveryType('radius')}
                className={cn(
                  'flex-1 border p-4 rounded-radius-lg cursor-pointer transition-all flex flex-col items-center gap-2 text-center',
                  deliveryType === 'radius'
                    ? 'border-action-primary bg-action-primary/5 shadow-sm'
                    : 'border-border-default bg-surface-card hover:bg-surface-subtle',
                )}
              >
                <Navigation2
                  className={cn(
                    'w-6 h-6',
                    deliveryType === 'radius' ? 'text-action-primary' : 'text-text-muted',
                  )}
                />
                <span
                  className={cn(
                    'font-bold text-sm',
                    deliveryType === 'radius' ? 'text-text-primary' : 'text-text-secondary',
                  )}
                >
                  Por Raio (KM)
                </span>
                <span className="text-xs text-text-muted">
                  Calcula a rota dinâmica do restaurante até o CEP.
                </span>
              </div>
              <div
                onClick={() => setDeliveryType('neighborhoods')}
                className={cn(
                  'flex-1 border p-4 rounded-radius-lg cursor-pointer transition-all flex flex-col items-center gap-2 text-center',
                  deliveryType === 'neighborhoods'
                    ? 'border-action-primary bg-action-primary/5 shadow-sm'
                    : 'border-border-default bg-surface-card hover:bg-surface-subtle',
                )}
              >
                <MapPin
                  className={cn(
                    'w-6 h-6',
                    deliveryType === 'neighborhoods' ? 'text-action-primary' : 'text-text-muted',
                  )}
                />
                <span
                  className={cn(
                    'font-bold text-sm',
                    deliveryType === 'neighborhoods' ? 'text-text-primary' : 'text-text-secondary',
                  )}
                >
                  Por Bairros
                </span>
                <span className="text-xs text-text-muted">
                  Tabela fixa de bairros com taxa estática para sua cidade.
                </span>
              </div>
            </div>

            {deliveryType === 'radius' && (
              <div className="flex flex-col gap-space-4 p-4 bg-surface-subtle border border-border-subtle rounded-radius-md animate-in fade-in">
                <h4 className="font-bold text-sm text-text-primary border-b border-border-default pb-2">
                  Precificação por KM (Google Maps API)
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-bold text-text-secondary ml-1">
                      Taxa Base (Saída)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={baseRate}
                        onChange={(e) => setBaseRate(e.target.value)}
                        className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md pl-9 pr-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-bold text-text-secondary ml-1">
                      Valor por KM Adicional
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={ratePerKm}
                        onChange={(e) => setRatePerKm(e.target.value)}
                        className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md pl-9 pr-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-bold text-text-secondary ml-1">
                    Distância Máxima de Cobertura (KM)
                  </label>
                  <input
                    type="number"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-32 text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
                  />
                  <p className="text-[11px] text-text-muted ml-1">
                    Pedidos além dessa distância do seu restaurante serão rejeitados
                    automaticamente.
                  </p>
                </div>
              </div>
            )}

            {deliveryType === 'neighborhoods' && (
              <div className="flex flex-col h-[200px] justify-center items-center bg-surface-subtle border border-border-subtle rounded-radius-md animate-in fade-in">
                <DollarSign className="h-8 w-8 text-text-muted mb-2" />
                <span className="font-bold text-sm text-text-secondary">
                  Em breve: Tabela interativa de bairros.
                </span>
                <span className="text-xs text-text-muted text-center max-w-[200px]">
                  Atualmente ativado via Importação do XML dos Correios (solicitar suporte).
                </span>
              </div>
            )}

            <div className="border-t border-border-default pt-4 flex flex-col gap-2 relative">
              <label className="text-xs font-bold text-text-secondary ml-1">
                Tempo de Entrega Prometido
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-1/2 text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all font-medium text-text-primary"
                placeholder="ex: 45-60 min"
              />
              <p className="text-[11px] text-text-muted ml-1">
                Tempo médio em minutos exibido no cardápio antes da compra.
              </p>
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
              Salvar Áreas
            </Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
