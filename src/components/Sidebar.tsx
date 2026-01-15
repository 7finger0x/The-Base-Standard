'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Logo variant="full" size="md" />
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
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors text-left">
              Check Your Score
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors text-left">
              Link Your Wallets
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
