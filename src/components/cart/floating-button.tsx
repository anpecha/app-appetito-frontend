'use client';

import * as React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';

interface FloatingCartButtonProps {
  itemCount: number;
  totalCents: number;
  onClick?: () => void;
}

export function FloatingCartButton({ itemCount, totalCents, onClick }: FloatingCartButtonProps) {
  if (itemCount === 0) return null;

  const formattedTotal = (totalCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-background/90 to-transparent pb-6">
      <div className="mx-auto max-w-md">
        <Button
          variant="strong"
          size="lg"
          onClick={onClick}
          className="w-full flex items-center justify-between shadow-shadow-lg h-14 rounded-radius-full px-6"
        >
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center bg-white text-action-strong font-bold rounded-full w-8 h-8 text-sm">
              {itemCount}
            </div>
            <span className="font-semibold text-white flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Ver pedido</span>
            </span>
          </div>
          <span className="font-bold text-white tracking-wide">{formattedTotal}</span>
        </Button>
      </div>
    </div>
  );
}
