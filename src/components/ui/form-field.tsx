/**
 * FormField — wrapper de campo de formulário com label, hint e mensagem de erro.
 *
 * Uso:
 *   <FormField label="Nome" htmlFor="name" error="Campo obrigatório" hint="Até 60 caracteres">
 *     <Input id="name" hasError={!!error} ... />
 *   </FormField>
 */
import * as React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  /** Texto auxiliar exibido abaixo do label */
  hint?: string;
  /** Mensagem de erro — quando presente, aplica estilo de erro */
  error?: string | null;
  /** Indica campo obrigatório com asterisco */
  required?: boolean;
  /** Ícone exibido antes do texto do label */
  labelIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  labelIcon,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-text-primary leading-none flex items-center gap-1"
        >
          {labelIcon}
          {label}
          {required && (
            <span className="ml-1 text-status-error" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {hint && !error && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <HelpCircle className="h-3 w-3 shrink-0" />
            {hint}
          </span>
        )}
      </div>

      {/* Field (slot) */}
      {children}

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs text-status-error animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
