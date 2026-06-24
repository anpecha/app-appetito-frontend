/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ImagePlus, Plus, Trash2, Clock } from 'lucide-react';
import PizzaFormModal from './pizza-form-modal';
import { formatCurrencyBRL, maskCurrency, parseCurrencyBRL } from '@/lib/format';

interface Category {
  id: string;
  name: string;
}

interface LocalProduct {
  id?: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active?: boolean;
  product_type?: 'standard' | 'pizza' | 'variable';
  pizza_category_id?: string | null;
  fractional_pricing_strategy?: string | null;
}

interface Option {
  id: string; // temp for UI
  name: string;
  price: string;
}

interface OptionGroup {
  id: string; // temp for UI
  name: string;
  min_options: number;
  max_options: number;
  options: Option[];
}

interface Availability {
  id: string; // temp for UI
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

interface Props {
  isOpen?: boolean;
  product?: LocalProduct;
  categories?: Category[];
  initialCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({
  product,
  categories = [],
  initialCategoryId,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = !!product?.id;
  const [productType, setProductType] = useState<'standard' | 'pizza' | 'variable' | null>(
    product?.product_type || null,
  );

  // Core fields
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? initialCategoryId ?? categories[0]?.id ?? '',
  );
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(formatCurrencyBRL(product?.price));
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [active, setActive] = useState(product?.active ?? true);

  // Options / Complements
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);

