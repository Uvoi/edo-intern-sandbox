import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { type BuildOptions, defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const plugins = [
    tsconfigPaths(),
    react(),
    svgrPlugin({
      include: '**/shared/static/icons/*.svg',
      svgrOptions: {
        icon: true,
        svgProps: { fill: 'currentColor' },
      },
    }),
  ];

  const build: BuildOptions = {};

  if (mode === 'production') {
    build.target = browserslistToEsbuild();

    build.rollupOptions = {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mobx: ['mobx', 'mobx-react-lite'],
        },
      },
    };
  }

  return {
    plugins,
    build,
    resolve: {
      alias: [
        // @mui/system и @mui/utils v5 отдают CommonJS из корня пакета, а ESM лежит в ./esm.
        // CommonJS-версия ломает пребандлинг Vite в dev-режиме (styled is undefined в @astral/ui),
        // поэтому явно направляем импорты в ESM-сборку
        { find: /^@mui\/(system|utils)$/, replacement: '@mui/$1/esm' },
        {
          find: /^@mui\/(system|utils)\/(?!esm\/)(.+)$/,
          replacement: '@mui/$1/esm/$2',
        },
      ],
    },
    server: {
      port: 3001,
    },
  };
});
