'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Toast, PageHeader, useToast, Toggle } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number | null;
  max_uses: number | null;
  max_uses_per_customer: number;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
  description: string | null;
  applicable_to: string;
  created_at: string;
}

function CouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon?: Coupon;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [code, setCode] = useState(coupon?.code ?? '');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    coupon?.discount_type ?? 'percentage',
  );
  const [discountValue, setDiscountValue] = useState(coupon?.discount_value ?? 10);
  const [minOrderValue, setMinOrderValue] = useState(coupon?.min_order_value ?? 0);
  const [maxUses, setMaxUses] = useState(coupon?.max_uses ?? 0);
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState(coupon?.max_uses_per_customer ?? 1);
  const [expiresAt, setExpiresAt] = useState(
    coupon?.expires_at ? coupon.expires_at.slice(0, 10) : '',
  );
  const [description, setDescription] = useState(coupon?.description ?? '');
  const [applicableTo, setApplicableTo] = useState(coupon?.applicable_to ?? 'all');
  const [active, setActive] = useState(coupon?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const body = {
        code,
        discount_type: discountType,
        discount_value: discountValue,
        min_order_value: minOrderValue > 0 ? minOrderValue : null,
        max_uses: maxUses > 0 ? maxUses : null,
        max_uses_per_customer: maxUsesPerCustomer,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        description: description || null,
        applicable_to: applicableTo,
        active,
      };

      const method = coupon ? 'PATCH' : 'POST';
      const url = coupon ? `/api/proxy/coupons/${coupon.id}` : '/api/proxy/coupons';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail ?? 'Erro ao salvar cupom');
      }

      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCode(result);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface-card rounded-radius-xl shadow-lg w-full max-w-lg animate-in fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle sticky top-0 bg-surface-card z-10">
          <h2 className="font-bold text-text-primary">{coupon ? 'Editar Cupom' : 'Novo Cupom'}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition p-1 rounded-radius-md hover:bg-surface-subtle cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <FormField label="Código do Cupom" htmlFor="coupon-code" required>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: DESCONTO10"
                required
                className="uppercase font-mono font-bold"
              />
              <Button type="button" variant="secondary" onClick={generateCode} className="shrink-0">
                Gerar
              </Button>
            </div>
          </FormField>

          <FormField label="Descrição (opcional)" htmlFor="coupon-desc">
            <Input
              id="coupon-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Cupom de boas-vindas"
            />
          </FormField>

          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase">
              Tipo de Desconto
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['percentage', 'fixed'] as const).map((type) => (
                <label
                  key={type}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium',
                    discountType === type
                      ? 'border-action-primary bg-action-primary/5 text-action-primary'
                      : 'border-border-default hover:border-border-focus text-text-secondary',
                  )}
                >
                  <input
                    type="radio"
                    checked={discountType === type}
                    onChange={() => setDiscountType(type)}
                    className="sr-only"
                  />
                  {type === 'percentage' ? (
                    <>
                      <Percent className="h-4 w-4" /> Percentual
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" /> Valor Fixo
                    </>
                  )}
                </label>
              ))}
            </div>
          </div>

          <FormField
            label={
              discountType === 'percentage'
                ? 'Percentual de Desconto (%)'
                : 'Valor do Desconto (R$)'
            }
            htmlFor="coupon-value"
            required
          >
            <Input
              id="coupon-value"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              min={0}
              step={discountType === 'percentage' ? 1 : 0.01}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Valor mínimo do pedido (R$)" htmlFor="coupon-min">
              <Input
                id="coupon-min"
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                min={0}
                step={0.01}
              />
            </FormField>
            <FormField label="Data de expiração" htmlFor="coupon-expires">
              <Input
                id="coupon-expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Limite de usos total" htmlFor="coupon-max">
              <Input
                id="coupon-max"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                min={0}
              />
            </FormField>
            <FormField label="Usos por cliente" htmlFor="coupon-per-customer">
              <Input
                id="coupon-per-customer"
                type="number"
                value={maxUsesPerCustomer}
                onChange={(e) => setMaxUsesPerCustomer(Number(e.target.value))}
                min={1}
              />
            </FormField>
          </div>

          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase">Aplicável a</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'delivery', label: 'Delivery' },
                { value: 'pickup', label: 'Retirada' },
                { value: 'dine_in', label: 'Salão' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center justify-center gap-2 p-2.5 border rounded-radius-md cursor-pointer transition-all text-xs font-medium',
                    applicableTo === opt.value
                      ? 'border-action-primary bg-action-primary/5 text-action-primary'
                      : 'border-border-default hover:border-border-focus text-text-secondary',
                  )}
                >
                  <input
                    type="radio"
                    checked={applicableTo === opt.value}
                    onChange={() => setApplicableTo(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border-subtle">
            <span className="text-sm font-medium text-text-primary">Cupom ativo</span>
            <Toggle enabled={active} onToggle={() => setActive(!active)} />
          </div>

          {error && <p className="text-xs text-status-error font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="strong" isLoading={saving} className="flex-1">
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast, show: showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const fetchCoupons = useRef(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/proxy/coupons');
      if (!res.ok) throw new Error();
      setCoupons(await res.json());
    } catch {
      showToastRef.current('error', 'Erro ao carregar cupons.');
    } finally {
      setLoading(false);
    }
  }).current;

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Remover o cupom "${coupon.code}"?`)) return;
    setDeletingId(coupon.id);
    try {
      const res = await fetch(`/api/proxy/coupons/${coupon.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('success', `Cupom "${coupon.code}" removido.`);
      fetchCoupons();
    } catch {
      showToast('error', 'Erro ao remover cupom.');
    } finally {
      setDeletingId(null);
    }
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const handleSaved = () => {
    setShowModal(false);
    showToast('success', editCoupon ? 'Cupom atualizado!' : 'Cupom criado!');
    fetchCoupons();
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expires_at) return false;
    return new Date(coupon.expires_at) < new Date();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR');
    } catch {
      return '—';
    }
  };

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Cupons de Desconto"
        description="Crie e gerencie cupons promocionais para seus clientes."
      >
        <Button
          onClick={() => {
            setEditCoupon(undefined);
            setShowModal(true);
          }}
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Novo Cupom
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="rounded-radius-xl border border-border-default bg-surface-card shadow-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-subtle px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          <div className="col-span-2">Código</div>
          <div className="col-span-2">Desconto</div>
          <div className="col-span-2">Validade</div>
          <div className="col-span-2">Usos</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Aplicável</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>

        <div className="divide-y divide-border-subtle">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando cupons…</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-12 w-12 rounded-radius-full bg-surface-subtle flex items-center justify-center">
                <Ticket className="h-6 w-6 text-text-muted" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">Nenhum cupom cadastrado</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Crie cupons para impulsionar suas vendas.
                </p>
              </div>
            </div>
          ) : (
            coupons.map((coupon) => {
              const expired = isExpired(coupon);
              const active = coupon.active && !expired;
              return (
                <div
                  key={coupon.id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-surface-subtle transition-colors"
                >
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-text-primary bg-surface-subtle px-2 py-1 rounded-radius-sm border border-border-default">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => copyCode(coupon.code, coupon.id)}
                        className="p-1 text-text-muted hover:text-action-primary transition-colors cursor-pointer"
                        title="Copiar código"
                      >
                        {copiedId === coupon.id ? (
                          <CheckCircle className="h-3.5 w-3.5 text-status-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-text-primary">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `R$ ${coupon.discount_value.toFixed(2)}`}
                    </span>
                    {coupon.min_order_value && coupon.min_order_value > 0 && (
                      <span className="text-xs text-text-muted block">
                        Mín: R$ {coupon.min_order_value.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-sm text-text-secondary">
                    {formatDate(coupon.expires_at)}
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-text-secondary">
                      {coupon.current_uses}
                      {coupon.max_uses ? `/${coupon.max_uses}` : ''}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-radius-full',
                        active
                          ? 'bg-status-success/10 text-status-success'
                          : 'bg-status-error/10 text-status-error',
                      )}
                    >
                      {active ? 'Ativo' : expired ? 'Expirado' : 'Inativo'}
                    </span>
                  </div>
                  <div className="col-span-1 text-xs text-text-secondary capitalize">
                    {coupon.applicable_to === 'all'
                      ? 'Todos'
                      : coupon.applicable_to === 'dine_in'
                        ? 'Salão'
                        : coupon.applicable_to === 'pickup'
                          ? 'Retirada'
                          : 'Delivery'}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditCoupon(coupon);
                        setShowModal(true);
                      }}
                      className="p-1.5 text-text-secondary hover:text-action-primary hover:bg-action-primary/10 rounded-radius-md transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      disabled={deletingId === coupon.id}
                      className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-radius-md transition-colors disabled:opacity-30 cursor-pointer"
                      title="Remover"
                    >
                      {deletingId === coupon.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {coupons.length > 0 && (
          <div className="px-6 py-3 border-t border-border-default text-xs text-text-muted">
            {coupons.length} cupom(ns) no total
          </div>
        )}
      </div>

      {showModal && (
        <CouponModal
          coupon={editCoupon}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
