import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PageTransitionSplash } from '../src/components/PageTransitionSplash'

afterEach(() => vi.useRealTimers())

describe('PageTransitionSplash', () => {
  it('muestra la transición durante tres segundos y luego libera la página', () => {
    vi.useFakeTimers()
    render(
      <MemoryRouter>
        <PageTransitionSplash />
      </MemoryRouter>,
    )
    expect(screen.getByRole('status', { name: 'Cargando página' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.queryByRole('status', { name: 'Cargando página' })).not.toBeInTheDocument()
  })
})
