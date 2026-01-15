'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  description?: string;
  graphic: ReactNode;
  className?: string;
}

export function MetricCard({ title, description, graphic, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors',
        className
      )}
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
        {title}
      </h3>
      <div className="h-32 flex items-center justify-center mb-3">{graphic}</div>
      {description && (
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

// Graphic components for different metrics
export function BaseTenureGraphic() {
  const heights = [20, 40, 60, 45, 80, 35, 70, 50, 90, 65, 55, 75];
  return (
    <div className="w-full h-full flex items-end justify-center gap-1">
      {heights.map((height, i) => (
        <div
          key={i}
          className="bg-green-500 rounded-t"
          style={{ width: '8%', height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export function ZoraMintsGraphic() {
  const blockHeights = [35, 50, 25, 65, 40, 55, 30, 70, 45, 60, 35, 50];
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-4 gap-2">
        {blockHeights.map((height, i) => (
          <div
            key={i}
            className="bg-pink-500 rounded"
            style={{
              height: `${height}%`,
              aspectRatio: '1',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ReputationScoreGraphic() {
  const barHeights = [18, 22, 20, 25, 17, 23, 19, 21];
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div className="w-20 h-20 rounded-full border-4 border-amber-400 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-xl font-bold text-amber-600">BS</span>
        </div>
      </div>
      {/* Orbiting bars */}
      {barHeights.map((height, i) => {
        const angle = (i * 360) / 8;
        const radius = 35;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        return (
          <div
            key={i}
            className="absolute bg-amber-400 rounded"
            style={{
              width: '4px',
              height: `${height}px`,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
}

export function EarlyAdopterGraphic() {
  const heights = [30, 50, 70, 60, 85, 45, 75, 55, 95, 70, 65, 80];
  return (
    <div className="w-full h-full flex items-end justify-center gap-1">
      {heights.map((height, i) => (
        <div
          key={i}
          className="bg-blue-500 rounded-t"
          style={{ width: '8%', height: `${height}%` }}
        />
      ))}
    </div>
  );
}
