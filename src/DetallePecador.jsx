import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const SUBREDDITS_ESP = ['memesESP', 'es', 'spain', 'argentina', 'mexico']

const MEME_RESPALDO = {
  url: 'https://i.imgflip.com/4/1bij.jpg',
  title: 'Meme de respaldo'
}

function useTiempoRestante(finPenitencia) {
  const [seg, setSeg] = useState(() =>
    Math.max(0, finPenitencia - Math.floor(Date.now() / 1000))
  )
  useEffect(() => {
    const tick = () => setSeg(Math.max(0, finPenitencia - Math.floor(Date.now() / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [finPenitencia])
  return seg
}

function TimerGrande({ finPenitencia }) {
  const seg = useTiempoRestante(finPenitencia)

  if (seg <= 0) {
    return (
      <>
        <div className="timer-completado-grande">
          <span className="icono">✓</span>
          ¡Castigo completado!
        </div>
        <div className="barra-wrap">
          <div className="barra-completada">✓ PENITENCIA CUMPLIDA</div>
        </div>
      </>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')
  const d     = Math.floor(seg / 86400)
  const h     = Math.floor((seg % 86400) / 3600)
  const m     = Math.floor((seg % 3600) / 60)
  const s     = seg % 60
  const años  = Math.floor(d / 365)
  const diasR = d % 365

  const fechaFin = new Date(finPenitencia * 1000)

  return (
    <>
      <div className="timer-grande-wrap">
        {años > 0 && (
          <div className="timer-bloque">
            <span className="timer-bloque-num">{años}</span>
            <span className="timer-bloque-lbl">{años === 1 ? 'año' : 'años'}</span>
          </div>
        )}
        {(años > 0 || diasR > 0) && (
          <div className="timer-bloque">
            <span className="timer-bloque-num">{diasR}</span>
            <span className="timer-bloque-lbl">{diasR === 1 ? 'día' : 'días'}</span>
          </div>
        )}
        <div className="timer-bloque">
          <span className="timer-bloque-num">{pad(h)}</span>
          <span className="timer-bloque-lbl">h</span>
        </div>
        <div className="timer-bloque">
          <span className="timer-bloque-num">{pad(m)}</span>
          <span className="timer-bloque-lbl">min</span>
        </div>
        <div className="timer-bloque">
          <span className="timer-bloque-num">{pad(s)}</span>
          <span className="timer-bloque-lbl">seg</span>
        </div>
      </div>

      <div className="timer-fecha">
        <strong>Finaliza:</strong>{' '}
        {fechaFin.toLocaleDateString('es-ES', {
          weekday: 'long', year: 'numeric', month: 'long',
          day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}
      </div>

      <div className="barra-wrap">
        <div className="barra-activa" />
      </div>
    </>
  )
}

function BtnCopiarLink() {
  const [copiado, setCopiado] = useState(false)

  const copiar = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <button
      onClick={copiar}
      className={`btn-copiar${copiado ? ' copiado' : ''}`}
    >
      {copiado ? '✓ ¡Link copiado!' : '🔗 Copiar link directo'}
    </button>
  )
}

function DetallePecador() {
  const { id } = useParams()
  const [pecador, setPecador]     = useState(null)
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)
  const [meme, setMeme]           = useState(null)
  const [cargandoMeme, setCargandoMeme] = useState(true)

  const cargarMeme = async () => {
    setCargandoMeme(true)
    for (let i = 0; i < 5; i++) {
      try {
        const sub = SUBREDDITS_ESP[Math.floor(Math.random() * SUBREDDITS_ESP.length)]
        const res = await fetch(`https://meme-api.com/gimme/${sub}`)
        if (!res.ok) continue
        const data = await res.json()
        if (data.nsfw || !data.url || data.error) continue
        setMeme(data)
        setCargandoMeme(false)
        return
      } catch {
        // siguiente intento
      }
    }
    setMeme(MEME_RESPALDO)
    setCargandoMeme(false)
  }

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(import.meta.env.BASE_URL + 'pecados.json')
        if (!res.ok) throw new Error('No se pudo cargar la lista')
        const data = await res.json()
        const p = data[id - 1]
        if (!p) throw new Error('Pecador no encontrado')

        const t = typeof p.tiempoPenitencia === 'number'
          ? p.tiempoPenitencia
          : Math.floor(Date.now() / 1000) + (p.tiempoPenitencia || 0)

        setPecador({ ...p, id: parseInt(id), tiempoPenitencia: t })
        setCargando(false)
      } catch (err) {
        setError(err.message)
        setCargando(false)
      }
    }

    cargar()
    cargarMeme()
  }, [id])

  if (cargando) return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)' }}>
      Cargando expediente...
    </div>
  )
  if (error) return (
    <div style={{ padding: '20px', color: 'var(--red-hi)' }}>Error: {error}</div>
  )
  if (!pecador) return (
    <div style={{ padding: '20px', color: 'var(--text-2)' }}>Pecador no encontrado</div>
  )

  return (
    <div>
      <Link to="/" className="btn-volver">
        ← Volver a la lista
      </Link>

      <div className="detalle-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="detalle-nombre" style={{ flex: 1 }}>
            {pecador.nombre}
          </h2>
        </div>

        <div className="detalle-seccion">
          <div className="seccion-label">Pecado cometido</div>
          <p className="seccion-valor">{pecador.pecado}</p>
        </div>

        {pecador.consecuencia && (
          <div className="detalle-seccion">
            <div className="seccion-label">Consecuencia</div>
            <p className="seccion-valor consecuencia">{pecador.consecuencia}</p>
          </div>
        )}

        <div className="detalle-seccion">
          <div className="seccion-label">Tiempo de penitencia</div>
          <TimerGrande finPenitencia={pecador.tiempoPenitencia} />
        </div>

        <BtnCopiarLink />
      </div>

      <div className="meme-card">
        <p className="meme-titulo">Meme en español para aliviar la condena</p>

        {cargandoMeme ? (
          <div className="meme-loading">
            <span className="meme-loading-icon">⌛</span>
            Buscando meme en español...
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img
              src={meme?.url}
              alt="Meme"
              className="meme-img"
              onError={(e) => {
                e.target.src = MEME_RESPALDO.url
              }}
            />
            {meme?.title && (
              <p className="meme-caption">{meme.title}</p>
            )}
            {meme?.subreddit && (
              <p className="meme-sub">r/{meme.subreddit}</p>
            )}
            <button onClick={cargarMeme} className="btn-meme">
              🔄 Otro meme
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetallePecador
