/// <reference types="vite/client" />

declare module '*.png?base64' {
  const src: string
  export default src
}
