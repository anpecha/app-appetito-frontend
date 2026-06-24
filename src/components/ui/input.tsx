import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Exibe borda e anel vermelhos de erro */
  hasError?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base
          'flex h-11 w-full rounded-radius-sm border bg-surface-card',
          'px-space-4 py-space-2 text-sm text-text-primary',
          'placeholder:text-text-muted',
          // Transições suaves
          'transition-all duration-200 ease-in-out',
          // Sombra sutil em repouso
          'shadow-sm',
          // Focus
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-surface-subtle',
          // File input
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          // Estado normal vs erro
          hasError
            ? 'border-status-error focus-visible:ring-status-error/40 bg-status-error/5'
            : 'border-border-default hover:border-border-focus focus-visible:ring-border-focus/40 focus-visible:border-border-focus',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
