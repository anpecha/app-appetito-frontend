'use client';

import React from 'react';
import { FileText, Lock, Mail, Bot } from 'lucide-react';
import { PageHeader, SectionCard, InfoCard } from '@/app/admin/settings/_shared';

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-4xl animate-in fade-in duration-500">
      <PageHeader
        title="Termos e Políticas"
        description="Documentos legais e políticas de uso da plataforma Appétito."
      />

      <SectionCard
        title="Termos de Serviço"
        icon={FileText}
        description="Condições gerais de uso da plataforma."
      >
        <div className="prose prose-sm max-w-none text-text-secondary">
          <p className="text-sm leading-relaxed">
            Ao utilizar a plataforma Appétito, você concorda com os seguintes termos e condições. O
            Appétito é um software SaaS (Software as a Service) destinado à gestão de restaurantes,
            incluindo cardápio digital, gestão de pedidos, atendimento via IA e ferramentas de
            gestão.
          </p>
          <h4 className="text-sm font-bold text-text-primary mt-6 mb-2">1. Uso da Plataforma</h4>
          <p className="text-sm leading-relaxed">
            O cliente é responsável por manter a confidencialidade de suas credenciais de acesso.
            Todas as atividades realizadas sob sua conta são de sua responsabilidade.
          </p>
          <h4 className="text-sm font-bold text-text-primary mt-6 mb-2">
            2. Assinatura e Pagamento
          </h4>
          <p className="text-sm leading-relaxed">
            O Appétito oferece planos de assinatura mensais. O não pagamento pode resultar na
            suspensão do acesso. Os preços podem ser alterados mediante aviso prévio de 30 dias.
          </p>
          <h4 className="text-sm font-bold text-text-primary mt-6 mb-2">3. Suporte</h4>
          <p className="text-sm leading-relaxed">
            O suporte técnico está disponível através do e-mail suporte@appetito.com.br e pelo chat
            na plataforma. O tempo de resposta varia conforme o plano contratado.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Política de Privacidade"
        icon={Lock}
        description="Como tratamos seus dados."
      >
        <div className="text-sm text-text-secondary leading-relaxed">
          <p className="mb-4">
            O Appétito coleta e armazena dados estritamente necessários para o funcionamento da
            plataforma, incluindo informações cadastrais, dados de pedidos e preferências de
            clientes.
          </p>
          <p className="mb-4">
            Os dados são armazenados em servidores seguros com criptografia. Não compartilhamos
            informações pessoais com terceiros sem autorização explícita.
          </p>
          <p>
            O cliente pode solicitar a exclusão de seus dados a qualquer momento através do e-mail
            privacidade@appetito.com.br.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Termos de Uso da IA"
        icon={Bot}
        description="Diretrizes para o uso do robô de atendimento."
      >
        <div className="text-sm text-text-secondary leading-relaxed">
          <p className="mb-4">
            O robô de atendimento (Appé) utiliza inteligência artificial para responder clientes. As
            respostas são geradas com base no cardápio e configurações do restaurante.
          </p>
          <p className="mb-4">
            O restaurante é responsável pelo conteúdo das respostas geradas. Recomendamos revisar
            periodicamente as conversas para garantir a qualidade do atendimento.
          </p>
        </div>
      </SectionCard>

      <InfoCard icon={Mail}>
        Para questões legais, entre em contato: <strong>legal@appetito.com.br</strong>
      </InfoCard>
    </div>
  );
}
