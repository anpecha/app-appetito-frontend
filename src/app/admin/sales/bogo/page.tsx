'use client';

import React, { useEffect, useState } from 'react';
import { Save, Gem, Loader2, Plus, Trash2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ToggleRow,
  Toast,
  SectionCard,
  PageHeader,
  useToast,
  Toggle,
  InfoCard,
} from '@/app/admin/settings/_shared';

interface BogoPromotion {
  id: string;
  name: string;
  description: string;
  active: boolean;
  buy_quantity: number;
  get_quantity: number;
  discount_percent: number;
  applicable_categories: string[];
  applicable_products: string[];
  max_uses_per_order: number;
  auto_apply: boolean;
  start_date: string;
  end_date: string;
}

const DEFAULT_BOGO: BogoPromotion = {
  id: '',
  name: '',
  description: '',
  active: true,
  buy_quantity: 1,
  get_quantity: 1,
  discount_percent: 100,
  applicable_categories: [],
  applicable_products: [],
  max_uses_per_order: 1,
  auto_apply: true,
  start_date: '',
  end_date: '',
};

export default function BogoPage() {
  const [promotions, setPromotions] = useState<BogoPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.bogo_promotions;
        if (stored?.length) setPromotions(stored);
      } catch {
        showToast('error', 'Erro ao carregar promoções.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function addPromotion() {
    setPromotions((prev) => [...prev, { ...DEFAULT_BOGO, id: String(Date.now()) }]);
  }

  function removePromotion(id: string) {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePromotion(id: string, field: keyof BogoPromotion, value: any) {
    setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
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
          config_json: { ...(current.config_json ?? {}), bogo_promotions: promotions },
        }),
      });
      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Promoções salvas com sucesso!');
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
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-5xl animate-in fade-in duration-500">
      <PageHeader
        title="Compre + Ganhe +"
        description="Crie promoções do tipo Compre X e Ganhe Y com desconto."
      >
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={addPromotion}
          >
            Nova Promoção
          </Button>
          <Button
            form="bogo-form"
            type="submit"
            className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand px-space-8 font-bold h-12 shadow-button-primary transition-all active:scale-[0.98]"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salvar
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="bogo-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        {promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-card border border-border-default rounded-radius-xl">
            <div className="h-16 w-16 rounded-radius-full bg-surface-subtle flex items-center justify-center">
              <Gem className="h-8 w-8 text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-text-primary">Nenhuma promoção cadastrada</p>
              <p className="text-sm text-text-muted mt-1">
                Crie promoções Compre + Ganhe + para atrair mais clientes.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={addPromotion}
            >
              Criar Promoção
            </Button>
          </div>
        ) : (
          promotions.map((promo, idx) => (
            <SectionCard
              key={promo.id}
              title={`${idx + 1}. ${promo.name || 'Nova Promoção'}`}
              icon={Gem}
              action={
                <button
                  type="button"
                  onClick={() => removePromotion(promo.id)}
                  className="p-2 text-text-muted hover:text-status-error transition-colors cursor-pointer"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              }
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Nome da Promoção
                    </label>
                    <Input
                      value={promo.name}
                      onChange={(e) => updatePromotion(promo.id, 'name', e.target.value)}
                      placeholder="Ex: Leve 2 Pague 1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Descrição
                    </label>
                    <Input
                      value={promo.description}
                      onChange={(e) => updatePromotion(promo.id, 'description', e.target.value)}
                      placeholder="Ex: Na compra de 2 pizzas, a 2ª sai pela metade do preço"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Regra
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-text-secondary">Compre</span>
                    <div className="flex items-center border border-border-default rounded-radius-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updatePromotion(
                            promo.id,
                            'buy_quantity',
                            Math.max(1, promo.buy_quantity - 1),
                          )
                        }
                        className="px-3 py-2 text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-bold text-text-primary border-x border-border-default bg-surface-card min-w-[3rem] text-center">
                        {promo.buy_quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePromotion(promo.id, 'buy_quantity', promo.buy_quantity + 1)
                        }
                        className="px-3 py-2 text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-text-secondary">e leve</span>
                    <div className="flex items-center border border-border-default rounded-radius-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updatePromotion(
                            promo.id,
                            'get_quantity',
                            Math.max(1, promo.get_quantity - 1),
                          )
                        }
                        className="px-3 py-2 text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-bold text-text-primary border-x border-border-default bg-surface-card min-w-[3rem] text-center">
                        {promo.get_quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePromotion(promo.id, 'get_quantity', promo.get_quantity + 1)
                        }
                        className="px-3 py-2 text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-text-secondary">com</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={promo.discount_percent}
                        onChange={(e) =>
                          updatePromotion(promo.id, 'discount_percent', Number(e.target.value))
                        }
                        min={0}
                        max={100}
                        className="w-20 h-10 text-center"
                      />
                      <span className="text-sm font-bold text-text-primary">% de desconto</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Início
                    </label>
                    <Input
                      type="date"
                      value={promo.start_date}
                      onChange={(e) => updatePromotion(promo.id, 'start_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Fim
                    </label>
                    <Input
                      type="date"
                      value={promo.end_date}
                      onChange={(e) => updatePromotion(promo.id, 'end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Máximo de usos por pedido
                    </label>
                    <Input
                      type="number"
                      value={promo.max_uses_per_order}
                      onChange={(e) =>
                        updatePromotion(promo.id, 'max_uses_per_order', Number(e.target.value))
                      }
                      min={1}
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <ToggleRow
                      label="Aplicar automaticamente"
                      description="Promoção é aplicada sem o cliente precisar inserir código."
                      checked={promo.auto_apply}
                      onChange={(v) => updatePromotion(promo.id, 'auto_apply', v)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-action-primary" />
                    <span className="text-sm font-medium text-text-primary">Promoção ativa</span>
                  </div>
                  <Toggle
                    enabled={promo.active}
                    onToggle={() => updatePromotion(promo.id, 'active', !promo.active)}
                  />
                </div>
              </div>
            </SectionCard>
          ))
        )}

        <InfoCard icon={Gift}>
          As promoções Compre + Ganhe + são自动amente aplicadas no carrinho do cliente quando as
          condições são atendidas. Ideal para aumentar o ticket médio.
        </InfoCard>
      </form>
    </div>
  );
}
