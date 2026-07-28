import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  function TestComponent(props: { initial?: number }) {
    const { count, increment, decrement, reset } = useCounter(props.initial)
    return (
      <div>
        <span data-testid="value">{count()}</span>
        <button data-testid="inc" onClick={increment}>+</button>
        <button data-testid="dec" onClick={decrement}>-</button>
        <button data-testid="reset" onClick={reset}>reset</button>
      </div>
    )
  }

  it('returns initial count', () => {
    render(() => <TestComponent initial={10} />)
    expect(screen.getByTestId('value')).toHaveTextContent('10')
  })

  it('defaults to 0', () => {
    render(() => <TestComponent />)
    expect(screen.getByTestId('value')).toHaveTextContent('0')
  })

  it('increments on click', async () => {
    render(() => <TestComponent initial={0} />)
    await fireEvent.click(screen.getByTestId('inc'))
    expect(screen.getByTestId('value')).toHaveTextContent('1')
  })

  it('decrements on click', async () => {
    render(() => <TestComponent initial={5} />)
    await fireEvent.click(screen.getByTestId('dec'))
    expect(screen.getByTestId('value')).toHaveTextContent('4')
  })

  it('resets to initial value', async () => {
    render(() => <TestComponent initial={10} />)
    await fireEvent.click(screen.getByTestId('inc'))
    await fireEvent.click(screen.getByTestId('inc'))
    await fireEvent.click(screen.getByTestId('reset'))
    expect(screen.getByTestId('value')).toHaveTextContent('10')
  })
})
