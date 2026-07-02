import Link from 'next/link';

export default function DemoRestaurantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E8E8E8] px-6 bg-white">
        <Link href="/" className="text-2xl font-black tracking-tighter text-[#DA291C]">
          Appetito
        </Link>
        <nav className="flex gap-3">
          <Link href="/admin/login">
            <button className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap tracking-wide cursor-pointer select-none transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] rounded-radius-md hover:border-border-focus hover:-translate-y-px active:bg-surface-section active:translate-y-0 py-2 font-semibold text-sm border border-[#D1D1D1] bg-white text-[#202020] hover:bg-[#F5F5F5] h-10 px-5">
              Entrar
            </button>
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-lg space-y-6">
          <div className="inline-flex items-center rounded-full border border-[#DA291C]/20 bg-[#DA291C]/5 px-4 py-1.5 text-sm font-semibold text-[#DA291C]">
            Em desenvolvimento
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#202020]">
            Cardápio Digital
          </h1>
          <p className="text-lg text-[#666666] leading-relaxed">
            Estamos preparando um cardápio de demonstração para você. Enquanto isso, acesse o painel administrativo para configurar seu restaurante.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/admin/login">
              <button className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap tracking-wide cursor-pointer select-none transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] rounded-radius-md hover:-translate-y-px hover:shadow-md active:bg-action-primary-active active:translate-y-0 active:shadow-sm h-14 px-8 text-lg font-bold bg-[#FFC72E] text-[#202020] hover:bg-[#E5B329] shadow-button-primary">
                Acessar Appetito Admin
              </button>
            </Link>
            <Link href="/">
              <button className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap tracking-wide cursor-pointer select-none transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] rounded-radius-md hover:-translate-y-px active:translate-y-0 active:shadow-sm h-14 px-8 text-lg font-bold bg-[#DA291C] text-white hover:bg-[#B82317] shadow-lg">
                Voltar ao Início
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
