'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Search, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageItem {
  name: string;
  url: string;
  created_at?: string;
}

interface ImageBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

export default function ImageBankModal({ isOpen, onClose, onSelectImage }: ImageBankModalProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/catalog/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch images', error);
      toast.error('Erro ao carregar banco de imagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser uma imagem válida.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/proxy/catalog/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erro no upload');
      }

      const data = await res.json();
      toast.success('Upload realizado com sucesso!');

      // Adiciona na lista atual sem precisar recarregar
      setImages((prev) => [{ name: file.name, url: data.url }, ...prev]);
    } catch {
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-page w-full max-w-4xl h-[80vh] rounded-radius-xl shadow-lg border border-border-default flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-card">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Banco de Imagens</h2>
            <p className="text-sm text-text-secondary mt-1">
              Selecione uma imagem do seu catálogo ou faça upload.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-subtle rounded-radius-md text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border-default bg-surface-page flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome do arquivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border-default rounded-radius-md focus:ring-2 focus:ring-border-focus outline-none bg-surface-card"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-action-primary text-text-on-brand text-sm font-bold rounded-radius-md shadow-button-primary hover:bg-action-primary-hover transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Fazer Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-surface-page">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Carregando imagens...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">Nenhuma imagem encontrada.</p>
              {search && <p className="text-xs mt-1">Tente outro termo de busca.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onSelectImage(img.url);
                    onClose();
                  }}
                  className="group aspect-square relative rounded-radius-md overflow-hidden border border-border-default cursor-pointer hover:border-action-primary hover:shadow-md transition-all bg-surface-card flex items-center justify-center"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-[10px] text-white truncate text-center" title={img.name}>
                      {img.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
