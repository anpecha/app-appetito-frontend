import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5] text-[#202020]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E8E8E8] px-6 bg-white">
        <span className="text-2xl font-black tracking-tighter text-[#DA291C]">Appetito</span>
        <nav className="flex gap-3">
          <Link href="/admin/login">
            <Button variant="secondary" className="font-semibold text-sm border border-[#D1D1D1] bg-white text-[#202020] hover:bg-[#F5F5F5] h-10 px-5">
              Entrar
            </Button>
          </Link>
          <Link href="/demo-restaurant">
            <Button variant="primary" className="font-bold text-sm bg-[#FFC72E] text-[#202020] hover:bg-[#E5B329] h-10 px-5 shadow-button-primary">
              Ver Demo
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFC72E]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#DA291C]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl space-y-8 relative z-10">
          <div className="inline-flex items-center rounded-full border border-[#FFC72E]/30 bg-[#FFC72E]/10 px-4 py-1.5 text-sm font-semibold text-[#DA291C]">
            Venda mais r&aacute;pido, com menos atrito
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-[#202020] leading-[1.1]">
            O sistema ideal para o <span className="text-[#DA291C]">seu restaurante</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#666666] max-w-2xl mx-auto font-medium leading-relaxed">
            Card&aacute;pio digital que d&aacute; apetite, checkout super r&aacute;pido sem cadastros
            demorados, e um painel Kanban perfeito para organizar sua cozinha.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/demo-restaurant">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-[#FFC72E] text-[#202020] hover:bg-[#E5B329] shadow-button-primary"
              >
                Acessar Card&aacute;pio de Teste
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button
                variant="strong"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-[#DA291C] text-white hover:bg-[#B82317] shadow-lg"
              >
                Acessar Appetito Admin
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-[#E8E8E8] bg-white text-[#999999] text-sm font-medium">
        &copy; {new Date().getFullYear()} Appetito. Todos os direitos reservados.
      </footer>
    </div>
  );
}
