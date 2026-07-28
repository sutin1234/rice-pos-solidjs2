import { createSignal } from 'solid-js'

const [globalCount, setGlobalCount] = createSignal(0)

export const counterStore = {
  get count() {
    return globalCount()
  },
  increment: () => setGlobalCount((c) => c + 1),
  decrement: () => setGlobalCount((c) => c - 1),
  reset: () => setGlobalCount(0),
}
