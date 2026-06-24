'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  ChevronDown,
  Image as ImageIcon,
  RefreshCcw,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface LocalCategory {
  id: string;
  name: string;
}

interface LocalProduct {
  id: string;
  category_id: string;
  name: string;
  image_url: string | null;
}

export default function MenuImagesPage() {
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    } catch (_err) {
      toast.error('Erro ao carregar itens do cardápio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleImageUpload = async (productId: string, file: File) => {
    try {
      toast.loading('Enviando imagem...', { id: `upload-${productId}` });

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/proxy/catalog/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error('Erro no upload: ' + errText);
      }

      const data = await uploadRes.json();
      const imageUrl = data.url;

      // Atualiza o produto com a nova imagem
      const updateRes = await fetch(`/api/proxy/catalog/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!updateRes.ok) throw new Error('Erro ao vincular imagem ao produto');

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, image_url: imageUrl } : p)),
      );
      toast.success('Imagem atualizada com sucesso!', { id: `upload-${productId}` });
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado', { id: `upload-${productId}` });
    }
  };

  const handleImageRemove = async (productId: string) => {
    try {
      toast.loading('Removendo imagem...', { id: `remove-${productId}` });

      const updateRes = await fetch(`/api/proxy/catalog/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: null }),
      });

      if (!updateRes.ok) throw new Error('Erro ao remover imagem do produto');

      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, image_url: null } : p)));
      toast.success('Imagem removida com sucesso!', { id: `remove-${productId}` });
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado', { id: `remove-${productId}` });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Início</span>
          <ChevronRight className="w-3 h-3" />
          <span>Gestor de cardápio</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary font-medium">Imagens do cardápio</span>
        </div>
        <p className="text-text-secondary font-medium text-sm">
          Por aqui, é possível remover, alterar e editar as imagens dos seus itens
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-surface-card border border-border-default rounded-radius-md px-4 py-2 text-sm focus:ring-2 focus:ring-border-focus outline-none transition-all appearance-none text-text-primary"
          >
            <option value="all">Todos</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Pesquise pelo nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-card border border-border-default rounded-radius-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-border-focus outline-none transition-all text-text-primary"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filteredProducts.map((prod) => (
          <ProductImageCard
            key={prod.id}
            product={prod}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-surface-card rounded-radius-xl p-12 text-center border border-border-default">
          <p className="text-text-secondary font-medium">Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
}

function ProductImageCard({
  product,
  onUpload,
  onRemove,
}: {
  product: LocalProduct;
  onUpload: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(product.id, e.target.files[0]);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-surface-card rounded-radius-lg p-5 shadow-sm border border-border-default flex flex-col gap-4 aspect-square h-auto relative">
      <h3 className="font-bold text-text-primary text-sm truncate w-full" title={product.name}>
        {product.name}
      </h3>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {product.image_url ? (
        <div className="flex-1 flex flex-col items-center justify-between border border-border-subtle rounded-radius-md overflow-hidden p-2 group relative">
          <div className="flex-1 w-full flex items-center justify-center p-2">
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Action buttons matching the screenshot style */}
          <div className="w-full flex items-center justify-center gap-4 mt-2 mb-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 border border-blue-200 rounded-radius-md text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center bg-white"
              title="Trocar imagem"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(product.id)}
              className="p-2 border border-blue-200 rounded-radius-md text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center bg-white"
              title="Remover imagem"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 w-full border border-dashed border-blue-300 rounded-radius-md flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer hover:bg-blue-50/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="bg-blue-50 text-blue-400 p-3 rounded-radius-lg">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <span className="block text-sm text-text-secondary mb-1">Escolha a foto</span>
            <span className="block text-xs text-text-muted">
              Clique aqui ou arraste a<br />
              foto para cá.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
