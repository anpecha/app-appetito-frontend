'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function CourierLoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/proxy/delivery/courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
      });

      if (!res.ok) {
        setError('Telefone não encontrado. Verifique se você está cadastrado como entregador.');
        return;
      }

      const data = await res.json();
      localStorage.setItem(
        'courier_session',
        JSON.stringify({
          id: data.id,
          name: data.name,
          phone: data.phone,
          vehicle_type: data.vehicle_type,
          restaurant_name: data.restaurant_name,
          restaurant_id: data.restaurant_id,
        }),
      );
      router.push('/courier/dashboard');
    } catch {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-action-primary/10 rounded-full mb-4">
            <Bike className="h-8 w-8 text-action-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">App do Entregador</h1>
          <p className="text-sm text-text-muted mt-1">Entre com seu telefone para acessar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Telefone do entregador
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full pl-10 pr-4 py-3 text-sm border border-border-default rounded-radius-md bg-surface-card focus:outline-none focus:ring-2 focus:ring-action-primary/30"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-status-error font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, '').length < 10}
            className="w-full flex items-center justify-center gap-2 bg-action-primary hover:bg-action-primary/90 text-text-on-brand font-bold py-3 rounded-radius-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
