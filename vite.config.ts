import { defineConfig } from 'vite';

export default defineConfig({
  base: '/sales24-webmcp-demo/',
  test: {
    environment: 'jsdom',
  },
});
