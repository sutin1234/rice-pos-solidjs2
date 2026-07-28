import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  jsxFramework: 'solid',
  theme: {
    extend: {
      tokens: {
        colors: {
          text: { value: '#6b6375' },
          'text-h': { value: '#08060d' },
          bg: { value: '#ffffff' },
          border: { value: '#e5e4e7' },
          'code-bg': { value: '#f4f3ec' },
          accent: { value: '#aa3bff' },
          'accent-bg': { value: 'rgba(170, 59, 255, 0.1)' },
          'accent-border': { value: 'rgba(170, 59, 255, 0.5)' },
          'social-bg': { value: 'rgba(244, 243, 236, 0.5)' },
        },
        fonts: {
          sans: { value: 'system-ui, "Segoe UI", Roboto, sans-serif' },
          heading: { value: 'system-ui, "Segoe UI", Roboto, sans-serif' },
          mono: { value: 'ui-monospace, Consolas, monospace' },
        },
      },
      semanticTokens: {
        colors: {
          'text-h': {
            value: { base: '#08060d', _dark: '#f3f4f6' },
          },
          text: {
            value: { base: '#6b6375', _dark: '#9ca3af' },
          },
          bg: {
            value: { base: '#ffffff', _dark: '#16171d' },
          },
          border: {
            value: { base: '#e5e4e7', _dark: '#2e303a' },
          },
          'code-bg': {
            value: { base: '#f4f3ec', _dark: '#1f2028' },
          },
          accent: {
            value: { base: '#aa3bff', _dark: '#c084fc' },
          },
          'accent-bg': {
            value: { base: 'rgba(170, 59, 255, 0.1)', _dark: 'rgba(192, 132, 252, 0.15)' },
          },
          'accent-border': {
            value: { base: 'rgba(170, 59, 255, 0.5)', _dark: 'rgba(192, 132, 252, 0.5)' },
          },
          'social-bg': {
            value: { base: 'rgba(244, 243, 236, 0.5)', _dark: 'rgba(47, 48, 58, 0.5)' },
          },
        },
      },
    },
  },
  outdir: 'styled-system',
})
