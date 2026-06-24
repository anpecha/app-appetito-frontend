'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  ArrowRight,
  Image as ImageIcon,
  Upload,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CategoryFormModal from '@/components/ui/category-form-modal';
import ProductFormModal from '@/components/ui/product-form-modal';
import ImportCatalogModal from '@/components/ui/import-catalog-modal';
import CatalogEnhancerModal from '@/components/ui/catalog-enhancer-modal';
import BulkEditModal from '@/components/ui/bulk-edit-modal';
import ImageBankModal from '@/components/ui/image-bank-modal';
import { toast } from 'sonner';
// Unused global types removed to avoid collision

interface LocalCategory {
  id: string;
  name: string;
  description: string | null;
  order: number;
  parent_id: string | null;
}

interface LocalProduct {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  price_cents: number;
  image_url: string | null;
  active: boolean;
  is_active: boolean;
  order: number;
}

export default function MenuManagerPage() {
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<LocalCategory | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<LocalProduct | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [openCatDropdownId, setOpenCatDropdownId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEnhancerModal, setShowEnhancerModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImageBank, setShowImageBank] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [catsRes, prodsRes] = await Promise.all([
        fetch('/api/proxy/catalog/categories'),
        fetch('/api/proxy/catalog/products'),
      ]);

      if (!catsRes.ok || !prodsRes.ok) throw new Error('Falha ao carregar dados');

      const cats = await catsRes.json();
      const prods = await prodsRes.json();

      setCategories(cats);
      setProducts(prods);

      // Expand all by default initially
      if (expandedCategories.size === 0) {
        setExpandedCategories(new Set(cats.map((c: LocalCategory) => c.id)));
      }
    } catch (_err) {
      toast.error('Erro ao carregar cardápio.');
    } finally {
      setLoading(false);
    }
  }, [expandedCategories.size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleProductActive = async (product: LocalProduct) => {
    try {
      await fetch(`/api/proxy/catalog/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !product.active }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (product: LocalProduct) => {
    if (!window.confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/proxy/catalog/products/${product.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir produto.');
      toast.success(`"${product.name}" excluído com sucesso.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir produto.');
    }
  };

  const deleteCategory = async (category: LocalCategory) => {
    const count = products.filter((p) => p.category_id === category.id).length;
    const msg =
      count > 0
        ? `A categoria "${category.name}" possui ${count} produto(s). Excluí-la irá desassociá-los. Continuar?`
        : `Excluir a categoria "${category.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      const res = await fetch(`/api/proxy/catalog/categories/${category.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir categoria.');
      toast.success(`Categoria "${category.name}" excluída com sucesso.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir categoria.');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  // Filtering
  const filteredCategories = categories.filter((cat) => {
    const catProducts = products.filter((p) => p.category_id === cat.id);
    const hasMatchingProduct = catProducts.some((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || hasMatchingProduct;
  });

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action-primary" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      onClick={() => {
        setShowActionsDropdown(false);
        setOpenCatDropdownId(null);
      }}
    >
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Início</span>
          <span>/</span>
          <span>Gestor de cardápio</span>
          <span>/</span>
          <span className="text-text-secondary font-medium">Gestor</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Gestor de cardápio</h1>
      </div>

      {/* Banner Recomendação */}
      <div className="bg-surface-card rounded-radius-xl border-2 border-dashed border-blue-200 p-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-blue-50 p-4 rounded-radius-lg shrink-0">
            <ImageIcon className="w-12 h-12 text-blue-500" />
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-radius-sm mb-2 uppercase">
              Recomendado
            </span>
            <h2 className="text-lg font-bold text-text-primary">
              Agilize o cadastro do seu Cardápio e comece a vender hoje mesmo
            </h2>
            <p className="text-sm text-text-secondary">
              Envie fotos do seu cardápio para cadastrarmos suas categorias, itens, valores,
              promoções e outros
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-action-primary text-text-on-brand px-6 py-2.5 rounded-radius-md font-bold text-sm shadow-button-primary hover:bg-action-primary-hover transition-colors whitespace-nowrap"
        >
          Enviar cardápio
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Pesquisar categoria ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-card border border-border-default rounded-radius-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-border-focus outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-radius-md bg-surface-card text-sm font-semibold text-text-secondary hover:bg-surface-subtle transition-colors">
            <SlidersHorizontal className="w-4 h-4" /> Categorias
          </button>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionsDropdown(!showActionsDropdown);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-action-primary text-text-on-brand rounded-radius-md font-bold text-sm hover:bg-action-primary-hover transition-colors"
            >
              Ações <ChevronDown className="w-4 h-4" />
            </button>

            {showActionsDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-card border border-border-default rounded-radius-md shadow-lg z-50 py-1 overflow-hidden">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors"
                  onClick={() => {
                    setShowActionsDropdown(false);
                    setShowImportModal(true);
                  }}
                >
                  <Upload className="w-4 h-4" /> Importar cardápio
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors"
                  onClick={() => {
                    setShowActionsDropdown(false);
                    setShowEnhancerModal(true);
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-500" /> Potencializador IA
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors">
                  <ExternalLink className="w-4 h-4" /> Integração PDV
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors"
                  onClick={() => {
                    setShowActionsDropdown(false);
                    setShowBulkModal(true);
                  }}
                >
                  <ArrowRight className="w-4 h-4" /> Edição em massa
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors"
                  onClick={() => {
                    setShowActionsDropdown(false);
                    setShowImageBank(true);
                  }}
                >
                  <ImageIcon className="w-4 h-4" /> Imagens do cardápio
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setEditCategory(null);
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 border-2 border-action-primary text-action-primary rounded-radius-md font-bold text-sm hover:bg-action-primary/5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova categoria
          </button>
        </div>
      </div>

      {/* Categorias e Itens */}
      <div className="space-y-4 pb-20">
        {filteredCategories.length === 0 ? (
          <div className="bg-surface-card rounded-radius-xl p-12 text-center border border-border-default">
            <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary font-medium">
              Nenhum resultado encontrado para sua busca.
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-surface-card rounded-radius-xl border border-border-default shadow-card overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-surface-subtle border-b border-border-subtle px-6 py-4 flex items-center justify-between group">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-4 h-0.5 bg-text-muted/30 rounded-full" />
                        <div className="w-4 h-0.5 bg-text-muted/30 rounded-full" />
                        <div className="w-4 h-0.5 bg-text-muted/30 rounded-full" />
                      </div>
                      <h3 className="text-lg font-bold text-text-primary">{cat.name}</h3>
                    </div>
                    <span className="text-xs text-text-muted font-bold px-2 py-0.5 bg-blue-50 text-blue-500 rounded-radius-sm w-fit uppercase">
                      Itens principais
                    </span>
                  </div>
                  <div className="text-text-muted transition-transform duration-200">
                    {expandedCategories.has(cat.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenCatDropdownId(openCatDropdownId === cat.id ? null : cat.id);
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 border border-border-default rounded-radius-md bg-white text-xs font-bold text-text-secondary hover:bg-surface-subtle transition-colors"
                  >
                    Ações categoria <ChevronDown className="w-3 h-3" />
                  </button>

                  {openCatDropdownId === cat.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-surface-card border border-border-default rounded-radius-md shadow-lg z-50 py-1 overflow-hidden">
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-primary hover:bg-surface-subtle transition-colors"
                        onClick={() => {
                          setEditCategory(cat);
                          setShowCategoryModal(true);
                          setOpenCatDropdownId(null);
                        }}
                      >
                        <Edit2 className="w-3 h-3" /> Editar nome
                      </button>
                      <button
                        onClick={() => {
                          deleteCategory(cat);
                          setOpenCatDropdownId(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-status-error hover:bg-status-error/5 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir categoria
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products List */}
              {expandedCategories.has(cat.id) && (
                <div className="divide-y divide-border-subtle">
                  {products
                    .filter((p) => p.category_id === cat.id)
                    .map((prod) => (
                      <div
                        key={prod.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-surface-subtle/30 transition-colors group"
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="w-3 h-0.5 bg-text-muted/20" />
                            <div className="w-3 h-0.5 bg-text-muted/20" />
                            <div className="w-3 h-0.5 bg-text-muted/20" />
                          </div>

                          <div className="w-12 h-12 bg-gray-100 rounded-radius-md overflow-hidden shrink-0 border border-border-subtle">
                            {prod.image_url ? (
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-muted">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="font-bold text-text-primary">{prod.name}</h4>
                            <p className="text-xs text-text-muted truncate max-w-sm">
                              {prod.description || 'Sem descrição'}
                            </p>
                            <p className="text-sm font-bold text-text-primary">
                              {formatPrice(prod.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center bg-gray-100/50 p-1 rounded-radius-full gap-1 border border-border-subtle">
                            <button
                              onClick={() => toggleProductActive(prod)}
                              className={cn(
                                'px-3 py-1 text-[10px] font-bold rounded-radius-full transition-all uppercase tracking-wider',
                                prod.active
                                  ? 'bg-green-500 text-white shadow-sm'
                                  : 'text-text-muted hover:text-text-primary',
                              )}
                            >
                              Ativo
                            </button>
                            <button
                              className={cn(
                                'px-3 py-1 text-[10px] font-bold rounded-radius-full transition-all uppercase tracking-wider',
                                !prod.active
                                  ? 'bg-orange-400 text-white shadow-sm'
                                  : 'text-text-muted hover:text-text-primary',
                              )}
                            >
                              Pausado
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditProduct(prod);
                                setShowProductModal(true);
                              }}
                              className="p-2 text-text-muted hover:text-action-primary transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(prod)}
                              className="p-2 text-text-muted hover:text-status-error transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Add Item Trigger */}
                  <button
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setEditProduct(null);
                      setShowProductModal(true);
                    }}
                    className="w-full px-6 py-4 flex items-center gap-3 text-action-primary hover:bg-surface-subtle transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-action-primary shadow-lg shadow-action-primary/20 flex items-center justify-center text-white">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Adicionar Item</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        <div className="flex justify-center pt-4">
          <p className="text-text-muted text-sm font-medium">
            Exibindo {filteredCategories.length} de {categories.length} categorias
          </p>
        </div>
      </div>

      {/* Modais */}
      {showCategoryModal && (
        <CategoryFormModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          category={editCategory || undefined}
          allCategories={categories}
          onSuccess={() => {
            setShowCategoryModal(false);
            fetchData();
          }}
        />
      )}

      {showProductModal && (
        <ProductFormModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          product={(editProduct as any) || undefined}
          categories={categories}
          initialCategoryId={selectedCategoryId || undefined}
          onSuccess={() => {
            setShowProductModal(false);
            fetchData();
          }}
        />
      )}

      {showImportModal && (
        <ImportCatalogModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchData();
          }}
        />
      )}

      {showEnhancerModal && (
        <CatalogEnhancerModal
          isOpen={showEnhancerModal}
          onClose={() => setShowEnhancerModal(false)}
          onSuccess={() => fetchData()}
          products={products}
        />
      )}

      {showBulkModal && (
        <BulkEditModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => fetchData()}
          products={products}
          categories={categories}
        />
      )}

      {showImageBank && (
        <ImageBankModal
          isOpen={showImageBank}
          onClose={() => setShowImageBank(false)}
          onSelectImage={(url) => {
            toast.success('Imagem selecionada (copiada para a área de transferência)');
            navigator.clipboard.writeText(url);
          }}
        />
      )}
    </div>
  );
}
