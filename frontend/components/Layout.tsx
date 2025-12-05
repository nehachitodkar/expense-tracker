import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/profile', label: 'Profile' }
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrate, clearAuth } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [user, pathname, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="px-6 py-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-900">Expense Tracker</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block rounded-md px-3 py-2 text-sm font-medium',
                pathname === item.href
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="text-lg font-semibold">Expense Tracker</div>
          {user && (
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
            >
              Logout
            </button>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}


