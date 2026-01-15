import { defineConfig } from 'vitest';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/foundry/**',
      '**/apps/**',
      '**/prisma/**',
      '**/scripts/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/dist/**',
        '**/.next/**',
        'foundry/**',
        'apps/**',
        'prisma/**',
        'scripts/**',
        '**/*.d.ts',
        '**/types/**',
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/providers.tsx',
        'src/middleware.ts',
      ],
      include: [
        'src/**/*.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
