import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/apps/arbitrage/test-setup.ts'],
  },
});
