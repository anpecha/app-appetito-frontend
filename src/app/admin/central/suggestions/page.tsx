'use client';

import React, { useState } from 'react';
import { UserSquare2, Send, Lightbulb, Bug, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast, PageHeader, useToast, SectionCard, InfoCard } from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

const SUGGESTION_TYPES = [
  { value: 'idea', label: 'Sugestão de melhoria', icon: Lightbulb },
  { value: 'bug', label: 'Reportar erro', icon: Bug },
  { value: 'praise', label: 'Elogio', icon: Star },
];

export default function SuggestionsPage() {
  const [type, setType] = useState<string>('idea');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast, show: showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
    showToast('success', 'Sugestão enviada com sucesso! Obrigado pelo feedback.');
    setTimeout(() => {
      setSent(false);
      setTitle('');
      setDescription('');
      setEmail('');
    }, 2000);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-space-8 pb-space-12 max-w-2xl animate-in fade-in duration-500">
        <PageHeader title="Sugestões" description="Compartilhe sua opinião conosco." />
        <div className="flex flex-col items-center justify-center py-20 bg-surface-card border border-border-default rounded-radius-xl">
          <div className="h-16 w-16 rounded-radius-full bg-status-success/10 flex items-center justify-center mb-4">
            <Send className="h-8 w-8 text-status-success" />
          </div>
          <p className="text-lg font-black text-text-primary">Obrigado!</p>
          <p className="text-sm text-text-secondary mt-1">
            Sua sugestão foi recebida e será analisada pela nossa equipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-2xl animate-in fade-in duration-500">
      <PageHeader
        title="Sugestões"
        description="Compartilhe ideias, reporte erros ou envie elogios."
      />

      {toast && <Toast type={toast.type} message={toast.message} />}

      <SectionCard
        title="Enviar Feedback"
        icon={UserSquare2}
        description="Sua opinião nos ajuda a melhorar o Appétito."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase ml-1">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {SUGGESTION_TYPES.map((st) => {
                const Icon = st.icon;
                return (
                  <label
                    key={st.value}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 border rounded-radius-xl cursor-pointer transition-all',
                      type === st.value
                        ? 'border-action-primary bg-action-primary/5 ring-1 ring-action-primary'
                        : 'border-border-default hover:border-border-focus bg-surface-subtle',
                    )}
                  >
                    <input
                      type="radio"
                      checked={type === st.value}
                      onChange={() => setType(st.value)}
                      className="sr-only"
                    />
                    <Icon
                      className={cn(
                        'h-6 w-6',
                        type === st.value ? 'text-action-primary' : 'text-text-muted',
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-bold text-center',
                        type === st.value ? 'text-action-primary' : 'text-text-secondary',
                      )}
                    >
                      {st.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase ml-1">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resuma sua sugestão em uma linha"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-40 px-4 py-3 text-sm bg-surface-subtle border border-border-default rounded-radius-sm focus:bg-surface-card focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all outline-none text-text-primary resize-none"
              placeholder="Descreva detalhadamente sua sugestão, o problema ou o elogio..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
              Seu e-mail (opcional)
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Para receber retorno sobre sua sugestão"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="strong"
              isLoading={sending}
              leftIcon={<Send className="h-4 w-4" />}
              disabled={!title.trim() || !description.trim()}
            >
              {sending ? 'Enviando...' : 'Enviar Sugestão'}
            </Button>
          </div>
        </form>
      </SectionCard>

      <InfoCard icon={Lightbulb}>
        Todas as sugestões são lidas pela nossa equipe. As ideias mais votadas entram no nosso
        roadmap de desenvolvimento.
      </InfoCard>
    </div>
  );
}
