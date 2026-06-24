'use client';

import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { PageHeader, SectionCard } from '@/app/admin/settings/_shared';
import { AccountSidebar } from '../shared';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AccountTeamPage() {
  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader title="Colaboradores" description="Gerencie sua equipe." />
      <div className="flex gap-8">
        <AccountSidebar active="team" />
        <div className="flex-1">
          <SectionCard
            title="Equipe"
            icon={Users}
            description="Gerencie os colaboradores do seu restaurante."
            action={
              <Link href="/admin/settings/customers">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                  Gerenciar Equipe
                </Button>
              </Link>
            }
          >
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-text-muted/30 mb-3" />
              <p className="text-sm font-medium text-text-primary">
                A gestão de colaboradores foi movida para Configurações.
              </p>
              <p className="text-xs text-text-muted mt-1 mb-4">
                Adicione, edite ou remova membros da sua equipe.
              </p>
              <Link href="/admin/settings/customers">
                <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Ir para Colaboradores
                </Button>
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
