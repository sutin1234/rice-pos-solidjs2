import { createSignal } from 'solid-js'

export function useCounter(initial = 0) {
  const [count, setCount] = createSignal(initial)

  const increment = () => setCount((c) => c + 1)
  const decrement = () => setCount((c) => c - 1)
  const reset = () => setCount(initial)

  return { count, increment, decrement, reset } as const
}
