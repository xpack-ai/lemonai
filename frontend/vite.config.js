import { defineConfig, loadEnv } from 'vite';
const env = loadEnv('development', process.cwd());
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';
import svgLoader from 'vite-svg-loader';

console.log(env);

// https://vitejs.dev/config/
export default defineConfig({
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
});
