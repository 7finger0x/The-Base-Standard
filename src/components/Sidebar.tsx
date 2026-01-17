'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  hasSubmenu?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Reputation', href: '/' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Tiers', href: '/tiers', hasSubmenu: true },
  { label: 'Metrics', href: '/metrics', hasSubmenu: true },
  { label: 'About', href: '/about', hasSubmenu: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const handleConnect = () => {
    // Try to connect with the first available connector (usually injected wallet like MetaMask)
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 transition-colors">
      {/* Logo and Theme Toggle */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <Logo variant="full" size="md" />
        </div>
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <span>{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* START HERE Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-600 rounded"></div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              START HERE
            </span>
          </div>
          <div className="space-y-2">
            {isConnected ? (
              <>
                <Link
                  href="/"
                  className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
                >
                  View Your Score
                </Link>
                <Link
                  href="/"
                  className="block w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors text-center"
                >
                  Manage Wallets
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-left"
                >
                  Check Your Score
                </button>
                <button
                  onClick={handleConnect}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors text-left"
                >
                  Link Your Wallets
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
