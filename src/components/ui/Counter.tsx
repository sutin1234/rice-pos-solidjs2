import { useCounter } from '@/hooks/useCounter'
import { css } from '@styled-system/css'

export function Counter() {
  const { count, increment } = useCounter(0)

  return (
    <button
      type="button"
      class={css({
        fontFamily: 'mono',
        display: 'inline-flex',
        fontSize: '16px',
        padding: '5px 10px',
        borderRadius: '5px',
        color: 'accent',
        bg: 'accent-bg',
        border: '2px solid transparent',
        cursor: 'pointer',
        mb: '24px',
        transition: 'border-color 0.3s',
        _hover: { borderColor: 'accent-border' },
        _focusVisible: {
          outline: '2px solid token(colors.accent)',
          outlineOffset: '2px',
        },
      })}
      onClick={increment}
    >
      Count is {count()}
    </button>
  )
}
