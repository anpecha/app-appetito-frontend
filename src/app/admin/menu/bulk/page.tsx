'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Save, Info, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  price: number;
  active: boolean;
  image_url: string | null;
}

export default function BulkEditPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [_loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [catsRes, prodsRes] = await Promise.all([
        fetch('/api/proxy/catalog/categories'),
        fetch('/api/proxy/catalog/products'),
      ]);

      const cats = await catsRes.json();
      const prods = await prodsRes.json();

      setCategories(cats);
      setProducts(prods);
      setOriginalProducts(JSON.parse(JSON.stringify(prods)));
    } catch (_err) {
      toast.error('Erro ao carregar cardápio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePriceChange = (id: string, value: string) => {
    const numValue = parseFloat(value.replace(',', '.').replace(/[^\d.]/g, ''));
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: isNaN(numValue) ? 0 : numValue } : p)),
    );
  };

  const toggleStatus = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const hasChanges = JSON.stringify(products) !== JSON.stringify(originalProducts);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, we'd send only changed items or a bulk update request
      const changedItems = products.filter(
        (p, i) => JSON.stringify(p) !== JSON.stringify(originalProducts[i]),
      );

      await Promise.all(
        changedItems.map((item) =>
          fetch(`/api/proxy/catalog/products/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              price: item.price,
              active: item.active,
            }),
          }),
        ),
      );

      setOriginalProducts(JSON.parse(JSON.stringify(products)));
      toast.success('Alterações salvas com sucesso!');
    } catch (_err) {
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category_id === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && p.active) ||
      (filterStatus === 'paused' && !p.active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Edição em massa</h1>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Início</span>
            <span>/</span>
            <span>Gestor de cardápio</span>
            <span>/</span>
            <span className="text-text-secondary font-medium">Edição em massa</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={!hasChanges || saving}
            onClick={handleSave}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-radius-md font-bold text-sm transition-all shadow-button-primary',
              hasChanges && !saving
                ? 'bg-action-primary text-text-on-brand hover:bg-action-primary-hover'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            )}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
            <Save className="w-4 h-4" />
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-action-primary text-text-on-brand rounded-radius-md font-bold text-sm hover:bg-action-primary-hover">
              Ação em massa <ChevronLeft className="w-4 h-4 -rotate-90" />
            </button>
            {/* Dropdown simplified for now */}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-card rounded-radius-xl border border-border-default p-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Pesquise pelo nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-border-default rounded-radius-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-border-focus outline-none"
            />
          </div>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-border-default rounded-radius-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-border-focus"
        >
          <option value="all">Todos itens</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-border-default rounded-radius-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-border-focus"
        >
          <option value="all">Filtrar por status</option>
          <option value="active">Ativos</option>
          <option value="paused">Pausados</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-card rounded-radius-xl border border-border-default shadow-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle bg-surface-subtle/30 flex items-center justify-between">
          <p className="text-sm font-semibold text-text-secondary">
            Total de {filteredProducts.length} registros
          </p>
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 flex items-center justify-center bg-action-primary text-text-on-brand rounded-radius-sm text-xs font-bold">
              1
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/20 border-b border-border-subtle">
                <th className="p-4 w-12">
                  <input type="checkbox" className="rounded-radius-sm border-border-default" />
                </th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Itens
                </th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Preço
                </th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Categoria
                </th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Disponibilidade
                </th>
                <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-surface-subtle/10 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded-radius-sm border-border-default" />
                  </td>
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-radius-md border border-border-subtle overflow-hidden shrink-0">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <Info className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{prod.name}</span>
                        <span className="text-[10px] text-text-muted truncate max-w-[150px]">
                          Turbine seu lanche
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                        R$
                      </span>
                      <input
                        type="text"
                        value={prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        onChange={(e) => handlePriceChange(prod.id, e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-border-default rounded-radius-md text-sm font-bold text-text-primary"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {getCategoryName(prod.category_id)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border border-border-default flex items-center justify-center text-[10px] font-bold text-text-muted bg-white"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(prod.id)}
                        title={prod.active ? 'Ativo' : 'Pausado'}
                        className={cn(
                          'w-10 h-5 rounded-full relative transition-colors',
                          prod.active ? 'bg-green-500' : 'bg-gray-300',
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all shadow-sm',
                            prod.active ? 'right-0.5' : 'left-0.5',
                          )}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-text-muted">Nenhum item encontrado.</div>
        )}
      </div>
    </div>
  );
}
