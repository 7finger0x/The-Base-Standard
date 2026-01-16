'use client';

import Image from 'next/image';
import { useState } from 'react';
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
 * Uses logo files from /public/ if available, falls back to styled badge.
 * Tries: logo-icon.svg -> logo.svg -> styled badge
 */
export function Logo({ variant = 'icon', size = 'md', className, showText = true }: LogoProps) {
  const [logoError, setLogoError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const logoSize = sizeMap[size];
  const showImage = (variant === 'icon' || variant === 'full') && !fallbackError;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Image/Icon */}
      <div className={cn('flex items-center justify-center flex-shrink-0 relative', className)}>
        {showImage ? (
          <div className="relative" style={{ width: logoSize, height: logoSize }}>
            <Image
              src={logoError ? '/logo.svg' : '/logo-icon.svg'}
              alt="The Base Standard"
              width={logoSize}
              height={logoSize}
              className="object-contain"
              onError={() => {
                if (!logoError) {
                  setLogoError(true);
                } else {
                  setFallbackError(true);
                }
              }}
            />
          </div>
        ) : (
          <div className={cn(
            'bg-blue-600 flex items-center justify-center rounded',
            size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-12 h-12' : 'w-16 h-16'
          )}>
            <span className={cn(
              'text-white font-black leading-none',
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
            )}>
              BS
            </span>
          </div>
        )}
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
