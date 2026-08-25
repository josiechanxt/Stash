import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  assetsInlineLimit: 0,
  base: '/Stash/',
  plugins: [react()],
});
