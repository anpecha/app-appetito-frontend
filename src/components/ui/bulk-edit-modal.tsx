'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number | string;
  price_cents?: number;
  category_id: string;
  is_active: boolean;
  image_url: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  products: Product[];
  categories: Category[];
}

export default function BulkEditModal({
  isOpen,
  onClose,
  onSuccess,
  products,
  categories,
}: BulkEditModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Bulk action states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Only fetch or reset when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectedCategory('');
      setSelectedStatus('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleApply = async () => {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos um produto para editar.');
      return;
    }

    if (!selectedCategory && !selectedStatus) {
      toast.error('Defina pelo menos uma alteração (categoria ou status).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        product_ids: selectedIds,
        category_id: selectedCategory || undefined,
        active:
          selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
      };

      const res = await fetch('/api/proxy/catalog/products/bulk/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Erro ao aplicar alterações em massa.');
      }

      const data = await res.json();
      toast.success(data.message || `${selectedIds.length} produtos atualizados com sucesso!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-page w-full max-w-4xl max-h-[90vh] rounded-radius-xl shadow-lg border border-border-default flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-card">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Edição em Massa</h2>
            <p className="text-sm text-text-secondary mt-1">
              Altere categorias e status de múltiplos produtos simultaneamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-subtle rounded-radius-md text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-hidden flex flex-col md:flex-row gap-6 flex-1">
          {/* Bulk Actions Panel */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 border-r border-border-default pr-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                O que deseja alterar?
              </h3>
              <p className="text-xs text-text-muted mb-4">
                Essas alterações serão aplicadas a todos os {selectedIds.length} produtos
                selecionados.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">
                  Nova Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-border-default rounded-radius-md px-3 py-2 text-sm bg-surface-card focus:ring-2 focus:ring-border-focus outline-none"
                >
                  <option value="">-- Não alterar --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">
                  Novo Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-border-default rounded-radius-md px-3 py-2 text-sm bg-surface-card focus:ring-2 focus:ring-border-focus outline-none"
                >
                  <option value="">-- Não alterar --</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button
                onClick={handleApply}
                disabled={loading || selectedIds.length === 0}
                className="w-full py-2.5 rounded-radius-md bg-action-primary text-text-on-brand font-bold text-sm shadow-button-primary hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Aplicar a {selectedIds.length} produtos
              </button>
            </div>
          </div>

          {/* Products List Panel */}
          <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Produtos ({products.length})
              </h3>
              <button
                onClick={toggleAll}
                className="text-xs font-medium text-action-primary hover:underline"
              >
                {selectedIds.length === products.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-border-default rounded-radius-md bg-surface-card">
              {products.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm">
                  Nenhum produto encontrado.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-subtle sticky top-0 z-10 border-b border-border-default">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === products.length && products.length > 0}
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-border-default text-action-primary focus:ring-action-primary"
                        />
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase">
                        Categoria Atual
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {products.map((product) => {
                      const categoryName =
                        categories.find((c) => c.id === product.category_id)?.name ||
                        'Sem categoria';
                      return (
                        <tr
                          key={product.id}
                          onClick={() => toggleProduct(product.id)}
                          className={cn(
                            'cursor-pointer transition-colors',
                            selectedIds.includes(product.id)
                              ? 'bg-action-primary/5'
                              : 'hover:bg-surface-subtle',
                          )}
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(product.id)}
                              onChange={() => toggleProduct(product.id)}
                              className="w-4 h-4 rounded border-border-default text-action-primary focus:ring-action-primary pointer-events-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-text-primary line-clamp-1">
                              {product.name}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-surface-page border border-border-subtle px-2 py-1 rounded-radius-sm text-text-secondary">
                              {categoryName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {product.is_active ? (
                              <span className="inline-flex w-2 h-2 rounded-full bg-status-success"></span>
                            ) : (
                              <span className="inline-flex w-2 h-2 rounded-full bg-status-error"></span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
