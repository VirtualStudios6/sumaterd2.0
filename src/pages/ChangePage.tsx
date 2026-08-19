import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ErrorState } from '../components/Ui'
import { registerChangeInterest } from '../services/change'
import type { ChangeInterestInput } from '../types'

const provinces = [
  'Azua',
  'Bahoruco',
  'Barahona',
  'Dajabón',
  'Distrito Nacional',
  'Duarte',
  'Elías Piña',
  'El Seibo',
  'Espaillat',
  'Hato Mayor',
  'Hermanas Mirabal',
  'Independencia',
  'La Altagracia',
  'La Romana',
  'La Vega',
  'María Trinidad Sánchez',
  'Monseñor Nouel',
  'Monte Cristi',
  'Monte Plata',
  'Pedernales',
  'Peravia',
  'Puerto Plata',
  'Samaná',
  'San Cristóbal',
  'San José de Ocoa',
  'San Juan',
  'San Pedro de Macorís',
  'Sánchez Ramírez',
  'Santiago',
  'Santiago Rodríguez',
  'Santo Domingo',
  'Valverde',
]

const initialForm: ChangeInterestInput = {
  fullName: '',
  email: '',
  phone: '',
  province: '',
  municipality: '',
  participation: 'ideas',
  adultConfirmed: false,
  sensitiveDataConsent: false,
  website: '',
}

