import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { semiTheming } from "vite-plugin-semi-theming";

export default defineConfig({
  base: './',
  plugins: [
    semiTheming({
      theme: "@semi-bot/semi-theme-feishu-dashboard",
    }),
    react(),
    eslintPlugin(),
    svgr(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
