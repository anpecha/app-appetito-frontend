'use client';

import React, { useEffect, useState } from 'react';
import { Bike, Plus, Trash2, MapPin, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard, Toast, PageHeader, InfoCard, useToast } from '../_shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryZone {
  id: string;
  name: string;
  fee_cents: number;
  estimated_minutes: number;
}

function newZone(): DeliveryZone {
  return { id: crypto.randomUUID(), name: '', fee_cents: 0, estimated_minutes: 30 };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DeliverySettingsPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();

        const storedZones: DeliveryZone[] = data?.config_json?.delivery_zones ?? [];
        setZones(storedZones.map((z) => ({ ...z, id: z.id ?? crypto.randomUUID() })));

        const deliverySettings = data?.config_json?.delivery_settings ?? {};
        setMinOrder(deliverySettings.min_order_cents ?? 0);
        setFreeDeliveryAbove(deliverySettings.free_delivery_above_cents ?? null);
      } catch {
        showToast('error', 'Erro ao carregar zonas de entrega.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function addZone() {
    setZones((prev) => [...prev, newZone()]);
  }
  function removeZone(id: string) {
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  function updateZone<K extends keyof DeliveryZone>(id: string, key: K, value: DeliveryZone[K]) {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, [key]: value } : z)));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const invalid = zones.find((z) => !z.name.trim());
    if (invalid) {
      showToast('error', 'Todas as zonas precisam de um nome.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/proxy/settings/restaurant');
      if (!res.ok) throw new Error('Falha ao carregar restaurante');
      const current = await res.json();

      const patch = await fetch('/api/proxy/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_json: {
            ...(current.config_json ?? {}),
            delivery_zones: zones,
            delivery_settings: {
              min_order_cents: minOrder,
              free_delivery_above_cents: freeDeliveryAbove,
            },
          },
        }),
      });

      if (!patch.ok) {
        const err = await patch.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Erro ao salvar');
      }
      showToast('success', 'Zonas de entrega salvas com sucesso!');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro desconhecido');
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
    <div className="flex flex-col gap-space-8 pb-space-12">
      <PageHeader
        title="Entregadores"
        description="Configure as zonas de entrega, taxas e tempo estimado."
      >
        <Button form="delivery-form" type="submit" variant="primary" isLoading={saving}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="delivery-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        <SectionCard title="Configurações Gerais de Entrega" icon={Bike}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
            <div className="space-y-space-2">
              <label className="text-text-sm font-bold text-text-secondary ml-1">
                Valor Mínimo do Pedido (Delivery)
              </label>
              <div className="flex items-center rounded-radius-sm border border-border-default bg-surface-card focus-within:ring-2 focus-within:ring-border-focus transition overflow-hidden">
                <span className="px-space-4 bg-surface-subtle border-r border-border-default text-text-muted text-sm font-medium py-3">
                  R$
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={(minOrder / 100).toFixed(2)}
                  onChange={(e) => setMinOrder(Math.round(Number(e.target.value) * 100))}
                  className="w-full text-sm font-medium bg-transparent px-space-4 py-3 outline-none text-text-primary"
                />
              </div>
              <p className="text-xs text-text-muted ml-1">
                Pedidos abaixo deste valor não poderão ser concluídos via delivery.
              </p>
            </div>

            <div className="space-y-space-2">
              <label className="text-text-sm font-bold text-text-secondary ml-1">
                Entrega Grátis a partir de (Opcional)
              </label>
              <div className="flex items-center rounded-radius-sm border border-border-default bg-surface-card focus-within:ring-2 focus-within:ring-border-focus transition overflow-hidden">
                <span className="px-space-4 bg-surface-subtle border-r border-border-default text-text-muted text-sm font-medium py-3">
                  R$
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={freeDeliveryAbove === null ? '' : (freeDeliveryAbove / 100).toFixed(2)}
                  onChange={(e) =>
                    setFreeDeliveryAbove(
                      e.target.value ? Math.round(Number(e.target.value) * 100) : null,
                    )
                  }
                  placeholder="Deixe em branco para desativar"
                  className="w-full text-sm font-medium bg-transparent px-space-4 py-3 outline-none text-text-primary"
                />
              </div>
              <p className="text-xs text-text-muted ml-1">
                Acima deste valor de subtotal, a entrega será gratuita independente da zona.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Zonas de Entrega" icon={MapPin}>
          {zones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-space-12 gap-space-4 text-center">
              <div className="h-12 w-12 rounded-radius-full bg-surface-subtle flex items-center justify-center">
                <Bike className="h-6 w-6 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Nenhuma zona configurada</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Adicione zonas de entrega com taxas e tempos estimados.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-space-3">
              <div className="hidden md:grid grid-cols-[1fr_120px_120px_40px] gap-space-3 text-xs font-medium text-text-muted uppercase tracking-wide pb-space-2 border-b border-border-subtle">
                <span>Nome da Zona</span>
                <span className="text-right">Taxa (R$)</span>
                <span className="text-right">Tempo (min)</span>
                <span />
              </div>

              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="grid md:grid-cols-[1fr_120px_120px_40px] grid-cols-1 gap-space-3 items-center md:border-b border-border-subtle md:pb-space-3 bg-surface-subtle md:bg-transparent rounded-radius-lg md:rounded-none p-space-3 md:p-0"
                >
                  <Input
                    value={zone.name}
                    onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                    placeholder="Ex: Centro, Zona Sul…"
                    required
                  />

                  {/* Taxa */}
                  <div className="flex items-center gap-space-1">
                    <span className="text-xs text-text-muted md:hidden">Taxa:</span>
                    <div className="flex items-center rounded-radius-sm border border-border-default bg-surface-card overflow-hidden focus-within:ring-2 focus-within:ring-border-focus transition flex-1">
                      <span className="px-space-2 py-1.5 text-xs text-text-muted bg-surface-subtle border-r border-border-default">
                        R$
                      </span>
                      <input
                        type="number"
                        value={(zone.fee_cents / 100).toFixed(2)}
                        onChange={(e) =>
                          updateZone(zone.id, 'fee_cents', Math.round(Number(e.target.value) * 100))
                        }
                        min={0}
                        step={0.5}
                        className="flex-1 px-space-2 py-1.5 text-sm text-text-primary text-right bg-transparent focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* Tempo */}
                  <div className="flex items-center gap-space-1">
                    <span className="text-xs text-text-muted md:hidden">Tempo:</span>
                    <div className="flex items-center rounded-radius-sm border border-border-default bg-surface-card overflow-hidden focus-within:ring-2 focus-within:ring-border-focus transition flex-1">
                      <input
                        type="number"
                        value={zone.estimated_minutes}
                        onChange={(e) =>
                          updateZone(zone.id, 'estimated_minutes', Number(e.target.value))
                        }
                        min={5}
                        className="flex-1 px-space-2 py-1.5 text-sm text-text-primary text-right bg-transparent focus:outline-none"
                      />
                      <span className="px-space-2 py-1.5 text-xs text-text-muted bg-surface-subtle border-l border-border-default">
                        min
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeZone(zone.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-radius-md text-status-error hover:bg-status-error/10 transition cursor-pointer mx-auto"
                    title="Remover zona"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={addZone}
            leftIcon={<Plus className="h-4 w-4" />}
            className="mt-space-4 w-full border-2 border-dashed border-border-default text-text-muted hover:border-action-primary hover:text-action-primary"
          >
            Adicionar zona de entrega
          </Button>
        </SectionCard>

        <InfoCard icon={Clock}>
          O tempo estimado de entrega é exibido no checkout e na tela de rastreamento do cliente. A
          taxa de entrega é somada ao total do pedido.
        </InfoCard>
      </form>
    </div>
  );
}
