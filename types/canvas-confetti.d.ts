declare module 'canvas-confetti' {
  export interface Options { [key: string]: unknown }
  const confetti: (opts?: Options) => void
  export default confetti
}
