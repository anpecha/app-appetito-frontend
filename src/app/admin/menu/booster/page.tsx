'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionCard } from '@/app/admin/settings/_shared';
import CatalogEnhancerModal from '@/components/ui/catalog-enhancer-modal';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

export default function BoosterPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/proxy/catalog/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.filter((p: any) => !p.deleted_at));
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Potencializador de Cardápio"
        description="Use inteligência artificial para otimizar nomes e descrições dos seus produtos."
      >
        <Link href="/admin/menu/manager">
          <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar ao Gestor
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
        </div>
      ) : (
        <SectionCard title="Produtos no Cardápio" icon={Sparkles}>
          <p className="text-sm text-text-muted mb-6">
            {products.length} produtos encontrados. Clique em &quot;Iniciar Análise&quot; para
            receber sugestões da IA.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-80 overflow-y-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-surface-subtle border border-border-default rounded-radius-md px-4 py-3 text-sm"
              >
                <p className="font-bold text-text-primary truncate">{p.name}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {p.description || 'Sem descrição'}
                </p>
                <p className="text-xs font-bold text-action-primary mt-1">
                  R$ {p.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            Iniciar Análise com IA
          </Button>
        </SectionCard>
      )}

      <CatalogEnhancerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products}
        onSuccess={() => {
          fetch('/api/proxy/catalog/products')
            .then((r) => r.ok && r.json())
            .then((data) => {
              if (data) setProducts(data.filter((p: any) => !p.deleted_at));
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}
