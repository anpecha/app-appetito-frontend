import { ComingSoonPage } from '@/components/coming-soon-page';
import { Bot } from 'lucide-react';

export default function BotPage() {
  return (
    <ComingSoonPage
      title="Robô"
      description="Configure o atendimento automatizado via WhatsApp."
      icon={Bot}
      eta="Q2 2026"
      features={[
        'Chatbot com IA para responder clientes no WhatsApp',
        'Fluxos personalizados de atendimento',
        'Integração com cardápio digital para tirar dúvidas',
        'Transferência para atendente humano',
        'Relatório de conversas e satisfação',
      ]}
    />
  );
}
