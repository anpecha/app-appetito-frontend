'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, Plus, Edit2, Trash2, Loader2, X, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Toast, PageHeader, useToast } from '@/app/admin/settings/_shared';

interface Waiter {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  pin_code?: string;
  active: boolean;
  created_at: string;
}

function WaiterModal({
  waiter,
  onClose,
  onSaved,
}: {
  waiter?: Waiter;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(waiter?.name ?? '');
  const [email, setEmail] = useState(waiter?.email ?? '');
  const [phone, setPhone] = useState(waiter?.phone ?? '');
  const [pinCode, setPinCode] = useState(waiter?.pin_code ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const method = waiter ? 'PATCH' : 'POST';
      const url = waiter ? `/api/proxy/settings/staff/${waiter.id}` : '/api/proxy/settings/staff';
      const body = waiter
        ? JSON.stringify({ name, role: 'waiter', phone, pin_code: pinCode })
        : JSON.stringify({ name, email, role: 'waiter', phone, pin_code: pinCode });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail ?? 'Erro ao salvar garçom');
      }

      if (waiter) {
        const patch = await fetch('/api/proxy/settings/restaurant');
        if (patch.ok) {
          const current = await patch.json();
          const waiters = current?.config_json?.waiters ?? [];
          const idx = waiters.findIndex((w: any) => w.id === waiter.id);
          const updated = { id: waiter.id, name, phone, pin_code: pinCode, active: true };
          if (idx >= 0) waiters[idx] = updated;
          else waiters.push(updated);
          await fetch('/api/proxy/settings/restaurant', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config_json: { ...(current.config_json ?? {}), waiters },
            }),
          });
        }
      }

      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface-card rounded-radius-xl shadow-lg w-full max-w-md animate-in fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="font-bold text-text-primary">
            {waiter ? 'Editar Garçom' : 'Adicionar Garçom'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition p-1 rounded-radius-md hover:bg-surface-subtle cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nome completo" htmlFor="waiter-name" required>
            <Input
              id="waiter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Garçom"
              required
            />
          </FormField>

          {!waiter && (
            <FormField label="E-mail" htmlFor="waiter-email" required>
              <Input
                id="waiter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                required
              />
            </FormField>
          )}

          <FormField label="Telefone" htmlFor="waiter-phone">
            <Input
              id="waiter-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </FormField>

          <FormField label="Código PIN (app garçom)" htmlFor="waiter-pin">
            <Input
              id="waiter-pin"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="1234"
              maxLength={6}
            />
          </FormField>

          {error && (
            <p className="text-xs text-status-error font-medium animate-in fade-in">{error}</p>
          )}

          <div className="flex gap-space-3 pt-space-2">
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

export default function WaitersSettingsPage() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editWaiter, setEditWaiter] = useState<Waiter | undefined>(undefined);
  const { toast, show: showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const fetchWaiters = useRef(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/proxy/settings/staff');
      if (!res.ok) throw new Error('Falha ao carregar');
      const allStaff: Waiter[] = await res.json();
      setWaiters(allStaff.filter((s) => s.role === 'waiter'));
    } catch {
      showToastRef.current('error', 'Erro ao carregar garçons.');
    } finally {
      setLoading(false);
    }
  }).current;

  useEffect(() => {
    fetchWaiters();
  }, [fetchWaiters]);

  async function handleDelete(waiter: Waiter) {
    if (!confirm(`Remover "${waiter.name}" da equipe de garçons?`)) return;
    setDeletingId(waiter.id);
    try {
      const res = await fetch(`/api/proxy/settings/staff/${waiter.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('success', `"${waiter.name}" removido com sucesso.`);
      fetchWaiters();
    } catch {
      showToast('error', 'Erro ao remover garçom.');
    } finally {
      setDeletingId(null);
    }
  }

  const openAdd = () => {
    setEditWaiter(undefined);
    setShowModal(true);
  };
  const openEdit = (w: Waiter) => {
    setEditWaiter(w);
    setShowModal(true);
  };

  const handleSaved = () => {
    setShowModal(false);
    showToast('success', editWaiter ? 'Garçom atualizado!' : 'Garçom adicionado!');
    fetchWaiters();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Meus Garçons"
        description="Gerencie os garçons do seu salão — cadastro, PIN e acesso ao app."
      >
        <Button onClick={openAdd} variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          Adicionar Garçom
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="rounded-radius-xl border border-border-default bg-surface-card shadow-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-subtle px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          <div className="col-span-3">Nome</div>
          <div className="col-span-3">E-mail</div>
          <div className="col-span-2">Telefone</div>
          <div className="col-span-1">PIN</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Desde</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        <div className="divide-y divide-border-subtle">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando garçons…</span>
            </div>
          ) : waiters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-12 w-12 rounded-radius-full bg-surface-subtle flex items-center justify-center">
                <Users className="h-6 w-6 text-text-muted" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">Nenhum garçom cadastrado</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Adicione garçons para operar o salão.
                </p>
              </div>
              <button
                onClick={openAdd}
                className="text-sm text-action-primary font-semibold hover:underline cursor-pointer"
              >
                Adicionar primeiro garçom →
              </button>
            </div>
          ) : (
            waiters.map((waiter) => (
              <div
                key={waiter.id}
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-surface-subtle transition-colors"
              >
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-radius-full bg-action-primary/10 text-action-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {waiter.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="font-semibold text-sm text-text-primary truncate">
                    {waiter.name}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-text-secondary truncate">
                  {waiter.email}
                </div>
                <div className="col-span-2 text-sm text-text-secondary">{waiter.phone || '—'}</div>
                <div className="col-span-1">
                  {waiter.pin_code ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-text-primary bg-surface-subtle px-2 py-0.5 rounded-radius-sm">
                      <KeyRound className="h-3 w-3" /> {waiter.pin_code}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </div>
                <div className="col-span-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-radius-full ${waiter.active !== false ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}
                  >
                    {waiter.active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="col-span-1 text-xs text-text-muted">
                  {formatDate(waiter.created_at)}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(waiter)}
                    className="p-1.5 text-text-secondary hover:text-action-primary hover:bg-action-primary/10 rounded-radius-md transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(waiter)}
                    disabled={deletingId === waiter.id}
                    className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-radius-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Remover"
                  >
                    {deletingId === waiter.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {waiters.length > 0 && (
          <div className="px-6 py-3 border-t border-border-default text-xs text-text-muted">
            {waiters.length} garçom(ns) no total
          </div>
        )}
      </div>

      {showModal && (
        <WaiterModal
          waiter={editWaiter}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
