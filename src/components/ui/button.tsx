import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base — cursor-pointer, transições suaves 200ms, focus ring acessível
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'text-sm font-semibold tracking-wide',
    'cursor-pointer select-none',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed',
    'active:scale-[0.97]', // micro-feedback tátil no clique
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary — Mostarda Appetito
        primary: [
          'bg-action-primary text-text-on-brand',
          'rounded-radius-md shadow-button-primary',
          'hover:bg-action-primary-hover hover:-translate-y-px hover:shadow-md',
          'active:bg-action-primary-active active:translate-y-0 active:shadow-sm',
        ].join(' '),

        // Secondary — superfície com borda
        secondary: [
          'bg-surface-card text-text-primary',
          'border border-border-default rounded-radius-md',
          'hover:bg-surface-subtle hover:border-border-focus hover:-translate-y-px',
          'active:bg-surface-section active:translate-y-0',
        ].join(' '),

        // Strong / CTA — Vermelho Appetito
        strong: [
          'bg-action-strong text-white',
          'rounded-radius-md shadow-md',
          'hover:bg-action-strong-hover hover:-translate-y-px hover:shadow-lg',
          'active:translate-y-0 active:shadow-sm',
        ].join(' '),

        // Destructive — para ações destrutivas (deletar, cancelar)
        destructive: [
          'bg-status-error text-white',
          'rounded-radius-md shadow-sm',
          'hover:opacity-90 hover:-translate-y-px',
          'active:translate-y-0',
        ].join(' '),

        // Ghost — discreto, sem fundo
        ghost: [
          'text-text-primary rounded-radius-md',
          'hover:bg-surface-subtle hover:text-text-primary',
        ].join(' '),

        // Outline — borda visível sem fundo
        outline: [
          'border border-border-default bg-transparent text-text-primary',
          'rounded-radius-md',
          'hover:bg-surface-subtle hover:border-border-focus',
        ].join(' '),

        // Link — somente texto
        link: 'text-action-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base font-bold',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Exibe spinner e desabilita o botão durante operações assíncronas */
  isLoading?: boolean;
  /** Ícone opcional exibido à esquerda do texto */
  leftIcon?: React.ReactNode;
  /** Ícone opcional exibido à direita do texto */
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
