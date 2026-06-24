'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Toast ────────────────────────────────────────────────────────────────────

export function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const show = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  return { toast, show };
}

export function Toast({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      className={cn(
        'fixed top-space-6 right-space-6 z-50 flex items-center gap-space-3 rounded-radius-lg border px-space-4 py-space-3 text-text-sm font-medium animate-in fade-in slide-in-from-top-4 shadow-lg',
        type === 'success'
          ? 'bg-status-success/10 border-status-success/20 text-status-success'
          : 'bg-status-error/10 border-status-error/20 text-status-error',
      )}
    >
      {type === 'success' ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      {message}
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

export function SectionCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-radius-xl border border-border-default bg-surface-card shadow-card hover:shadow-card-hover transition-shadow overflow-hidden',
        className,
      )}
    >
      <div className="px-space-6 py-space-5 border-b border-border-subtle flex items-center justify-between bg-surface-page/30">
        <div className="flex items-center gap-space-3">
          <div className={cn('p-space-2 rounded-radius-lg', iconBg || 'bg-action-primary/10')}>
            <Icon className={cn('h-5 w-5', iconColor || 'text-action-primary')} />
          </div>
          <div>
            <h2 className="text-text-lg font-bold text-text-primary tracking-tight">{title}</h2>
            {description && (
              <p className="text-text-xs font-medium text-text-secondary mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-space-6">{children}</div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-radius-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2',
        enabled ? 'bg-action-primary' : 'bg-surface-subtle',
      )}
      aria-checked={enabled}
      role="switch"
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-radius-full bg-surface-card shadow ring-0 transition duration-200 ease-in-out',
          enabled ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-space-5 border-b border-border-subtle last:border-0 group">
      <div className="flex flex-col gap-0.5">
        <span className="text-text-sm font-bold text-text-primary group-hover:text-action-primary transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-text-xs font-medium text-text-muted leading-tight">
            {description}
          </span>
        )}
      </div>
      <Toggle enabled={checked} onToggle={() => onChange(!checked)} />
    </div>
  );
}

// ─── InfoCard ─────────────────────────────────────────────────────────────────

export function InfoCard({
  icon: Icon = Info,
  children,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-space-4 rounded-radius-xl bg-surface-subtle border border-border-subtle p-space-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-radius-lg bg-surface-card shadow-sm border border-border-default">
        <Icon className="h-5 w-5 text-action-primary" />
      </div>
      <div className="text-text-sm font-medium leading-relaxed text-text-secondary">{children}</div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  children,
  badgePrimary,
  badgeSecondary,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  badgePrimary?: string;
  badgeSecondary?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-6 pb-space-8 border-b border-border-default mb-space-8">
      <div className="space-y-space-2">
        {(badgePrimary || badgeSecondary) && (
          <div className="flex items-center gap-space-2">
            {badgePrimary && (
              <span className="px-space-2 py-0.5 rounded-radius-sm bg-action-primary/10 text-action-primary text-text-xs font-bold uppercase tracking-wider">
                {badgePrimary}
              </span>
            )}
            {badgePrimary && badgeSecondary && (
              <div className="h-1 w-1 rounded-radius-full bg-border-default" />
            )}
            {badgeSecondary && (
              <span className="text-text-xs font-bold text-status-success uppercase tracking-wider">
                {badgeSecondary}
              </span>
            )}
          </div>
        )}
        <h1 className="text-text-4xl font-black text-text-primary tracking-tight">{title}</h1>
        {description && (
          <p className="text-text-sm font-medium text-text-secondary">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-space-3">{children}</div>
    </div>
  );
}
