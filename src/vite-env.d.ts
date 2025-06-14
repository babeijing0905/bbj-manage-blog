/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 添加对.glb 3D模型文件的支持
declare module '*.glb' {
  const src: string
  export default src
}

// 添加对Yike Design库的支持
declare module '@yike-design/resolver' {
  export const YikeResolver: any
}