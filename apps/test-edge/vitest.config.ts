/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // setupFiles: './__tests__/helpers/setup.ts',
    globals: true,
    environment: 'edge-runtime',
  },
});
