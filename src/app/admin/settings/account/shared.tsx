'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Settings, UserCircle, CreditCard, FileText, Crown, Users } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/admin/settings/account/general', label: 'Geral', icon: Settings },
  { href: '/admin/settings/account/personal', label: 'Informações Pessoais', icon: UserCircle },
  { href: '/admin/settings/account/billing', label: 'Formas de Pagamento', icon: CreditCard },
  { href: '/admin/settings/account/invoices', label: 'Fatura', icon: FileText },
  { href: '/admin/settings/account/plans', label: 'Planos', icon: Crown },
  { href: '/admin/settings/account/team', label: 'Colaboradores', icon: Users },
];

export function AccountSidebar({ active }: { active: string }) {
  return (
    <div className="w-56 shrink-0 flex flex-col gap-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 px-3">
        Minha Conta
      </p>
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.href.split('/').pop();
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-radius-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-action-primary/5 text-action-primary font-bold'
                : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
