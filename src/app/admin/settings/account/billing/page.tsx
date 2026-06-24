'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast, PageHeader, useToast, SectionCard, InfoCard } from '@/app/admin/settings/_shared';
import { AccountSidebar } from '../shared';

export default function AccountBillingPage() {
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Formas de Pagamento"
        description="Gerencie seus métodos de pagamento da assinatura."
      />
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="flex gap-8">
        <AccountSidebar active="billing" />
        <div className="flex-1 max-w-2xl space-y-6">
          <SectionCard
            title="Cartões Salvos"
            icon={CreditCard}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="h-3 w-3" />}
                onClick={() => setShowAdd(!showAdd)}
              >
                Adicionar
              </Button>
            }
          >
            {showAdd && (
              <div className="mb-6 p-4 border border-border-default rounded-radius-lg bg-surface-subtle space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Número do Cartão
                    </label>
                    <Input placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Validade
                    </label>
                    <Input placeholder="MM/AA" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      CVV
                    </label>
                    <Input placeholder="123" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Nome no Cartão
                    </label>
                    <Input placeholder="Nome como está no cartão" />
                  </div>
                </div>
                <Button type="button" variant="primary">
                  Salvar Cartão
                </Button>
              </div>
            )}
            <div className="text-center py-8 text-text-muted">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum cartão salvo</p>
              <p className="text-xs mt-1">
                Adicione um cartão para facilitar o pagamento da sua assinatura.
              </p>
            </div>
          </SectionCard>
          <InfoCard icon={CreditCard}>
            Seus dados de pagamento são processados de forma segura. Nós não armazenamos números
            completos de cartão.
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
