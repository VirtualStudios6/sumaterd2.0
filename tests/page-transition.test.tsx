import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PageTransitionSplash } from '../src/components/PageTransitionSplash'

describe('PageTransitionSplash', () => {
  it('muestra un estado de carga neutral mientras llega la ruta', () => {
    render(
      <MemoryRouter>
        <PageTransitionSplash />
      </MemoryRouter>,
    )
    expect(screen.getByRole('status', { name: 'Cargando página' })).toBeInTheDocument()
    expect(screen.getByText('Cargando contenido…')).toBeInTheDocument()
  })
})
