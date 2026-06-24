'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2, ImagePlus, Plus, Trash2, Clock } from 'lucide-react';
import { formatCurrencyBRL, maskCurrency, parseCurrencyBRL } from '@/lib/format';

interface Category {
  id: string;
  name: string;
}

interface Size {
  id: string; // temporary for UI
  name: string;
  price: string;
  max_flavors: number;
}

interface Availability {
  id: string; // temp for UI
  day_of_week: number;
  start_time: string;
  end_time: string;
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

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

interface Product {
  id?: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number; // Base price or "starting from"
  image_url: string | null;
  active: boolean;
  product_type: 'pizza';
  fractional_pricing_strategy: 'highest_price' | 'average_price';
}

interface Props {
  product?: Product;
  categories: Category[];
  initialCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PizzaFormModal({
  product,
  categories,
  initialCategoryId,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = !!product?.id;

  // Core fields
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? initialCategoryId ?? categories[0]?.id ?? '',
  );
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [active, setActive] = useState(product?.active ?? true);
  const [fractionalStrategy, setFractionalStrategy] = useState<'highest_price' | 'average_price'>(
    product?.fractional_pricing_strategy ?? 'highest_price',
  );

  // Sizes
  const [sizes, setSizes] = useState<Size[]>([
    { id: crypto.randomUUID(), name: 'Grande', price: '60,00', max_flavors: 2 },
  ]);

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
          if (data.sizes && data.sizes.length > 0) {
            setSizes(
              data.sizes.map(
                (s: {
                  id?: string;
                  name?: string;
                  size_name?: string;
                  price: number;
                  max_flavors: number;
                }) => ({
                  id: s.id || crypto.randomUUID(),
                  name: s.name || s.size_name || '',
                  price: formatCurrencyBRL(s.price),
                  max_flavors: s.max_flavors,
                }),
              ),
            );
          }
          if (data.option_groups) {
            setOptionGroups(
              data.option_groups.map(
                (g: {
                  id?: string;
                  name: string;
                  min_options?: number;
                  min_selections?: number;
                  max_options?: number;
                  max_selections?: number;
                  options?: {
                    id?: string;
                    name: string;
                    price?: number;
                    price_addition?: number;
                  }[];
                  product_options?: {
                    id?: string;
                    name: string;
                    price?: number;
                    price_addition?: number;
                  }[];
                }) => ({
                  id: g.id || crypto.randomUUID(),
                  name: g.name,
                  min_options: g.min_options ?? g.min_selections ?? 0,
                  max_options: g.max_options ?? g.max_selections ?? 1,
                  options: (g.options || g.product_options || []).map(
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

  const addSize = () => {
    setSizes([...sizes, { id: crypto.randomUUID(), name: '', price: '0,00', max_flavors: 1 }]);
  };

  const removeSize = (id: string) => {
    setSizes(sizes.filter((s) => s.id !== id));
  };

  const updateSize = (id: string, field: keyof Size, value: string | number) => {
    setSizes(sizes.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

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
    if (sizes.length === 0) return setError('Adicione ao menos um tamanho para a pizza.');

    // Find base price (minimum size price)
    const numericPrices = sizes.map((s) => parseCurrencyBRL(s.price));
    const basePrice = Math.min(...numericPrices);

    setSaving(true);
    setError(null);

    const url = isEdit
      ? `/api/proxy/catalog/products/${product.id}`
      : '/api/proxy/catalog/products';

    const payload = {
      category_id: categoryId,
      name: name.trim(),
      description: description.trim() || null,
      price: basePrice, // Used as starting point
      image_url: imageUrl.trim() || null,
      active,
      product_type: 'pizza',
      fractional_pricing_strategy: fractionalStrategy,
    };

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Erro ao salvar pizza.');
      }
      const savedProduct = await res.json();
      const productId = savedProduct.id || product?.id;

      if (
        productId &&
        (sizes.length > 0 || optionGroups.length > 0 || availabilities.length > 0 || isEdit)
      ) {
        // Save Sizes, Options and Availability
        const complexDataPayload = {
          sizes: sizes.map((s) => ({
            size_name: s.name,
            price: parseCurrencyBRL(s.price),
            max_flavors: s.max_flavors,
          })),
          availability: availabilities.map((a) => ({
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
          })),
          option_groups: optionGroups.map((g) => ({
            name: g.name,
            min_selections: g.min_options,
            max_selections: g.max_options,
            options: g.options.map((o) => ({
              name: o.name,
              price_addition: parseCurrencyBRL(o.price),
            })),
          })),
        };
        const complexRes = await fetch(`/api/proxy/catalog/products/${productId}/complex-data`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complexDataPayload),
        });
        if (!complexRes.ok) {
          const errorData = await complexRes.json().catch(() => ({}));
          throw new Error(errorData.detail ?? 'Erro ao salvar tamanhos e opcionais da pizza.');
        }
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-card rounded-radius-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? 'Editar Pizza' : 'Nova Pizza'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-radius-md hover:bg-surface-subtle text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <p className="text-sm text-status-error bg-status-error/10 border border-status-error/20 rounded-radius-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-text-secondary">Nome *</label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Categoria Tradicionais, Especial..."
                className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-text-secondary">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a composição da pizza..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-secondary">
                Categoria do Cardápio *
              </label>
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

            {/* Fractional Option */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-secondary">
                Cálculo de Preço (Meio a Meio)
              </label>
              <select
                value={fractionalStrategy}
                onChange={(e) =>
                  setFractionalStrategy(e.target.value as 'highest_price' | 'average_price')
                }
                className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
              >
                <option value="highest_price">Cobrar pelo sabor mais caro</option>
                <option value="average_price">Cobrar a média (proporcional)</option>
              </select>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4" /> Imagem da Pizza
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

          {/* Tamanhos da Pizza */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">Tamanhos e Preços</h3>
                <p className="text-xs text-text-muted">
                  Adicione os tamanhos desta pizza (ex: Grande, Broto).
                </p>
              </div>
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-action-secondary text-text-primary border border-border-default rounded-radius-sm hover:bg-surface-subtle transition-colors"
              >
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {sizes.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start md:items-center gap-3 p-3 border border-border-default rounded-radius-md bg-surface-page"
                >
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase">
                      Tamanho
                    </label>
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateSize(s.id, 'name', e.target.value)}
                      placeholder="Ex: Grande (8 fatias)"
                      className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase">
                      Preço (R$)
                    </label>
                    <input
                      type="text"
                      value={s.price}
                      onChange={(e) => updateSize(s.id, 'price', maskCurrency(e.target.value))}
                      placeholder="0,00"
                      className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label
                      className="text-xs font-semibold text-text-secondary uppercase"
                      title="Máximo de sabores por pizza"
                    >
                      Max. Sabores
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={s.max_flavors || 1}
                      onChange={(e) => updateSize(s.id, 'max_flavors', Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
                    />
                  </div>
                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => removeSize(s.id)}
                      className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-radius-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options / Complements */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">Adicionais / Complementos</h3>
                <p className="text-xs text-text-muted">Ex: Bordas, Ingredientes Extras, etc.</p>
              </div>
              <button
                type="button"
                onClick={addOptionGroup}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-action-strong text-white rounded-radius-md hover:bg-action-strong-hover transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Grupo
              </button>
            </div>

            {optionGroups.length > 0 ? (
              <div className="space-y-4">
                {optionGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 border border-border-default rounded-radius-lg bg-surface-page space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase">
                          Nome do Grupo
                        </label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => updateOptionGroup(group.id, 'name', e.target.value)}
                          placeholder="Ex: Escolha sua borda, Adicionais..."
                          className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30"
                        />
                      </div>
                      <div className="w-20 space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase">
                          Mín
                        </label>
                        <input
                          type="number"
                          value={group.min_options}
                          onChange={(e) =>
                            updateOptionGroup(group.id, 'min_options', Number(e.target.value))
                          }
                          className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30"
                        />
                      </div>
                      <div className="w-20 space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase">
                          Máx
                        </label>
                        <input
                          type="number"
                          value={group.max_options}
                          onChange={(e) =>
                            updateOptionGroup(group.id, 'max_options', Number(e.target.value))
                          }
                          className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm focus:outline-none focus:ring-2 focus:ring-action-primary/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOptionGroup(group.id)}
                        className="mt-7 p-2 text-text-muted hover:text-status-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pl-4 space-y-2 border-l-2 border-border-subtle">
                      {group.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-3 bg-white p-2 rounded-radius-sm border border-border-subtle shadow-sm"
                        >
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOption(group.id, opt.id, 'name', e.target.value)}
                            placeholder="Nome da opção"
                            className="flex-1 px-2 py-1 text-sm border-none focus:ring-0"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-text-muted">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={opt.price || ''}
                              onChange={(e) =>
                                updateOption(group.id, opt.id, 'price', Number(e.target.value))
                              }
                              placeholder="0.00"
                              className="w-20 px-2 py-1 text-sm border border-border-default rounded-radius-sm focus:ring-1 focus:ring-action-primary"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(group.id, opt.id)}
                            className="p-1.5 text-text-muted hover:text-status-error transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(group.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-action-primary hover:bg-action-primary/5 rounded-radius-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Opção
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-border-default rounded-radius-xl text-center bg-surface-subtle/30">
                <p className="text-sm text-text-muted">
                  Nenhum adicional configurado para esta pizza.
                </p>
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Disponibilidade (Opcional)
                </h3>
                <p className="text-xs text-text-muted">
                  Desative a pizza em dias e horários específicos.
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
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setActive((v) => !v)}
                className={`w-11 h-6 rounded-radius-full transition-colors relative ${active ? 'bg-action-primary' : 'bg-border-default'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-radius-full shadow transition-transform ${active ? 'translate-x-5' : ''}`}
                />
              </div>
              <span className="text-sm font-semibold text-text-secondary">
                {active ? 'Pizza ativa (visível no cardápio)' : 'Pizza inativa (oculta)'}
              </span>
            </label>
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-border-subtle flex justify-end gap-2 shrink-0 bg-surface-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-radius-md border border-border-default text-text-secondary hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-bold rounded-radius-md bg-action-primary text-text-on-brand hover:bg-action-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Salvar alterações' : 'Salvar Pizza'}
          </button>
        </footer>
      </div>
    </div>
  );
}
