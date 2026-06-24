'use client';

import React, { useState } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, SectionCard, Toast, InfoCard, useToast } from '@/app/admin/settings/_shared';
import ImportCatalogModal from '@/components/ui/import-catalog-modal';
import Link from 'next/link';

export default function ImportPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { toast, show: showToast } = useToast();

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 animate-in fade-in duration-500">
      <PageHeader
        title="Importação de Cardápio"
        description="Importe produtos de outras plataformas como iFood, Uber Eats ou cardápio físico."
      >
        <Link href="/admin/menu/manager">
          <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar ao Gestor
          </Button>
        </Link>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-6">
        <SectionCard title="Arquivo ZIP / JSON" icon={Upload} className="flex flex-col">
          <p className="text-sm text-text-muted mb-4">
            Importe o arquivo exportado do iFood (ZIP ou JSON) com todos os produtos, categorias,
            preços e descrições.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
            <CheckCircle className="h-3.5 w-3.5 text-status-success" />
            Suporta iFood, Uber Eats
          </div>
          <Button onClick={() => setModalOpen(true)} variant="primary" className="mt-auto">
            Importar Arquivo
          </Button>
        </SectionCard>

        <SectionCard title="Link do iFood" icon={LinkIcon} className="flex flex-col">
          <p className="text-sm text-text-muted mb-4">
            Cole a URL pública do seu restaurante no iFood para importar automaticamente produtos e
            preços.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
            <CheckCircle className="h-3.5 w-3.5 text-status-success" />
            Importação automática
          </div>
          <Button onClick={() => setModalOpen(true)} variant="secondary" className="mt-auto">
            Usar Link
          </Button>
        </SectionCard>

        <SectionCard title="Gerar via IA" icon={Sparkles} className="flex flex-col relative">
          <span className="absolute top-3 right-3 bg-[#FFC72E] text-[#202020] text-[10px] font-bold px-2 py-0.5 rounded-full">
            Novo
          </span>
          <p className="text-sm text-text-muted mb-4">
            Tire uma foto do seu cardápio físico ou envie um PDF. A IA extrai todos os produtos
            automaticamente.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
            <AlertCircle className="h-3.5 w-3.5 text-status-warning" />
            Em desenvolvimento
          </div>
          <Button disabled variant="outline" className="mt-auto opacity-50">
            Em Breve
          </Button>
        </SectionCard>
      </div>

      <InfoCard icon={Upload}>
        Após a importação, revise os produtos no Gestor de Cardápio antes de publicar. Produtos
        duplicados serão detectados automaticamente.
      </InfoCard>

      <ImportCatalogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => showToast('success', 'Cardápio importado com sucesso!')}
      />
    </div>
  );
}
