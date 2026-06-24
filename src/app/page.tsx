import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page text-text-primary">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-default px-6 bg-surface-card">
        <span className="text-2xl font-black tracking-tighter text-action-primary">Appetito</span>
        <nav className="flex gap-4">
          <Link href="/admin/login">
            <Button variant="secondary" className="font-semibold">
              Log in (Lojista)
            </Button>
          </Link>
          <Link href="/demo-restaurant">
            <Button variant="primary" className="font-bold">
              Ver Demo (Cliente)
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden bg-gradient-to-b from-surface-subtle to-surface-page">
        {/* Background blobs decorativos */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-action-primary/20 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-action-strong/10 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />

        <div className="max-w-3xl space-y-8 relative z-10">
          <div className="inline-flex items-center rounded-radius-full border border-action-primary/30 bg-action-primary/10 px-3 py-1 text-sm font-semibold text-action-primary shadow-sm mb-4">
            🚀 Venda mais rápido, com menos atrito.
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-text-primary leading-[1.1]">
            O sistema ideal para o <span className="text-action-strong">seu restaurante.</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
            Cardápio digital que dá apetite, checkout super rápido sem cadastros demorados, e um
            painel Kanban perfeito para organizar sua cozinha.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/demo-restaurant">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-shadow-lg shadow-action-primary/30"
              >
                Acessar Cardápio de Teste
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button
                variant="strong"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-shadow-lg shadow-action-strong/20"
              >
                Acessar Appetito Admin
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-border-subtle bg-surface-card text-text-muted text-sm font-medium">
        &copy; {new Date().getFullYear()} Appetito. Todos os direitos reservados.
      </footer>
    </div>
  );
}
