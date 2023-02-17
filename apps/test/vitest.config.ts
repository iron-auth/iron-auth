/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: './src/helpers/setup.ts',
    globals: true,
    environment: 'happy-dom',
  },
});
