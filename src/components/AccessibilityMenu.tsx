import {
  Accessibility,
  CaseSensitive,
  Contrast,
  Link as LinkIcon,
  RotateCcw,
  Scaling,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type FontSize = 'normal' | 'large' | 'extra-large'

type AccessibilityPreferences = {
  fontSize: FontSize
  highContrast: boolean
  underlineLinks: boolean
  reduceMotion: boolean
  readableFont: boolean
}

const STORAGE_KEY = 'sumaterd-accessibility'
const defaults: AccessibilityPreferences = {
  fontSize: 'normal',
  highContrast: false,
  underlineLinks: false,
  reduceMotion: false,
  readableFont: false,
}

function loadPreferences(): AccessibilityPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...defaults, ...saved }
  } catch {
    return defaults
  }
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(loadPreferences)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.a11yFont = preferences.fontSize
    root.dataset.a11yContrast = String(preferences.highContrast)
    root.dataset.a11yLinks = String(preferences.underlineLinks)
    root.dataset.a11yMotion = String(preferences.reduceMotion)
    root.dataset.a11yReadable = String(preferences.readableFont)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const toggle = (key: keyof Omit<AccessibilityPreferences, 'fontSize'>) =>
    setPreferences((current) => ({ ...current, [key]: !current[key] }))

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="accessibility-widget">
      {open && (
        <section
          className="accessibility-panel"
          id="accessibility-panel"
          role="dialog"
          aria-labelledby="accessibility-title"
        >
          <div className="accessibility-heading">
            <div>
              <span>Preferencias de lectura</span>
              <h2 id="accessibility-title">Accesibilidad</h2>
            </div>
            <button
              ref={closeRef}
              className="accessibility-close"
              type="button"
              onClick={close}
              aria-label="Cerrar opciones de accesibilidad"
            >
              <X aria-hidden="true" />
            </button>
          </div>

          <fieldset className="accessibility-font-options">
            <legend>Tamaño del contenido</legend>
            {(
              [
                ['normal', '100%'],
                ['large', '115%'],
                ['extra-large', '125%'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={preferences.fontSize === value ? 'active' : ''}
                aria-pressed={preferences.fontSize === value}
                onClick={() => setPreferences((current) => ({ ...current, fontSize: value }))}
              >
                <Scaling aria-hidden="true" /> {label}
              </button>
            ))}
          </fieldset>

          <div className="accessibility-toggles">
            <PreferenceButton
              icon={<Contrast />}
              label="Alto contraste"
              active={preferences.highContrast}
              onClick={() => toggle('highContrast')}
            />
            <PreferenceButton
              icon={<LinkIcon />}
              label="Subrayar enlaces"
              active={preferences.underlineLinks}
              onClick={() => toggle('underlineLinks')}
            />
            <PreferenceButton
              icon={<CaseSensitive />}
              label="Fuente más legible"
              active={preferences.readableFont}
              onClick={() => toggle('readableFont')}
            />
            <PreferenceButton
              icon={<Accessibility />}
              label="Reducir movimiento"
              active={preferences.reduceMotion}
              onClick={() => toggle('reduceMotion')}
            />
          </div>

          <button
            type="button"
            className="accessibility-reset"
            onClick={() => setPreferences(defaults)}
          >
            <RotateCcw aria-hidden="true" /> Restablecer preferencias
          </button>
          <span className="sr-only" aria-live="polite">
            Preferencias de accesibilidad actualizadas.
          </span>
        </section>
      )}

      <button
        ref={triggerRef}
        className="accessibility-trigger"
        type="button"
        aria-label="Abrir opciones de accesibilidad"
        aria-expanded={open}
        aria-controls="accessibility-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <Accessibility aria-hidden="true" />
        <span>Accesibilidad</span>
      </button>
    </div>
  )
}

function PreferenceButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? 'active' : ''}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
      <b>{active ? 'Sí' : 'No'}</b>
    </button>
  )
}
