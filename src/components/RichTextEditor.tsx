import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Unlink,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Markdown } from 'tiptap-markdown'
import { isSafeUrl } from '../utils/content'

function getMarkdown(editor: Editor): string {
  return (editor.storage as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={active ? 'is-active' : ''}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

/**
 * Editor visual (WYSIWYG). Muestra el formato mientras se escribe y guarda Markdown,
 * que es lo que la web pública renderiza y sanea.
 */
export function RichTextEditor({
  value,
  onChange,
  onReady,
  placeholder = 'Escribe aquí el artículo…',
}: {
  value: string
  onChange: (markdown: string) => void
  onReady?: (editor: Editor) => void
  placeholder?: string
}) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https'] }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({ html: false, linkify: true, transformPastedText: true }),
    ],
    content: value,
    editorProps: { attributes: { class: 'prose rich-editor-content', 'aria-label': 'Contenido' } },
    onUpdate: ({ editor }) => onChangeRef.current(getMarkdown(editor)),
  })

  useEffect(() => {
    if (editor && onReady) onReady(editor)
  }, [editor, onReady])

  // Sincroniza cuando el contenido llega desde fuera (p. ej. al cargar el artículo).
  useEffect(() => {
    if (!editor || editor.isFocused) return
    if (getMarkdown(editor) !== value) editor.commands.setContent(value, false)
  }, [editor, value])

  if (!editor) return <div className="rich-editor is-loading" />

  const openLink = () => {
    setLinkUrl(editor.getAttributes('link').href || '')
    setLinkError('')
    setLinkOpen(true)
  }
  const applyLink = () => {
    const url = linkUrl.trim()
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setLinkOpen(false)
      return
    }
    const href = /^(https?:\/\/|\/)/.test(url) ? url : `https://${url}`
    if (!isSafeUrl(href)) return setLinkError('Enlace no válido.')
    const chain = editor.chain().focus().extendMarkRange('link')
    if (editor.state.selection.empty && !editor.isActive('link'))
      chain.insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href } }] })
    else chain.setLink({ href })
    chain.run()
    setLinkOpen(false)
  }

  return (
    <div className="rich-editor">
      <div className="rich-toolbar" role="toolbar" aria-label="Formato del artículo">
        <ToolButton
          label="Párrafo"
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow />
        </ToolButton>
        <ToolButton
          label="Subtítulo"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 />
        </ToolButton>
        <ToolButton
          label="Apartado"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </ToolButton>
        <span className="toolbar-sep" aria-hidden="true" />
        <ToolButton
          label="Negrita (Ctrl+B)"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolButton>
        <ToolButton
          label="Cursiva (Ctrl+I)"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolButton>
        <ToolButton
          label="Tachado"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolButton>
        <ToolButton label="Enlace" active={editor.isActive('link')} onClick={openLink}>
          <LinkIcon />
        </ToolButton>
        {editor.isActive('link') && (
          <ToolButton
            label="Quitar enlace"
            onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
          >
            <Unlink />
          </ToolButton>
        )}
        <span className="toolbar-sep" aria-hidden="true" />
        <ToolButton
          label="Cita"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToolButton>
        <ToolButton
          label="Lista"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolButton>
        <ToolButton
          label="Lista numerada"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolButton>
        <ToolButton
          label="Separador"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus />
        </ToolButton>
        <span className="toolbar-spacer" />
        <ToolButton
          label="Deshacer (Ctrl+Z)"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 />
        </ToolButton>
        <ToolButton
          label="Rehacer (Ctrl+Y)"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </ToolButton>
      </div>
      {linkOpen && (
        <div className="rich-link-bar">
          <input
            autoFocus
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                applyLink()
              }
              if (event.key === 'Escape') setLinkOpen(false)
            }}
            placeholder="https://ejemplo.com"
            aria-label="Dirección del enlace"
          />
          <button type="button" className="button small" onClick={applyLink}>
            Aplicar
          </button>
          <button type="button" className="button ghost small" onClick={() => setLinkOpen(false)}>
            Cancelar
          </button>
          {linkError && <small role="alert">{linkError}</small>}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
