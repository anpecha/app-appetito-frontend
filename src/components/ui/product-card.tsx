'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price_cents: number;
  promotional_price_cents?: number | null;
  stock_quantity?: number | null;
  is_out_of_stock?: boolean;
  orders_count?: number;
  image_url: string | null;
  category_id: string;
  active?: boolean;
  product_type?: 'standard' | 'pizza' | 'variable';
  pizza_category_id?: string | null;
  fractional_pricing_strategy?: string | null;
  sizes?: { id: string; name: string; price: number; max_flavors: number }[];
}

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const formattedPrice = (product.price_cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <Card className="flex flex-col h-full overflow-hidden border-border-subtle">
      {/* Imagem do Produto */}
      <div className="relative w-full pt-[60%] bg-surface-subtle">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted">
            <span className="text-sm font-medium">Sem imagem</span>
          </div>
        )}
      </div>

      <CardHeader className="flex-1 p-4 pb-0">
        <CardTitle className="text-lg font-bold leading-tight break-words line-clamp-2">
          {product.name}
        </CardTitle>
        {product.description && (
          <CardDescription className="mt-1 text-sm line-clamp-2">
            {product.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-4">
        <p className="font-semibold text-text-primary text-lg">{formattedPrice}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button variant="primary" className="w-full font-bold" onClick={() => onAdd?.(product)}>
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
