'use client';

import { useState } from 'react';
import { X, Upload, Link as LinkIcon, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImportCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportCatalogModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportCatalogModalProps) {
  const [importType, setImportType] = useState<'url' | 'file' | 'ai'>('file');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (importType === 'url' && !url.trim()) {
      toast.error('Por favor, insira a URL do iFood.');
      return;
    }
    if (importType === 'file' && !file) {
      toast.error('Por favor, selecione um arquivo ZIP ou JSON.');
      return;
    }
    if (importType === 'ai') {
      toast.info(
        'Importação via IA em desenvolvimento. Use o Potencializador de Cardápio por enquanto.',
      );
      return;
    }

    setLoading(true);
    try {
      let res: Response;

      if (importType === 'file' && file) {
        // Send as multipart/form-data for file uploads
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/proxy/catalog/import', {
          method: 'POST',
          body: formData, // Browser sets Content-Type with boundary automatically
        });
      } else {
        // URL-based import
        res = await fetch('/api/proxy/catalog/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 'Erro na importação. Verifique os dados e tente novamente.',
        );
      }

      const data = await res.json();
      toast.success(data.message || 'Cardápio importado com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-page w-full max-w-lg rounded-radius-xl shadow-lg border border-border-default overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-card">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Importar Cardápio</h2>
            <p className="text-sm text-text-secondary mt-1">
              Importe facilmente do iFood ou crie com IA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-subtle rounded-radius-md text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Select import type */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setImportType('file')}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-radius-md border text-sm font-medium transition-colors',
                importType === 'file'
                  ? 'border-action-primary bg-action-primary/5 text-action-primary'
                  : 'border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle',
              )}
            >
              <Upload className="w-5 h-5" />
              Arquivo ZIP
            </button>
            <button
              onClick={() => setImportType('url')}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-radius-md border text-sm font-medium transition-colors',
                importType === 'url'
                  ? 'border-action-primary bg-action-primary/5 text-action-primary'
                  : 'border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle',
              )}
            >
              <LinkIcon className="w-5 h-5" />
              Link iFood
            </button>
            <button
              onClick={() => setImportType('ai')}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-radius-md border text-sm font-medium transition-colors relative overflow-hidden',
                importType === 'ai'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-border-default bg-surface-card text-text-secondary hover:bg-surface-subtle',
              )}
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
              Gerar via IA
              <span className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] px-1.5 py-0.5 rounded-bl-radius-sm font-bold uppercase">
                Novo
              </span>
            </button>
          </div>

          {/* Dynamic inputs */}
          {importType === 'file' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">
                Arquivo iFood (ZIP ou JSON)
              </label>
              <div className="border-2 border-dashed border-border-default rounded-radius-md p-8 flex flex-col items-center justify-center bg-surface-card text-center hover:bg-surface-subtle transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-text-muted mb-3" />
                <span className="text-sm font-medium text-text-primary">
                  Clique ou arraste seu arquivo
                </span>
                <span className="text-xs text-text-muted mt-1">
                  Formatos suportados: .zip, .json
                </span>
                <input
                  type="file"
                  accept=".zip,.json"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer"></label>
                {file && (
                  <span className="mt-3 text-sm text-action-primary font-medium">{file.name}</span>
                )}
              </div>
            </div>
          )}

          {importType === 'url' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">
                Link da loja no iFood
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ex: https://www.ifood.com.br/delivery/cidade/restaurante..."
                className="w-full border border-border-default rounded-radius-md px-3 py-2 text-sm focus:ring-2 focus:ring-border-focus outline-none"
              />
              <p className="text-xs text-text-muted">
                Importaremos os produtos, descrições e preços automaticamente.
              </p>
            </div>
          )}

          {importType === 'ai' && (
            <div className="space-y-2">
              <div className="bg-purple-50 border border-purple-100 rounded-radius-md p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-purple-900">Como funciona?</h4>
                  <p className="text-xs text-purple-700 mt-1">
                    Nossa IA pode analisar seu cardápio em PDF, imagem ou texto livre e organizá-lo
                    automaticamente na plataforma.
                  </p>
                </div>
              </div>
              <label className="text-sm font-semibold text-text-primary mt-4 block">
                Foto ou PDF do Cardápio
              </label>
              <input type="file" className="w-full text-sm text-text-muted" />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-default bg-surface-card flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-radius-md border border-border-default text-text-primary font-medium text-sm hover:bg-surface-subtle transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-6 py-2 rounded-radius-md bg-action-primary text-text-on-brand font-bold text-sm shadow-button-primary hover:bg-action-primary-hover transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {importType === 'ai' ? 'Gerar com IA' : 'Importar Cardápio'}
          </button>
        </div>
      </div>
    </div>
  );
}
