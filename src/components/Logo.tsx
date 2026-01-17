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
 * - text: Text only
 *
 * Uses actual logo images from /public/images/logos/
 */
export function Logo({ variant = 'icon', size = 'md', className, showText = true }: LogoProps) {
  const sizeValues = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const logoSize = sizeValues[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Image - Hexagonal BS Logo */}
      <div className={cn('flex-shrink-0 relative')} style={{ width: logoSize, height: logoSize }}>
        <Image
          src="/images/logos/logo-hex.png"
          alt="The Base Standard"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Text/Wordmark */}
      {showText && variant !== 'icon' && (
        <div>
          <h1 className={cn(
            'font-black tracking-tight text-gray-900 dark:text-white',
            textSizeClasses[size]
          )}>
            The Base Standard
          </h1>
        </div>
      )}
    </div>
  );
}
