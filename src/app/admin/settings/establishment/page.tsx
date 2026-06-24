'use client';

import React, { useEffect, useState } from 'react';
import { Store, Phone, MapPin, Save, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Toggle, Toast, SectionCard, PageHeader, useToast } from '../_shared';

// ─── Utils ────────────────────────────────────────────────────────────────────

function applyPhoneMask(v: string) {
  const digits = v.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').substring(0, 14);
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
}

function applyWhatsAppMask(v: string) {
  return applyPhoneMask(v);
}

function applyCepMask(v: string) {
  const digits = v.replace(/\D/g, '');
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2').substring(0, 9);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

function buildDefaultHours(): BusinessHours {
  const day = { open: '08:00', close: '18:00', closed: false };
  return {
    monday: { ...day },
    tuesday: { ...day },
    wednesday: { ...day },
    thursday: { ...day },
    friday: { ...day },
    saturday: { ...day },
    sunday: { ...day, closed: true },
  };
}

// ─── Components ───────────────────────────────────────────────────────────────

/** Time selector input */
function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'h-10 rounded-radius-sm border border-border-default bg-surface-card px-space-3 text-text-sm text-text-primary',
        'hover:border-action-primary/40 focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-action-primary/10 transition-all w-full',
        'disabled:opacity-50 disabled:bg-surface-subtle disabled:cursor-not-allowed',
      )}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EstablishmentSettings() {
  const [name, setName] = useState('');
  const [document, setDocumentVal] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [hours, setHours] = useState<BusinessHours>(buildDefaultHours());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast, show: showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setDocumentVal(data.document || '');
          setPhone(data.phone || '');

          const config = data.config_json || {};
          setWhatsapp(config.whatsapp || '');

          if (config.address) {
            setZipcode(config.address.zipcode || '');
            setStreet(config.address.street || '');
            setNumber(config.address.number || '');
            setNeighborhood(config.address.neighborhood || '');
            setCity(config.address.city || '');
          }
          if (config.hours) {
            setHours(config.hours);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant settings:', error);
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name,
        document: document,
        phone,
        config_json: {
          whatsapp,
          address: { zipcode, street, number, neighborhood, city },
          hours,
        },
      };

      const res = await fetch('/api/proxy/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('success', 'Configurações salvas com sucesso!');
      } else {
        showToast('error', 'Erro ao salvar configurações.');
      }
    } catch (error) {
      console.error('Error saving restaurant settings:', error);
      showToast('error', 'Falha de comunicação.');
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (
    day: keyof BusinessHours,
    field: 'open' | 'close' | 'closed',
    value: string | boolean,
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-space-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header PRO (Stitch) */}
      <PageHeader
        title="Estabelecimento"
        description="Informações da conta, identidade visual e endereço físico."
        badgePrimary="Configuração da Loja"
        badgeSecondary="Ativa no PDV"
      >
        <Button
          form="establishment-form"
          type="submit"
          disabled={saving}
          className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand px-space-10 rounded-radius-md font-bold h-14 shadow-button-primary transition-all hover:scale-[1.02] active:bg-action-primary-active active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="mr-space-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-space-2 h-5 w-5" />
              Salvar Estabelecimento
            </>
          )}
        </Button>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-10">
        {/* Lateral Left: Brand & Status Summary */}
        <div className="lg:col-span-4 space-y-space-6">
          <div className="bg-surface-card rounded-radius-2xl p-space-8 border border-border-default shadow-card hover:shadow-card-hover transition-shadow sticky top-24">
            <div className="flex flex-col items-center text-center space-y-space-6 mb-space-8">
              <div className="relative group cursor-pointer">
                <div className="h-32 w-32 rounded-radius-full bg-surface-subtle border-4 border-surface-card shadow-lg flex items-center justify-center text-text-muted group-hover:border-border-focus/50 transition-all overflow-hidden ring-1 ring-border-default">
                  <Store className="h-12 w-12 text-text-muted" />
                </div>
                <div className="absolute inset-0 rounded-radius-full bg-surface-sidebar/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-text-on-dark">
                  <Save size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-text-2xl font-black text-text-primary leading-tight">
                  {name || 'Sua Loja'}
                </h3>
                <p className="text-text-xs font-bold text-text-muted mt-space-2 uppercase tracking-widest">
                  Identidade Visual da Unidade
                </p>
              </div>
            </div>

            <div className="space-y-space-4 pt-space-8 border-t border-border-default">
              <div className="p-space-5 rounded-radius-xl bg-status-success/10 border border-status-success/20">
                <div className="flex items-center justify-between mb-space-3">
                  <span className="text-text-xs font-bold text-status-success uppercase tracking-widest leading-none">
                    Canal de Vendas
                  </span>
                  <div className="h-2 w-2 rounded-radius-full bg-status-success animate-pulse" />
                </div>
                <p className="text-text-sm font-bold text-text-primary mb-space-1 leading-tight">
                  Digital Menu Ativo
                </p>
                <p className="text-text-xs font-medium text-text-secondary leading-relaxed">
                  Seu estabelecimento está recebendo pedidos via site e app agora.
                </p>
              </div>

              <div className="p-space-5 rounded-radius-xl bg-surface-subtle border border-border-default">
                <div className="flex items-center gap-space-3 mb-space-2">
                  <Clock className="h-4 w-4 text-text-muted" />
                  <span className="text-text-sm font-bold text-text-secondary">Horário Atual</span>
                </div>
                <p className="text-text-xs font-medium text-text-muted">
                  Aberto hoje das 08h às 18h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Right Column: Form Modules */}
        <div className="lg:col-span-8">
          <form id="establishment-form" onSubmit={handleSave} className="space-y-space-8">
            {/* Identidade */}
            <SectionCard
              title="Dados da Unidade"
              description="Informações principais que regem as regras fiscais e comerciais."
              icon={Store}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-8">
                <div className="space-y-space-2">
                  <label className="text-text-sm font-bold text-text-secondary ml-1">
                    Nome Comercial
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Appetito Centro"
                    className="w-full h-12 px-space-5 text-text-sm font-medium bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-4 focus:ring-border-focus/10 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
                <div className="space-y-space-2">
                  <label className="text-text-sm font-bold text-text-secondary ml-1">
                    CNPJ / Documento
                  </label>
                  <input
                    value={document}
                    onChange={(e) => setDocumentVal(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full h-12 px-space-5 text-text-sm font-medium bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-4 focus:ring-border-focus/10 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
                <div className="space-y-space-2">
                  <label className="text-text-sm font-bold text-text-secondary ml-1">
                    WhatsApp para Pedidos
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-space-4 pointer-events-none text-status-success">
                      <Phone size={16} />
                    </div>
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(applyWhatsAppMask(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="w-full h-12 pl-space-12 pr-space-5 text-text-sm font-medium bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-4 focus:ring-border-focus/10 focus:border-border-focus transition-all outline-none text-text-primary"
                    />
                  </div>
                </div>
                <div className="space-y-space-2">
                  <label className="text-text-sm font-bold text-text-secondary ml-1">
                    Telefone de Contato
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(applyPhoneMask(e.target.value))}
                    placeholder="(00) 0000-0000"
                    className="w-full h-12 px-space-5 text-text-sm font-medium bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-4 focus:ring-border-focus/10 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Localização" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-6">
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    CEP
                  </label>
                  <input
                    value={zipcode}
                    onChange={(e) => setZipcode(applyCepMask(e.target.value))}
                    className="w-full h-11 px-space-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Endereço / Logradouro
                  </label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full h-11 px-space-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Número
                  </label>
                  <input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full h-11 px-space-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Bairro
                  </label>
                  <input
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full h-11 px-space-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Cidade
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 px-space-4 text-text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Horários de Funcionamento" icon={Clock}>
              <div className="space-y-space-4">
                {(Object.keys(hours) as Array<keyof BusinessHours>).map((day) => {
                  const labels: Record<string, string> = {
                    monday: 'Segunda-feira',
                    tuesday: 'Terça-feira',
                    wednesday: 'Quarta-feira',
                    thursday: 'Quinta-feira',
                    friday: 'Sexta-feira',
                    saturday: 'Sábado',
                    sunday: 'Domingo',
                  };
                  return (
                    <div
                      key={day}
                      className="flex flex-col md:flex-row md:items-center justify-between p-space-4 rounded-radius-lg border border-border-subtle bg-surface-subtle gap-space-4"
                    >
                      <div className="flex items-center gap-space-4 min-w-[180px]">
                        <Toggle
                          enabled={!hours[day].closed}
                          onToggle={() => updateHour(day, 'closed', !hours[day].closed)}
                        />
                        <span
                          className={cn(
                            'text-text-sm font-bold',
                            hours[day].closed ? 'text-text-muted' : 'text-text-primary',
                          )}
                        >
                          {labels[day]}
                        </span>
                      </div>

                      {!hours[day].closed ? (
                        <div className="flex items-center gap-space-2 animate-in fade-in slide-in-from-top-1">
                          <TimeInput
                            value={hours[day].open}
                            onChange={(v) => updateHour(day, 'open', v)}
                          />
                          <span className="text-text-muted font-medium px-space-2 text-text-xs uppercase">
                            até
                          </span>
                          <TimeInput
                            value={hours[day].close}
                            onChange={(v) => updateHour(day, 'close', v)}
                          />
                        </div>
                      ) : (
                        <span className="text-text-xs font-black text-status-error bg-status-error/10 px-space-3 py-1 rounded-radius-full uppercase tracking-widest border border-status-error/20">
                          Estabelecimento Fechado
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </form>
        </div>
      </div>
    </div>
  );
}
