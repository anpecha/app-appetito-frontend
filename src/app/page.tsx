import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, QrCode, Smartphone, LayoutDashboard, BarChart3, Users, GitBranch } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'Cardápio Digital',
    description: 'Cardápio online com QR Code na mesa. Cliente escaneia, escolhe e pede sem precisar de app.',
  },
  {
    icon: Smartphone,
    title: 'PDV Rápido',
    description: 'Checkout em segundos com suporte a Pix, cartão e dinheiro. Ideal para delivery e balcão.',
  },
  {
    icon: LayoutDashboard,
    title: 'KDS Cozinha',
    description: 'Painel Kanban em tempo real que organiza os pedidos da cozinha por prioridade e tempo.',
  },
  {
    icon: Users,
    title: 'Gestão de Pedidos',
    description: 'Acompanhe cada pedido do início ao fim: novo, preparando, pronto, entregue.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios',
    description: 'Dashboard com vendas, ticket médio, horários de pico e os produtos mais vendidos.',
  },
  {
    icon: GitBranch,
    title: 'Integrações',
    description: 'Conecte com iFood, WhatsApp, Telegram, Instagram e receba pedidos de todos os canais.',
  },
];

const plans = [
  {
    name: 'Inicial',
    price: 'Grátis',
    period: '',
    description: 'Para quem está começando',
    features: ['1 mesa / comanda', 'Cardápio digital', 'PDV básico', '5 fotos no cardápio', 'Suporte por e-mail'],
    cta: 'Criar Conta',
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para restaurantes em crescimento',
    features: [
      'Mesas ilimitadas',
      'Cardápio digital + QR Code',
      'PDV completo com Pix',
      'KDS Cozinha',
      'Relatórios e dashboards',
      'Fotos ilimitadas',
      'Suporte prioritário',
    ],
    cta: 'Assinar Agora',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 129',
    period: '/mês',
    description: 'Para redes e alta demanda',
    features: [
      'Tudo do Profissional',
      'Multi-unidades',
      'Integrações iFood/WhatsApp',
      'API exclusiva',
      'Gerente de conta dedicado',
      'SLA 99.9%',
    ],
    cta: 'Falar com Vendas',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-16 shrink-0 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-action-strong">
            Appetito
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
              Recursos
            </Link>
            <Link href="#pricing" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
              Preços
            </Link>
            <Link href="#contact" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
              Contato
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/admin/login">
              <Button variant="secondary" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="primary" size="sm">
                Comece Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border bg-surface-page">
          <div className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-action-primary/15 blur-[120px]" />
          <div className="pointer-events-none absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-action-strong/10 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-action-primary/30 bg-action-primary/10 px-4 py-1.5 text-sm font-semibold text-action-strong">
                <span className="h-2 w-2 rounded-full bg-action-strong animate-pulse" />
                Venda mais rápido, com menos atrito
              </div>

              <h1 className="text-5xl font-black tracking-tight text-text-primary sm:text-7xl leading-[1.08]">
                O sistema ideal para o{' '}
                <span className="text-action-strong">seu restaurante</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
                Cardápio digital que dá apetite, checkout super rápido sem cadastros
                demorados, e um painel Kanban perfeito para organizar sua cozinha.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/demo-restaurant">
                  <Button variant="primary" size="xl" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Ver Demonstração
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="strong" size="xl">
                    Criar Conta Grátis
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-text-muted">Sem cartão de crédito • Cancelamento livre</p>
            </div>
          </div>
        </section>

        {/* ─── Features ─────────────────────────────────────────────────── */}
        <section id="features" className="bg-surface-card py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full border border-border bg-surface-page px-3 py-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Funcionalidades
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
                Tudo que seu restaurante precisa
              </h2>
              <p className="mt-3 text-text-secondary">
                Do cardápio digital ao relatório de vendas — uma plataforma completa para gestão.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-radius-md border border-border bg-surface-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-radius-md bg-action-primary/10 text-action-strong">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="bg-surface-page py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full border border-border bg-surface-card px-3 py-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Planos
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
                Escolha o plano ideal
              </h2>
              <p className="mt-3 text-text-secondary">
                Do empreendedor individual à rede de restaurantes.
              </p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-radius-md border bg-surface-card p-8 shadow-card transition-all duration-200 hover:shadow-card-hover ${
                    plan.highlighted
                      ? 'border-action-primary ring-2 ring-action-primary/30 scale-[1.03] lg:scale-[1.05]'
                      : 'border-border'
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-action-primary px-4 py-1 text-xs font-bold text-text-on-brand">
                      Recomendado
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-primary">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-text-secondary">{plan.period}</span>
                    )}
                  </div>

                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-text-primary">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-action-strong" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link href="/admin/login" className="mt-8 block">
                    <Button
                      variant={plan.highlighted ? 'primary' : 'secondary'}
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Final ────────────────────────────────────────────────── */}
        <section id="contact" className="bg-action-strong py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Pronto para transformar seu restaurante?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Crie sua conta grátis em menos de 2 minutos. Sem compromisso.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/admin/login">
                <Button
                  variant="primary"
                  size="xl"
                  className="bg-white text-action-strong hover:bg-gray-100 shadow-lg"
                >
                  Começar Agora
                </Button>
              </Link>
              <Link href="/demo-restaurant">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div>
              <span className="text-2xl font-black tracking-tighter text-action-strong">Appetito</span>
              <p className="mt-2 text-sm text-text-muted">
                O sistema completo para gestão de restaurantes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link href="#features" className="font-medium text-text-secondary hover:text-text-primary transition-colors">
                Recursos
              </Link>
              <Link href="#pricing" className="font-medium text-text-secondary hover:text-text-primary transition-colors">
                Preços
              </Link>
              <Link href="#contact" className="font-medium text-text-secondary hover:text-text-primary transition-colors">
                Contato
              </Link>
              <span className="text-border select-none">|</span>
              <Link href="#" className="font-medium text-text-secondary hover:text-text-primary transition-colors">
                Termos
              </Link>
              <Link href="#" className="font-medium text-text-secondary hover:text-text-primary transition-colors">
                Privacidade
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Appetito. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
