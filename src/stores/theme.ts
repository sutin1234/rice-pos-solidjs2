import { createSignal } from 'solid-js'

function getInitialTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

const [theme, setTheme] = createSignal<'light' | 'dark'>(getInitialTheme())

function toggleTheme() {
  const next = theme() === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
  setTheme(next)
}

export { theme, toggleTheme }