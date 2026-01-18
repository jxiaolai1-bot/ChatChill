import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      define: {
        // 使用系统环境变量
        'process.env.APTABASE_APP_KEY': JSON.stringify(process.env.APTABASE_APP_KEY || ''),
      },
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'electron/main/index.ts'),
            'worker/dbWorker': resolve(__dirname, 'electron/main/worker/dbWorker.ts'),
          },
        },
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'electron/preload/index.ts'),
          },
        },
      },
    },
    renderer: {
      resolve: {
        alias: {
          '@': resolve('src/'),
        },
      },
      plugins: [
        react()
      ],
      root: 'src/',
      build: {
        sourcemap: false,
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'src/index.html'),
          },
        },
      },
      server: {
        host: '0.0.0.0',
        port: 3400,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: 3400,
        },
      },
    },
  }
})