  // Availability
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Sync categoryId when categories load
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(initialCategoryId ?? categories[0].id);
    }
  }, [categories, initialCategoryId, categoryId]);

  useEffect(() => {
    if (isEdit && product?.id) {
      fetch(`/api/proxy/catalog/products/${product.id}/complex-data`)
        .then((res) => res.json())
        .then((data) => {
          if (data.option_groups) {
            setOptionGroups(
              data.option_groups.map(
                (g: {
                  id?: string;
                  name: string;
                  min_selections?: number;
                  max_selections?: number;
                  options?: {
                    id?: string;
                    name: string;
                    price?: number;
                    price_addition?: number;
                  }[];
                }) => ({
                  id: g.id || crypto.randomUUID(),
                  name: g.name,
                  min_options: g.min_selections || 0,
                  max_options: g.max_selections || 1,
                  options: (g.options || []).map(
                    (o: {
                      id?: string;
                      name: string;
                      price?: number;
                      price_addition?: number;
                    }) => ({
                      id: o.id || crypto.randomUUID(),
                      name: o.name,
                      price: formatCurrencyBRL(o.price ?? o.price_addition ?? 0),
                    }),
                  ),
                }),
              ),
            );
          }

          if (data.availability) {
            setAvailabilities(
              data.availability.map(
                (a: {
                  id?: string;
                  day_of_week: number;
                  start_time: string;
                  end_time: string;
                }) => ({
                  id: a.id || crypto.randomUUID(),
                  day_of_week: a.day_of_week,
                  start_time: a.start_time,
                  end_time: a.end_time,
                }),
              ),
            );
          }
        })
        .catch(console.error);
    }
  }, [isEdit, product?.id]);

  // Helpers for Options
  const addOptionGroup = () => {
    setOptionGroups([
      ...optionGroups,
      { id: crypto.randomUUID(), name: '', min_options: 0, max_options: 1, options: [] },
    ]);
  };
  const updateOptionGroup = (id: string, field: keyof OptionGroup, value: string | number) => {
    setOptionGroups(optionGroups.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };
  const removeOptionGroup = (id: string) => {
    setOptionGroups(optionGroups.filter((g) => g.id !== id));
  };
  const addOption = (groupId: string) => {
    setOptionGroups(
      optionGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: [...g.options, { id: crypto.randomUUID(), name: '', price: '0,00' }],
            }
          : g,
      ),
    );
  };
  const updateOption = (
    groupId: string,
    optionId: string,
    field: keyof Option,
    value: string | number,
  ) => {
    setOptionGroups(
      optionGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) => (o.id === optionId ? { ...o, [field]: value } : o)),
            }
          : g,
      ),
    );
  };
  const removeOption = (groupId: string, optionId: string) => {
    setOptionGroups(
      optionGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.filter((o) => o.id !== optionId),
            }
          : g,
      ),
    );
  };

  // Helpers for Availability
  const addAvailability = () => {
    setAvailabilities([
      ...availabilities,
      {
        id: crypto.randomUUID(),
        day_of_week: 1,
        start_time: '08:00',
        end_time: '22:00',
      },
    ]);
  };
  const updateAvailability = (id: string, field: keyof Availability, value: number | string) => {
    setAvailabilities(availabilities.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };
  const removeAvailability = (id: string) => {
    setAvailabilities(availabilities.filter((a) => a.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return setError('Por favor, selecione um arquivo de imagem.');
    }

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/proxy/catalog/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Erro ao fazer upload da imagem.');
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro no upload.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Nome é obrigatório.');
    if (!categoryId) return setError('Selecione uma categoria.');
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) return setError('Preço inválido.');

    setSaving(true);
    setError(null);

    const url = isEdit
      ? `/api/proxy/catalog/products/${product.id}`
      : '/api/proxy/catalog/products';

    const payload = {
      category_id: categoryId,
      name: name.trim(),
      description: description.trim() || null,
      price: parseCurrencyBRL(price),
      image_url: imageUrl.trim() || null,
      active,
      product_type: productType || 'standard',
    };

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Erro ao salvar produto.');
      }
      const savedProduct = await res.json();
      const productId = savedProduct.id || product?.id;

      if (productId && (optionGroups.length > 0 || availabilities.length > 0 || isEdit)) {
        // Save Options and Availability
        const complexDataPayload = {
          option_groups: optionGroups.map((g) => ({
            name: g.name,
            min_selections: g.min_options,
            max_selections: g.max_options,
            options: g.options.map((o) => ({
              name: o.name,
              price_addition: parseCurrencyBRL(o.price),
            })),
          })),
          availability: availabilities.map((a) => ({
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
          })),
        };
        const complexRes = await fetch(`/api/proxy/catalog/products/${productId}/complex-data`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complexDataPayload),
        });
        if (!complexRes.ok) {
          const errorData = await complexRes.json().catch(() => ({}));
          throw new Error(errorData.detail ?? 'Erro ao salvar opcionais do produto.');
        }
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setSaving(false);
    }
  };

  if (!productType) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-surface-card rounded-radius-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
            <h2 className="text-xl font-bold text-text-primary">Novo Item</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-radius-md hover:bg-surface-subtle text-text-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </header>
          <div className="p-6">
            <p className="text-text-secondary mb-6 text-sm font-medium">
              Selecione o tipo de item que deseja cadastrar:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setProductType('standard')}
                className="flex flex-col items-center justify-center p-8 border-2 border-border-default hover:border-action-primary rounded-radius-xl hover:bg-surface-subtle transition-all group text-center"
              >
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-red-50 text-gray-400 group-hover:text-action-primary rounded-full flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Item Principal</h3>
                <p className="text-sm text-text-muted">Lanches, pratos, porções, bebidas e etc.</p>
              </button>

              <button
                onClick={() => setProductType('pizza')}
                className="flex flex-col items-center justify-center p-8 border-2 border-border-default hover:border-action-primary rounded-radius-xl hover:bg-surface-subtle transition-all group text-center"
              >
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-red-50 text-gray-400 group-hover:text-action-primary rounded-full flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 21a9 9 0 009-9H3a9 9 0 009 9z M12 3v9M17.657 7.343L12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Pizza</h3>
                <p className="text-sm text-text-muted">
                  Pizzas com diversos tamanhos com 1 até 5 sabores.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productType === 'pizza') {
    return (
      <PizzaFormModal
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        product={product as any}
        categories={categories}
        initialCategoryId={initialCategoryId}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-card rounded-radius-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-radius-md hover:bg-surface-subtle text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <p className="text-sm text-status-error bg-status-error/10 border border-status-error/20 rounded-radius-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary">Categoria *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary">Nome *</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Big Smash Burger"
              className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredientes, diferenciais..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary resize-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary">Preço (R$) *</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(maskCurrency(e.target.value))}
              placeholder="0,00"
              className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
            />
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4" /> Imagem do Produto
            </label>

            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL da imagem (opcional)"
                className="flex-1 px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-3 py-2 bg-action-secondary text-text-primary border border-border-default rounded-radius-sm hover:bg-surface-subtle transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {imageUrl && (
              <div className="relative mt-2 group">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-radius-lg border border-border-subtle"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-status-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-text-muted italic">
              Formatos suportados: JPG, PNG, WEBP. Tamanho máx recomendável: 2MB.
            </p>
          </div>

          {/* Complement Groups */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">Complementos (Opcional)</h3>
                <p className="text-xs text-text-muted">
                  Adicione grupos de escolhas (ex: Escolha a bebida, Adicionais).
                </p>
              </div>
              <button
                type="button"
                onClick={addOptionGroup}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-action-secondary text-text-primary border border-border-default rounded-radius-sm hover:bg-surface-subtle transition-colors"
              >
                <Plus className="w-3 h-3" /> Adicionar Grupo
              </button>
            </div>

            <div className="space-y-4">
              {optionGroups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border border-border-default rounded-radius-md bg-surface-page space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Nome do Grupo
                      </label>
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateOptionGroup(group.id, 'name', e.target.value)}
                        placeholder="Ex: Escolha a sua bebida"
                        className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                      />
                    </div>
                    <div className="w-20 space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Mínimo
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={group.min_options}
                        onChange={(e) =>
                          updateOptionGroup(group.id, 'min_options', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                      />
                    </div>
                    <div className="w-20 space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Máximo
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={group.max_options}
                        onChange={(e) =>
                          updateOptionGroup(group.id, 'max_options', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                      />
                    </div>
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => removeOptionGroup(group.id)}
                        className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-radius-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options in group */}
                  <div className="pl-4 border-l-2 border-border-subtle space-y-2">
                    {group.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => updateOption(group.id, opt.id, 'name', e.target.value)}
                          placeholder="Nome da opção. Ex: Coca-Cola Lata"
                          className="flex-1 px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                        />
                        <input
                          type="text"
                          value={opt.price}
                          onChange={(e) =>
                            updateOption(group.id, opt.id, 'price', maskCurrency(e.target.value))
                          }
                          placeholder="0,00 (+R$)"
                          className="w-24 px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(group.id, opt.id)}
                          className="p-1 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-radius-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(group.id)}
                      className="text-xs font-semibold text-action-primary hover:underline"
                    >
                      + Adicionar nova opção
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Disponibilidade (Opcional)
                </h3>
                <p className="text-xs text-text-muted">
                  Desative o produto em dias e horários específicos.
                </p>
              </div>
              <button
                type="button"
                onClick={addAvailability}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-action-secondary text-text-primary border border-border-default rounded-radius-sm hover:bg-surface-subtle transition-colors"
              >
                <Plus className="w-3 h-3" /> Adicionar Horário
              </button>
            </div>

            {availabilities.length > 0 ? (
              <div className="space-y-3">
                {availabilities.map((av) => (
                  <div
                    key={av.id}
                    className="flex items-center gap-3 p-3 border border-border-default rounded-radius-md bg-surface-page"
                  >
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Dia
                      </label>
                      <select
                        value={av.day_of_week}
                        onChange={(e) =>
                          updateAvailability(av.id, 'day_of_week', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Início
                      </label>
                      <input
                        type="time"
                        value={av.start_time}
                        onChange={(e) => updateAvailability(av.id, 'start_time', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Até
                      </label>
                      <input
                        type="time"
                        value={av.end_time}
                        onChange={(e) => updateAvailability(av.id, 'end_time', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                      />
                    </div>
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => removeAvailability(av.id)}
                        className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-radius-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-border-default rounded-radius-md text-center">
                <p className="text-sm text-text-muted">Totalmente disponível 24x7.</p>
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div className="pt-4 border-t border-border-subtle">
            <label className="flex items-center gap-3 cursor-pointer py-2">
              <div
                onClick={() => setActive((v) => !v)}
                className={`w-11 h-6 rounded-radius-full transition-colors relative ${active ? 'bg-action-primary' : 'bg-border-default'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-radius-full shadow transition-transform ${active ? 'translate-x-5' : ''}`}
                />
              </div>
              <span className="text-sm font-semibold text-text-secondary">
                {active ? 'Produto ativo (visível no cardápio)' : 'Produto inativo (oculto)'}
              </span>
            </label>
          </div>
        </form>

        <footer className="px-6 py-4 border-t border-border-subtle flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-radius-md border border-border-default text-text-secondary hover:bg-surface-subtle transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-bold rounded-radius-md bg-action-primary text-text-on-brand hover:bg-action-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </footer>
      </div>
    </div>
  );
}
