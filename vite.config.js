// Vite
import { defineConfig } from 'vite';

// HTML
import { createHtmlPlugin } from 'vite-plugin-html';

// Vue.js
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      entry: '/src/main.js',
      inject: {
        data: {
          title: 'gpt.mallows.io',
        },
      },
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
