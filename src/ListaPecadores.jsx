import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function useTiempoRestante(finPenitencia) {
  const [segundos, setSegundos] = useState(() =>
    Math.max(0, finPenitencia - Math.floor(Date.now() / 1000))
  )

  useEffect(() => {
    const tick = () => setSegundos(Math.max(0, finPenitencia - Math.floor(Date.now() / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [finPenitencia])

  return segundos
}

function TimerMini({ finPenitencia }) {
  const seg = useTiempoRestante(finPenitencia)

  if (seg <= 0) {
    return <span className="timer-mini completado-txt">✓ Penitencia completada</span>
  }

  const pad = (n) => String(n).padStart(2, '0')
  const d = Math.floor(seg / 86400)
  const h = Math.floor((seg % 86400) / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60

  const años = Math.floor(d / 365)
  const diasR = d % 365

  if (años > 0) {
    return (
      <span className="timer-mini">
        <span className="t-num">{años}</span><span className="t-lbl">a</span>
        <span className="t-num">{diasR}</span><span className="t-lbl">d</span>
        <span className="t-num">{pad(h)}</span><span className="t-lbl">h</span>
      </span>
    )
  }
  if (d > 0) {
    return (
      <span className="timer-mini">
        <span className="t-num">{d}</span><span className="t-lbl">d</span>
        <span className="t-num">{pad(h)}</span><span className="t-lbl">h</span>
        <span className="t-num">{pad(m)}</span><span className="t-lbl">m</span>
      </span>
    )
  }
  if (h > 0) {
    return (
      <span className="timer-mini">
        <span className="t-num">{pad(h)}</span><span className="t-lbl">h</span>
        <span className="t-num">{pad(m)}</span><span className="t-lbl">m</span>
        <span className="t-num">{pad(s)}</span><span className="t-lbl">s</span>
      </span>
    )
  }
  return (
    <span className="timer-mini">
      <span className="t-num">{pad(m)}</span><span className="t-lbl">m</span>
      <span className="t-num">{pad(s)}</span><span className="t-lbl">s</span>
    </span>
  )
}

function ListaPecadores() {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'pecados.json')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar la lista')
        return res.json()
      })
      .then((data) => {
        const ahora = Math.floor(Date.now() / 1000)
        const listaConIds = data.map((p, i) => {
          const t = typeof p.tiempoPenitencia === 'number' && p.tiempoPenitencia > 1_000_000_000
            ? p.tiempoPenitencia
            : ahora + p.tiempoPenitencia
          return { ...p, id: i + 1, tiempoPenitencia: t, completado: t <= ahora }
        })
        setLista(listaConIds)
        setCargando(false)
      })
      .catch((err) => {
        setError(err.message)
        setCargando(false)
      })
  }, [])

  if (cargando) return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)' }}>
      Cargando registros...
    </div>
  )
  if (error) return (
    <div style={{ padding: '20px', color: 'var(--red-hi)' }}>Error: {error}</div>
  )

  const activos   = lista.filter(p => !p.completado).length
  const absueltos = lista.filter(p =>  p.completado).length

  return (
    <div>
      <div className="stats-bar">
        <div className="stat-chip">
          <span className="stat-num rojo">{activos}</span>
          <span className="stat-lbl">en penitencia</span>
        </div>
        <div className="stat-chip">
          <span className="stat-num verde">{absueltos}</span>
          <span className="stat-lbl">absueltos</span>
        </div>
      </div>

      <ul>
        {lista.map((p, index) => (
          <li
            key={p.id}
            className="card-entrada"
            style={{ marginBottom: '12px', animationDelay: `${index * 0.07}s` }}
          >
            <Link
              to={`/pecador/${p.id}`}
              className={`card-pecador${p.completado ? ' completado' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <strong style={{ fontSize: '16px', fontWeight: 600 }}>
                  {p.nombre}
                </strong>
                <span className={`badge ${p.completado ? 'badge-absuelto' : 'badge-activo'}`}>
                  {p.completado ? '✓ ABSUELTO' : '⚠ ACTIVO'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span className={`dot ${p.completado ? 'dot-completado' : 'dot-activo'}`} />
                <TimerMini finPenitencia={p.tiempoPenitencia} />
              </div>

              {p.pecado && (
                <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                  {p.pecado.length > 70 ? p.pecado.slice(0, 70) + '…' : p.pecado}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ListaPecadores
