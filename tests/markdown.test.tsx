import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from '../src/components/ArticleParts'
describe('Markdown seguro', () => {
  it('no renderiza HTML, scripts ni enlaces javascript', () => {
    const html = renderToStaticMarkup(
      <MarkdownContent
        content={
          '# Título\n<script>alert(1)</script>\n[mal](javascript:alert(1))\n<img src=x onerror=alert(1)>'
        }
      />,
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('onerror')
  })
})
