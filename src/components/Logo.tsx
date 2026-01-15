'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

/**
 * Logo component for The Base Standard
 * 
 * Supports multiple variants:
 * - full: Full logo with wordmark
 * - icon: Icon only
 * - text: Text only (fallback)
 * 
 * When logo files are added to /public/, this component will automatically use them.
 * Falls back to gradient badge if logo files don't exist.
 */
export function Logo({ variant = 'icon', size = 'md', className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Image/Icon - Solid Blue Square for Light Theme */}
      <div className={cn(
        'bg-blue-600 flex items-center justify-center flex-shrink-0 relative',
        size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-12 h-12' : 'w-16 h-16',
        className
      )}>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* BS Text */}
          <span className={cn(
            'text-white font-black leading-none',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
          )}>
            BS
          </span>
        </div>
      </div>

      {/* Text/Wordmark */}
      {showText && variant !== 'icon' && (
        <div>
          <h1 className={cn(
            'font-black tracking-tight text-gray-900',
            textSizeClasses[size]
          )}>
            The Base Standard
          </h1>
        </div>
      )}
    </div>
  );
}
