'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MenuSquare,
  Settings,
  PieChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Monitor,
  Bike,
  Bot,
  Store,
  Bell,
  UserCircle,
  Star,
  ChefHat,
  TrendingUp,
  LineChart,
  Award,
  HelpCircle,
  ShoppingBag,
  Users,
  Calendar,
  Ticket,
  Gem,
  Smile,
  UserSquare2,
  ScrollText,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarCashierWidget } from '@/components/caixa/SidebarCashierWidget';

// ─── Nav structure ─────────────────────────────────────────────────────────

export type MenuItemType = {
  href?: string;
  label: string;
  icon?: React.ElementType;
  subItems?: MenuItemType[];
  badge?: string;
  isGroup?: boolean;
};

const MENU_ITEMS: MenuItemType[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    label: 'Meu dia a dia',
    isGroup: true,
  },
  {
    label: 'Meus Pedidos',
    icon: ShoppingBag,
    href: '/admin/orders',
  },
  {
    label: 'Pedidos Balcão',
    icon: Monitor,
    href: '/admin/orders/counter',
  },
  {
    label: 'Pedidos salão',
    icon: Users,
    href: '/admin/orders/dine-in',
  },
  {
    label: 'Pedido Agendados',
    icon: Calendar,
    href: '/admin/orders/scheduled',
  },
  {
    label: 'Gestão de Cardápio',
    icon: MenuSquare,
    subItems: [
      { href: '/admin/menu/manager', label: 'Gestor' },
      { href: '/admin/menu/images', label: 'Imagens de cardapio' },
      { href: '/admin/menu/booster', label: 'Potencializador de cardapio' },
      { href: '/admin/menu/import', label: 'Importação de cardapio (Ifood, Uber Eats, PDF)' },
    ],
  },
  {
    label: 'Gestão Avançada',
    icon: PieChart,
    subItems: [
      { href: '/admin/advanced/fiscal', label: 'Nota Fiscal' },
      { href: '/admin/advanced/finance', label: 'Financeiro' },
      { href: '/admin/advanced/purchases', label: 'Compras' },
      { href: '/admin/advanced/reports', label: 'Relatórios' },
    ],
  },
  {
    label: 'Entregadores',
    icon: Bike,
    subItems: [
      { href: '/admin/delivery/register', label: 'Cadastro de entregadores' },
      { href: '/admin/delivery/reports', label: 'Relatórios' },
      { href: '/admin/delivery/areas', label: 'Áreas de Entrega' },
      { href: '/courier/login', label: 'App do Entregador', badge: 'Novo' },
    ],
  },
  {
    label: 'Meu Desempenho',
    icon: Star,
    href: '/admin/performance',
  },
  {
    label: 'Cozinha (KDS)',
    icon: ChefHat,
    href: '/admin/kds',
  },
  {
    label: 'Robô',
    icon: Bot,
    subItems: [
      { href: '/admin/bot/calling', label: 'Chamando atendentes' },
      { href: '/admin/bot/feedback', label: 'Feedback de clientes' },
      { href: '/admin/bot/messages', label: 'Personalizar mensagens' },
      { href: '/admin/bot/settings', label: 'Configurações' },
    ],
  },
  {
    label: 'Meu Salão',
    isGroup: true,
  },
  {
    label: 'Gestão de Salão',
    icon: Store,
    href: '/admin/dine-in/management',
  },
  {
    label: 'Configuração de Salão',
    icon: Settings,
    subItems: [
      { href: '/admin/dine-in/settings/salon', label: 'Meu Salão' },
      { href: '/admin/dine-in/settings/waiters', label: 'Meus Garçons' },
      { href: '/admin/dine-in/settings/app', label: 'App Garçon' },
      { href: '/admin/dine-in/settings/commands', label: 'Comandas' },
      { href: '/admin/cashier', label: 'Pedidos Balcão (PDV)' },
      { href: '/admin/dine-in/settings/fees', label: 'Taxa de serviços' },
      { href: '/admin/dine-in/settings/qr', label: 'Cardápio QR Code' },
      { href: '/admin/settings/printer', label: 'Impressoras' },
      { href: '/admin/dine-in/settings/scales', label: 'Balanças' },
    ],
  },
  {
    label: 'Venda Mais',
    isGroup: true,
  },
  {
    label: 'Recuperador de vendas',
    icon: TrendingUp,
    href: '/admin/sales/recover',
  },
  {
    label: 'Cupom',
    icon: Ticket,
    href: '/admin/sales/coupons',
  },
  {
    label: 'Compre + Ganhe +',
    icon: Gem,
    href: '/admin/sales/bogo',
  },
  {
    label: 'Analises',
    isGroup: true,
  },
  {
    label: 'Relatórios',
    icon: LineChart,
    href: '/admin/analytics/reports',
  },
  {
    label: 'Satisfação',
    icon: Smile,
    href: '/admin/analytics/satisfaction',
  },
  {
    label: 'Configurações',
    isGroup: true,
  },
  {
    label: 'Pagamentos',
    icon: CreditCard,
    href: '/admin/settings/payments',
  },
  {
    label: 'Entregadores',
    icon: Bike,
    subItems: [
      { href: '/admin/delivery/register', label: 'Cadastro' },
      { href: '/admin/delivery/reports', label: 'Relatórios' },
      { href: '/admin/settings/delivery', label: 'Configurações' },
    ],
  },
  {
    label: 'Minha Conta',
    icon: UserCircle,
    subItems: [
      { href: '/admin/settings/account/general', label: 'Geral' },
      { href: '/admin/settings/account/personal', label: 'Informações Pessoais' },
      { href: '/admin/settings/account/billing', label: 'Formas de Pagamento' },
      { href: '/admin/settings/account/invoices', label: 'Fatura' },
      { href: '/admin/settings/account/plans', label: 'Planos' },
      { href: '/admin/settings/account/team', label: 'Colaboradores' },
    ],
  },
  {
    label: 'Configurações',
    icon: Settings,
    subItems: [
      { href: '/admin/settings/customers', label: 'Meus Clientes' },
      { href: '/admin/settings/orders', label: 'Meus Pedidos' },
      { href: '/admin/settings/printer', label: 'Impressoras' },
      { href: '/admin/settings/fiscal', label: 'Nota Fiscal' },
      { href: '/admin/cashier', label: 'Frente de Caixa' },
      { href: '/admin/settings/integrations', label: 'Integrações' },
      { href: '/admin/settings/digital-menu', label: 'Cardápio Digital' },
      { href: '/admin/settings/social', label: 'Rede Sociais' },
      { href: '/admin/settings/delivery', label: 'Entregadores' },
      { href: '/admin/bot/settings', label: 'Robô' },
      { href: '/admin/settings/establishment', label: 'Estabelecimento' },
      { href: '/admin/settings/scheduled-orders', label: 'Pedidos Agendados' },
    ],
  },
  {
    label: 'Vantagens Appetito',
    isGroup: true,
  },
  {
    label: 'Benefícios',
    icon: Award,
    href: '/admin/advantages/benefits',
  },
  {
    label: 'Central Appetito',
    isGroup: true,
  },
  {
    label: 'Instruções de Ajuda',
    icon: HelpCircle,
    href: '/admin/central/help',
  },
  {
    label: 'Sugestões',
    icon: UserSquare2,
    href: '/admin/central/suggestions',
  },
  {
    label: 'Termos e Políticas',
    icon: ScrollText,
    href: '/admin/central/terms',
  },
];

