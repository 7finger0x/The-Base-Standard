'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: 'blue' | 'purple';
  className?: string;
}

export function FeatureCard({ icon, title, description, gradient, className }: FeatureCardProps) {
  const gradientClasses = {
    blue: 'border-blue-500/50',
    purple: 'border-purple-500/50',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 bg-black/40 backdrop-blur-sm p-6 transition-all hover:scale-105',
        gradientClasses[gradient],
        className
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mb-4',
          gradient === 'blue'
            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
            : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
        )}
      >
        <div
          className={cn(
            'text-2xl',
            gradient === 'blue' ? 'text-blue-400' : 'text-purple-400'
          )}
        >
          {icon}
        </div>
      </div>
      <h3
        className={cn(
          'text-xl font-bold mb-2',
          gradient === 'blue' ? 'text-blue-400' : 'text-purple-400'
        )}
      >
        {title}
      </h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none',
          gradient === 'blue'
            ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
            : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
        )}
      />
    </div>
  );
}
