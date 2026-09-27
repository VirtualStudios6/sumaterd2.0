import { render, waitFor } from '@testing-library/react'
import type { Editor } from '@tiptap/react'
import { describe, expect, it, vi } from 'vitest'
import { RichTextEditor } from '../src/components/RichTextEditor'

describe('RichTextEditor', () => {
  it('muestra el formato y guarda Markdown', async () => {
    let editor: Editor | undefined
    const onChange = vi.fn()
    const { container } = render(
      <RichTextEditor
        value={'## Título\n\nTexto con **negrita** y _cursiva_.'}
        onChange={onChange}
        onReady={(instance) => (editor = instance)}
      />,
    )
    await waitFor(() => expect(editor).toBeDefined())
    expect(container.querySelector('h2')?.textContent).toBe('Título')
    expect(container.querySelector('strong')?.textContent).toBe('negrita')
    editor!.chain().focus('end').insertContent(' Más').run()
    const markdown = onChange.mock.calls.at(-1)?.[0] as string
    expect(markdown).toContain('## Título')
    expect(markdown).toContain('**negrita**')
    expect(markdown).toContain('Más')
  })
})
