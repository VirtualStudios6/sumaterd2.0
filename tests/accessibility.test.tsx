import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AccessibilityMenu } from '../src/components/AccessibilityMenu'

describe('AccessibilityMenu', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    for (const key of Object.keys(document.documentElement.dataset)) {
      if (key.startsWith('a11y')) delete document.documentElement.dataset[key]
    }
  })

  it('applies and persists the selected accessibility preferences', () => {
    render(<AccessibilityMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir opciones de accesibilidad' }))
    fireEvent.click(screen.getByRole('button', { name: /Alto contraste/ }))
    fireEvent.click(screen.getByRole('button', { name: /Fuente más legible/ }))
    fireEvent.click(screen.getByRole('button', { name: /125%/ }))

    expect(document.documentElement.dataset.a11yContrast).toBe('true')
    expect(document.documentElement.dataset.a11yReadable).toBe('true')
    expect(document.documentElement.dataset.a11yFont).toBe('extra-large')
    expect(localStorage.getItem('sumaterd-accessibility')).toContain('extra-large')
  })

  it('closes with Escape and returns focus to the trigger', () => {
    render(<AccessibilityMenu />)
    const trigger = screen.getByRole('button', { name: 'Abrir opciones de accesibilidad' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
