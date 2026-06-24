'use client';

import React, { useEffect, useState } from 'react';
import { Bike, Save, Loader2, Plus, Trash2, Edit2, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionCard, Toast, PageHeader, useToast } from '../../settings/_shared';
import { cn } from '@/lib/utils';

type Courier = {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  license_plate?: string;
  is_active: boolean;
  address?: string;
  city?: string;
  state?: string;
};

export default function CouriersRegisterPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [couriers, setCouriers] = useState<Courier[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    vehicle_type: 'motorcycle',
    license_plate: '',
    is_active: true,
    address: '',
    city: '',
    state: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const { toast, show: showToast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────────────────
  const loadCouriers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/proxy/delivery/couriers');
      if (res.ok) {
        const data = await res.json();
        setCouriers(data);
      }
    } catch {
      showToast('error', 'Erro ao carregar entregadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCouriers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing
        ? `/api/proxy/delivery/couriers/${formData.id}`
        : `/api/proxy/delivery/couriers`;

      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Falha ao salvar');

      showToast(
        'success',
        isEditing ? 'Entregador atualizado!' : 'Entregador cadastrado com sucesso!',
      );

      // Reset form
      setFormData({
        id: '',
        name: '',
        phone: '',
        vehicle_type: 'motorcycle',
        license_plate: '',
        is_active: true,
        address: '',
        city: '',
        state: '',
      });
      setIsEditing(false);

      loadCouriers();
    } catch {
      showToast('error', 'Erro ao salvar o entregador. Verifique se o telefone já existe.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja inativar e excluir este entregador?')) return;

    try {
      const res = await fetch(`/api/proxy/delivery/couriers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      showToast('success', 'Entregador removido com sucesso.');
      loadCouriers();
    } catch {
      showToast('error', 'Erro ao excluir o entregador.');
    }
  }

  function handleEdit(c: Courier) {
    setFormData({
      id: c.id,
      name: c.name,
      phone: c.phone,
      vehicle_type: c.vehicle_type || 'motorcycle',
      license_plate: c.license_plate || '',
      is_active: c.is_active,
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader
        title="Meus Entregadores"
        description="Cadastre motoboys da sua frota própria para despachar os pedidos diretamente no sistema."
      />
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-6">
        <div className="lg:col-span-1">
          <SectionCard title={isEditing ? 'Editar Entregador' : 'Novo Entregador'} icon={Bike}>
            <form onSubmit={handleSave} className="flex flex-col gap-space-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all text-text-primary"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary ml-1">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all text-text-primary"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-secondary ml-1">Veículo</label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full text-sm bg-surface-card border border-border-default rounded-radius-sm px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all text-text-primary"
                  >
                    <option value="motorcycle">Moto</option>
                    <option value="bicycle">Bicicleta</option>
                    <option value="car">Carro</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-secondary ml-1">
                    Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) =>
                      setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })
                    }
                    className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all text-text-primary uppercase"
                    placeholder="ABC-1234"
                  />
                </div>
              </div>

              <div className="border-t border-border-subtle pt-4 mt-2">
                <p className="text-text-xs font-bold text-text-muted uppercase mb-3">Endereço</p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-secondary ml-1">Endereço</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all text-text-primary"
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-space-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-secondary ml-1">Cidade</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all text-text-primary"
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-secondary ml-1">Estado</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value.toUpperCase() })
                        }
                        className="w-full text-sm bg-surface-card border border-border-default rounded-radius-md px-3 py-2 outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/20 transition-all text-text-primary uppercase"
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="activeStatus"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-border-default text-action-primary focus:ring-action-primary"
                  />
                  <label
                    htmlFor="activeStatus"
                    className="text-sm font-medium text-text-primary cursor-pointer"
                  >
                    Entregador Ativo
                  </label>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        id: '',
                        name: '',
                        phone: '',
                        vehicle_type: 'motorcycle',
                        license_plate: '',
                        is_active: true,
                        address: '',
                        city: '',
                        state: '',
                      });
                    }}
                    className="flex-1 bg-surface-card text-text-secondary hover:bg-surface-subtle"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] bg-action-primary hover:bg-action-primary-hover text-text-on-brand shadow-button-primary disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : isEditing ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Listing */}
        <div className="lg:col-span-2 flex flex-col gap-space-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
              Frota Proprietária
              <span className="bg-surface-subtle border border-border-subtle text-text-secondary text-xs px-2 py-0.5 rounded-full">
                {couriers.length} Entregadores
              </span>
            </h3>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center bg-surface-card border border-border-default rounded-radius-lg border-dashed">
              <Loader2 className="h-6 w-6 animate-spin text-action-primary" />
            </div>
          ) : couriers.length === 0 ? (
            <div className="flex flex-col h-40 items-center justify-center bg-surface-card border border-border-default rounded-radius-lg border-dashed text-text-muted gap-2">
              <Bike className="h-8 w-8 opacity-50" />
              <p className="text-sm">Nenhum entregador cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              {couriers.map((courier) => (
                <div
                  key={courier.id}
                  className={cn(
                    'bg-surface-card border border-border-default rounded-radius-lg p-space-4 flex flex-col gap-4 group transition-all hover:border-action-primary/30',
                    !courier.is_active && 'opacity-60',
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary text-base flex items-center gap-2">
                        {courier.name}
                        {courier.is_active && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
                        )}
                        {!courier.is_active && (
                          <span className="text-[10px] bg-status-error/10 text-status-error px-1.5 py-0.5 rounded-radius-sm">
                            Inativo
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-text-secondary flex items-center gap-1.5 mt-1">
                        <Phone className="h-3 w-3" /> {courier.phone}
                      </span>
                      {courier.address && (
                        <span className="text-xs text-text-muted mt-0.5 block">
                          {courier.address}
                          {courier.city ? `, ${courier.city}` : ''}
                          {courier.state ? ` - ${courier.state}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center bg-surface-subtle px-2 py-1 rounded-radius-sm border border-border-subtle text-xs text-text-primary font-medium tracking-wide">
                      {courier.vehicle_type === 'motorcycle'
                        ? '🛵 Moto'
                        : courier.vehicle_type === 'bicycle'
                          ? '🚲 Bike'
                          : '🚗 Carro'}
                    </div>
                  </div>

                  <div className="border-t border-border-subtle flex items-center pt-3 mt-1 gap-2">
                    {courier.license_plate && (
                      <span className="bg-[#f0f0f0] border border-[#d9d9d9] font-mono text-xs px-2 py-1 rounded-radius-sm text-text-primary text-center tracking-widest shadow-sm">
                        {courier.license_plate}
                      </span>
                    )}
                    <div className="flex items-center ml-auto gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(courier)}
                        className="h-8 w-8 p-0 text-text-secondary hover:text-action-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(courier.id)}
                        className="h-8 w-8 p-0 text-text-secondary hover:text-status-error hover:bg-status-error/10 border-transparent hover:border-status-error/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
