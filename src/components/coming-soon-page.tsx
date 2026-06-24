import React from 'react';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: React.ElementType;
  features?: string[];
  eta?: string;
}

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
  features,
  eta,
}: ComingSoonPageProps) {
  return (
    <div className="flex flex-col gap-space-8 pb-space-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">{title}</h1>
        <p className="text-text-secondary mt-1 text-sm">{description}</p>
      </div>

      {/* Main banner */}
      <div className="rounded-radius-2xl border-2 border-dashed border-border-default bg-surface-card flex flex-col items-center justify-center py-space-20 px-space-8 gap-space-6 text-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-radius-2xl bg-action-primary/10 flex items-center justify-center">
            <Icon className="h-10 w-10 text-action-primary" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-radius-full bg-status-warning flex items-center justify-center">
            <Construction className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="text-xl font-bold text-text-primary">{title} em breve</h2>
          <p className="text-text-muted text-sm mt-space-2">
            Este módulo está sendo desenvolvido. Em breve você terá acesso completo a esta
            funcionalidade.
          </p>
          {eta && (
            <span className="inline-block mt-space-3 rounded-radius-full bg-status-warning/10 text-status-warning px-space-4 py-space-1 text-xs font-semibold">
              Previsão: {eta}
            </span>
          )}
        </div>

        {features && features.length > 0 && (
          <div className="w-full max-w-sm">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-space-3">
              O que vem por aí
            </p>
            <ul className="flex flex-col gap-space-2">
              {features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-space-2 text-sm text-text-secondary bg-surface-subtle rounded-radius-md px-space-4 py-space-2"
                >
                  <span className="h-1.5 w-1.5 rounded-radius-full bg-action-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
