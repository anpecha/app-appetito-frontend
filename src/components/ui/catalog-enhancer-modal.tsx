'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LocalProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface Suggestion {
  id: string;
  originalName: string;
  suggestedName: string;
  originalDescription: string | null;
  suggestedDescription: string;
}

interface CatalogEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  products: LocalProduct[];
}

export default function CatalogEnhancerModal({
  isOpen,
  onClose,
  onSuccess,
  products,
}: CatalogEnhancerModalProps) {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/services/potencializador/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.map((p) => ({ id: p.id, name: p.name, description: p.description })),
        }),
      });

      if (!res.ok) throw new Error('Erro ao analisar cardápio');

      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setAnalyzed(true);
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (suggestion: Suggestion) => {
    try {
      const res = await fetch(`/api/proxy/catalog/products/${suggestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suggestion.suggestedName,
          description: suggestion.suggestedDescription,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Erro ao aplicar sugestão.');
      }

      toast.success(`✨ "${suggestion.suggestedName}" aplicado com sucesso!`);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aplicar sugestão.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-page w-full max-w-2xl rounded-radius-xl shadow-lg border border-border-default overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-radius-md">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Potencializador com IA</h2>
              <p className="text-sm text-text-secondary mt-1">
                Aumente suas vendas com descrições mais atrativas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-subtle rounded-radius-md text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!analyzed && !loading && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Pronto para a mágica?</h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
                Nossa IA vai analisar os {products.length} itens do seu cardápio e sugerir nomes e
                descrições otimizados para neuromarketing e conversão.
              </p>
              <button
                onClick={handleAnalyze}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-radius-md font-bold text-sm hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Iniciar Análise
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto" />
              <p className="text-text-primary font-medium">Analisando seu cardápio...</p>
              <p className="text-xs text-text-muted">
                Isso pode levar alguns segundos dependendo da quantidade de itens.
              </p>
            </div>
          )}

          {analyzed && !loading && suggestions.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Cardápio Otimizado!</h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                Seu cardápio já possui ótimas descrições. Nenhuma sugestão urgente no momento.
              </p>
            </div>
          )}

          {analyzed && !loading && suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-text-primary">
                  {suggestions.length} Sugestões Encontradas
                </h3>
              </div>

              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="bg-surface-card border border-border-default rounded-radius-lg p-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Como é hoje
                      </span>
                      <p className="text-sm font-bold text-text-primary">{s.originalName}</p>
                      <p className="text-xs text-text-secondary">
                        {s.originalDescription || 'Sem descrição'}
                      </p>
                    </div>
                    {/* Sugestão */}
                    <div className="space-y-1 bg-purple-50 p-3 rounded-radius-md border border-purple-100">
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Sugestão IA
                      </span>
                      <p className="text-sm font-bold text-purple-900">{s.suggestedName}</p>
                      <p className="text-xs text-purple-800">{s.suggestedDescription}</p>
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-border-subtle pt-3">
                    <button
                      onClick={() => handleApply(s)}
                      className="text-xs font-bold text-action-primary hover:text-action-primary-hover flex items-center gap-1"
                    >
                      Aplicar sugestão <ArrowRight className="w-3 h-3" />
                    </button>
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
