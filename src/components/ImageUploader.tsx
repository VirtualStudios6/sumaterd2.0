import { ImagePlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../lib/constants'
import { deleteAdminImage, uploadAdminImage } from '../services/admin'
import { ErrorState } from './Ui'

export function ImageUploader({
  value,
  alt,
  area,
  ownerId,
  kind = 'cover',
  onChange,
}: {
  value: string
  alt: string
  area: 'articles' | 'carousel'
  ownerId: string
  kind?: string
  onChange: (url: string) => void
}) {
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const choose = async (file?: File) => {
    if (!file) return
    setError('')
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name))
      return setError('Usa una imagen JPEG, PNG o WebP.')
    if (file.size > MAX_IMAGE_BYTES) return setError('La imagen no puede superar 5 MB.')
    setProgress('Subiendo…')
    try {
      const result = await uploadAdminImage(file, area, ownerId, kind)
      onChange(result.url)
      setProgress('Imagen subida')
    } catch {
      setError('No pudimos subir la imagen. Comprueba el emulador o los permisos de administrador.')
      setProgress('')
    }
  }
  const remove = async () => {
    setProgress('Eliminando…')
    try {
      await deleteAdminImage(area, ownerId, kind)
      onChange('')
      setProgress('Imagen eliminada')
    } catch {
      setError('No pudimos eliminar la imagen.')
      setProgress('')
    }
  }
  return (
    <div className="uploader">
      {value ? (
        <div className="image-preview">
          <img src={value} alt={alt || 'Vista previa'} />
          <button type="button" onClick={() => void remove()}>
            <Trash2 /> Quitar
          </button>
        </div>
      ) : (
        <label className="upload-drop">
          <ImagePlus />
          <span>Seleccionar imagen</span>
          <small>JPEG, PNG o WebP. Máximo 5 MB.</small>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void choose(e.target.files?.[0])}
          />
        </label>
      )}
      {progress && <p role="status">{progress}</p>}
      {error && <ErrorState message={error} />}
    </div>
  )
}
