import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfirmDialog, ErrorState, Spinner } from '../../components/Ui'
import { ImageUploader } from '../../components/ImageUploader'
import { adminCarousel } from '../../services/admin'
import type { CarouselPanel } from '../../types'
import { isSafeUrl } from '../../utils/content'
const emptyPanel = (): CarouselPanel => ({
  id: crypto.randomUUID(),
  title: '',
  message: '',
  imageUrl: '',
  imageAlt: '',
  buttonText: '',
  buttonUrl: '',
  active: true,
  order: 0,
})
export function CarouselAdminPage() {
  const [panels, setPanels] = useState<CarouselPanel[]>([])
  const [editing, setEditing] = useState<CarouselPanel | null>(null)
  const [deleting, setDeleting] = useState<CarouselPanel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = () =>
    adminCarousel('list')
      .then((r) => setPanels(r.panels))
      .catch(() => setError('No pudimos cargar el carrusel.'))
      .finally(() => setLoading(false))
  useEffect(() => {
    void load()
  }, [])
  const save = async () => {
    if (!editing) return
    if (!editing.title || !editing.imageUrl || !editing.imageAlt)
      return setError('Título, imagen y texto alternativo son obligatorios.')
    if (!isSafeUrl(editing.buttonUrl || ''))
      return setError('El enlace no es seguro. Usa una ruta interna, http o https.')
    try {
      await adminCarousel('save', { panel: editing })
      setEditing(null)
      await load()
    } catch {
      setError('No pudimos guardar el panel.')
    }
  }
  const move = async (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= panels.length) return
    const copy = [...panels]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    setPanels(copy)
    try {
      await adminCarousel('reorder', { ids: copy.map((p) => p.id) })
    } catch {
      setError('No se pudo guardar el orden.')
      await load()
    }
  }
  return (
    <>
      <div className="admin-title">
        <div>
          <p>Portada</p>
          <h1>Carrusel principal</h1>
        </div>
        <button
          className="button"
          onClick={() => setEditing({ ...emptyPanel(), order: panels.length })}
        >
          <Plus /> Nuevo panel
        </button>
      </div>
      {error && <ErrorState message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="carousel-admin-list">
          {panels.map((p, index) => (
            <article key={p.id}>
              <img src={p.imageUrl} alt={p.imageAlt} />
              <div>
                <span className={`status-pill ${p.active ? 'published' : 'draft'}`}>
                  {p.active ? 'Activo' : 'Inactivo'}
                </span>
                <h2>{p.title}</h2>
                <p>{p.message}</p>
              </div>
              <div className="order-actions">
                <button disabled={!index} onClick={() => void move(index, -1)} aria-label="Subir">
                  <ChevronUp />
                </button>
                <button
                  disabled={index === panels.length - 1}
                  onClick={() => void move(index, 1)}
                  aria-label="Bajar"
                >
                  <ChevronDown />
                </button>
                <button onClick={() => setEditing(p)}>Editar</button>
                <button onClick={() => setDeleting(p)} aria-label="Eliminar">
                  <Trash2 />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <div className="modal-backdrop">
          <div className="modal wide" role="dialog" aria-modal="true">
            <h2>{panels.some((p) => p.id === editing.id) ? 'Editar panel' : 'Nuevo panel'}</h2>
            <div className="form">
              <label>
                Título
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </label>
              <label>
                Mensaje
                <textarea
                  rows={3}
                  value={editing.message}
                  onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                />
              </label>
              <ImageUploader
                value={editing.imageUrl}
                alt={editing.imageAlt}
                area="carousel"
                ownerId={editing.id}
                onChange={(imageUrl) => setEditing({ ...editing, imageUrl })}
              />
              <label>
                Texto alternativo
                <input
                  value={editing.imageAlt}
                  onChange={(e) => setEditing({ ...editing, imageAlt: e.target.value })}
                />
              </label>
              <div className="editor-pair">
                <label>
                  Texto del botón
                  <input
                    value={editing.buttonText || ''}
                    onChange={(e) => setEditing({ ...editing, buttonText: e.target.value })}
                  />
                </label>
                <label>
                  Enlace
                  <input
                    value={editing.buttonUrl || ''}
                    onChange={(e) => setEditing({ ...editing, buttonUrl: e.target.value })}
                  />
                </label>
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />{' '}
                Panel activo
              </label>
              <div className="actions">
                <button className="button secondary" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
                <button className="button" onClick={() => void save()}>
                  Guardar panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="¿Eliminar este panel?"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          adminCarousel('delete', { id: deleting.id })
            .then(() => {
              setDeleting(null)
              void load()
            })
            .catch(() => setError('No se pudo eliminar.'))
        }}
      >
        La imagen asociada también se eliminará cuando no esté en uso.
      </ConfirmDialog>
    </>
  )
}
