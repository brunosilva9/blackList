import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function TiempoRestanteDetallado({ finPenitencia }) {
  const [tiempoRestante, setTiempoRestante] = useState(0);

  useEffect(() => {
    const calcularTiempo = () => {
      const ahora = Math.floor(Date.now() / 1000);
      const restante = finPenitencia - ahora;
      setTiempoRestante(restante > 0 ? restante : 0);
    };

    calcularTiempo();
    const interval = setInterval(calcularTiempo, 1000);
    return () => clearInterval(interval);
  }, [finPenitencia]);

  const formatearTiempoCompleto = (segundos) => {
    if (segundos <= 0) {
      return (
        <div style={{ color: 'green', fontWeight: 'bold', fontSize: '20px' }}>
          ¡Castigo completado!
        </div>
      );
    }

    // Cálculo de años, meses, días, horas, minutos y segundos
    const fechaFin = new Date(finPenitencia * 1000);
    const ahora = new Date();

    // Diferencia exacta
    let años = fechaFin.getFullYear() - ahora.getFullYear();
    let meses = fechaFin.getMonth() - ahora.getMonth();
    let dias = fechaFin.getDate() - ahora.getDate();

    // Ajustes para valores negativos
    if (dias < 0) {
      meses--;
      // Días en el mes anterior
      const ultimoDiaMesAnterior = new Date(
        fechaFin.getFullYear(),
        fechaFin.getMonth(),
        0
      ).getDate();
      dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
      años--;
      meses += 12;
    }

    // Cálculo de horas, minutos y segundos
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;

    return (
      <div style={{ fontSize: '18px' }}>
        {años > 0 && <span>{años} año{años !== 1 ? 's' : ''} </span>}
        {meses > 0 && <span>{meses} mes{meses !== 1 ? 'es' : ''} </span>}
        {dias > 0 && <span>{dias} día{dias !== 1 ? 's' : ''} </span>}
        {horas > 0 && <span>{horas}h </span>}
        {minutos > 0 && <span>{minutos}m </span>}
        <span>{segundosRestantes}s</span>

        <div style={{ marginTop: '15px', fontSize: '16px' }}>
          <strong>Fecha de finalización:</strong> {fechaFin.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  };

  // Calcular porcentaje completado para la barra de progreso
  const ahora = Math.floor(Date.now() / 1000);
  const tiempoTotal = finPenitencia - (ahora - (finPenitencia - tiempoRestante));
  const porcentajeCompletado = tiempoTotal > 0 ?
    ((finPenitencia - tiempoRestante) / tiempoTotal) * 100 : 100;

  return (
    <div>
      {formatearTiempoCompleto(tiempoRestante)}
      <div style={{
        width: '100%',
        height: '10px',
        marginTop: '15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px'
      }}>
        <div
          style={{
            width: `${porcentajeCompletado}%`,
            height: '100%',
            backgroundColor: tiempoRestante > 0 ? 'darkred' : 'green',
            borderRadius: '5px',
            transition: 'width 1s linear'
          }}
        />
      </div>
    </div>
  );
}

function DetallePecador() {
  const { id } = useParams();
  const [pecador, setPecador] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [meme, setMeme] = useState(null);
  const [cargandoMeme, setCargandoMeme] = useState(true);

  // Función para cargar un meme aleatorio
  const cargarMemeAleatorio = async () => {
    try {
      setCargandoMeme(true);
      // Usamos la API de Meme Generator
      const response = await fetch('https://meme-api.com/gimme');
      const data = await response.json();
      if (data.nsfw) { // Si es contenido inapropiado, cargar otro
        return cargarMemeAleatorio();
      }
      setMeme(data);
    } catch (error) {
      console.error("Error al cargar el meme", error);
      setMeme({
        url: 'https://i.imgflip.com/4/1bij.jpg', // Meme de respaldo
        title: 'Error cargando meme. Aquí tienes uno de respaldo'
      });
    } finally {
      setCargandoMeme(false);
    }
  };

  useEffect(() => {
    // Cargar datos del pecador
    const cargarPecador = async () => {
      try {
        const res = await fetch(process.env.PUBLIC_URL + '/pecados.json');
        if (!res.ok) throw new Error('No se pudo cargar la lista');
        const data = await res.json();

        const pecadorEncontrado = data[id - 1];
        console.log(pecadorEncontrado);
        console.log(data);

        if (!pecadorEncontrado) throw new Error('Pecador no encontrado');

        // Asegurarse que el tiempoPenitencia es un timestamp válido
        const tiempoPenitencia = typeof pecadorEncontrado.tiempoPenitencia === 'number'
          ? pecadorEncontrado.tiempoPenitencia
          : Math.floor(Date.now() / 1000) + (pecadorEncontrado.tiempoPenitencia || 0);

        setPecador({
          ...pecadorEncontrado,
          id: parseInt(id),
          tiempoPenitencia
        });
        setCargando(false);
      } catch (err) {
        console.error("Error al cargar los datos", err);
        setError(err.message);
        setCargando(false);
      }
    };

    cargarPecador();
    cargarMemeAleatorio();

    return () => {
      // Limpieza si es necesaria
    };
  }, [id]);

  if (cargando) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando información del pecador...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  if (!pecador) return <div style={{ padding: '20px', textAlign: 'center' }}>Pecador no encontrado</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{
          textDecoration: 'none',
          color: 'darkred',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{ fontSize: '20px' }}>←</span> Volver a la lista
        </Link>
      </div>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: 'darkred', marginTop: 0, borderBottom: '2px solid darkred', paddingBottom: '10px' }}>
          {pecador.nombre}
        </h2>

        <div style={{ margin: '25px 0' }}>
          <h3 style={{ color: '#555', marginBottom: '10px', fontSize: '20px' }}>Pecado cometido:</h3>
          <p style={{
            fontSize: '18px',
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '5px',
            borderLeft: '4px solid #ccc'
          }}>
            {pecador.pecado}
          </p>
        </div>

        <div style={{ margin: '25px 0' }}>
          <h3 style={{ color: '#555', marginBottom: '10px', fontSize: '20px' }}>Consecuencia:</h3>
          <p style={{
            fontSize: '18px',
            backgroundColor: '#ffe6e6',
            padding: '15px',
            borderRadius: '5px',
            borderLeft: '4px solid darkred',
            fontWeight: '500'
          }}>
            {pecador.consecuencia || 'Sin consecuencia específica'}
          </p>
        </div>

        <div style={{ margin: '25px 0' }}>
          <h3 style={{ color: '#555', marginBottom: '10px', fontSize: '20px' }}>Tiempo de penitencia:</h3>
          <TiempoRestanteDetallado finPenitencia={pecador.tiempoPenitencia} />
        </div>
      </div>

      {/* Sección de Meme Aleatorio */}
      <div style={{
        margin: '30px 0',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          color: '#555',
          marginBottom: '20px',
          fontSize: '20px',
          textAlign: 'center'
        }}>
          Meme aleatorio para alegrarte el dia
        </h3>

        {cargandoMeme ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9f9f9',
            borderRadius: '5px'
          }}>
            Cargando meme divertido...
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img
              src={meme?.url}
              alt="Meme aleatorio"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                margin: '0 auto',
                display: 'block'
              }}
              onError={(e) => {
                e.target.src = 'https://i.imgflip.com/4/1bij.jpg';
                e.target.alt = 'Meme de respaldo';
              }}
            />
            <p style={{
              marginTop: '15px',
              fontStyle: 'italic',
              color: '#666'
            }}>
              {meme?.title}
            </p>
            <button
              onClick={cargarMemeAleatorio}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: 'darkred',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#a52a2a';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'darkred';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔄 Cargar otro meme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetallePecador;