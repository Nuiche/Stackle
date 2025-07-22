// lib/confetti.ts
export async function burst(count = 120) {
  const { default: confetti } = await import('canvas-confetti')
  confetti({
    particleCount: count,
    spread: 70,
    origin: { y: 0.3 },
    ticks: 200,
    scalar: 0.9,
  })
}
