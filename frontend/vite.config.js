import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()); // ✅ 根据 --mode 自动加载正确的 .env 文件

  return {
  root: __dirname,
  base: './',
  build: {
    outDir: '../.vite/renderer/main_window', // 输出到 Electron Forge 期望的目录
    emptyOutDir: false
  },
  plugins: [
    vue(),
    svgLoader(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: 'less',
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: env.VITE_PORT || 5005,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: env.VITE_SERVICE_URL || 'http://127.0.0.1:3000',
        protocol: 'http',
        changeOrigin: true,
        ws: true,
      },
    },
    },
  };
});
