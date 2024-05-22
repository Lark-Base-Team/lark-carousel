import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import SemiTheme from '@kousum/vite-plugin-semi-theme';

export default defineConfig({
  plugins: [
    SemiTheme({
      // name: '@douyinfe/semi-theme-default'
      theme: '@semi-bot/semi-theme-universedesign',
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
