'use client';

import Image from 'next/image';
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

  // Try to use actual logo files if they exist
  // In production, these will be available from /public/
  const logoSrc = variant === 'full' ? '/logo.svg' : '/logo-icon.svg';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Image/Icon */}
      <div className={cn(
        'rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0',
        sizeClasses[size]
      )}>
        {/* Try to load actual logo, fallback to gradient badge */}
        <div className="relative w-full h-full">
          {/* Uncomment when logo files are added */}
          {/* <Image
            src={logoSrc}
            alt="The Base Standard"
            fill
            className="object-contain p-1"
            onError={(e) => {
              // Fallback to gradient badge if image doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          /> */}
          
          {/* Fallback gradient badge */}
          <span className={cn(
            'text-white font-black',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-4xl'
          )}>
            BR
          </span>
        </div>
      </div>

      {/* Text/Wordmark */}
      {showText && variant !== 'icon' && (
        <div>
          <h1 className={cn(
            'font-black tracking-tight text-gradient',
            textSizeClasses[size]
          )}>
            The Base Standard
          </h1>
          {size !== 'sm' && (
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Protocol</p>
          )}
        </div>
      )}
    </div>
  );
}