export function ChangePage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  const update = <K extends keyof ChangeInterestInput>(key: K, value: ChangeInterestInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await registerChangeInterest(form)
      setReference(result.reference)
      setForm(initialForm)
    } catch {
      setError(
        'No pudimos guardar tu solicitud. El servicio de inscripción todavía no está disponible o los datos están incompletos.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="change-page">
      <Helmet>
        <title>Cambio — Participación ciudadana | SumateRD</title>
        <meta
          name="description"
          content="Conoce Proyecto Cambio y registra tu interés en aportar ideas, colaborar y construir una nueva opción política para República Dominicana."
        />
      </Helmet>

      <section className="change-hero">
        <div className="container">
          <p className="change-kicker">Una nueva opción para República Dominicana</p>
          <h1>El cambio comienza cuando la ciudadanía decide participar.</h1>
          <p>
            Este Proyecto es una iniciativa en proceso de organización que trabaja para formar un
            nuevo partido político, escuchar propuestas y construir una alternativa democrática con
            la gente.
          </p>
          <div className="change-actions">
            <a className="button change-primary" href="#quiero-participar">
              Quiero ser parte <ArrowRight aria-hidden="true" />
            </a>
            <a className="change-text-link" href="#propuesta">
              Conocer la propuesta
            </a>
          </div>
        </div>
      </section>

      <section className="container change-intro" id="propuesta">
        <div>
          <p className="eyebrow">Una construcción colectiva</p>
          <h2>Un proyecto abierto a quienes quieren un mejor país.</h2>
        </div>
        <p>
          No se trata solamente de crear otra organización. Se trata de construir una forma más
          cercana, transparente y participativa de hacer política, comenzando por escuchar las
          necesidades reales de cada comunidad.
        </p>
      </section>

      <section className="container change-principles" aria-label="Principios de Proyecto Cambio">
        <article>
          <Lightbulb aria-hidden="true" />
          <h3>Ideas con propósito</h3>
          <p>Propuestas claras, posibles y conectadas con la vida cotidiana.</p>
        </article>
        <article>
          <UsersRound aria-hidden="true" />
          <h3>Participación real</h3>
          <p>Espacios para que las comunidades ayuden a decidir las prioridades.</p>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" />
          <h3>Transparencia</h3>
          <p>Reglas democráticas, cuentas claras y responsabilidad pública.</p>
        </article>
        <article>
          <HeartHandshake aria-hidden="true" />
          <h3>Unidad ciudadana</h3>
          <p>Un punto de encuentro para personas de distintas comunidades e ideas.</p>
        </article>
      </section>

      <section className="change-signup" id="quiero-participar">
        <div className="container change-signup-grid">
          <div className="change-signup-copy">
            <p className="change-kicker">Súmate al proceso</p>
            <h2>Registra tu interés en participar.</h2>
            <p>
              Puedes aportar ideas, colaborar como voluntario, ayudar a organizar tu comunidad o
              recibir información sobre los próximos pasos.
            </p>
            <div className="change-legal-note">
              <ShieldCheck aria-hidden="true" />
              <p>
                Este formulario registra una manifestación voluntaria de interés. No constituye
                afiliación formal ni afirma que Proyecto Cambio sea todavía un partido reconocido
                por la Junta Central Electoral.
              </p>
            </div>
          </div>

          <div className="change-form-card">
            {reference ? (
              <div className="change-success" role="status">
                <CheckCircle2 aria-hidden="true" />
                <h2>Recibimos tu solicitud.</h2>
                <p>Gracias por expresar tu interés en participar en Proyecto Cambio.</p>
                <span>Referencia: {reference}</span>
                <button className="button secondary" onClick={() => setReference('')}>
                  Registrar otra persona
                </button>
              </div>
            ) : (
              <form className="form change-form" onSubmit={submit}>
                <div>
                  <p className="eyebrow">Formulario seguro</p>
                  <h2>Quiero participar</h2>
                </div>
                {error && <ErrorState message={error} />}
                <label>
                  Nombre completo
                  <input
                    required
                    minLength={3}
                    maxLength={100}
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) => update('fullName', event.target.value)}
                  />
                </label>
                <div className="change-form-pair">
                  <label>
                    Correo electrónico
                    <input
                      required
                      type="email"
                      maxLength={254}
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => update('email', event.target.value)}
                    />
                  </label>
                  <label>
                    Teléfono <small>Opcional</small>
                    <input
                      type="tel"
                      maxLength={18}
                      autoComplete="tel"
                      placeholder="809 000 0000"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                    />
                  </label>
                </div>
                <div className="change-form-pair">
                  <label>
                    Provincia
                    <select
                      required
                      value={form.province}
                      onChange={(event) => update('province', event.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {provinces.map((province) => (
                        <option key={province}>{province}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Municipio <small>Opcional</small>
                    <input
                      maxLength={80}
                      autoComplete="address-level2"
                      value={form.municipality}
                      onChange={(event) => update('municipality', event.target.value)}
                    />
                  </label>
                </div>
                <label>
                  ¿Cómo te gustaría participar?
                  <select
                    value={form.participation}
                    onChange={(event) =>
                      update(
                        'participation',
                        event.target.value as ChangeInterestInput['participation'],
                      )
                    }
                  >
                    <option value="ideas">Aportar ideas y propuestas</option>
                    <option value="volunteer">Colaborar como voluntario</option>
                    <option value="organizer">Ayudar a organizar mi comunidad</option>
                    <option value="information">Recibir información</option>
                  </select>
                </label>
                <label className="change-honeypot" aria-hidden="true">
                  Sitio web
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) => update('website', event.target.value)}
                  />
                </label>
                <label className="check">
                  <input
                    required
                    type="checkbox"
                    checked={form.adultConfirmed}
                    onChange={(event) => update('adultConfirmed', event.target.checked)}
                  />
                  Confirmo que tengo 18 años o más y que participo de manera voluntaria.
                </label>
                <label className="check">
                  <input
                    required
                    type="checkbox"
                    checked={form.sensitiveDataConsent}
                    onChange={(event) => update('sensitiveDataConsent', event.target.checked)}
                  />
                  <span>
                    Autorizo de forma libre y consciente el tratamiento de mis datos y de esta
                    manifestación de interés político para gestionar mi participación. He leído la{' '}
                    <Link to="/privacidad">información de privacidad</Link>.
                  </span>
                </label>
                <button className="button full change-primary" disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar mi solicitud'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="container change-disclaimer">
        <p>
          La conformación y el reconocimiento de partidos, agrupaciones y movimientos políticos
          corresponde al procedimiento establecido por la legislación dominicana y la JCE.
        </p>
        <a href="https://jce.gob.do/Partidos-Politicos" target="_blank" rel="noreferrer">
          Consultar información oficial de la JCE <ArrowRight aria-hidden="true" />
        </a>
      </section>
    </div>
  )
}
