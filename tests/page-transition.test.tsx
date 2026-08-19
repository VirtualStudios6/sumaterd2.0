import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PageTransitionSplash } from '../src/components/PageTransitionSplash'

afterEach(() => vi.useRealTimers())

describe('PageTransitionSplash', () => {
  it('muestra una transición breve y luego libera la página', () => {
    vi.useFakeTimers()
    render(
      <MemoryRouter>
        <PageTransitionSplash />
      </MemoryRouter>,
    )
    expect(screen.getByRole('status', { name: 'Cargando página' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1100))
    expect(screen.queryByRole('status', { name: 'Cargando página' })).not.toBeInTheDocument()
  })
})