// ─── Sidebar nav item ─────────────────────────────────────────────────────

function AccordionNavItem({
  item,
  level = 0,
  pathname,
  collapsed,
}: {
  item: MenuItemType;
  level?: number;
  pathname: string;
  collapsed: boolean;
}) {
  const hasSubItems = !!item.subItems?.length;

  const isActive = React.useMemo(() => {
    if (item.href && pathname === item.href) return true;
    if (hasSubItems && item.subItems) {
      const checkActive = (items: MenuItemType[]): boolean => {
        return items.some(
          (sub) =>
            (sub.href && pathname.startsWith(sub.href)) ||
            (sub.subItems && checkActive(sub.subItems)),
        );
      };
      return checkActive(item.subItems);
    }
    return false;
  }, [pathname, item, hasSubItems]);

  const [isOpen, setIsOpen] = React.useState(isActive);

  React.useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  if (!hasSubItems) {
    return (
      <Link
        href={item.href || '#'}
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center rounded-lg py-2 transition-all duration-150 cursor-pointer',
          level === 0 ? 'px-3 text-sm font-medium' : 'px-3 text-[13px] gap-3',
          isActive && level === 0 ? 'bg-red-50 text-[#DA291C]' : '',
          isActive && level > 0 ? 'text-[#DA291C] font-semibold bg-red-50/50' : '',
          !isActive && level === 0 ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' : '',
          !isActive && level > 0
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium'
            : '',
          collapsed && 'justify-center px-2 py-2.5',
          !collapsed && level === 2 && 'text-[12px] py-1.5',
        )}
      >
        {item.icon && <item.icon className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />}
        {!item.icon && level > 0 && !collapsed && (
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-2 text-[10px] font-bold bg-[#FFC72E] text-[#202020] px-1.5 py-0.5 rounded-full leading-none">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center rounded-lg py-2 transition-all duration-150 cursor-pointer w-full text-left',
          level === 0 ? 'px-3 text-sm font-medium' : 'px-3 text-[13px] gap-3',
          isActive && level === 0
            ? 'text-[#DA291C] bg-red-50/30'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          isActive && level > 0
            ? 'text-[#DA291C] font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium',
          collapsed && 'justify-center px-2 py-2.5',
        )}
      >
        {item.icon && <item.icon className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />}
        {!item.icon && level > 0 && !collapsed && (
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </>
        )}
      </button>

      {isOpen && !collapsed && (
        <div
          className={cn(
            'flex flex-col mt-1 mb-2',
            level === 0
              ? 'space-y-0.5 ml-4 pl-3 border-l-2 border-gray-100'
              : 'space-y-0.5 ml-3 pl-3 border-l-2 border-gray-100',
          )}
        >
          {item.subItems!.map((sub, idx) => (
            <AccordionNavItem
              key={idx}
              item={sub}
              level={level + 1}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-page">
      {/* ── Top bar PRO ── */}
      <header className="h-16 shrink-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 z-30 shadow-sm shadow-black/5 w-full">
        <div className="flex items-center gap-4 flex-1">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 mr-4">
            <div className="flex shrink-0 items-center justify-center">
              <Image
                src="/img/Icone App menor.png"
                alt="Appetito"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Appetito</span>
          </Link>

          {/* Search Bar - Stitch Style */}
          <div className="relative w-full max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20 focus:border-[#DA291C] placeholder-gray-400 transition-all font-medium"
              placeholder="Buscar pedidos, produtos ou clientes..."
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider cursor-default">
              Loja Aberta
            </span>
          </div>
          {/* Removed Breadcrumbs space */}

          <div className="h-8 w-px bg-gray-200 mx-2" />

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-[#DA291C] transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-600 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-bold text-gray-900 leading-none">Admin Appetito</span>
                <span className="text-[10px] text-gray-500 font-medium cursor-pointer hover:text-red-500 transition-colors">
                  Sair da conta
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#DA291C]/10 flex items-center justify-center text-[#DA291C] border border-[#DA291C]/20">
                <UserCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar Light (Stitch) ── */}
        <aside
          className={cn(
            'relative flex flex-col bg-surface-card border-r border-gray-200 transition-all duration-300 z-20 shrink-0',
            collapsed ? 'w-16' : 'w-64',
          )}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm z-30 cursor-pointer transition-colors"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
            {/* Caixa Status Block */}
            <SidebarCashierWidget collapsed={collapsed} />

            {MENU_ITEMS.map((item, idx) => {
              if (item.isGroup) {
                if (collapsed) return <div key={idx} className="my-4" />;
                return (
                  <p
                    key={idx}
                    className={cn(
                      'px-3 mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-600',
                      idx > 0 && 'mt-6',
                    )}
                  >
                    {item.label}
                  </p>
                );
              }
              return (
                <AccordionNavItem key={idx} item={item} pathname={pathname} collapsed={collapsed} />
              );
            })}
          </nav>

          {/* Footer: Bell / Profile / Logout */}
          <div
            className={cn(
              'border-t border-gray-200 p-4 bg-gray-50/50',
              collapsed ? 'flex flex-col items-center gap-3' : 'space-y-1',
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">Loja Centro</span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    Administrador
                  </span>
                </div>
              </div>
            )}

            <Link
              href="#"
              title="Notificações"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer',
                collapsed && 'justify-center px-2',
              )}
            >
              <Bell className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
              {!collapsed && 'Notificações'}
            </Link>

            <Link
              href="/admin/login"
              title="Sair"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer',
                collapsed && 'justify-center px-2',
              )}
            >
              <LogOut className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
              {!collapsed && 'Encerrar Sessão'}
            </Link>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 flex overflow-hidden bg-[#F9FAFB]">
          {/* Content Section */}
          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
