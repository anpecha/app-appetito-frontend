'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus } from 'lucide-react';

import { Product, ProductOptions } from '@/types/order';

interface Option {
  id?: string;
  name: string;
  price_addition: number;
}

interface OptionGroup {
  id: string;
  name: string;
  min_selections: number;
  max_selections: number;
  options: Option[];
}

interface Size {
  id: string;
  name: string;
  price: number;
  max_flavors: number;
}

interface ProductOptionsModalProps {
  product: Product;
  allProducts?: Product[];
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    options: ProductOptions | null,
    totalItemPrice: number,
  ) => void;
}

export default function ProductOptionsModal({
  product,
  allProducts = [],
  onClose,
  onAddToCart,
}: ProductOptionsModalProps) {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections state
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Option[]>>({});
  const [selectedFlavors, setSelectedFlavors] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const hasTriggeredRef = useRef(false);

  // Adjust selected flavors if size changes to one with fewer max_flavors
  useEffect(() => {
    if (selectedSize && selectedFlavors.length > selectedSize.max_flavors - 1) {
      setSelectedFlavors(selectedFlavors.slice(0, Math.max(0, selectedSize.max_flavors - 1)));
    }
  }, [selectedSize, selectedFlavors]);

  useEffect(() => {
    async function fetchComplexData() {
      try {
        // If it's a standard product without options, we might still fetch to be sure, or we could rely on a flag.
        // For safety we just fetch.
        const res = await fetch(`/api/proxy/catalog/products/${product.id}/complex-data`);
        if (res.ok) {
          const data = await res.json();

          const pSizes = data.sizes || [];
          const pGroups = data.option_groups || [];

          if (pSizes.length === 0 && pGroups.length === 0) {
            if (!hasTriggeredRef.current) {
              hasTriggeredRef.current = true;
              onAddToCart(product, 1, null, product.price_cents);
              onClose();
            }
            return;
          }

          setSizes(
            pSizes.map(
              (s: {
                id: string;
                name?: string;
                size_name?: string;
                price: number;
                max_flavors: number;
              }) => ({
                id: s.id,
                name: s.name || s.size_name || '', // Map to 'name' property
                price: s.price,
                max_flavors: s.max_flavors,
              }),
            ),
          );

          setOptionGroups(
            pGroups.map(
              (g: {
                id: string;
                name: string;
                min_options?: number;
                max_options?: number;
                product_options?: { id: string; name: string; price?: number }[];
              }) => ({
                id: g.id,
                name: g.name,
                min_selections: g.min_options ?? 0,
                max_selections: g.max_options ?? 1,
                options: (g.product_options || []).map(
                  (o: { id: string; name: string; price?: number }) => ({
                    id: o.id,
                    name: o.name,
                    price_addition: o.price ?? 0,
                  }),
                ),
              }),
            ),
          );

          if (pSizes.length > 0) {
            const firstSize = pSizes[0];
            setSelectedSize({
              id: firstSize.id,
              name: firstSize.name || firstSize.size_name, // Map to 'name' property
              price: firstSize.price,
              max_flavors: firstSize.max_flavors,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load options', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplexData();
  }, [product.id, onAddToCart, onClose, product]);

  let basePrice = selectedSize ? selectedSize.price * 100 : product.price_cents;

  // Pizza half-and-half price calculation
  if (product.product_type === 'pizza' && selectedFlavors.length > 0 && selectedSize) {
    const allSelectedProducts = [product, ...selectedFlavors];
    const prices = allSelectedProducts.map((p) => {
      const pSize = p.sizes?.find((s: Size) => s.name === selectedSize.name);
      return pSize ? pSize.price * 100 : p.price_cents;
    });

    if (product.fractional_pricing_strategy === 'average') {
      basePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    } else {
      // "highest_price" default
      basePrice = Math.max(...prices);
    }
  }

  const optionsTotal = Object.values(selectedOptions)
    .flat()
    .reduce((acc, opt) => acc + opt.price_addition * 100, 0);
  const unitPrice = basePrice + optionsTotal;
  const finalPrice = unitPrice * quantity;

  const toggleOption = (group: OptionGroup, option: Option) => {
    setError(null);
    setSelectedOptions((prev) => {
      const groupSelections = prev[group.id] || [];
      const isSelected = groupSelections.some((o) => o.name === option.name);

      if (isSelected) {
        return { ...prev, [group.id]: groupSelections.filter((o) => o.name !== option.name) };
      } else {
        if (groupSelections.length >= group.max_selections) {
          // Optional: remove oldest if max == 1 to implement radio behavior naturally
          if (group.max_selections === 1) {
            return { ...prev, [group.id]: [option] };
          }
          return prev;
        }
        return { ...prev, [group.id]: [...groupSelections, option] };
      }
    });
  };

  const handleAddToCart = () => {
    // Validation
    for (const group of optionGroups) {
      const selections = selectedOptions[group.id] || [];
      if (selections.length < group.min_selections) {
        setError(`Selecione no mínimo ${group.min_selections} opções em: ${group.name}`);
        return;
      }
    }

    const finalOptions = {
      size: selectedSize ? selectedSize.name : undefined, // Use 'name' property
      flavors: selectedFlavors.length > 0 ? selectedFlavors.map((f) => f.name) : undefined,
      addons: Object.values(selectedOptions)
        .flat()
        .map((o) => ({
          name: o.name,
          price_cents: Math.round(o.price_addition * 100),
        })),
    };

    onAddToCart(product, quantity, finalOptions, unitPrice);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-surface-card rounded-radius-xl p-6 flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-action-primary border-t-transparent animate-spin" />
          <p className="text-text-muted text-sm">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-surface-card sm:rounded-radius-xl shadow-lg w-full max-w-lg h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-t-[24px]">
        {/* Header Image & Close */}
        <div className="relative h-48 shrink-0 bg-surface-subtle">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface-section">
              Sem Imagem
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          <h2 className="text-2xl font-bold text-text-primary mb-2">{product.name}</h2>
          {product.description && (
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Sizes Selection */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 bg-surface-section px-3 py-2 rounded-radius-md">
                <h3 className="font-semibold text-text-primary text-sm uppercase">
                  Escolha o Tamanho
                </h3>
                <span className="text-xs font-bold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-radius-sm">
                  1 Obrigatório
                </span>
              </div>
              <div className="space-y-2">
                {sizes.map((size) => (
                  <label
                    key={size.id}
                    className="flex items-center justify-between p-3 border border-border-default rounded-radius-md cursor-pointer hover:border-action-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center h-5 w-5 rounded-full border flex-shrink-0 border-border-default">
                        {selectedSize?.id === size.id && (
                          <div className="h-3 w-3 rounded-full bg-action-primary" />
                        )}
                      </div>
                      <span className="font-medium text-text-primary text-sm">{size.name}</span>{' '}
                      {/* Use 'name' property */}
                    </div>
                    <span className="text-sm text-text-muted">
                      {size.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    {/* Hidden Radio */}
                    <input
                      type="radio"
                      name="size"
                      className="hidden"
                      checked={selectedSize?.id === size.id}
                      onChange={() => setSelectedSize(size)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Additional Flavors (Meio a Meio) */}
          {product.product_type === 'pizza' && selectedSize && selectedSize.max_flavors > 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 bg-surface-section px-3 py-2 rounded-radius-md">
                <div>
                  <h3 className="font-semibold text-text-primary text-sm uppercase">
                    Sabores Adicionais
                  </h3>
                  <p className="text-xs text-text-muted">
                    Escolha até {selectedSize.max_flavors - 1} sabor
                    {selectedSize.max_flavors - 1 > 1 ? 'es' : ''} extra.
                  </p>
                </div>
                <span className="text-xs font-bold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-radius-sm">
                  {selectedFlavors.length} / {selectedSize.max_flavors - 1}
                </span>
              </div>
              <div className="space-y-2">
                {allProducts
                  .filter(
                    (p) =>
                      p.product_type === 'pizza' &&
                      p.pizza_category_id === product.pizza_category_id &&
                      p.id !== product.id,
                  )
                  .map((flavor) => {
                    const isSelected = selectedFlavors.some((f) => f.id === flavor.id);

                    return (
                      <label
                        key={flavor.id}
                        className={`flex items-center justify-between p-3 border rounded-radius-md cursor-pointer transition-colors ${isSelected ? 'border-action-primary' : 'border-border-default hover:border-border-focus'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center h-5 w-5 rounded-radius-sm border flex-shrink-0 transition-colors ${isSelected ? 'bg-action-primary border-action-primary text-white' : 'border-border-default'}`}
                          >
                            {isSelected && (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="w-3 h-3"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-text-primary text-sm">
                            {flavor.name}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedFlavors((prev) => prev.filter((f) => f.id !== flavor.id));
                            } else {
                              if (selectedFlavors.length < selectedSize.max_flavors - 1) {
                                setSelectedFlavors((prev) => [...prev, flavor]);
                              }
                            }
                          }}
                        />
                      </label>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Option Groups */}
          {optionGroups.map((group) => {
            const selectionsCount = (selectedOptions[group.id] || []).length;
            return (
              <div key={group.id} className="mb-6">
                <div className="flex items-center justify-between mb-3 bg-surface-section px-3 py-2 rounded-radius-md">
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm uppercase">
                      {group.name}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Escolha de {group.min_selections} a {group.max_selections} opções.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-radius-sm">
                    {selectionsCount} / {group.max_selections}
                  </span>
                </div>
                <div className="space-y-2">
                  {(group.options || []).map((opt, idx) => {
                    const isSelected = (selectedOptions[group.id] || []).some(
                      (o) => o.name === opt.name,
                    );
                    return (
                      <label
                        key={idx}
                        className={`flex items-center justify-between p-3 border rounded-radius-md cursor-pointer transition-colors ${isSelected ? 'border-action-primary' : 'border-border-default hover:border-border-focus'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center h-5 w-5 rounded-radius-sm border flex-shrink-0 transition-colors ${isSelected ? 'bg-action-primary border-action-primary text-white' : 'border-border-default'}`}
                          >
                            {isSelected && (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="w-3 h-3"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-text-primary text-sm">{opt.name}</span>
                        </div>
                        {opt.price_addition > 0 && (
                          <span className="text-sm text-action-primary font-medium">
                            +{' '}
                            {opt.price_addition.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        )}
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => toggleOption(group, opt)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-border-subtle bg-surface-card absolute bottom-0 left-0 right-0">
          {error && (
            <div className="text-status-error text-xs font-medium mb-3 text-center">{error}</div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 py-1 px-1 border border-border-default rounded-radius-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 flex items-center justify-center text-text-secondary hover:bg-surface-subtle rounded-radius-sm transition"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-bold text-text-primary text-lg w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 flex items-center justify-center text-action-primary hover:bg-surface-subtle rounded-radius-sm transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-between rounded-radius-md bg-action-primary py-3.5 px-4 text-sm font-bold text-white shadow-shadow-button-primary hover:bg-action-primary-hover active:scale-[0.98] transition"
            >
              <span>Adicionar</span>
              <span>
                {(finalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
