'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Toast, PageHeader, useToast } from '../_shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  manager: 'Gerente',
  attendant: 'Atendente',
  waiter: 'Garçom',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-700',
  manager: 'bg-blue-100 text-blue-700',
  attendant: 'bg-green-100 text-green-700',
  waiter: 'bg-slate-100 text-slate-600',
};

// ─── Staff Form Modal ─────────────────────────────────────────────────────────

function StaffModal({
  member,
  onClose,
  onSaved,
}: {
  member?: StaffMember;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [role, setRole] = useState(member?.role ?? 'attendant');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const method = member ? 'PATCH' : 'POST';
      const url = member ? `/api/proxy/settings/staff/${member.id}` : '/api/proxy/settings/staff';
      const body = member ? JSON.stringify({ name, role }) : JSON.stringify({ name, email, role });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail ?? 'Erro ao salvar colaborador');
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
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="font-bold text-text-primary">
            {member ? 'Editar colaborador' : 'Adicionar colaborador'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition p-1 rounded-radius-md hover:bg-surface-subtle cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nome completo" htmlFor="staff-name" required>
            <Input
              id="staff-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Santos"
              required
            />
          </FormField>

          {!member && (
            <FormField label="E-mail" htmlFor="staff-email" required>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@email.com"
                required
              />
            </FormField>
          )}

          <FormField label="Função" htmlFor="staff-role">
            <select
              id="staff-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 rounded-radius-sm border border-border-default bg-surface-card px-space-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus hover:border-border-focus transition-all duration-200 cursor-pointer"
            >
              <option value="manager">Gerente</option>
              <option value="attendant">Atendente</option>
              <option value="waiter">Garçom</option>
            </select>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffSettingsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | undefined>(undefined);
  const { toast, show: showToast } = useToast();

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const fetchStaff = useRef(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/proxy/settings/staff');
      if (!res.ok) throw new Error('Falha ao carregar colaboradores');
      setStaff(await res.json());
    } catch {
      showToastRef.current('error', 'Erro ao carregar colaboradores.');
    } finally {
      setLoading(false);
    }
  }).current;

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  async function handleDelete(member: StaffMember) {
    if (!confirm(`Remover "${member.name}" da equipe?`)) return;
    setDeletingId(member.id);
    try {
      const res = await fetch(`/api/proxy/settings/staff/${member.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('success', `"${member.name}" removido com sucesso.`);
      fetchStaff();
    } catch {
      showToast('error', 'Erro ao remover colaborador.');
    } finally {
      setDeletingId(null);
    }
  }

  const openAdd = () => {
    setEditMember(undefined);
    setShowModal(true);
  };
  const openEdit = (m: StaffMember) => {
    setEditMember(m);
    setShowModal(true);
  };

  const handleSaved = () => {
    setShowModal(false);
    showToast('success', editMember ? 'Colaborador atualizado!' : 'Colaborador adicionado!');
    fetchStaff();
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
    <div className="flex flex-col gap-space-8 pb-space-12">
      <PageHeader
        title="Colaboradores"
        description="Gerencie a equipe do seu restaurante — gerentes, atendentes e garçons."
      >
        <Button onClick={openAdd} variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          Adicionar
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Staff list */}
      <div className="rounded-radius-xl border border-border-default bg-surface-card shadow-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-subtle px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          <div className="col-span-4">Nome</div>
          <div className="col-span-4">E-mail</div>
          <div className="col-span-2">Função</div>
          <div className="col-span-1">Desde</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        {/* Table body */}
        <div className="divide-y divide-border-subtle">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando colaboradores…</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-12 w-12 rounded-radius-full bg-surface-subtle flex items-center justify-center">
                <Users className="h-6 w-6 text-text-muted" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">
                  Nenhum colaborador cadastrado
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Adicione gerentes, atendentes e garçons.
                </p>
              </div>
              <button
                onClick={openAdd}
                className="text-sm text-action-primary font-semibold hover:underline cursor-pointer"
              >
                Adicionar primeiro colaborador →
              </button>
            </div>
          ) : (
            staff.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-surface-subtle transition-colors"
              >
                {/* Name + avatar */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-radius-full bg-action-primary/10 text-action-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {member.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="font-semibold text-sm text-text-primary truncate">
                    {member.name}
                  </span>
                </div>

                <div className="col-span-4 text-sm text-text-secondary truncate">
                  {member.email}
                </div>

                <div className="col-span-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-radius-full ${ROLE_COLORS[member.role] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                </div>

                <div className="col-span-1 text-xs text-text-muted">
                  {formatDate(member.created_at)}
                </div>

                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(member)}
                    className="p-1.5 text-text-secondary hover:text-action-primary hover:bg-action-primary/10 rounded-radius-md transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    disabled={deletingId === member.id || member.role === 'owner'}
                    className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-radius-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title={
                      member.role === 'owner' ? 'O proprietário não pode ser removido' : 'Remover'
                    }
                  >
                    {deletingId === member.id ? (
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

        {staff.length > 0 && (
          <div className="px-6 py-3 border-t border-border-default text-xs text-text-muted">
            {staff.length} colaborador{staff.length !== 1 ? 'es' : ''} no total
          </div>
        )}
      </div>

      {showModal && (
        <StaffModal member={editMember} onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}
