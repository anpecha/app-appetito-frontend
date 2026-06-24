'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast, PageHeader, useToast } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

// ─── Component ──────────────────────────────────────────────────────────────

export default function SalonManagementPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Settings States
  const [hasSalonService, setHasSalonService] = useState<boolean>(true);
  const [tableQuantity, setTableQuantity] = useState<number>(3);
  const [orderQuantity, setOrderQuantity] = useState<number>(0);
  const [hasWaiters, setHasWaiters] = useState<boolean>(true);
  const [operationMode, setOperationMode] = useState<string>('alacarte');
  const [serviceModes, setServiceModes] = useState<string[]>(['mesa']);

  const { toast, show: showToast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────────────────

  useEffect(() => {
    fetchSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchSettings() {
    try {
      const res = await fetch('/api/proxy/settings/restaurant');
      if (res.ok) {
        const data = await res.json();
        const salon = data.config_json?.salon || {};

        if (salon.hasSalonService !== undefined) setHasSalonService(salon.hasSalonService);
        if (salon.tableQuantity !== undefined) setTableQuantity(salon.tableQuantity);
        if (salon.orderQuantity !== undefined) setOrderQuantity(salon.orderQuantity);
        if (salon.hasWaiters !== undefined) setHasWaiters(salon.hasWaiters);
        if (salon.operationMode !== undefined) setOperationMode(salon.operationMode);
        if (salon.serviceModes !== undefined) setServiceModes(salon.serviceModes);
      }
    } catch {
      showToast('error', 'Erro ao carregar configurações do salão.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  const toggleServiceMode = (mode: string) => {
    setServiceModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);

    const payload = {
      config_json: {
        salon: {
          hasSalonService,
          tableQuantity,
          orderQuantity,
          hasWaiters,
          operationMode,
          serviceModes,
        },
      },
    };

    try {
      const res = await fetch('/api/proxy/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('success', 'Configurações salvas com sucesso!');
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch {
      showToast('error', 'Erro ao salvar as configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

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
        title="10. Operação em salão"
        description="Defina informações da sua operação no Salão."
      />

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex flex-col gap-space-8">
        {/* ─── SETTINGS SECTION ─── */}
        <div className="bg-surface-card border border-border-default rounded-radius-xl p-space-6 shadow-card">
          {/* Atendimento de Salão */}
          <div className="mb-space-8">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-space-4 border-b border-border-subtle pb-2">
              Atendimento de Salão
            </h3>
            <div className="flex flex-col gap-space-2">
              <label className="text-text-base font-bold text-text-primary">
                Você tem atendimento de salão no seu estabelecimento? *
              </label>
              <div className="flex items-center gap-space-6 mt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-text-secondary hover:text-text-primary transition-colors">
                  <input
                    type="radio"
                    checked={hasSalonService === true}
                    onChange={() => setHasSalonService(true)}
                    className="h-4 w-4 accent-action-primary"
                  />
                  Sim
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-text-secondary hover:text-text-primary transition-colors">
                  <input
                    type="radio"
                    checked={hasSalonService === false}
                    onChange={() => setHasSalonService(false)}
                    className="h-4 w-4 accent-action-primary"
                  />
                  Não
                </label>
              </div>
            </div>
          </div>

          {hasSalonService && (
            <div className="animate-in fade-in slide-in-from-top-2">
              {/* Estrutura e Modelo de Negócio */}
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-space-4 border-b border-border-subtle pb-2">
                Estrutura e Modelo de Negócio
              </h3>

              <div className="flex flex-col gap-space-6 mb-space-8">
                {/* Quantidade de mesas & comandas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-8">
                  <div className="flex flex-col gap-1">
                    <label className="text-text-base font-bold text-text-primary mb-1">
                      Quantidade de mesas
                    </label>
                    <div className="flex items-center border border-border-default rounded-radius-sm w-fit overflow-hidden bg-surface-subtle shadow-sm">
                      <button
                        onClick={() => setTableQuantity(Math.max(0, tableQuantity - 1))}
                        className="p-3 text-text-muted hover:text-text-primary hover:bg-border-subtle transition-colors bg-surface-card"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="w-16 text-center font-bold text-text-primary bg-surface-card py-3 border-x border-border-default">
                        {tableQuantity}
                      </div>
                      <button
                        onClick={() => setTableQuantity(tableQuantity + 1)}
                        className="p-3 text-text-muted hover:text-text-primary hover:bg-border-subtle transition-colors bg-surface-card"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-text-muted mt-1">Mesas no seu estabelecimento</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-text-base font-bold text-text-primary mb-1">
                      Quantidade de comandas
                    </label>
                    <div className="flex items-center border border-border-default rounded-radius-sm w-fit overflow-hidden bg-surface-subtle shadow-sm">
                      <button
                        onClick={() => setOrderQuantity(Math.max(0, orderQuantity - 1))}
                        className="p-3 text-text-muted hover:text-text-primary hover:bg-border-subtle transition-colors bg-surface-card"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="w-16 text-center font-bold text-text-primary bg-surface-card py-3 border-x border-border-default">
                        {orderQuantity}
                      </div>
                      <button
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="p-3 text-text-muted hover:text-text-primary hover:bg-border-subtle transition-colors bg-surface-card"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-text-muted mt-1">Comandas no estabelecimento</p>
                  </div>
                </div>

                {/* Possui Garçons? */}
                <div className="flex flex-col gap-space-2 mt-2">
                  <label className="text-text-base font-bold text-text-primary">
                    Possui Garçons? *
                  </label>
                  <div className="flex items-center gap-space-6 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-text-secondary hover:text-text-primary transition-colors">
                      <input
                        type="radio"
                        checked={hasWaiters === true}
                        onChange={() => setHasWaiters(true)}
                        className="h-4 w-4 accent-action-primary"
                      />
                      Sim
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-text-secondary hover:text-text-primary transition-colors">
                      <input
                        type="radio"
                        checked={hasWaiters === false}
                        onChange={() => setHasWaiters(false)}
                        className="h-4 w-4 accent-action-primary"
                      />
                      Não
                    </label>
                  </div>
                  <p className="text-xs text-text-muted">Garçons do seu estabelecimento</p>
                </div>

                {/* Como você opera? */}
                <div className="flex flex-col gap-space-2 mt-4">
                  <label className="text-text-base font-bold text-text-primary">
                    Como você opera? *{' '}
                    <span className="font-normal text-text-secondary text-sm">
                      (Selecione apenas 1 opção, considere a principal)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-4 mt-2">
                    <label
                      className={cn(
                        'flex flex-col gap-1 border rounded-radius-md p-space-4 cursor-pointer transition-all',
                        operationMode === 'alacarte'
                          ? 'border-action-primary bg-action-primary/5'
                          : 'border-border-default hover:border-border-subtle bg-surface-page',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={operationMode === 'alacarte'}
                          onChange={() => setOperationMode('alacarte')}
                          className="h-4 w-4 accent-action-primary"
                        />
                        <span className="font-bold text-text-primary">À la carte</span>
                      </div>
                      <p className="text-xs text-text-muted ml-6">Cardápio físico ou digital</p>
                    </label>

                    <label
                      className={cn(
                        'flex flex-col gap-1 border rounded-radius-md p-space-4 cursor-pointer transition-all',
                        operationMode === 'buffet'
                          ? 'border-action-primary bg-action-primary/5'
                          : 'border-border-default hover:border-border-subtle bg-surface-page',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={operationMode === 'buffet'}
                          onChange={() => setOperationMode('buffet')}
                          className="h-4 w-4 accent-action-primary"
                        />
                        <span className="font-bold text-text-primary">Buffet/Self Service</span>
                      </div>
                      <p className="text-xs text-text-muted ml-6">Preço único ou por quilo (Kg)</p>
                    </label>

                    <label
                      className={cn(
                        'flex flex-col gap-1 border rounded-radius-md p-space-4 cursor-pointer transition-all',
                        operationMode === 'rodizio'
                          ? 'border-action-primary bg-action-primary/5'
                          : 'border-border-default hover:border-border-subtle bg-surface-page',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={operationMode === 'rodizio'}
                          onChange={() => setOperationMode('rodizio')}
                          className="h-4 w-4 accent-action-primary"
                        />
                        <span className="font-bold text-text-primary">Rodízio</span>
                      </div>
                      <p className="text-xs text-text-muted ml-6">Garçons oferecem variedades</p>
                    </label>
                  </div>
                </div>

                {/* Como você atende o seu cliente? */}
                <div className="flex flex-col gap-space-2 mt-4">
                  <label className="text-text-base font-bold text-text-primary">
                    Como você atende o seu cliente no salão? *{' '}
                    <span className="font-normal text-text-secondary text-sm">
                      (Selecione 1 opção ou mais)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4 mt-2">
                    <div
                      onClick={() => toggleServiceMode('mesa')}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          'mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors',
                          serviceModes.includes('mesa')
                            ? 'bg-action-primary border-action-primary'
                            : 'border-border-default bg-surface-page group-hover:border-border-focus',
                        )}
                      >
                        {serviceModes.includes('mesa') && (
                          <Check className="w-3.5 h-3.5 text-text-on-brand" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">Em mesa</span>
                        <span className="text-xs text-text-muted">
                          Garçom se dirige ao cliente nas mesas
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleServiceMode('comanda')}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          'mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors',
                          serviceModes.includes('comanda')
                            ? 'bg-action-primary border-action-primary'
                            : 'border-border-default bg-surface-page group-hover:border-border-focus',
                        )}
                      >
                        {serviceModes.includes('comanda') && (
                          <Check className="w-3.5 h-3.5 text-text-on-brand" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">
                          Comanda individual
                        </span>
                        <span className="text-xs text-text-muted">
                          Registra o consumo de cada cliente
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleServiceMode('balcao')}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          'mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors',
                          serviceModes.includes('balcao')
                            ? 'bg-action-primary border-action-primary'
                            : 'border-border-default bg-surface-page group-hover:border-border-focus',
                        )}
                      >
                        {serviceModes.includes('balcao') && (
                          <Check className="w-3.5 h-3.5 text-text-on-brand" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">No Balcão</span>
                        <span className="text-xs text-text-muted">Cliente se dirige ao balcão</span>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleServiceMode('auto')}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          'mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors',
                          serviceModes.includes('auto')
                            ? 'bg-action-primary border-action-primary'
                            : 'border-border-default bg-surface-page group-hover:border-border-focus',
                        )}
                      >
                        {serviceModes.includes('auto') && (
                          <Check className="w-3.5 h-3.5 text-text-on-brand" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">
                          Auto atendimento
                        </span>
                        <span className="text-xs text-text-muted">
                          Cliente pede através de dispositivo eletrônico
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-space-6 border-t border-border-subtle mt-space-6">
            <Button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-action-primary text-text-on-brand hover:bg-action-primary-hover font-bold px-space-6 h-11"
            >
              {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
