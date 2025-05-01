declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  export function ref<T>(value: T): { value: T }
  export function computed<T>(getter: () => T): { value: T }
  export function reactive<T extends object>(target: T): T
  export function createApp(rootComponent: any): any
} 