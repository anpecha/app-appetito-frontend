'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, ChevronDown } from 'lucide-react';
import { useCashierStore } from '@/store/useCashierStore';
import { cn } from '@/lib/utils';

const CurrencyInput = ({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: number;
  required?: boolean;
}) => {
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const [displayValue, setDisplayValue] = useState(() => formatValue(defaultValue || 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = Number(rawValue) / 100;
    setDisplayValue(formatValue(numericValue));
  };

  return (
    <>
      <input type="hidden" name={name} value={Number(displayValue.replace(/\D/g, '')) / 100} />
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        required={required}
        className="w-full bg-surface-card border border-border-default rounded-radius-sm p-space-3 outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus"
      />
    </>
  );
};

// Exemplo de Modais Simples (Normalmente separados em arquivos, mas agrupados aqui pela simplicidade de integração)
export function SidebarCashierWidget({ collapsed }: { collapsed: boolean }) {
  const { cashier, isLoading, fetchCurrentCashier, openCashier, closeCashier, addTransaction } =
    useCashierStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Modals state
  const [modalType, setModalType] = useState<
    'OPEN' | 'CLOSE' | 'PARTIAL' | 'WITHDRAWAL' | 'ADDITION' | 'FORCE_CLOSE' | null
  >(null);

  useEffect(() => {
    fetchCurrentCashier();
  }, [fetchCurrentCashier]);

  useEffect(() => {
    if (cashier && cashier.status === 'OPEN') {
      const openedDate = new Date(cashier.opened_at).toLocaleDateString();
      const currentDate = new Date().toLocaleDateString();
      if (openedDate !== currentDate) {
        setModalType('FORCE_CLOSE');
      }
    }
  }, [cashier]);

  if (isLoading && !cashier)
    return <div className="animate-pulse h-12 bg-surface-card rounded-radius-md mb-6 mx-1"></div>;

  const isOpen = cashier?.status === 'OPEN';

  const handleOpenCashier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const initial = parseFloat(fd.get('initialBalance') as string) || 0;
    await openCashier(initial);
    setModalType(null);
  };

  const handleTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = parseFloat(fd.get('amount') as string) || 0;
    const obs = (fd.get('obs') as string) || '';
    if (modalType === 'WITHDRAWAL' || modalType === 'ADDITION') {
      await addTransaction(modalType, amount, obs);
    }
    setModalType(null);
  };

  const handleCloseCashier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const actual = parseFloat(fd.get('actualBalance') as string) || 0;
    await closeCashier(actual);
    setModalType(null);
  };

  return (
    <>
      <div className="mb-6 px-1 relative">
        <div
          onClick={() => isOpen && setDropdownOpen(!dropdownOpen)}
          className={cn(
            'flex items-center rounded-xl bg-[#202020] p-1.5 text-text-on-dark shadow-md cursor-pointer transition-colors',
            !isOpen ? 'hover:bg-[#303030]' : 'hover:bg-[#2a2a2a]',
            collapsed ? 'justify-center' : 'justify-between pr-3',
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                isOpen ? 'bg-status-success/20 text-status-success' : 'bg-white/10 text-white',
              )}
            >
              <Monitor className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Caixa</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                    isOpen
                      ? 'bg-status-success text-text-on-brand'
                      : 'bg-surface-subtle text-status-error',
                  )}
                >
                  {isOpen ? 'Aberto' : 'Fechado'}
                </span>
              </div>
            )}
          </div>
          {!collapsed &&
            (isOpen ? (
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform text-white',
                  dropdownOpen && 'rotate-180',
                )}
              />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalType('OPEN');
                }}
                className="text-[12px] font-bold text-white hover:text-gray-300 transition-colors"
              >
                Abrir
              </button>
            ))}
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && isOpen && !collapsed && (
          <div className="absolute top-14 left-0 w-full bg-surface-card border border-border-default rounded-radius-md shadow-md z-50 py-space-2 text-text-sm text-text-primary overflow-hidden">
            <div className="px-space-4 py-space-2 text-text-muted text-text-xs border-b border-border-subtle">
              Caixa ID: {cashier?.id.slice(0, 6)}
            </div>
            <button
              onClick={() => {
                setModalType('PARTIAL');
                setDropdownOpen(false);
              }}
              className="w-full text-left px-space-4 py-space-2 hover:bg-surface-subtle transition-colors"
            >
              Resumo parcial
            </button>
            <button
              onClick={() => {
                setModalType('WITHDRAWAL');
                setDropdownOpen(false);
              }}
              className="w-full text-left px-space-4 py-space-2 hover:bg-surface-subtle transition-colors"
            >
              Informar retirada
            </button>
            <button
              onClick={() => {
                setModalType('ADDITION');
                setDropdownOpen(false);
              }}
              className="w-full text-left px-space-4 py-space-2 hover:bg-surface-subtle transition-colors"
            >
              Informar suprimento
            </button>
            <div className="border-t border-border-subtle my-1"></div>
            <button
              onClick={() => {
                setModalType('CLOSE');
                setDropdownOpen(false);
              }}
              className="w-full text-left px-space-4 py-space-2 hover:bg-surface-subtle text-status-error font-semibold transition-colors"
            >
              Fechar caixa
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-space-4">
          <div className="bg-surface-page rounded-radius-xl shadow-lg w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-space-6 border-b border-border-default bg-surface-card">
              <h2 className="text-text-2xl font-bold text-text-primary">
                {modalType === 'OPEN' && 'Abrir Caixa'}
                {(modalType === 'CLOSE' || modalType === 'FORCE_CLOSE') && 'Fechar Caixa'}
                {modalType === 'PARTIAL' && 'Resumo Parcial'}
                {modalType === 'WITHDRAWAL' && 'Informar Retirada'}
                {modalType === 'ADDITION' && 'Informar Suprimento'}
              </h2>
              {modalType !== 'FORCE_CLOSE' && (
                <button
                  onClick={() => setModalType(null)}
                  className="text-text-muted hover:text-text-primary text-text-lg"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-space-6 bg-surface-page">
              {/* OPEN MODAL */}
              {modalType === 'OPEN' && (
                <form onSubmit={handleOpenCashier} className="flex flex-col gap-space-4">
                  <div>
                    <label className="block text-text-sm font-semibold text-text-secondary mb-space-2">
                      Saldo Inicial (Troco) *
                    </label>
                    <CurrencyInput name="initialBalance" defaultValue={0} required />
                  </div>
                  <div className="flex justify-end gap-space-3 mt-space-4">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-space-4 py-space-2 bg-surface-card text-text-primary border border-border-default rounded-radius-md hover:bg-surface-subtle"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-space-4 py-space-2 bg-action-primary text-text-on-brand rounded-radius-md shadow-button-primary hover:bg-action-primary-hover font-semibold"
                    >
                      Abrir Caixa
                    </button>
                  </div>
                </form>
              )}

              {/* TRANSACTIONS MODAL */}
              {(modalType === 'WITHDRAWAL' || modalType === 'ADDITION') && (
                <form onSubmit={handleTransaction} className="flex flex-col gap-space-4">
                  <div>
                    <label className="block text-text-sm font-semibold text-text-secondary mb-space-2">
                      Valor *
                    </label>
                    <CurrencyInput name="amount" defaultValue={0} required />
                  </div>
                  <div>
                    <label className="block text-text-sm font-semibold text-text-secondary mb-space-2">
                      Observação *
                    </label>
                    <input
                      type="text"
                      name="obs"
                      required
                      className="w-full bg-surface-card border border-border-default rounded-radius-sm p-space-3 outline-none focus:border-border-focus"
                      placeholder="Escreva aqui"
                    />
                  </div>
                  <div className="flex justify-end gap-space-3 mt-space-4">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-space-4 py-space-2 bg-surface-card text-text-primary border border-border-default rounded-radius-md hover:bg-surface-subtle"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-space-4 py-space-2 bg-action-primary text-text-on-brand rounded-radius-md shadow-button-primary hover:bg-action-primary-hover font-semibold"
                    >
                      Informar {modalType === 'WITHDRAWAL' ? 'Retirada' : 'Suprimento'}
                    </button>
                  </div>
                </form>
              )}

              {/* PARTIAL SUMMARY MODAL */}
              {modalType === 'PARTIAL' && (
                <div className="flex flex-col gap-space-4">
                  <div className="flex justify-between text-text-sm text-text-secondary">
                    <span>Abertura: {new Date(cashier?.opened_at || '').toLocaleString()}</span>
                    <span>ID: {cashier?.id.slice(0, 6)}</span>
                  </div>
                  <div className="border border-border-default rounded-radius-md bg-surface-card overflow-hidden mt-space-2">
                    <div className="flex justify-between p-space-3 border-b border-border-subtle bg-surface-subtle font-semibold text-text-primary">
                      <span>Forma de pagamento</span>
                      <span>Saldo</span>
                    </div>
                    <div className="flex justify-between p-space-3 text-text-secondary">
                      <span>Dinheiro / Total (Esperado)</span>
                      <span className="font-mono font-medium">
                        R$ {cashier?.expected_balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-space-4">
                    <button
                      onClick={() => setModalType(null)}
                      className="px-space-4 py-space-2 bg-action-primary text-text-on-brand rounded-radius-md font-semibold"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* CLOSE CASHIER MODAL */}
              {(modalType === 'CLOSE' || modalType === 'FORCE_CLOSE') && (
                <form onSubmit={handleCloseCashier} className="flex flex-col gap-space-4">
                  {modalType === 'FORCE_CLOSE' && (
                    <div className="bg-status-warning/10 p-space-4 border border-status-warning rounded-radius-md">
                      <h3 className="font-bold text-status-warning mb-1">
                        Caixa do dia anterior detectado
                      </h3>
                      <p className="text-sm text-text-secondary">
                        O caixa ficou aberto de um dia para o outro. É necessário realizar o
                        fechamento agora para iniciar um novo dia de vendas.
                      </p>
                    </div>
                  )}
                  <div className="bg-surface-subtle p-space-4 border border-border-default rounded-radius-md">
                    <div className="flex justify-between mb-space-2 text-text-sm text-text-secondary">
                      <span>Saldo na abertura:</span>{' '}
                      <span>R$ {cashier?.initial_balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-text-lg text-text-primary mt-space-2 pt-space-2 border-t border-border-default">
                      <span>Total Esperado:</span>{' '}
                      <span>R$ {cashier?.expected_balance.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-text-sm font-semibold text-text-secondary mb-space-2">
                      Valor Físico em Caixa (Em Caixa) *
                    </label>
                    <CurrencyInput
                      name="actualBalance"
                      defaultValue={cashier?.expected_balance}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-space-3 mt-space-4">
                    {modalType !== 'FORCE_CLOSE' && (
                      <button
                        type="button"
                        onClick={() => setModalType(null)}
                        className="px-space-4 py-space-2 bg-surface-card text-text-primary border border-border-default rounded-radius-md hover:bg-surface-subtle"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-space-4 py-space-2 bg-action-primary text-text-on-brand rounded-radius-md shadow-button-primary hover:bg-action-primary-hover font-semibold"
                    >
                      Fechar caixa
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
