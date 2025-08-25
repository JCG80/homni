import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'e2e-tests/',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
        'public/',
        'src/integrations/supabase/types.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    include: [
      'src/**/*.{test,spec}.{ts,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'e2e-tests/'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/test': resolve(__dirname, './src/test')
    }
  }
});