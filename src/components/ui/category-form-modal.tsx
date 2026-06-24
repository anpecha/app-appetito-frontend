'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Category {
  id?: string;
  name: string;
  description: string | null;
  parent_id?: string | null;
}

interface Props {
  isOpen?: boolean;
  category?: Category;
  allCategories?: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryFormModal({
  category,
  allCategories = [],
  onClose,
  onSuccess,
}: Props) {
  const isEdit = !!category?.id;
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [parentId, setParentId] = useState<string | null>(category?.parent_id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out the category itself and its children (basic safeguard) to prevent circular references
  const availableParents = allCategories.filter((c) => c.id !== category?.id && !c.parent_id);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Nome é obrigatório.');
    setSaving(true);
    setError(null);

    const url = isEdit
      ? `/api/proxy/catalog/categories/${category.id}`
      : '/api/proxy/catalog/categories';

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          parent_id: parentId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Erro ao salvar categoria.');
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
      <div className="bg-surface-card rounded-radius-xl shadow-lg w-full max-w-md">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-radius-md hover:bg-surface-subtle text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-status-error bg-status-error/10 border border-status-error/20 rounded-radius-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary">Nome *</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Hambúrgueres"
              className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da categoria (opcional)"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary">
              Categoria Pai (para criar subcategoria)
            </label>
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-radius-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:border-action-primary"
            >
              <option value="">Nenhuma (Categoria Principal)</option>
              {availableParents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-radius-md border border-border-default text-text-secondary hover:bg-surface-subtle transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-bold rounded-radius-md bg-action-primary text-text-on-brand hover:bg-action-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Salvar alterações' : 'Criar categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
