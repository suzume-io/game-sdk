import react from '@vitejs/plugin-react';
import fs from 'fs';
import mime from 'mime';
import { resolve } from 'path';
import { defineConfig, Plugin } from 'vite';
import dtsPlugin from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const base64Loader: Plugin = {
  name: 'base64-loader',
  transform(_: any, id: string) {
    const [path, query] = id.split('?');
    if (query != 'base64') return null;

    const data = fs.readFileSync(path);
    const mimeType = mime.getType(path);
    const base64 = 'data:' + mimeType + ';base64,' + data.toString('base64');

    return `export default '${base64}';`;
  },
};

const jsonLoader: Plugin = {
  name: 'json-loader',
  transform(_: any, id: string) {
    const [path, query] = id.split('?');
    if (!path.endsWith('.json')) return null;

    const text = fs.readFileSync(path, 'utf-8');
    return `export default ${text};`;
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  mode: 'production',
  base: '/',
  plugins: [
    react(),
    nodePolyfills(),
    dtsPlugin({
      insertTypesEntry: true,
      outDir: 'dist/umd',
    }),
    base64Loader,
    jsonLoader,
  ],
  build: {
    lib: {
      name: 'suzume',
      fileName: (format) => 'suzume.js',
      entry: resolve(__dirname, 'src/lib.ts'),
      formats: ['umd'],
    },
    minify: true,
    rollupOptions: {
      external: [], // Specify external dependencies if any
      output: {
        globals: {
          suzume: 'suzume',
        }, // Specify global variable names for external dependencies if any
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'), // DO NOT CHANGE TO production
  },
  resolve: {
    alias: [
      {
        find: '@app',
        replacement: resolve(__dirname, 'src/ui/app'),
      },
      {
        find: '@res',
        replacement: resolve(__dirname, 'src/res'),
      },
      {
        find: '@config',
        replacement: resolve(__dirname, 'src/config'),
      },
      {
        find: '@services',
        replacement: resolve(__dirname, 'src/services'),
      },
    ],
  },
});
