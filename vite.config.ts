import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { YikeResolver } from '@yike-design/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
    AutoImport({ resolvers: [YikeResolver()] }),
    Components({ resolvers: [YikeResolver({ sideEffect: true })] }),
  ],
  css: {
    // css预处理器，方便直接使用组件样式变量（按需配置）
    preprocessorOptions: {
      less: {
        charset: false,
        additionalData:
          '@import "@yike-design/ui/es/components/styles/basis.less";',
      },
    },
  },
  assetsInclude: ['**/*.glb'], // 将.glb文件包含为资源文件
})
